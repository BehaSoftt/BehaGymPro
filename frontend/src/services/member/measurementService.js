import api from '../../utils/api';

const { apiClient } = api;

export const measurementService = {
    async getByMemberId(memberId) {
        const response = await apiClient.get(`/body-measurements?memberId=${memberId}`);
        return response.data;
    },

    async create(data) {
        const response = await apiClient.post('/body-measurements', data);
        return response.data;
    }
};
