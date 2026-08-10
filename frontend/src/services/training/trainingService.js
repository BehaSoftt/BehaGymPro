import api from '../../utils/api';

const { apiClient } = api;

export const trainingService = {
    async getAll(params = {}) {
        const response = await apiClient.get('/training-plans', { params });
        return response.data;
    },

    async getById(id) {
        const response = await apiClient.get(`/training-plans/${id}`);
        return response.data;
    },

    async create(data) {
        const response = await apiClient.post('/training-plans', data);
        return response.data;
    },

    async update(id, data) {
        const response = await apiClient.put(`/training-plans/${id}`, data);
        return response.data;
    },

    async delete(id) {
        const response = await apiClient.delete(`/training-plans/${id}`);
        return response.data;
    },

    async getPlans() {
        return this.getAll();
    },

    async getPlanDetails(id) {
        return this.getById(id);
    },

    // Member methods (for compatibility if needed)
    async getPlansByMember(memberId) {
        const response = await apiClient.get(`/training-plans/member/${memberId}`);
        return response.data;
    },

    async createPlan(data) {
        return this.create(data);
    },

    async deletePlan(id) {
        return this.delete(id);
    },

    async getTemplates() {
        const response = await apiClient.get('/training-plans/templates');
        return response.data;
    },

    async logActivity(planId, data) {
        const response = await apiClient.post(`/training-plans/${planId}/log`, data);
        return response.data;
    },

    async getWeekLogs(planId, weekNumber, memberId) {
        const response = await apiClient.get('/training-plans/logs/all', {
            params: { planId, weekNumber, memberId }
        });
        return Array.isArray(response.data) ? response.data : (response.data?.logs || []);
    },

    async logBatchActivity(data) {
        const response = await apiClient.post('/training-plans/log/batch-activity', data);
        return response.data;
    }
};
