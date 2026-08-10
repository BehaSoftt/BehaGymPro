import api from '../../utils/api';

const { apiClient } = api;

export const packageService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/packages', { params });
    return response.data;
  },
  create: async (data) => {
    const response = await apiClient.post('/packages', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await apiClient.put(`/packages/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/packages/${id}`);
    return response.data;
  }
};
