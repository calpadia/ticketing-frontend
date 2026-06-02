import api from './axios'

export const getClientSupports = (clientId) => api.get(`/clients/${clientId}/supports`)
export const addClientSupports = (clientId, supportUserIds) => api.post(`/clients/${clientId}/supports`, { supportUserIds })
export const removeClientSupports = (clientId, supportUserIds) => api.delete(`/clients/${clientId}/supports`, { data: { supportUserIds } })
