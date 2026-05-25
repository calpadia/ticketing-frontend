import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNotificationStore = defineStore('notifications', () => {
  // Map of ticketId -> unread message count
  const unreadMessages = ref(JSON.parse(localStorage.getItem('unreadMessages') || '{}'))

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

  function save() {
    localStorage.setItem('unreadMessages', JSON.stringify(unreadMessages.value))
  }

  return { unreadMessages, totalUnread, addUnread, clearUnread, getUnread }
})
