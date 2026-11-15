import financeService from '../services/finance.service.js';
import asyncHandler from '../utils/asyncHandler.js';

class FinanceController {
    getOverview = asyncHandler(async (req, res) => {
        const result = await financeService.getProjectFinanceOverview(
            req.params.projectId,
            req.query,
            req.user
        );
        res.status(200).json({
            success: true,
            data: result
        });
    });

    // Investments
    createInvestment = asyncHandler(async (req, res) => {
        const investment = await financeService.createInvestment(
            req.params.projectId,
            req.body,
            req.user
        );
        res.status(201).json({
            success: true,
            message: 'Investment recorded successfully.',
            data: investment
        });
    });

    updateInvestment = asyncHandler(async (req, res) => {
        const investment = await financeService.updateInvestment(
            req.params.projectId,
            req.params.investmentId,
            req.body,
            req.user
        );
        res.status(200).json({
            success: true,
            message: 'Investment updated successfully.',
            data: investment
        });
    });

    deleteInvestment = asyncHandler(async (req, res) => {
        await financeService.deleteInvestment(
            req.params.projectId,
            req.params.investmentId,
            req.user
        );
        res.status(200).json({
            success: true,
            message: 'Investment deleted successfully.'
        });
    });

    // Expenses
    createExpense = asyncHandler(async (req, res) => {
        const expense = await financeService.createExpense(
            req.params.projectId,
            req.body,
            req.user
        );
        res.status(201).json({
            success: true,
            message: 'Expense recorded successfully.',
            data: expense
        });
    });

    updateExpense = asyncHandler(async (req, res) => {
        const expense = await financeService.updateExpense(
            req.params.projectId,
            req.params.expenseId,
            req.body,
            req.user
        );
        res.status(200).json({
            success: true,
            message: 'Expense updated successfully.',
            data: expense
        });
    });

    deleteExpense = asyncHandler(async (req, res) => {
        await financeService.deleteExpense(
            req.params.projectId,
            req.params.expenseId,
            req.user
        );
        res.status(200).json({
            success: true,
            message: 'Expense deleted successfully.'
        });
    });

    addCustomCategory = asyncHandler(async (req, res) => {
        const category = await financeService.addCustomExpenseCategory(
            req.params.projectId,
            req.body.name,
            req.user
        );
        res.status(201).json({
            success: true,
            message: 'Custom expense category added.',
            data: category
        });
    });

    // Sales
    createSale = asyncHandler(async (req, res) => {
        const sale = await financeService.createSale(
            req.params.projectId,
            req.body,
            req.user
        );
        res.status(201).json({
            success: true,
            message: 'Sale recorded successfully.',
            data: sale
        });
    });

    updateSale = asyncHandler(async (req, res) => {
        const sale = await financeService.updateSale(
            req.params.projectId,
            req.params.saleId,
            req.body,
            req.user
        );
        res.status(200).json({
            success: true,
            message: 'Sale updated successfully.',
            data: sale
        });
    });

    deleteSale = asyncHandler(async (req, res) => {
        await financeService.deleteSale(
            req.params.projectId,
            req.params.saleId,
            req.user
        );
        res.status(200).json({
            success: true,
            message: 'Sale deleted successfully.'
        });
    });
}

export default new FinanceController();

