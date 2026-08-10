import api from '../../utils/api'

const { apiClient } = api

export const groupClassService = {
  getAll: async () => {
    const res = await apiClient.get('/group-classes')
    return res.data
  },

  getById: async (id) => {
    const res = await apiClient.get(`/group-classes/${id}`)
    return res.data
  },

  create: async (data) => {
    const res = await apiClient.post('/group-classes', data)
    return res.data
  },

  update: async (id, data) => {
    const res = await apiClient.put(`/group-classes/${id}`, data)
    return res.data
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/group-classes/${id}`)
    return res.data
  },

  batchDelete: async (ids) => {
    const res = await apiClient.post('/group-classes/batch-delete', { ids })
    return res.data
  },

  enroll: async (groupClassId, memberIds) => {
    const res = await apiClient.post('/group-classes/enroll', { groupClassId, memberIds })
    return res.data
  },

  unenroll: async (groupClassId, memberId) => {
    const res = await apiClient.post('/group-classes/unenroll', { groupClassId, memberId })
    return res.data
  }
}
