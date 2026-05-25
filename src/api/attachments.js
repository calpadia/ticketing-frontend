import api from './axios'

export const getAttachmentsByTicketId = (ticketId) => api.get(`/attachments/ticket/${ticketId}`)

export const downloadAttachment = async (id, fileName) => {
  const response = await api.get(`/attachments/${id}/download`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName || 'attachment')
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export const getDownloadUrl = (id) => `/api/v1/attachments/${id}/download`
