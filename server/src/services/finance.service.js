import ProjectInvestment from '../models/projectInvestment.js';
import ProjectExpense, { PREDEFINED_EXPENSE_CATEGORIES } from '../models/projectExpense.js';
import ProjectSale from '../models/projectSale.js';
import ExpenseCategory from '../models/expenseCategory.js';
import projectRepository from '../repositories/project.repository.js';
import AppError from '../utils/AppError.js';

class FinanceService {
    async verifyProjectAccess(projectId, user) {
        const project = await projectRepository.findById(projectId);
        if (!project) {
            throw new AppError('Project not found', 404);
        }

        if (!user) {
            throw new AppError('Authentication required', 401);
        }

        if (user.role === 'admin') {
            return project;
        }

        const userIdStr = user._id.toString();
        const creatorIdStr = (project.createdBy?._id || project.createdBy)?.toString();
        const isCreator = creatorIdStr === userIdStr;
        const isMember = (project.members || []).some(
            (m) => (m?._id || m)?.toString() === userIdStr
        );

        if (!isCreator && !isMember) {
            throw new AppError('You do not have permission to access this project', 403);
        }

        return project;
    }

    canModifyEntry(entry, project, user) {
        if (!user) return false;
        if (user.role === 'admin') return true;
        const userIdStr = user._id.toString();
        const projectCreatorId = (project.createdBy?._id || project.createdBy)?.toString();
        if (projectCreatorId && projectCreatorId === userIdStr) return true;
        const entryCreatorId = (entry.createdBy?._id || entry.createdBy)?.toString();
        return entryCreatorId === userIdStr;
    }

    /**
     * Computes complete financial summary and chart aggregations from actual stored records.
     * Financial Logic:
     * - Total Investment = Sum of all investment entries
     * - Total Expenses = Sum of all recorded expenses
     * - Total Sales Revenue = Sum of all completed sales (quantity * unitPrice)
     * - Net Operating Profit/Loss = Total Sales Revenue - Total Expenses (Investments are NOT added to expenses)
     * - Investment Recovery = Total Sales Revenue - Total Investment
     * - Remaining Unrecovered Investment = max(0, Total Investment - Total Sales Revenue)
     * - Cash Position = Total Investment + Total Sales Revenue - Total Expenses
     */
    computeFinancialSummary(investments = [], expenses = [], sales = []) {
        const round2 = (num) => Number((Number(num) || 0).toFixed(2));

        const totalInvestment = round2(
            investments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
        );

        const totalExpenses = round2(
            expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
        );

        const totalSalesRevenue = round2(
            sales.reduce((sum, item) => {
                const lineTotal =
                    item.totalAmount !== undefined && item.totalAmount !== null
                        ? Number(item.totalAmount)
                        : (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
                return sum + lineTotal;
            }, 0)
        );

        const netProfitLoss = round2(totalSalesRevenue - totalExpenses);
        const investmentRecovery = round2(totalSalesRevenue - totalInvestment);
        const remainingUnrecoveredInvestment = round2(
            Math.max(0, totalInvestment - totalSalesRevenue)
        );
        const recoveredAmount = round2(Math.min(totalInvestment, totalSalesRevenue));
        const investmentRecoveryPercent =
            totalInvestment > 0
                ? Math.min(100, Math.round((totalSalesRevenue / totalInvestment) * 100))
                : 0;
        const cashPosition = round2(totalInvestment + totalSalesRevenue - totalExpenses);

        const profitMarginPercent =
            totalSalesRevenue > 0
                ? Number(((netProfitLoss / totalSalesRevenue) * 100).toFixed(1))
                : null;

        // 1. Expense breakdown by category
        const categoryMap = {};
        for (const exp of expenses) {
            const cat = exp.category || 'Miscellaneous';
            categoryMap[cat] = round2((categoryMap[cat] || 0) + (Number(exp.amount) || 0));
        }

        const expenseByCategory = Object.entries(categoryMap)
            .map(([category, amount]) => ({
                category,
                amount,
                percentage:
                    totalExpenses > 0
                        ? Number(((amount / totalExpenses) * 100).toFixed(1))
                        : 0
            }))
            .sort((a, b) => b.amount - a.amount);

        // 2. Investment breakdown by date (YYYY-MM-DD)
        const invDateMap = {};
        for (const inv of investments) {
            const d = inv.investmentDate ? new Date(inv.investmentDate) : new Date(inv.createdAt);
            const dateKey = !isNaN(d) ? d.toISOString().split('T')[0] : 'Unknown';
            invDateMap[dateKey] = round2((invDateMap[dateKey] || 0) + (Number(inv.amount) || 0));
        }
        const investmentByDate = Object.entries(invDateMap)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // 3. Monthly trends (Expenses, Sales, Investments)
        const monthlyMap = {};
        const ensureMonth = (dateVal) => {
            const d = dateVal ? new Date(dateVal) : new Date();
            if (isNaN(d)) return null;
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const key = `${year}-${month}`;
            const label = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
            if (!monthlyMap[key]) {
                monthlyMap[key] = {
                    monthKey: key,
                    label,
                    investments: 0,
                    expenses: 0,
                    sales: 0,
                    netProfit: 0
                };
            }
            return monthlyMap[key];
        };

        for (const inv of investments) {
            const m = ensureMonth(inv.investmentDate || inv.createdAt);
            if (m) m.investments = round2(m.investments + (Number(inv.amount) || 0));
        }
        for (const exp of expenses) {
            const m = ensureMonth(exp.expenseDate || exp.createdAt);
            if (m) m.expenses = round2(m.expenses + (Number(exp.amount) || 0));
        }
        for (const s of sales) {
            const m = ensureMonth(s.saleDate || s.createdAt);
            if (m) m.sales = round2(m.sales + (Number(s.totalAmount) || 0));
        }

        const monthlyTrends = Object.values(monthlyMap)
            .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
            .map((m) => ({
                ...m,
                netProfit: round2(m.sales - m.expenses)
            }));

        return {
            totalInvestment,
            totalExpenses,
            totalSalesRevenue,
            netProfitLoss,
            investmentRecovery,
            remainingUnrecoveredInvestment,
            recoveredAmount,
            investmentRecoveryPercent,
            cashPosition,
            profitMarginPercent,
            hasSales: sales.length > 0 && totalSalesRevenue > 0,
            counts: {
                investments: investments.length,
                expenses: expenses.length,
                sales: sales.length
            },
            charts: {
                expenseByCategory,
                investmentByDate,
                monthlyTrends
            }
        };
    }

    async getProjectFinanceOverview(projectId, query = {}, user) {
        const project = await this.verifyProjectAccess(projectId, user);

        // Fetch all raw records for accurate project-wide financial calculations
        const [allInvestments, allExpenses, allSales, customCategories] = await Promise.all([
            ProjectInvestment.find({ projectId })
                .populate('createdBy', 'name email designation role')
                .sort({ investmentDate: -1, createdAt: -1 }),
            ProjectExpense.find({ projectId })
                .populate('createdBy', 'name email designation role')
                .sort({ expenseDate: -1, createdAt: -1 }),
            ProjectSale.find({ projectId })
                .populate('createdBy', 'name email designation role')
                .sort({ saleDate: -1, createdAt: -1 }),
            ExpenseCategory.find({ projectId }).sort({ name: 1 })
        ]);

        // Filtered expenses if query filters are supplied
        let filteredExpenses = allExpenses;
        if (query.category && query.category !== 'all') {
            filteredExpenses = filteredExpenses.filter((e) => e.category === query.category);
        }
        if (query.startDate) {
            const start = new Date(query.startDate);
            start.setHours(0, 0, 0, 0);
            if (!isNaN(start)) {
                filteredExpenses = filteredExpenses.filter(
                    (e) => new Date(e.expenseDate || e.createdAt) >= start
                );
            }
        }
        if (query.endDate) {
            const end = new Date(query.endDate);
            end.setHours(23, 59, 59, 999);
            if (!isNaN(end)) {
                filteredExpenses = filteredExpenses.filter(
                    (e) => new Date(e.expenseDate || e.createdAt) <= end
                );
            }
        }
        if (query.search && query.search.trim()) {
            const q = query.search.trim().toLowerCase();
            filteredExpenses = filteredExpenses.filter(
                (e) =>
                    e.title?.toLowerCase().includes(q) ||
                    e.description?.toLowerCase().includes(q) ||
                    e.category?.toLowerCase().includes(q) ||
                    e.paidBy?.toLowerCase().includes(q)
            );
        }

        const customCatNames = customCategories.map((c) => c.name);
        const mergedCategories = Array.from(
            new Set([...PREDEFINED_EXPENSE_CATEGORIES, ...customCatNames])
        );

        const summary = this.computeFinancialSummary(allInvestments, allExpenses, allSales);

        return {
            project: {
                _id: project._id,
                title: project.title,
                description: project.description,
                status: project.status,
                createdBy: project.createdBy,
                members: project.members
            },
            summary,
            investments: allInvestments,
            expenses: filteredExpenses,
            allExpensesCount: allExpenses.length,
            sales: allSales,
            expenseCategories: mergedCategories,
            customCategories
        };
    }

    // ==========================================
    // A. INVESTMENT CRUD
    // ==========================================
    async createInvestment(projectId, data, user) {
        await this.verifyProjectAccess(projectId, user);

        const amount = Number(data.amount);
        if (isNaN(amount) || amount <= 0) {
            throw new AppError('Investment amount must be a positive number greater than ₹0', 400);
        }
        if (!data.title || !String(data.title).trim()) {
            throw new AppError('Investment title is required', 400);
        }
        if (!data.investedBy || !String(data.investedBy).trim()) {
            throw new AppError('Invested by field is required', 400);
        }

        const investment = await ProjectInvestment.create({
            projectId,
            title: String(data.title).trim(),
            amount: Number(amount.toFixed(2)),
            investmentDate: data.investmentDate ? new Date(data.investmentDate) : new Date(),
            investedBy: String(data.investedBy).trim(),
            description: data.description ? String(data.description).trim() : '',
            attachmentUrl: data.attachmentUrl ? String(data.attachmentUrl).trim() : '',
            attachmentName: data.attachmentName ? String(data.attachmentName).trim() : '',
            createdBy: user._id
        });

        return await ProjectInvestment.findById(investment._id).populate(
            'createdBy',
            'name email designation role'
        );
    }

    async updateInvestment(projectId, investmentId, data, user) {
        const project = await this.verifyProjectAccess(projectId, user);

        const existing = await ProjectInvestment.findOne({ _id: investmentId, projectId });
        if (!existing) {
            throw new AppError('Investment record not found in this project', 404);
        }

        if (!this.canModifyEntry(existing, project, user)) {
            throw new AppError('Permission denied to edit this investment entry', 403);
        }

        const updatePayload = {};
        if (data.title !== undefined) {
            if (!String(data.title).trim()) throw new AppError('Investment title cannot be empty', 400);
            updatePayload.title = String(data.title).trim();
        }
        if (data.amount !== undefined) {
            const amount = Number(data.amount);
            if (isNaN(amount) || amount <= 0) {
                throw new AppError('Investment amount must be greater than ₹0', 400);
            }
            updatePayload.amount = Number(amount.toFixed(2));
        }
        if (data.investmentDate !== undefined) {
            updatePayload.investmentDate = new Date(data.investmentDate);
        }
        if (data.investedBy !== undefined) {
            if (!String(data.investedBy).trim()) throw new AppError('Invested by cannot be empty', 400);
            updatePayload.investedBy = String(data.investedBy).trim();
        }
        if (data.description !== undefined) {
            updatePayload.description = String(data.description).trim();
        }
        if (data.attachmentUrl !== undefined) {
            updatePayload.attachmentUrl = String(data.attachmentUrl).trim();
        }
        if (data.attachmentName !== undefined) {
            updatePayload.attachmentName = String(data.attachmentName).trim();
        }

        return await ProjectInvestment.findByIdAndUpdate(investmentId, updatePayload, {
            new: true,
            runValidators: true
        }).populate('createdBy', 'name email designation role');
    }

    async deleteInvestment(projectId, investmentId, user) {
        const project = await this.verifyProjectAccess(projectId, user);

        const existing = await ProjectInvestment.findOne({ _id: investmentId, projectId });
        if (!existing) {
            throw new AppError('Investment record not found in this project', 404);
        }

        if (!this.canModifyEntry(existing, project, user)) {
            throw new AppError('Permission denied to delete this investment entry', 403);
        }

        await ProjectInvestment.findByIdAndDelete(investmentId);
        return existing;
    }

    // ==========================================
    // B. EXPENSE CRUD & CUSTOM CATEGORIES
    // ==========================================
    async createExpense(projectId, data, user) {
        await this.verifyProjectAccess(projectId, user);

        const amount = Number(data.amount);
        if (isNaN(amount) || amount <= 0) {
            throw new AppError('Expense amount must be a positive number greater than ₹0', 400);
        }
        if (!data.title || !String(data.title).trim()) {
            throw new AppError('Expense title is required', 400);
        }
        if (!data.category || !String(data.category).trim()) {
            throw new AppError('Expense category is required', 400);
        }
        if (!data.paidBy || !String(data.paidBy).trim()) {
            throw new AppError('Paid by field is required', 400);
        }

        const categoryName = String(data.category).trim();

        // If it's a custom category not in predefined list, persist it in ExpenseCategory for this project
        if (!PREDEFINED_EXPENSE_CATEGORIES.includes(categoryName)) {
            await ExpenseCategory.findOneAndUpdate(
                { projectId, name: categoryName },
                { $setOnInsert: { projectId, name: categoryName, createdBy: user._id } },
                { upsert: true, new: true }
            );
        }

        const expense = await ProjectExpense.create({
            projectId,
            title: String(data.title).trim(),
            amount: Number(amount.toFixed(2)),
            category: categoryName,
            expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
            description: data.description ? String(data.description).trim() : '',
            paidBy: String(data.paidBy).trim(),
            attachmentUrl: data.attachmentUrl ? String(data.attachmentUrl).trim() : '',
            attachmentName: data.attachmentName ? String(data.attachmentName).trim() : '',
            createdBy: user._id
        });

        return await ProjectExpense.findById(expense._id).populate(
            'createdBy',
            'name email designation role'
        );
    }

    async updateExpense(projectId, expenseId, data, user) {
        const project = await this.verifyProjectAccess(projectId, user);

        const existing = await ProjectExpense.findOne({ _id: expenseId, projectId });
        if (!existing) {
            throw new AppError('Expense record not found in this project', 404);
        }

        if (!this.canModifyEntry(existing, project, user)) {
            throw new AppError('Permission denied to edit this expense entry', 403);
        }

        const updatePayload = {};
        if (data.title !== undefined) {
            if (!String(data.title).trim()) throw new AppError('Expense title cannot be empty', 400);
            updatePayload.title = String(data.title).trim();
        }
        if (data.amount !== undefined) {
            const amount = Number(data.amount);
            if (isNaN(amount) || amount <= 0) {
                throw new AppError('Expense amount must be greater than ₹0', 400);
            }
            updatePayload.amount = Number(amount.toFixed(2));
        }
        if (data.category !== undefined) {
            const categoryName = String(data.category).trim();
            if (!categoryName) throw new AppError('Expense category cannot be empty', 400);
            updatePayload.category = categoryName;
            if (!PREDEFINED_EXPENSE_CATEGORIES.includes(categoryName)) {
                await ExpenseCategory.findOneAndUpdate(
                    { projectId, name: categoryName },
                    { $setOnInsert: { projectId, name: categoryName, createdBy: user._id } },
                    { upsert: true, new: true }
                );
            }
        }
        if (data.expenseDate !== undefined) {
            updatePayload.expenseDate = new Date(data.expenseDate);
        }
        if (data.description !== undefined) {
            updatePayload.description = String(data.description).trim();
        }
        if (data.paidBy !== undefined) {
            if (!String(data.paidBy).trim()) throw new AppError('Paid by field cannot be empty', 400);
            updatePayload.paidBy = String(data.paidBy).trim();
        }
        if (data.attachmentUrl !== undefined) {
            updatePayload.attachmentUrl = String(data.attachmentUrl).trim();
        }
        if (data.attachmentName !== undefined) {
            updatePayload.attachmentName = String(data.attachmentName).trim();
        }

        return await ProjectExpense.findByIdAndUpdate(expenseId, updatePayload, {
            new: true,
            runValidators: true
        }).populate('createdBy', 'name email designation role');
    }

    async deleteExpense(projectId, expenseId, user) {
        const project = await this.verifyProjectAccess(projectId, user);

        const existing = await ProjectExpense.findOne({ _id: expenseId, projectId });
        if (!existing) {
            throw new AppError('Expense record not found in this project', 404);
        }

        if (!this.canModifyEntry(existing, project, user)) {
            throw new AppError('Permission denied to delete this expense entry', 403);
        }

        await ProjectExpense.findByIdAndDelete(expenseId);
        return existing;
    }

    async addCustomExpenseCategory(projectId, name, user) {
        await this.verifyProjectAccess(projectId, user);
        if (!name || !String(name).trim()) {
            throw new AppError('Category name is required', 400);
        }
        const trimmedName = String(name).trim();
        const category = await ExpenseCategory.findOneAndUpdate(
            { projectId, name: trimmedName },
            { $setOnInsert: { projectId, name: trimmedName, createdBy: user._id } },
            { upsert: true, new: true }
        );
        return category;
    }

    // ==========================================
    // C. SALES & REVENUE CRUD
    // ==========================================
    async createSale(projectId, data, user) {
        await this.verifyProjectAccess(projectId, user);

        if (!data.productName || !String(data.productName).trim()) {
            throw new AppError('Product/item sold is required', 400);
        }

        const quantity = Number(data.quantity);
        if (isNaN(quantity) || quantity <= 0) {
            throw new AppError('Quantity must be greater than zero', 400);
        }

        const unitPrice = Number(data.unitPrice);
        if (isNaN(unitPrice) || unitPrice < 0) {
            throw new AppError('Sale price per unit cannot be negative', 400);
        }

        const totalAmount = Number((quantity * unitPrice).toFixed(2));

        const sale = await ProjectSale.create({
            projectId,
            productName: String(data.productName).trim(),
            quantity,
            saleDate: data.saleDate ? new Date(data.saleDate) : new Date(),
            unitPrice: Number(unitPrice.toFixed(2)),
            totalAmount,
            customerName: data.customerName ? String(data.customerName).trim() : '',
            description: data.description ? String(data.description).trim() : '',
            attachmentUrl: data.attachmentUrl ? String(data.attachmentUrl).trim() : '',
            attachmentName: data.attachmentName ? String(data.attachmentName).trim() : '',
            createdBy: user._id
        });

        return await ProjectSale.findById(sale._id).populate(
            'createdBy',
            'name email designation role'
        );
    }

    async updateSale(projectId, saleId, data, user) {
        const project = await this.verifyProjectAccess(projectId, user);

        const existing = await ProjectSale.findOne({ _id: saleId, projectId });
        if (!existing) {
            throw new AppError('Sale record not found in this project', 404);
        }

        if (!this.canModifyEntry(existing, project, user)) {
            throw new AppError('Permission denied to edit this sale entry', 403);
        }

        if (data.productName !== undefined) {
            if (!String(data.productName).trim()) {
                throw new AppError('Product/item sold cannot be empty', 400);
            }
            existing.productName = String(data.productName).trim();
        }
        if (data.quantity !== undefined) {
            const qty = Number(data.quantity);
            if (isNaN(qty) || qty <= 0) {
                throw new AppError('Quantity must be greater than zero', 400);
            }
            existing.quantity = qty;
        }
        if (data.unitPrice !== undefined) {
            const price = Number(data.unitPrice);
            if (isNaN(price) || price < 0) {
                throw new AppError('Sale price per unit cannot be negative', 400);
            }
            existing.unitPrice = Number(price.toFixed(2));
        }
        if (data.saleDate !== undefined) {
            existing.saleDate = new Date(data.saleDate);
        }
        if (data.customerName !== undefined) {
            existing.customerName = String(data.customerName).trim();
        }
        if (data.description !== undefined) {
            existing.description = String(data.description).trim();
        }
        if (data.attachmentUrl !== undefined) {
            existing.attachmentUrl = String(data.attachmentUrl).trim();
        }
        if (data.attachmentName !== undefined) {
            existing.attachmentName = String(data.attachmentName).trim();
        }

        // Recalculate totalAmount automatically
        existing.totalAmount = Number((existing.quantity * existing.unitPrice).toFixed(2));
        await existing.save();

        return await ProjectSale.findById(existing._id).populate(
            'createdBy',
            'name email designation role'
        );
    }

    async deleteSale(projectId, saleId, user) {
        const project = await this.verifyProjectAccess(projectId, user);

        const existing = await ProjectSale.findOne({ _id: saleId, projectId });
        if (!existing) {
            throw new AppError('Sale record not found in this project', 404);
        }

        if (!this.canModifyEntry(existing, project, user)) {
            throw new AppError('Permission denied to delete this sale entry', 403);
        }

        await ProjectSale.findByIdAndDelete(saleId);
        return existing;
    }
}

export default new FinanceService();

