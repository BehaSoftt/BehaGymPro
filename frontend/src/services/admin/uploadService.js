import api from '../../utils/api'

const { apiClient } = api

export const uploadService = {
  uploadFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data?.filePath || res.data
  }
}
