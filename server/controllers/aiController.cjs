const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../prisma/client.cjs');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Expense.date is stored from a "YYYY-MM-DD" string, which Date parses as UTC
// midnight (see createExpense) — bound ranges in UTC too, or a server running
// behind UTC would drop expenses dated on the 1st of the month.
const monthToUtcRange = (month) => {
    const [year, mon] = month.split('-').map(Number);
    return {
        start: new Date(Date.UTC(year, mon - 1, 1)),
        end: new Date(Date.UTC(year, mon, 1)),
    };
};

const shiftMonth = (month, delta) => {
    const [year, mon] = month.split('-').map(Number);
    const d = new Date(Date.UTC(year, mon - 1 + delta, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

const sumByCategory = (expenses) => expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
    return acc;
}, {});

// Per-user daily caps on Gemini-backed endpoints. The app runs on stateless
// serverless functions with no durable in-memory state, and registration has
// no verification step, so this is backed by the DB rather than an in-memory
// limiter — otherwise a scripted loop of free accounts could run up real
// Gemini API cost with no friction (this repo is public).
const DAILY_INSIGHTS_LIMIT = 3;
const DAILY_CHAT_LIMIT = 5;
const CHAT_MAX_MESSAGE_LENGTH = 1000;

const todayUtc = () => new Date().toISOString().slice(0, 10);

// Not fully race-proof under concurrent requests (read-then-write), which is
// an acceptable tradeoff here: the goal is deterring scripted abuse, not
// enforcing a hard security boundary — a determined attacker can already just
// create another free account, which the per-account cap doesn't defend against.
const consumeDailyQuota = async (userId, field, limit) => {
    const date = todayUtc();
    const usage = await prisma.aiUsage.upsert({
        where: { userId_date: { userId, date } },
        create: { userId, date },
        update: {},
    });
    if (usage[field] >= limit) return false;
    await prisma.aiUsage.update({
        where: { userId_date: { userId, date } },
        data: { [field]: { increment: 1 } },
    });
    return true;
};

const getInsights = async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ message: 'Gemini API key is not configured on the server.' });
    }

    const month = /^\d{4}-\d{2}$/.test(req.query.month || '')
        ? req.query.month
        : new Date().toISOString().slice(0, 7);
    const prevMonth = shiftMonth(month, -1);
    const { start: startDate, end: endDate } = monthToUtcRange(month);
    const { start: prevStartDate, end: prevEndDate } = monthToUtcRange(prevMonth);

    try {
        const [expenses, prevExpenses, budgets, income] = await Promise.all([
            prisma.expense.findMany({
                where: { userId: req.userId, date: { gte: startDate, lt: endDate } },
            }),
            prisma.expense.findMany({
                where: { userId: req.userId, date: { gte: prevStartDate, lt: prevEndDate } },
            }),
            prisma.budget.findMany({ where: { userId: req.userId, month } }),
            prisma.income.findUnique({ where: { userId_month: { userId: req.userId, month } } }),
        ]);

        if (expenses.length === 0) {
            return res.json({ insights: "No expenses logged for this month yet — add a few transactions and check back for insights." });
        }

        const allowed = await consumeDailyQuota(req.userId, 'insightsCount', DAILY_INSIGHTS_LIMIT);
        if (!allowed) {
            return res.status(429).json({ message: `You've reached today's limit of ${DAILY_INSIGHTS_LIMIT} AI insight generations. Try again tomorrow.` });
        }

        const spentByCategory = sumByCategory(expenses);
        const prevSpentByCategory = sumByCategory(prevExpenses);
        const totalSpent = Object.values(spentByCategory).reduce((sum, v) => sum + v, 0);
        const prevTotalSpent = Object.values(prevSpentByCategory).reduce((sum, v) => sum + v, 0);

        // Pre-compute budget status and month-over-month deltas in code rather than
        // asking the model to do the arithmetic itself — it's easy for an LLM to
        // misjudge "$180 vs $100" as fine, or drop a flagged category entirely.
        // Union current + previous month categories so a category the user dropped
        // to $0 this month (arguably the best trend to surface) isn't silently lost.
        const allCategories = new Set([...Object.keys(spentByCategory), ...Object.keys(prevSpentByCategory)]);
        const categoryRows = Array.from(allCategories)
            .map(category => {
                const spent = spentByCategory[category] || 0;
                const budget = budgets.find(b => b.category === category);
                let status = 'no budget set';
                let limit = null;
                if (budget) {
                    limit = Number(budget.amount);
                    const pct = limit > 0 ? (spent / limit) * 100 : 0;
                    status = 'within budget';
                    if (spent > limit) status = `OVER BUDGET by $${(spent - limit).toFixed(2)}`;
                    else if (pct >= 80) status = `near budget limit (${pct.toFixed(0)}% used)`;
                }

                const prevSpent = prevSpentByCategory[category] || 0;
                let trend = 'no spending in this category last month';
                if (prevSpent > 0) {
                    const pctChange = ((spent - prevSpent) / prevSpent) * 100;
                    const sign = pctChange >= 0 ? '+' : '';
                    trend = `${sign}${pctChange.toFixed(0)}% vs last month (was $${prevSpent.toFixed(2)})`;
                }

                return { category, spent, limit, status, prevSpent, trend };
            });

        const summaryLines = categoryRows
            .map(r => {
                const budgetPart = r.limit !== null ? ` of $${r.limit.toFixed(2)} budget` : '';
                return `- ${r.category}: spent $${r.spent.toFixed(2)}${budgetPart} — ${r.status}; ${r.trend}`;
            })
            .join('\n');

        const overBudget = categoryRows.filter(r => r.status.startsWith('OVER BUDGET'));
        const nearLimit = categoryRows.filter(r => r.status.startsWith('near budget limit'));

        let alertLine = 'No categories are over or near their budget this month.';
        if (overBudget.length > 0) {
            alertLine = `MUST MENTION — over budget: ${overBudget.map(r => `${r.category} (${r.status})`).join(', ')}.`;
        } else if (nearLimit.length > 0) {
            alertLine = `MUST MENTION — near budget limit: ${nearLimit.map(r => `${r.category} (${r.status})`).join(', ')}.`;
        }

        // The single biggest month-over-month dollar swing — the fact most likely
        // to actually be useful to the user, so call it out explicitly.
        const biggestMover = categoryRows
            .filter(r => r.prevSpent > 0)
            .sort((a, b) => Math.abs(b.spent - b.prevSpent) - Math.abs(a.spent - a.prevSpent))[0];
        const moverLine = biggestMover
            ? `MUST MENTION — biggest change vs last month: ${biggestMover.category} (${biggestMover.trend}).`
            : 'No prior-month data to compare trends against.';

        const totalTrendLine = prevTotalSpent > 0
            ? `Total spending is ${(((totalSpent - prevTotalSpent) / prevTotalSpent) * 100).toFixed(0)}% vs last month's $${prevTotalSpent.toFixed(2)}.`
            : 'No total spending recorded last month to compare against.';

        const prompt = `You are a terse, factual personal finance analyst embedded in a budgeting app.
Based on this user's spending for ${month} vs ${prevMonth}, write a short summary (3-5 sentences, plain text, no markdown headers or bullet points, no headers) that:
- Names their biggest spending category with its dollar amount
- ${moverLine} Trust this exactly, do not recompute it yourself.
- ${alertLine} Trust this exactly, do not recompute budget status yourself, and do not omit any category listed as MUST MENTION.
- Ends with one concrete, specific tip tied to an actual number from the data (not generic advice)

Rules: Do not use generic filler praise like "fantastic", "great job", "thoughtful purchases", or "staying on top of your finances". Every sentence must reference a specific number, category, or percentage from the data below.

Income this month: ${income ? `$${Number(income.amount).toFixed(2)}` : 'not set'}
Total spent this month: $${totalSpent.toFixed(2)}. ${totalTrendLine}
Spending by category (status and trend already computed, just relay them):
${summaryLines}`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const insights = result.response.text().trim();

        res.json({ insights });
    } catch (error) {
        console.error('Error generating insights:', error?.message || error);
        res.status(500).json({ message: 'Failed to generate insights' });
    }
};

const CHAT_MONTHS_WINDOW = 6;
const CHAT_HISTORY_TURNS = 6;
const CHAT_MAX_EXPENSE_ROWS = 400;

const chat = async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ message: 'Gemini API key is not configured on the server.' });
    }

    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    if (!message) {
        return res.status(400).json({ message: 'A message is required.' });
    }
    if (message.length > CHAT_MAX_MESSAGE_LENGTH) {
        return res.status(400).json({ message: `Message is too long (max ${CHAT_MAX_MESSAGE_LENGTH} characters).` });
    }
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-CHAT_HISTORY_TURNS) : [];

    const currentMonth = new Date().toISOString().slice(0, 7);
    const oldestMonth = shiftMonth(currentMonth, -(CHAT_MONTHS_WINDOW - 1));
    const { start: windowStart } = monthToUtcRange(oldestMonth);
    const { end: windowEnd } = monthToUtcRange(currentMonth);

    try {
        const allowed = await consumeDailyQuota(req.userId, 'chatCount', DAILY_CHAT_LIMIT);
        if (!allowed) {
            return res.status(429).json({ message: `You've reached today's limit of ${DAILY_CHAT_LIMIT} assistant messages. Try again tomorrow.` });
        }

        const [expenses, budgets, incomes] = await Promise.all([
            prisma.expense.findMany({
                where: { userId: req.userId, date: { gte: windowStart, lt: windowEnd } },
                orderBy: { date: 'desc' },
            }),
            prisma.budget.findMany({ where: { userId: req.userId, month: { gte: oldestMonth, lte: currentMonth } } }),
            prisma.income.findMany({ where: { userId: req.userId, month: { gte: oldestMonth, lte: currentMonth } } }),
        ]);

        // Aggregate per month+category so "how much did I spend on X in June" or
        // "which month was my highest" can be answered by lookup, not by the model
        // re-summing a long itemized list (a known source of arithmetic errors).
        const monthlyCategoryTotals = {};
        const monthlyTotals = {};
        for (const e of expenses) {
            const monthKey = e.date.toISOString().slice(0, 7);
            monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + Number(e.amount);
            monthlyCategoryTotals[monthKey] = monthlyCategoryTotals[monthKey] || {};
            monthlyCategoryTotals[monthKey][e.category] = (monthlyCategoryTotals[monthKey][e.category] || 0) + Number(e.amount);
        }

        const monthlySummaryLines = Object.keys(monthlyTotals).sort().reverse().map(monthKey => {
            const catBreakdown = Object.entries(monthlyCategoryTotals[monthKey])
                .sort((a, b) => b[1] - a[1])
                .map(([cat, amt]) => `${cat} $${amt.toFixed(2)}`)
                .join(', ');
            const income = incomes.find(i => i.month === monthKey);
            const incomePart = income ? `, income $${Number(income.amount).toFixed(2)}` : '';
            return `${monthKey}: total $${monthlyTotals[monthKey].toFixed(2)}${incomePart} — ${catBreakdown}`;
        }).join('\n');

        const budgetLines = budgets
            .map(b => `${b.month} ${b.category}: budget $${Number(b.amount).toFixed(2)}`)
            .join('\n') || 'No budgets set in this window.';

        const truncated = expenses.length > CHAT_MAX_EXPENSE_ROWS;
        const itemizedLines = expenses.slice(0, CHAT_MAX_EXPENSE_ROWS)
            .map(e => `${e.date.toISOString().slice(0, 10)} | ${e.category} | ${e.itemName || '(no name)'} | $${Number(e.amount).toFixed(2)}`)
            .join('\n');

        const historyText = history
            .filter(h => h && typeof h.content === 'string')
            .map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
            .join('\n');

        const prompt = `You are a financial assistant embedded in a budgeting app called Trackwise. Answer the user's question using ONLY the data provided below, which covers ${oldestMonth} through ${currentMonth}.

Rules:
- Be concise (2-4 sentences unless the question needs a list).
- Always cite concrete numbers from the data, never estimate or guess.
- If the question needs data outside ${oldestMonth}–${currentMonth}, or about a category/month not present below, say so plainly instead of guessing.
- Use the "Monthly summary" section for totals/trends/comparisons — it is already summed for you, do not re-derive totals from the itemized list.
- Use the "Itemized expenses" section only for line-item questions (e.g. largest single purchase, specific item names).
${truncated ? `- Note: itemized list was truncated to the ${CHAT_MAX_EXPENSE_ROWS} most recent rows; say so if the question likely needs older rows.` : ''}

Monthly summary (most recent first):
${monthlySummaryLines || 'No expenses recorded in this window.'}

Budgets set:
${budgetLines}

Itemized expenses (most recent first):
${itemizedLines || 'No expenses recorded in this window.'}

${historyText ? `Recent conversation:\n${historyText}\n` : ''}
User: ${message}`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const reply = result.response.text().trim();

        res.json({ reply });
    } catch (error) {
        console.error('Error in AI chat:', error?.message || error);
        res.status(500).json({ message: 'Failed to get a response' });
    }
};

module.exports = { getInsights, chat };
