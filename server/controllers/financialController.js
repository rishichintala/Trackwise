const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// --- Expenses ---
const getExpenses = async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            where: { userId: req.userId },
            orderBy: { date: 'desc' },
        });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error: error.message });
    }
};

const createExpense = async (req, res) => {
    const { amount, itemName, category, date } = req.body;
    try {
        const expense = await prisma.expense.create({
            data: {
                amount: parseFloat(amount),
                itemName,
                category,
                date: new Date(date),
                userId: req.userId,
            },
        });
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Error creating expense', error: error.message });
    }
};

const updateExpense = async (req, res) => {
    const { id } = req.params;
    const { amount, itemName, category, date } = req.body;
    try {
        const expense = await prisma.expense.update({
            where: { id, userId: req.userId },
            data: {
                amount: parseFloat(amount),
                itemName,
                category,
                date: new Date(date),
            },
        });
        res.json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Error updating expense', error: error.message });
    }
};

const deleteExpense = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.expense.delete({
            where: { id, userId: req.userId },
        });
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting expense', error: error.message });
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
        res.status(500).json({ message: 'Error fetching budgets', error: error.message });
    }
};

const upsertBudget = async (req, res) => {
    const { category, amount, month } = req.body;
    try {
        // Find if budget exists for this month/category
        const existing = await prisma.budget.findFirst({
            where: { category, month, userId: req.userId }
        });

        let budget;
        if (existing) {
            budget = await prisma.budget.update({
                where: { id: existing.id },
                data: { amount: parseFloat(amount) }
            });
        } else {
            budget = await prisma.budget.create({
                data: { category, amount: parseFloat(amount), month, userId: req.userId }
            });
        }
        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Error saving budget', error: error.message });
    }
};

const deleteBudgetByCategory = async (req, res) => {
    const { category } = req.params;
    try {
        await prisma.budget.deleteMany({
            where: { category, userId: req.userId }
        });
        res.json({ message: 'Budget category deleted for all months' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting budget', error: error.message });
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
        res.status(500).json({ message: 'Error fetching incomes', error: error.message });
    }
};

const upsertIncome = async (req, res) => {
    const { amount, month } = req.body;
    try {
        const existing = await prisma.income.findFirst({
            where: { month, userId: req.userId }
        });

        let income;
        if (existing) {
            income = await prisma.income.update({
                where: { id: existing.id },
                data: { amount: parseFloat(amount) }
            });
        } else {
            income = await prisma.income.create({
                data: { amount: parseFloat(amount), month, userId: req.userId }
            });
        }
        res.json(income);
    } catch (error) {
        res.status(500).json({ message: 'Error saving income', error: error.message });
    }
};

module.exports = {
    getExpenses, createExpense, updateExpense, deleteExpense,
    getBudgets, upsertBudget, deleteBudgetByCategory,
    getIncomes, upsertIncome
};
