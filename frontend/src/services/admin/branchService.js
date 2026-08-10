import api from '../../utils/api';

const { apiClient } = api;

export const branchService = {
    async getAll() {
        const response = await apiClient.get('/branches');
        return response.data;
    },

    async getById(id) {
        const response = await apiClient.get(`/branches/${id}`);
        return response.data;
    },

    async create(data) {
        const response = await apiClient.post('/branches', data);
        return response.data;
    },

    async update(id, data) {
        const response = await apiClient.put(`/branches/${id}`, data);
        return response.data;
    },

    async delete(id) {
        const response = await apiClient.delete(`/branches/${id}`);
        return response.data;
    }
};
