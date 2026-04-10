const prisma = require('../prisma/client.cjs');

// --- Expenses ---
const getExpenses = async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            where: { userId: req.userId },
            orderBy: { date: 'desc' },
        });
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error.message);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

const createExpense = async (req, res) => {
    const { amount, itemName, category, date } = req.body;
    try {
        const expense = await prisma.expense.create({
            data: {
                amount: Number.parseFloat(amount),
                itemName,
                category,
                date: new Date(date),
                userId: req.userId,
            },
        });
        res.status(201).json(expense);
    } catch (error) {
        console.error('Error creating expense:', error.message);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

const updateExpense = async (req, res) => {
    const { id } = req.params;
    const { amount, itemName, category, date } = req.body;
    try {
        // Atomic ownership check + update in a single query (no TOCTOU gap)
        const result = await prisma.expense.updateMany({
            where: { id, userId: req.userId },
            data: {
                amount: Number.parseFloat(amount),
                itemName,
                category,
                date: new Date(date),
            },
        });
        if (result.count === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        const expense = await prisma.expense.findUnique({ where: { id } });
        res.json(expense);
    } catch (error) {
        console.error('Error updating expense:', error.message);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

const deleteExpense = async (req, res) => {
    const { id } = req.params;
    try {
        // Atomic ownership check + delete in a single query (no TOCTOU gap)
        const result = await prisma.expense.deleteMany({
            where: { id, userId: req.userId },
        });
        if (result.count === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        console.error('Error deleting expense:', error.message);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

// --- Budgets ---
const getBudgets = async (req, res) => {
    try {
        const budgets = await prisma.budget.findMany({
            where: { userId: req.userId },
        });
        res.json(budgets);
    } catch (error) {
        console.error('Error fetching budgets:', error.message);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

const upsertBudget = async (req, res) => {
    const { category, amount, month } = req.body;
    try {
        // Atomic upsert using the unique constraint on [userId, category, month]
        const budget = await prisma.budget.upsert({
            where: { userId_category_month: { userId: req.userId, category, month } },
            update: { amount: Number.parseFloat(amount) },
            create: { category, amount: Number.parseFloat(amount), month, userId: req.userId },
        });
        res.json(budget);
    } catch (error) {
        console.error('Error saving budget:', error.message);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

const deleteBudgetByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        await prisma.budget.deleteMany({
            where: { category, userId: req.userId },
        });
        res.json({ message: 'Budget category deleted for all months' });
    } catch (error) {
        console.error('Error deleting budget:', error.message);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

// --- Incomes ---
const getIncomes = async (req, res) => {
    try {
        const incomes = await prisma.income.findMany({
            where: { userId: req.userId },
        });
        res.json(incomes);
    } catch (error) {
        console.error('Error fetching incomes:', error.message);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

const upsertIncome = async (req, res) => {
    const { amount, month } = req.body;
    try {
        // Atomic upsert using the unique constraint on [userId, month]
        const income = await prisma.income.upsert({
            where: { userId_month: { userId: req.userId, month } },
            update: { amount: Number.parseFloat(amount) },
            create: { amount: Number.parseFloat(amount), month, userId: req.userId },
        });
        res.json(income);
    } catch (error) {
        console.error('Error saving income:', error.message);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

module.exports = {
    getExpenses, createExpense, updateExpense, deleteExpense,
    getBudgets, upsertBudget, deleteBudgetByCategory,
    getIncomes, upsertIncome,
};
