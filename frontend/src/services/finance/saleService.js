import api from '../../utils/api';

const { apiClient } = api;

export const saleService = {
  initiate: async (data) => {
    const response = await apiClient.post('/sales/initiate', data);
    return response.data;
  },
  searchEntities: async (query) => {
    const response = await apiClient.get('/sales/entities/search', { params: { q: query } });
    return response.data;
  },
  validateCart: async (data) => {
    const response = await apiClient.post('/sales/validate-cart', data);
    return response.data;
  },
  complete: async (data) => {
    const response = await apiClient.post('/sales/complete', data);
    return response.data;
  },
  getHistory: async (entityId, params) => {
    const response = await apiClient.get(`/sales/history/${entityId}`, { params });
    return response.data;
  },
  getDetails: async (saleId) => {
    const response = await apiClient.get(`/sales/${saleId}`);
    return response.data;
  }
};
