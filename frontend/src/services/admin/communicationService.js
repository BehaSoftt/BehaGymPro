import api from '../../utils/api'

const { apiClient } = api

export const communicationService = {
  sendBroadcastWhatsApp(data) {
    return apiClient.post('/test/broadcast-whatsapp', data).then(r => r.data)
  },
  testTelegram(data) {
    return apiClient.post('/test/telegram', data).then(r => r.data)
  },
  testWhatsAppConnection() {
    return apiClient.get('/test/whatsapp-status').then(r => r.data)
  }
}
