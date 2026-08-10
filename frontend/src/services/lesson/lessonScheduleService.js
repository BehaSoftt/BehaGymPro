import api from '../../utils/api';

const { apiClient } = api;

export const lessonScheduleService = {
    async getCalendar() {
        const response = await apiClient.get('/lesson-schedules/calendar');
        return response.data;
    },

    async getAll(params = {}) {
        const response = await apiClient.get('/lesson-schedules', { params });
        return response.data;
    },

    async create(data) {
        const response = await apiClient.post('/lesson-schedules', data);
        return response.data;
    },

    async update(id, data) {
        const response = await apiClient.put(`/lesson-schedules/${id}`, data);
        return response.data;
    },

    async delete(id) {
        const response = await apiClient.delete(`/lesson-schedules/${id}`);
        return response.data;
    },

    async takeAttendance(data) {
        const response = await apiClient.post('/lesson-schedules/attendance', data);
        return response.data;
    }
};
