import api from './api'

export const authService = {
  register: async (data) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  verifyOtp: async (email, code, registerData = null) => {
    const body = {
      email,
      code,
      ...(registerData && {
        password: registerData.password,
        confirmPassword: registerData.confirmPassword,
        fullName: registerData.fullName,
        phone: registerData.phone,
        role: registerData.role || 'Tenant',
      }),
    }
    const response = await api.post('/auth/verify-otp', body)
    return response.data
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  logout: async () => {
    await api.post('/auth/logout')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      email,
      otp,
      newPassword,
    })
    return response.data
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    })
    return response.data
  },

  resendOtp: async (email) => {
    const response = await api.post('/auth/resend-otp', { email })
    return response.data
  },
}

