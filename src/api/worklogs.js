import api from './axios'

export const getWorklogs = (ticketId) => api.get(`/tickets/${ticketId}/worklogs`)
export const startWorklog = (ticketId, data) => api.post(`/tickets/${ticketId}/worklogs`, data)
export const stopWorklog = (ticketId, worklogId, data) => api.put(`/tickets/${ticketId}/worklogs/${worklogId}/stop`, data)
