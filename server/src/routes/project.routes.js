import { Router } from 'express'
import projectController from '../controller/project.controller.js'
import insightController from '../controller/insight.controller.js'
import financeController from '../controller/finance.controller.js'
import { protect } from '../middleware/auth.middleware.js'
const router = Router();

// Protect all project routes
router.use(protect);

// Project CRUD
router.post('/', projectController.createProject)
router.get('/', projectController.getAllProjects)
router.get('/:id', projectController.getProjectById)
router.put('/:id', projectController.updateProject)
router.delete('/:id', projectController.deleteProject)

// Project Insights Module Routes
router.get('/:projectId/insights', insightController.getProjectInsights)
router.post('/:projectId/insights', insightController.createInsight)
router.put('/:projectId/insights/:insightId', insightController.updateInsight)
router.patch('/:projectId/insights/:insightId/pin', insightController.togglePinInsight)
router.delete('/:projectId/insights/:insightId', insightController.deleteInsight)

// Project Expense Tracker & Finance Module Routes
router.get('/:projectId/finance', financeController.getOverview)

router.post('/:projectId/finance/investments', financeController.createInvestment)
router.put('/:projectId/finance/investments/:investmentId', financeController.updateInvestment)
router.delete('/:projectId/finance/investments/:investmentId', financeController.deleteInvestment)

router.post('/:projectId/finance/expenses', financeController.createExpense)
router.put('/:projectId/finance/expenses/:expenseId', financeController.updateExpense)
router.delete('/:projectId/finance/expenses/:expenseId', financeController.deleteExpense)
router.post('/:projectId/finance/categories', financeController.addCustomCategory)

router.post('/:projectId/finance/sales', financeController.createSale)
router.put('/:projectId/finance/sales/:saleId', financeController.updateSale)
router.delete('/:projectId/finance/sales/:saleId', financeController.deleteSale)

export default router;
