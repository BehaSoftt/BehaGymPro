import api from '../../utils/api'

const { apiClient } = api

export const licenseService = {
  async getAll(params = {}) {
    const response = await apiClient.get('/licenses/all', { params })
    return response.data
  },

  async getStatus() {
    const response = await apiClient.get('/licenses/status')
    return response.data
  },

  async generate(data) {
    const response = await apiClient.post('/licenses/generate', data)
    return response.data
  },

  async update(id, data) {
    const response = await apiClient.put(`/licenses/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await apiClient.delete(`/licenses/${id}`)
    return response.data
  }
}
