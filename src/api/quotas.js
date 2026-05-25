import api from './axios'

export const getClientQuotas = () => api.get('/client-quotas')
export const getClientQuotaById = (id) => api.get(`/client-quotas/${id}`)
export const createClientQuota = (data) => api.post('/client-quotas', data)
export const updateClientQuota = (id, data) => api.put(`/client-quotas/${id}`, data)
export const deleteClientQuota = (id) => api.delete(`/client-quotas/${id}`)

// User's own quota
export const getMyQuotas = () => api.get('/my-quotas')
export const getMyQuotaByYear = (year) => api.get(`/my-quotas/year/${year}`)
