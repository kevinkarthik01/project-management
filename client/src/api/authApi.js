import apiClient from './apiClient.js';

export const authApi = {
    register: async (userData) => {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
    },

    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },

    resetPassword: async (data) => {
        const response = await apiClient.post('/auth/reset-password', data);
        return response.data;
    },

    updatePassword: async (data) => {
        const response = await apiClient.patch('/auth/update-password', data);
        return response.data;
    }
};
// Request Interceptor: Attach JWT token if available
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default authApi;