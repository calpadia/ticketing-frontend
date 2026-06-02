import api from './axios'
export const getClients = () => api.get('/clients')
export const getClientById = (id) => api.get(`/clients/${id}`)
export const createClient = (data) => api.post('/clients', data)
export const updateClient = (id, data) => api.put(`/clients/${id}`, data)
export const updateClientStatus = (id, isActive) => api.patch(`/clients/${id}/status`, { isActive })
export const deleteClient = (id) => api.delete(`/clients/${id}`)
