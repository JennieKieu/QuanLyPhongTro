import api from './api'

export const reportService = {
  getSummary: async ({ month, year } = {}) => {
    const query = new URLSearchParams()
    if (month) query.set('month', String(month))
    if (year) query.set('year', String(year))
    const qs = query.toString()
    const response = await api.get(`/reports/summary${qs ? `?${qs}` : ''}`)
    return response.data
  },
}

