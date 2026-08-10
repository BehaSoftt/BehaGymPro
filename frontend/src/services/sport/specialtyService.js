import api from '../../utils/api';

const { apiClient } = api;

export const specialtyService = {
    async getAll() {
        const response = await apiClient.get('/specialties');
        return response.data;
    },

    async getById(id) {
        const response = await apiClient.get(`/specialties/${id}`);
        return response.data;
    },

    async create(data) {
        const response = await apiClient.post('/specialties', data);
        return response.data;
    },

    async update(id, data) {
        const response = await apiClient.put(`/specialties/${id}`, data);
        return response.data;
    },

    async batchDelete(ids) {
        const response = await apiClient.post('/specialties/batch-delete', { ids });
        return response.data;
    },

    async toggleStatus(id) {
        const response = await apiClient.put(`/specialties/${id}/toggle-status`);
        return response.data;
    },

    // Exercise Categories
    async getCategories(specialtyId) {
        const response = await apiClient.get(`/exercise-categories?specialtyId=${specialtyId}`);
        return response.data;
    },

    async createCategory(data) {
        const response = await apiClient.post('/exercise-categories', data);
        return response.data;
    },

    async updateCategory(id, data) {
        const response = await apiClient.put(`/exercise-categories/${id}`, data);
        return response.data;
    },

    async deleteCategory(id) {
        const response = await apiClient.delete(`/exercise-categories/${id}`);
        return response.data;
    },

    // Exercises
    async createExercise(data) {
        const response = await apiClient.post('/exercises', data);
        return response.data;
    }
};
