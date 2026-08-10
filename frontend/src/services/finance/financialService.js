import api from '../../utils/api';

const { apiClient } = api;

export const financialService = {
  // Accounts
  getAccounts: async (params) => {
    const response = await apiClient.get('/financial-accounts', { params });
    return response.data;
  },
  getStats: async (params) => {
    const response = await apiClient.get('/financial-accounts/stats', { params });
    return response.data;
  },
  getAccountDetail: async (id) => {
    const response = await apiClient.get(`/financial-accounts/${id}`);
    return response.data;
  },
  syncAccount: async (id) => {
    const response = await apiClient.post(`/financial-accounts/${id}/sync`);
    return response.data;
  },
  updateAccount: async (id, data) => {
    const response = await apiClient.put(`/financial-accounts/${id}`, data);
    return response.data;
  },
  transfer: async (data) => {
    const response = await apiClient.post('/financial-accounts/transfer', data);
    return response.data;
  },
  closeBranchCash: async (data) => {
    const response = await apiClient.post('/financial-accounts/close-branch-cash', data);
    return response.data;
  },

  // Transactions
  getTransactions: async (params) => {
    const response = await apiClient.get('/financial-transactions', { params });
    return response.data;
  },
  createTransaction: async (data) => {
    const response = await apiClient.post('/financial-transactions', data);
    return response.data;
  },
  deleteTransaction: async (id) => {
    const response = await apiClient.delete(`/financial-transactions/${id}`);
    return response.data;
  },

  // Plans (Installments)
  getPlans: async (params) => {
    const response = await apiClient.get('/financial-plans', { params });
    return response.data;
  },
  getOverduePlans: async () => {
    const response = await apiClient.get('/financial-plans/overdue');
    return response.data;
  },
  createPlan: async (data) => {
    const response = await apiClient.post('/financial-plans', data);
    return response.data;
  },
  deletePlan: async (id) => {
    const response = await apiClient.delete(`/financial-plans/${id}`);
    return response.data;
  },
  payAll: async (id) => {
    const response = await apiClient.post(`/financial-plans/${id}/pay-all`);
    return response.data;
  },
  payInstallment: async (id, data) => {
    const response = await apiClient.post(`/financial-plans/schedule/${id}/pay`, data);
    return response.data;
  },
  cancelInstallment: async (id) => {
    const response = await apiClient.post(`/financial-plans/schedule/${id}/cancel`);
    return response.data;
  },
  deletePlan: async (id) => {
    const response = await apiClient.delete(`/financial-plans/${id}`);
    return response.data;
  },
  cancelPlan: async (id) => {
    const response = await apiClient.post(`/financial-plans/${id}/cancel`);
    return response.data;
  }
};
