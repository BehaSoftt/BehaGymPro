import axios from 'axios'
import Storage from '../../utils/Storage'

const host = window.location.hostname
const API_URL = `http://${host}:5000/api`

export const gateService = {
  getStats: async (branchId) => {
    const token = Storage.getItem('token')
    const res = await axios.get(`${API_URL}/qr/stats`, {
      params: { branchId },
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  },

  verifyQR: async (payload) => {
    const token = Storage.getItem('token')
    const res = await axios.post(`${API_URL}/qr/verify`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  },

  getTrainingLogs: async (planId, weekNumber, memberId) => {
    const token = Storage.getItem('token')
    const res = await axios.get(`${API_URL}/training-plans/logs/all`, {
      params: { planId, weekNumber, memberId },
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  },

  toggleTrainingLog: async (payload) => {
    const token = Storage.getItem('token')
    const res = await axios.post(`${API_URL}/training-logs/toggle`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  },

  sendHeartbeat: async () => {
    const token = Storage.getItem('token')
    const res = await axios.post(`${API_URL}/users/heartbeat`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data
  }
}
