const express = require('express');
const financialController = require('../controllers/financialController.cjs');
const authMiddleware = require('../middleware/authMiddleware.cjs');

const router = express.Router();

router.use(authMiddleware);

// Expenses
router.get('/expenses', financialController.getExpenses);
router.post('/expenses', financialController.createExpense);
router.put('/expenses/:id', financialController.updateExpense);
router.delete('/expenses/:id', financialController.deleteExpense);

// Budgets
router.get('/budgets', financialController.getBudgets);
router.post('/budgets', financialController.upsertBudget);
router.delete('/budgets/:category', financialController.deleteBudgetByCategory);

// Incomes
router.get('/incomes', financialController.getIncomes);
router.post('/incomes', financialController.upsertIncome);

module.exports = router;
