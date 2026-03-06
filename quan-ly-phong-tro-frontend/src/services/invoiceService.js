import api from './api'

export const invoiceService = {
  getAll: async () => {
    const response = await api.get('/invoices')
    return response.data
  },

  getPending: async () => {
    const response = await api.get('/invoices/pending')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/invoices/${id}`)
    return response.data
  },

  getByContract: async (contractId) => {
    const response = await api.get(`/invoices/contract/${contractId}`)
    return response.data
  },

  getMyInvoices: async () => {
    const response = await api.get('/invoices/my-invoices')
    return response.data
  },

  generate: async (data) => {
    const response = await api.post('/invoices/generate', data)
    return response.data
  },

  pay: async (id, data) => {
    const response = await api.put(`/invoices/${id}/pay`, data)
    return response.data
  },
}

