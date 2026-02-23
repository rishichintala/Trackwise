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
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'An internal server error occurred' });
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
        console.error('Error creating expense:', error);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

const updateExpense = async (req, res) => {
    const { id } = req.params;
    const { amount, itemName, category, date } = req.body;
    try {
        // Ensure user owns this expense (schema does not define composite unique on id+userId)
        const existing = await prisma.expense.findFirst({
            where: { id, userId: req.userId }
        });
        if (!existing) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        const expense = await prisma.expense.update({
            where: { id },
            data: {
                amount: parseFloat(amount),
                itemName,
                category,
                date: new Date(date),
            },
        });
        res.json(expense);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

const deleteExpense = async (req, res) => {
    const { id } = req.params;
    try {
        // Ensure user owns this expense (schema does not define composite unique on id+userId)
        const existing = await prisma.expense.findFirst({
            where: { id, userId: req.userId }
        });
        if (!existing) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        await prisma.expense.delete({ where: { id } });
        res.json({ message: 'Expense deleted' });
    } catch (error) {
        console.error('Error deleting expense:', error);
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
        console.error('Error fetching budgets:', error);
        res.status(500).json({ message: 'An internal server error occurred' });
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
        console.error('Error saving budget:', error);
        res.status(500).json({ message: 'An internal server error occurred' });
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
        console.error('Error deleting budget:', error);
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
        console.error('Error fetching incomes:', error);
        res.status(500).json({ message: 'An internal server error occurred' });
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
        console.error('Error saving income:', error);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
};

module.exports = {
    getExpenses, createExpense, updateExpense, deleteExpense,
    getBudgets, upsertBudget, deleteBudgetByCategory,
    getIncomes, upsertIncome
};
