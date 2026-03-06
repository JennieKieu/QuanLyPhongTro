import api from './api'

export const utilityService = {
  getAll: async () => {
    const response = await api.get('/utilities')
    return response.data
  },

  getByRoom: async (roomId) => {
    const response = await api.get(`/utilities/room/${roomId}`)
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/utilities/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/utilities', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/utilities/${id}`, data)
    return response.data
  },
}

