import api from '../../utils/api';

const { apiClient } = api;

export const memberService = {
    async getAll(params = {}) {
        const response = await apiClient.get('/members', { params });
        return response.data;
    },

    async getById(id) {
        const response = await apiClient.get(`/members/${id}`);
        return response.data;
    },

    async create(memberData) {
        const response = await apiClient.post('/members', memberData);
        return response.data;
    },

    async update(id, memberData) {
        const response = await apiClient.put(`/members/${id}`, memberData);
        return response.data;
    },

    async delete(id) {
        const response = await apiClient.delete(`/members/${id}`);
        return response.data;
    },

    async bulkDelete(ids) {
        const response = await apiClient.post('/members/bulk-delete', { ids });
        return response.data;
    }
};
