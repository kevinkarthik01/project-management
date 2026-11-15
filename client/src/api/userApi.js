import apiClient from './apiClient.js';

export const userApi = {
    getAll: async () => {
        const response = await apiClient.get('/users');
        return response.data || [];
    }
};

export default userApi;
