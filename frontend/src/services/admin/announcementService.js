import api from '../../utils/api'

const { apiClient } = api

export const announcementService = {
  async getAll(params = {}) {
    const response = await apiClient.get('/announcements', { params })
    return response.data
  },

  async create(data) {
    const response = await apiClient.post('/announcements', data)
    return response.data
  },

  async update(id, data) {
    const response = await apiClient.put(`/announcements/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await apiClient.delete(`/announcements/${id}`)
    return response.data
  }
}
