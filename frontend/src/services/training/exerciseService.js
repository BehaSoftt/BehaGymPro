import api from '../../utils/api';

const { apiClient } = api;

export const exerciseService = {
    async getAll() {
        const response = await apiClient.get('/exercises?limit=2000');
        return response.data;
    },

    async getById(id) {
        const response = await apiClient.get(`/exercises/${id}`);
        return response.data;
    },

    async create(data) {
        const response = await apiClient.post('/exercises', data);
        return response.data;
    },

    async update(id, data) {
        const response = await apiClient.put(`/exercises/${id}`, data);
        return response.data;
    },

    async delete(id) {
        const response = await apiClient.delete(`/exercises/${id}`);
        return response.data;
    },

    async batchDelete(ids) {
        const response = await apiClient.post('/exercises/batch-delete', { ids });
        return response.data;
    }
};
