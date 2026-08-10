import api from '../../utils/api'

const { apiClient } = api

export const beltExamService = {
  getAll: async () => {
    const res = await apiClient.get('/belt-exams')
    return res.data
  },

  getById: async (id) => {
    const res = await apiClient.get(`/belt-exams/${id}`)
    return res.data
  },

  create: async (data) => {
    const res = await apiClient.post('/belt-exams', data)
    return res.data
  },

  update: async (id, data) => {
    const res = await apiClient.put(`/belt-exams/${id}`, data)
    return res.data
  },

  delete: async (id) => {
    const res = await apiClient.delete(`/belt-exams/${id}`)
    return res.data
  },

  complete: async (id) => {
    const res = await apiClient.put(`/belt-exams/${id}/complete`)
    return res.data
  },

  getCandidates: async (params) => {
    const res = await apiClient.get('/belt-exams/candidates', { params })
    return res.data
  },

  addParticipants: async (data) => {
    const res = await apiClient.post('/belt-exams/participants', data)
    return res.data
  },

  updateParticipant: async (id, data) => {
    const res = await apiClient.put(`/belt-exams/participants/${id}`, data)
    return res.data
  },

  deleteParticipant: async (id) => {
    const res = await apiClient.delete(`/belt-exams/participants/${id}`)
    return res.data
  },

  setParticipantResult: async (id, status) => {
    const res = await apiClient.put(`/belt-exams/participants/${id}/result`, { status })
    return res.data
  },

  markAttendance: async (data) => {
    const res = await apiClient.post('/belt-exams/participants/mark-attendance', data)
    return res.data
  },

  updateAttendance: async (participantId, data) => {
    const res = await apiClient.put(`/belt-exams/participants/${participantId}/attendance`, data)
    return res.data
  },

  notify: async (participantId) => {
    const res = await apiClient.post('/belt-exams/notify', { participantId })
    return res.data
  }
}
