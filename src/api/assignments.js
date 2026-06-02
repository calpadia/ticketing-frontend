import api from './axios'

export const getTicketAssignments = (ticketId) => api.get(`/tickets/${ticketId}/assignments`)
export const getMyAssignments = () => api.get('/tickets/my-assignments')
export const assignTicket = (ticketId, data) => api.post(`/tickets/${ticketId}/assign`, data)
export const unassignTicket = (ticketId, data) => api.post(`/tickets/${ticketId}/unassign`, data)
export const reassignTicket = (ticketId, data) => api.post(`/tickets/${ticketId}/reassign`, data)
