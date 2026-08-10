import api from '../../utils/api'

const { apiClient } = api

export const sportGroupService = {
  getAll() {
    return apiClient.get('/sport-groups').then(r => r.data)
  },
  getMembers(groupId) {
    return apiClient.get(`/sport-groups/${groupId}/members`).then(r => r.data)
  },
  async addMember(groupId, memberId) {
    return apiClient.post(`/sport-groups/${groupId}/members`, { memberId }).then(r => r.data)
  },
  removeMember(groupId, memberId) {
    return apiClient.delete(`/sport-groups/${groupId}/members/${memberId}`).then(r => r.data)
  },
  create(data) {
    return apiClient.post('/sport-groups', data).then(r => r.data)
  },
  update(id, data) {
    return apiClient.put(`/sport-groups/${id}`, data).then(r => r.data)
  },
  delete(id) {
    return apiClient.delete(`/sport-groups/${id}`).then(r => r.data)
  }
}
