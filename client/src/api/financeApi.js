import apiClient from './apiClient.js';

export const financeApi = {
    getOverview: async (projectId, params = {}) => {
        const response = await apiClient.get(`/projects/${projectId}/finance`, { params });
        return response.data;
    },

    // Investments
    createInvestment: async (projectId, payload) => {
        const response = await apiClient.post(`/projects/${projectId}/finance/investments`, payload);
        return response.data;
    },
    updateInvestment: async (projectId, investmentId, payload) => {
        const response = await apiClient.put(
            `/projects/${projectId}/finance/investments/${investmentId}`,
            payload
        );
        return response.data;
    },
    deleteInvestment: async (projectId, investmentId) => {
        return await apiClient.delete(`/projects/${projectId}/finance/investments/${investmentId}`);
    },

    // Expenses
    createExpense: async (projectId, payload) => {
        const response = await apiClient.post(`/projects/${projectId}/finance/expenses`, payload);
        return response.data;
    },
    updateExpense: async (projectId, expenseId, payload) => {
        const response = await apiClient.put(
            `/projects/${projectId}/finance/expenses/${expenseId}`,
            payload
        );
        return response.data;
    },
    deleteExpense: async (projectId, expenseId) => {
        return await apiClient.delete(`/projects/${projectId}/finance/expenses/${expenseId}`);
    },
    addCustomCategory: async (projectId, name) => {
        const response = await apiClient.post(`/projects/${projectId}/finance/categories`, { name });
        return response.data;
    },

    // Sales
    createSale: async (projectId, payload) => {
        const response = await apiClient.post(`/projects/${projectId}/finance/sales`, payload);
        return response.data;
    },
    updateSale: async (projectId, saleId, payload) => {
        const response = await apiClient.put(
            `/projects/${projectId}/finance/sales/${saleId}`,
            payload
        );
        return response.data;
    },
    deleteSale: async (projectId, saleId) => {
        return await apiClient.delete(`/projects/${projectId}/finance/sales/${saleId}`);
    }
};

export default financeApi;

