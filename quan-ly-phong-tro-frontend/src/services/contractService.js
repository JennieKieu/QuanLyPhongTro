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

  getAwaitingDeposit: async () => {
    const response = await api.get('/contracts/awaiting-deposit')
    return response.data
  },

  getActive: async () => {
    const response = await api.get('/contracts/active')
    return response.data
  },

  getExpiringSoon: async (days = 30) => {
    const response = await api.get(`/contracts/expiring-soon?days=${days}`)
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

  exportPdf: async (id) => {
    const response = await api.get(`/contracts/${id}/pdf`, {
      responseType: 'blob',
      headers: { Accept: 'application/pdf' },
    })
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

  extend: async (id, data) => {
    const response = await api.put(`/contracts/${id}/extend`, data)
    return response.data
  },

  terminate: async (id, data) => {
    const response = await api.put(`/contracts/${id}/terminate`, data)
    return response.data
  },

  terminateAsTenant: async (id, data) => {
    const response = await api.put(`/contracts/${id}/terminate-by-tenant`, data)
    return response.data
  },

  recordDepositRefund: async (id, data) => {
    const response = await api.put(`/contracts/${id}/deposit-refund`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/contracts/${id}`)
    return response.data
  },
}

