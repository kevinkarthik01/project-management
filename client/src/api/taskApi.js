import apiClient from "./apiClient";

export const taskApi = {
    getByProject: async (projectId, status = 'all') => {
        const query = status && status != 'all' ? `?status=${status}` : '';
        const response = await apiClient.get(`/tasks/project/${projectId}${query}`);
        //return response.data;
        return response;
    },
    create: async (taskData) => {
        const response = await apiClient.post(`/tasks`, taskData);
        return response.data;
    },
    update: async (id, taskData) => {
        const response = await apiClient.put(`/tasks/${id}`, taskData);
        return response.data;
    },
    delete: async (id) => {
        return await apiClient.delete(`/tasks/${id}`);
    },
    getProjectsSummary: async () => {
        const response = await apiClient.get(`/tasks/summary/projects`);
        return response.data;
    },
    getAll: async (params = {}) => {
        const response = await apiClient.get(`/tasks`, { params });
        return response.data;
    }
}
export default taskApi;