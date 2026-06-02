import api from './axios'

export const getSlaReport = (params = {}) => {
  const query = new URLSearchParams()
  if (params.clientId) query.append('clientId', params.clientId)
  if (params.from) query.append('from', params.from)
  if (params.to) query.append('to', params.to)
  return api.get(`/sla-report?${query.toString()}`)
}

export const getSlaTargets = () => api.get('/sla-report/targets')
