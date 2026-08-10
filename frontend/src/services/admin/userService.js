import api from '../../utils/api'

const { apiClient } = api

export const userService = {
  async getAll(params = {}) {
    const response = await apiClient.get('/users', { params })
    // Backend { total, pages, currentPage, users } döndürüyor
    return Array.isArray(response.data) ? response.data : (response.data?.users || [])
  },

  async getById(id) {
    const response = await apiClient.get(`/users/${id}`)
    return response.data
  },

  async create(data) {
    const response = await apiClient.post('/users', data)
    return response.data
  },

  async updateSettings(id, data) {
    const response = await apiClient.put(`/users/${id}/settings`, data)
    return response.data
  },

  async delete(id) {
    const response = await apiClient.delete(`/users/${id}`)
    return response.data
  },

  async getKioskConfig(id) {
    const response = await apiClient.get(`/users/kiosk-config/${id}`)
    return response.data
  },

  async saveKioskConfig(data) {
    const response = await apiClient.post('/users/kiosk-config', data)
    return response.data
  },

  async sendSingleWhatsApp(data) {
    return apiClient.post('/test/send-single-whatsapp', data).then(r => r.data)
  }
}
