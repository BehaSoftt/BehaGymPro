import api from '../../utils/api';

const { apiClient } = api;

export const companyService = {
    async getAll() {
        const response = await apiClient.get('/companies');
        return response.data;
    },

    async getById(id) {
        const response = await apiClient.get(`/companies/${id}`);
        return response.data;
    },

    async create(data) {
        const response = await apiClient.post('/companies', data);
        return response.data;
    },

    async update(id, data) {
        const response = await apiClient.put(`/companies/${id}`, data);
        return response.data;
    },

    async delete(id) {
        const response = await apiClient.delete(`/companies/${id}`);
        return response.data;
    },

    async updateLogo(id, logoPath) {
        const response = await apiClient.put(`/companies/${id}/logo`, { logo: logoPath });
        return response.data;
    },

    async addLicense(id, data) {
        const response = await apiClient.post(`/companies/${id}/license-add`, data);
        return response.data;
    },

    async toggleStatus(id) {
        const response = await apiClient.put(`/companies/${id}/toggle-status`);
        return response.data;
    },
    async addBranch(companyId, data) {
        const response = await apiClient.post(`/companies/${companyId}/branches`, data);
        return response.data;
    }
};
