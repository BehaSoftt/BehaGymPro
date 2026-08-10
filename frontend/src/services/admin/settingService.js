import api from '../../utils/api';

const { apiClient } = api;

export const settingService = {
  /**
   * Kapsam önceliğine göre ayarı getirir
   * branch > company > global
   */
  getScoped: async (baseKey, params = {}) => {
    const response = await apiClient.get(`/settings/scope/${baseKey}`, { params });
    return response.data;
  },

  /**
   * Belirli bir anahtarın tüm kapsam varyantlarını listeler
   */
  listScoped: async (baseKey) => {
    const response = await apiClient.get(`/settings/list/${baseKey}`);
    return response.data;
  },

  /**
   * Tek bir ayarı anahtarı ile getirir
   */
  getByKey: async (key) => {
    const response = await apiClient.get(`/settings/${key}`);
    return response.data;
  },

  /**
   * Ayarı oluştur veya güncelle (Upsert)
   */
  update: async (key, data) => {
    const response = await apiClient.post(`/settings/${key}`, data);
    return response.data;
  },

  /**
   * Ayarı sil
   */
  delete: async (key) => {
    const response = await apiClient.delete(`/settings/${key}`);
    return response.data;
  }
};
