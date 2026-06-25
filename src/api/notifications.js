import api from './axios'

export const getUnreadCount = () => api.get('/notifications/unread-count')
export const markTicketAsRead = (ticketId) => api.post(`/tickets/${ticketId}/read`)
