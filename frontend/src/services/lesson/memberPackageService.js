import api from '../../utils/api';

const { apiClient } = api;

export const memberPackageService = {
  assign: async (data) => {
    const response = await apiClient.post('/member-packages', data);
    return response.data;
  },
  unassign: async (id) => {
    const response = await apiClient.delete(`/member-packages/${id}`);
    return response.data;
  }
};
