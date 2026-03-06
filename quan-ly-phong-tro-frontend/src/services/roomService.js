import api from './api'

export const roomService = {
  getAll: async () => {
    const response = await api.get('/rooms')
    return response.data
  },

  getAvailable: async () => {
    const response = await api.get('/rooms/available')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/rooms/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/rooms', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/rooms/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/rooms/${id}`)
    return response.data
  },
}

