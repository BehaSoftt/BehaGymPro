import api from '../../utils/api';

const { apiClient } = api;

export const nutritionService = {
    async getByMemberId(memberId) {
        const response = await apiClient.get(`/nutrition-plans/${memberId}`);
        return response.data;
    }
};
