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
  if (data.projectId) formData.append('projectId', data.projectId)
  if (data.productType) formData.append('productType', data.productType)

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

// Export tickets as CSV
export const exportTicketsCsv = async (params = {}) => {
  const query = new URLSearchParams()
  if (params.clientId) query.append('clientId', params.clientId)
  if (params.from) query.append('from', params.from)
  if (params.to) query.append('to', params.to)
  const response = await api.get(`/tickets/export/csv?${query.toString()}`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', response.headers['content-disposition']?.split('filename="')[1]?.replace('"', '') || 'tickets-export.csv')
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
