import api from '../../utils/api';

const { apiClient } = api;

export const privateLessonService = {
  getPackages: async (params = {}) => {
    const response = await apiClient.get('/private-lesson-packages', { params });
    return response.data;
  },
  createPackage: async (data) => {
    const response = await apiClient.post('/private-lesson-packages', data);
    return response.data;
  },
  updatePackage: async (id, data) => {
    const response = await apiClient.put(`/private-lesson-packages/${id}`, data);
    return response.data;
  },
  archivePackage: async (id) => {
    const response = await apiClient.post(`/private-lesson-packages/${id}/archive`);
    return response.data;
  },
  deletePackage: async (id) => {
    const response = await apiClient.delete(`/private-lesson-packages/${id}`);
    return response.data;
  }
};
