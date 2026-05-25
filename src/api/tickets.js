import api from './axios'

export const getTickets = () => api.get('/tickets')
export const getTicketById = (id) => api.get(`/tickets/${id}`)
export const getTicketByNumber = (ticketNumber) => api.get(`/tickets/number/${ticketNumber}`)

// Create ticket with attachments (multipart)
export const createTicket = (data, files) => {
  const formData = new FormData()
  formData.append('title', data.title)
  formData.append('description', data.description)
  formData.append('priority', data.priority)
  formData.append('maintenanceType', data.maintenanceType)
  formData.append('clientId', data.clientId)
  formData.append('requesterId', data.requesterId)

  if (files && files.length > 0) {
    files.forEach(file => formData.append('files', file))
  }

  return api.post('/tickets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// Update ticket status
export const updateTicketStatus = (id, data) => api.put(`/tickets/${id}/status`, data)

// Get progress logs
export const getTicketProgress = (id) => api.get(`/tickets/${id}/progress`)
