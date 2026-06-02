import { ref, watch } from 'vue'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import { getTickets } from '../api/tickets'

let stompClient = null
let subscriptions = []
const connected = ref(false)
const initialized = ref(false)

export function useGlobalChat() {
  const auth = useAuthStore()
  const notifications = useNotificationStore()

  function connect() {
    if (stompClient || !auth.token || auth.token === 'demo-token') return

    const wsUrl = `${window.location.protocol === 'https:' ? 'https' : 'http'}://${window.location.host}/ws`

    stompClient = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${auth.token}`,
      },
      onConnect: async () => {
        connected.value = true
        await subscribeAll()
      },
      onDisconnect: () => {
        connected.value = false
      },
      onStompError: () => {
        connected.value = false
      },
      reconnectDelay: 5000,
    })

    stompClient.activate()
    initialized.value = true
  }

  async function subscribeAll() {
    // Unsubscribe existing
    subscriptions.forEach(sub => sub.unsubscribe())
    subscriptions = []

    try {
      const res = await getTickets()
      const tickets = res.data

      // Update ticket count for badge
      notifications.updateTicketCount(tickets.length)

      tickets.forEach(t => {
        if (stompClient && connected.value) {
          const sub = stompClient.subscribe(`/topic/chat/${t.id}`, (message) => {
            const msg = JSON.parse(message.body)
            // Only count as unread if not from current user
            if (msg.senderId !== auth.user?.id) {
              notifications.addUnread(t.id)
            }
          })
          subscriptions.push(sub)
        }
      })
    } catch {
      // tickets fetch failed
    }
  }

  function disconnect() {
    if (stompClient) {
      stompClient.deactivate()
      stompClient = null
      connected.value = false
      initialized.value = false
      subscriptions = []
    }
  }

  return { connect, disconnect, connected, initialized }
}
