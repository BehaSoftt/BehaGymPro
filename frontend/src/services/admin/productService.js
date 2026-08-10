import api from '../../utils/api'

const { apiClient } = api

export const productService = {
  // --- Products ---
  async getAll(params = {}) {
    const response = await apiClient.get('/products', { params })
    return response.data
  },

  async create(data) {
    const response = await apiClient.post('/products', data)
    return response.data
  },

  async update(id, data) {
    const response = await apiClient.put(`/products/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await apiClient.delete(`/products/${id}`)
    return response.data
  },

  async adjustStock(id, data) {
    const response = await apiClient.post(`/products/${id}/stock`, data)
    return response.data
  },

  async adjustStockBulk(data) {
    const response = await apiClient.post('/products/bulk-update-stock', data)
    return response.data
  },

  // --- Units ---
  async getUnits(params = {}) {
    const response = await apiClient.get('/products/units', { params })
    return response.data
  },

  async createUnit(data) {
    const response = await apiClient.post('/products/units', data)
    return response.data
  },

  async updateUnit(id, data) {
    const response = await apiClient.put(`/products/units/${id}`, data)
    return response.data
  },

  async deleteUnit(id) {
    const response = await apiClient.delete(`/products/units/${id}`)
    return response.data
  },

  // --- Groups ---
  async getGroups(params = {}) {
    const response = await apiClient.get('/products/groups', { params })
    return response.data
  },

  async createGroup(data) {
    const response = await apiClient.post('/products/groups', data)
    return response.data
  },

  async updateGroup(id, data) {
    const response = await apiClient.put(`/products/groups/${id}`, data)
    return response.data
  },

  async deleteGroup(id) {
    const response = await apiClient.delete(`/products/groups/${id}`)
    return response.data
  }
}
