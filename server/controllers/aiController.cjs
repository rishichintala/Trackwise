const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../prisma/client.cjs');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const getInsights = async (req, res) => {
    const month = /^\d{4}-\d{2}$/.test(req.query.month || '')
        ? req.query.month
        : new Date().toISOString().slice(0, 7);
    const [year, mon] = month.split('-').map(Number);
    // Expense.date is stored from a "YYYY-MM-DD" string, which Date parses as UTC
    // midnight (see createExpense) — bound the range in UTC too, or a server
    // running behind UTC would drop expenses dated on the 1st of the month.
    const startDate = new Date(Date.UTC(year, mon - 1, 1));
    const endDate = new Date(Date.UTC(year, mon, 1));

    try {
        const [expenses, budgets, income] = await Promise.all([
            prisma.expense.findMany({
                where: { userId: req.userId, date: { gte: startDate, lt: endDate } },
            }),
            prisma.budget.findMany({ where: { userId: req.userId, month } }),
            prisma.income.findUnique({ where: { userId_month: { userId: req.userId, month } } }),
        ]);

        if (expenses.length === 0) {
            return res.json({ insights: "No expenses logged for this month yet — add a few transactions and check back for insights." });
        }

        const spentByCategory = expenses.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
            return acc;
        }, {});
        const totalSpent = Object.values(spentByCategory).reduce((sum, v) => sum + v, 0);

        // Pre-compute budget status in code rather than asking the model to do the
        // arithmetic itself — it's easy for an LLM to misjudge "$180 vs $100" as fine,
        // or to drop an over-budget category when a bigger-but-safe one dominates.
        const categoryRows = Object.entries(spentByCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([category, spent]) => {
                const budget = budgets.find(b => b.category === category);
                if (!budget) return { category, spent, limit: null, status: 'no budget set' };
                const limit = Number(budget.amount);
                const pct = limit > 0 ? (spent / limit) * 100 : 0;
                let status = 'within budget';
                if (spent > limit) status = `OVER BUDGET by $${(spent - limit).toFixed(2)}`;
                else if (pct >= 80) status = `near budget limit (${pct.toFixed(0)}% used)`;
                return { category, spent, limit, status };
            });

        const summaryLines = categoryRows
            .map(r => {
                const budgetPart = r.limit !== null ? ` of $${r.limit.toFixed(2)} budget` : '';
                return `- ${r.category}: spent $${r.spent.toFixed(2)}${budgetPart} — ${r.status}`;
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

        const prompt = `You are a friendly personal finance assistant embedded in a budgeting app.
Based on this user's spending for ${month}, write a short, encouraging summary (3-5 sentences, plain text, no markdown headers or bullet points) that:
- Names their biggest spending category
- ${alertLine} Trust this exactly, do not recompute budget status yourself, and do not omit any category listed as MUST MENTION.
- Ends with one concrete, actionable tip for next month

Income this month: ${income ? `$${Number(income.amount).toFixed(2)}` : 'not set'}
Total spent: $${totalSpent.toFixed(2)}
Spending by category (status already computed, just relay it):
${summaryLines}`;

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const insights = result.response.text().trim();

        res.json({ insights });
    } catch (error) {
        console.error('Error generating insights:', error.message);
        res.status(500).json({ message: 'Failed to generate insights' });
    }
};

module.exports = { getInsights };
