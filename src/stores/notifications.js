import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotificationStore = defineStore('notifications', () => {
  // Map of ticketId -> unread message count
  const unreadMessages = ref(JSON.parse(localStorage.getItem('unreadMessages') || '{}'))
  // Count of new tickets since last viewed
  const newTicketCount = ref(Number(localStorage.getItem('newTicketCount') || '0'))
  const lastSeenTicketCount = ref(Number(localStorage.getItem('lastSeenTicketCount') || '0'))

  const totalUnread = computed(() =>
    Object.values(unreadMessages.value).reduce((sum, count) => sum + count, 0)
  )

  function addUnread(ticketId) {
    if (!unreadMessages.value[ticketId]) {
      unreadMessages.value[ticketId] = 0
    }
    unreadMessages.value[ticketId]++
    save()
  }

  function clearUnread(ticketId) {
    delete unreadMessages.value[ticketId]
    save()
  }

  function getUnread(ticketId) {
    return unreadMessages.value[ticketId] || 0
  }

  function updateTicketCount(currentCount) {
    if (lastSeenTicketCount.value === 0) {
      // First time — no badge
      lastSeenTicketCount.value = currentCount
    } else if (currentCount > lastSeenTicketCount.value) {
      newTicketCount.value = currentCount - lastSeenTicketCount.value
    }
    localStorage.setItem('lastSeenTicketCount', String(lastSeenTicketCount.value))
    localStorage.setItem('newTicketCount', String(newTicketCount.value))
  }

  function clearNewTickets(currentCount) {
    newTicketCount.value = 0
    lastSeenTicketCount.value = currentCount
    localStorage.setItem('newTicketCount', '0')
    localStorage.setItem('lastSeenTicketCount', String(currentCount))
  }

  function save() {
    localStorage.setItem('unreadMessages', JSON.stringify(unreadMessages.value))
  }

  return { unreadMessages, totalUnread, newTicketCount, addUnread, clearUnread, getUnread, updateTicketCount, clearNewTickets }
})
