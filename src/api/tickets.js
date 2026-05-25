import api from './axios'
export const getTickets = () => api.get('/tickets')
export const getTicketById = (id) => api.get(`/tickets/${id}`)
export const createTicket = (data) => api.post('/tickets', data)
