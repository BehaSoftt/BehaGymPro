import api from '../../utils/api'

const { apiClient } = api

export const formationService = {
  getBySpecialty(specialtyId) {
    return apiClient.get(`/sport-formations?specialtyId=${specialtyId}`).then(r => r.data)
  },
  create(data) {
    return apiClient.post('/sport-formations', data).then(r => r.data)
  },
  update(id, data) {
    return apiClient.put(`/sport-formations/${id}`, data).then(r => r.data)
  },
  delete(id) {
    return apiClient.delete(`/sport-formations/${id}`).then(r => r.data)
  }
}
