import api from './api'

export const contractService = {
  getAll: async () => {
    const response = await api.get('/contracts')
    return response.data
  },

  getPending: async () => {
    const response = await api.get('/contracts/pending')
    return response.data
  },

  getActive: async () => {
    const response = await api.get('/contracts/active')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/contracts/${id}`)
    return response.data
  },

  getMyContract: async () => {
    const response = await api.get('/contracts/my-contract')
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/contracts', data)
    return response.data
  },

  rentRoom: async (data) => {
    const response = await api.post('/contracts/rent-room', data)
    return response.data
  },

  approve: async (id, data) => {
    const response = await api.put(`/contracts/${id}/approve`, data)
    return response.data
  },

  reject: async (id) => {
    const response = await api.put(`/contracts/${id}/reject`)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/contracts/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/contracts/${id}`)
    return response.data
  },
}

