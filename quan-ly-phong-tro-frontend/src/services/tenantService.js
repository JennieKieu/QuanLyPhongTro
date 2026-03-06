import api from './api'

export const tenantService = {
  getAll: async () => {
    const response = await api.get('/tenants')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/tenants/${id}`)
    return response.data
  },

  getMyProfile: async () => {
    const response = await api.get('/tenants/my-profile')
    return response.data
  },

  getMyRoom: async () => {
    const response = await api.get('/tenants/my-room')
    return response.data
  },

  updateProfile: async (data) => {
    const response = await api.put('/tenants/profile', data)
    return response.data
  },
}

