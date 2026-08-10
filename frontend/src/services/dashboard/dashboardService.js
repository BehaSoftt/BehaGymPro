import api from '../../utils/api';

const { apiClient } = api;

export const dashboardService = {
    async getStats() {
        const response = await apiClient.get('/dashboard');
        return response.data;
    },

    async getMemberDashboard() {
        const response = await apiClient.get('/members/me/dashboard');
        return response.data;
    }
};
