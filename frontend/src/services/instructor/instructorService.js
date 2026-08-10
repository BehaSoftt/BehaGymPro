import api from '../../utils/api';

const { apiClient } = api;

export const instructorService = {
    async getAll() {
        const response = await apiClient.get('/instructors');
        const data = response.data;
        return Array.isArray(data) ? data : (data?.instructors || []);
    },

    async getById(id) {
        const response = await apiClient.get(`/instructors/${id}`);
        return response.data;
    },

    async create(data) {
        const response = await apiClient.post('/instructors', data);
        return response.data;
    },

    async update(id, data) {
        const response = await apiClient.put(`/instructors/${id}`, data);
        return response.data;
    },

    async delete(id) {
        const response = await apiClient.delete(`/instructors/${id}`);
        return response.data;
    },

    async toggleStatus(id) {
        const response = await apiClient.post(`/instructors/${id}/toggle-status`);
        return response.data;
    },

    async updateUserSettings(userId, settings) {
        const response = await apiClient.put(`/users/${userId}/settings`, settings);
        return response.data;
    }
};
