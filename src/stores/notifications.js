import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUnreadCount, markTicketAsRead as apiMarkRead } from '../api/notifications'

export const useNotificationStore = defineStore('notifications', () => {
  const newTicketCount = ref(0)
  const totalUnread = ref(0)
  const incomingTicket = ref(null)

  // Fetch unread count from the new backend API
  async function fetchUnreadCount() {
    try {
      const res = await getUnreadCount()
      newTicketCount.value = res.data.unreadTickets
      totalUnread.value = res.data.unreadMessages
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }

  // Called by TicketDetail.vue when a ticket is opened
  async function markTicketSeen(ticketId) {
    try {
      await apiMarkRead(ticketId)
      await fetchUnreadCount() // Refresh counts after reading
    } catch (err) {
      console.error('Failed to mark ticket as read:', err)
    }
  }

  // The below functions are kept for compatibility with useGlobalChat.js WebSocket events
  function addNewTicket(ticketId, ticketData = null) {
    // Optimistically update badge when WebSocket receives new ticket
    newTicketCount.value++
    if (ticketData) {
      incomingTicket.value = ticketData
    }
  }

  function addUnread(ticketId) {
    // Optimistically update message badge when WebSocket receives new chat
    totalUnread.value++
  }


  return {
    totalUnread,
    newTicketCount,
    incomingTicket,
    fetchUnreadCount,
    addUnread,
    addNewTicket,
    markTicketSeen
  }
})
