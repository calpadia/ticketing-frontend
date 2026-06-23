import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotificationStore = defineStore('notifications', () => {
  // Map of ticketId -> unread message count
  const unreadMessages = ref(JSON.parse(localStorage.getItem('unreadMessages') || '{}'))

  // Count of new tickets since last viewed (sidebar badge)
  const newTicketCount = ref(Number(localStorage.getItem('newTicketCount') || '0'))
  const lastSeenTicketCount = ref(Number(localStorage.getItem('lastSeenTicketCount') || '0'))

  // Set of new ticket IDs received via WebSocket — shows "NEW" badge per row
  // Use array instead of Set for Vue reactivity
  const newTicketIds = ref(JSON.parse(localStorage.getItem('newTicketIds') || '[]'))
  const viewedTicketIds = ref(JSON.parse(localStorage.getItem('viewedTicketIds') || '[]'))

  // Buffer of new ticket objects received via WebSocket — Tickets.vue can watch this
  const incomingTicket = ref(null)

  const totalUnread = computed(() =>
    Object.values(unreadMessages.value).reduce((sum, count) => sum + count, 0)
  )

  function addUnread(ticketId) {
    const current = unreadMessages.value[ticketId] || 0
    unreadMessages.value = { ...unreadMessages.value, [ticketId]: current + 1 }
    save()
  }

  function clearUnread(ticketId) {
    if (unreadMessages.value[ticketId]) {
      const newUnread = { ...unreadMessages.value }
      delete newUnread[ticketId]
      unreadMessages.value = newUnread
      save()
    }
  }

  function getUnread(ticketId) {
    return unreadMessages.value[ticketId] || 0
  }

  function initializeFromTickets(tickets, authUser) {
    const currentCount = tickets.length
    tickets.forEach(t => {
      if (t.status === 'OPEN' && t.requesterId !== authUser?.id) {
        if (!viewedTicketIds.value.includes(t.id)) {
          if (!newTicketIds.value.includes(t.id)) {
            newTicketIds.value.push(t.id)
          }
        }
      }
    })
    
    newTicketCount.value = newTicketIds.value.length
    lastSeenTicketCount.value = currentCount
    saveNewTicketIds()
    localStorage.setItem('newTicketCount', String(newTicketCount.value))
    localStorage.setItem('lastSeenTicketCount', String(lastSeenTicketCount.value))
  }

  function clearNewTickets(currentCount) {
    newTicketCount.value = 0
    lastSeenTicketCount.value = currentCount
    localStorage.setItem('newTicketCount', '0')
    localStorage.setItem('lastSeenTicketCount', String(currentCount))
  }

  function addNewTicket(ticketId, ticketData = null) {
    newTicketCount.value++
    lastSeenTicketCount.value++
    localStorage.setItem('newTicketCount', String(newTicketCount.value))
    localStorage.setItem('lastSeenTicketCount', String(lastSeenTicketCount.value))
    if (ticketId && !newTicketIds.value.includes(ticketId)) {
      newTicketIds.value.push(ticketId)
      saveNewTicketIds()
    }
    if (ticketData) {
      incomingTicket.value = ticketData
    }
  }

  function markTicketSeen(ticketId) {
    const idx = newTicketIds.value.indexOf(ticketId)
    if (idx !== -1) {
      newTicketIds.value.splice(idx, 1)
      saveNewTicketIds()
    }
    if (!viewedTicketIds.value.includes(ticketId)) {
      viewedTicketIds.value.push(ticketId)
      localStorage.setItem('viewedTicketIds', JSON.stringify(viewedTicketIds.value))
    }
  }

  function isNewTicket(ticketId) {
    return newTicketIds.value.includes(ticketId)
  }

  function saveNewTicketIds() {
    localStorage.setItem('newTicketIds', JSON.stringify(newTicketIds.value))
  }

  function save() {
    localStorage.setItem('unreadMessages', JSON.stringify(unreadMessages.value))
  }

  return {
    unreadMessages,
    totalUnread,
    newTicketCount,
    newTicketIds,
    incomingTicket,
    addUnread,
    clearUnread,
    getUnread,
    initializeFromTickets,
    clearNewTickets,
    addNewTicket,
    markTicketSeen,
    isNewTicket,
  }
})
