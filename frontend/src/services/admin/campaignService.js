import api from '../../utils/api'

const { apiClient } = api

export const campaignService = {
  async getAll(params = {}) {
    const response = await apiClient.get('/campaigns', { params })
    return response.data
  },

  async create(data) {
    const response = await apiClient.post('/campaigns', data)
    return response.data
  },

  async update(id, data) {
    const response = await apiClient.put(`/campaigns/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await apiClient.delete(`/campaigns/${id}`)
    return response.data
  },

  async getActive(params = {}) {
    const response = await apiClient.get('/campaigns/active', { params })
    return response.data
  }
}
