import api from './axios'

export const getChatHistory = (ticketId) => api.get(`/chat/${ticketId}`)
export const getChatHistoryByTicketNumber = (ticketNumber) => api.get(`/chat/ticket/${ticketNumber}`)

export const uploadChatFile = (ticketId, file) => {
  const formData = new FormData()
  formData.append('ticketId', ticketId)
  formData.append('file', file)
  return api.post('/chat/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export const downloadChatAttachment = async (id, fileName) => {
  const response = await api.get(`/chat/attachments/${id}/download`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName || 'attachment')
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
