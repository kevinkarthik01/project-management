import apiClient from './apiClient.js';

export const projectApi = {
    getAll: async () => {
        const response = await apiClient.get('/projects');
        return response.data;
    },
    getById: async (id) => {
        const response = await apiClient.get(`/projects/${id}`);
        return response.data;
    },
    create: async (projectData) => {
        const response = await apiClient.post('/projects', projectData);
        return response.data;
    },
    update: async (id, updateData) => {
        const response = await apiClient.put(`/projects/${id}`, updateData);
        return response.data;
    },
    delete: async (id) => {
        return await apiClient.delete(`/projects/${id}`)
    }
}

export default projectApi;