import apiClient from './apiClient.js';

export const insightApi = {
    getByProject: async (projectId, params = {}) => {
        const response = await apiClient.get(`/projects/${projectId}/insights`, { params });
        return response.data;
    },
    create: async (projectId, payload) => {
        const response = await apiClient.post(`/projects/${projectId}/insights`, payload);
        return response.data;
    },
    update: async (projectId, insightId, payload) => {
        const response = await apiClient.put(`/projects/${projectId}/insights/${insightId}`, payload);
        return response.data;
    },
    togglePin: async (projectId, insightId) => {
        const response = await apiClient.patch(`/projects/${projectId}/insights/${insightId}/pin`);
        return response.data;
    },
    delete: async (projectId, insightId) => {
        return await apiClient.delete(`/projects/${projectId}/insights/${insightId}`);
    }
};

export default insightApi;

