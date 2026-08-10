import api from '../../utils/api'

const { apiClient } = api

export const roleService = {
  async getAll(params = {}) {
    const response = await apiClient.get('/roles', { params })
    return response.data
  },

  async getById(id) {
    const response = await apiClient.get(`/roles/${id}`)
    return response.data
  },

  async create(data) {
    const response = await apiClient.post('/roles', data)
    return response.data
  },

  async update(id, data) {
    const response = await apiClient.put(`/roles/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await apiClient.delete(`/roles/${id}`)
    return response.data
  },

  async getPermissions() {
    const response = await apiClient.get('/roles/permissions')
    return response.data
  },

  async syncPermissions() {
    const response = await apiClient.get('/test/fix-permissions')
    return response.data
  }
}
