import api from '../../utils/api';

const { apiClient } = api;

export const attendanceService = {
  getPrivateAttendance: async (packageId, date) => {
    const response = await apiClient.get(`/attendance/private/${packageId}`, { params: { date } });
    return response.data;
  },
  submitPrivateAttendance: async (data) => {
    const response = await apiClient.post('/attendance/private', data);
    return response.data;
  },
  deletePrivateAttendance: async (attendanceId) => {
    const response = await apiClient.delete(`/attendance/private/${attendanceId}`);
    return response.data;
  },
  getGroupAttendance: async (groupId, date) => {
    const response = await apiClient.get(`/attendance/group/${groupId}`, { params: { date } });
    return response.data;
  },
  markAttendance: async (data) => {
    const response = await apiClient.post('/attendance/mark', data);
    return response.data;
  },
  deleteAttendance: async (attendanceId) => {
    const response = await apiClient.delete(`/attendance/${attendanceId}`);
    return response.data;
  }
};
