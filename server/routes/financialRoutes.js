const express = require('express');
const {
    getExpenses, createExpense, updateExpense, deleteExpense,
    getBudgets, upsertBudget, deleteBudgetByCategory,
    getIncomes, upsertIncome
} = require('../controllers/financialController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

// Expenses
router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);
router.put('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);

// Budgets
router.get('/budgets', getBudgets);
router.post('/budgets', upsertBudget);
router.delete('/budgets/:category', deleteBudgetByCategory);

// Incomes
router.get('/incomes', getIncomes);
router.post('/incomes', upsertIncome);

module.exports = router;
