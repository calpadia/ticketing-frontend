import { ref, watch } from 'vue'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import { getTickets } from '../api/tickets'
import { triggerNotification } from '../utils/notify'

let stompClient = null
let subscriptions = []
const connected = ref(false)
const initialized = ref(false)

export function useGlobalChat() {
  const auth = useAuthStore()
  const notifications = useNotificationStore()

  function connect() {
    if (stompClient || !auth.token || auth.token === 'demo-token') return

    // Fetch baseline unread count from API
    notifications.fetchUnreadCount()

    const wsUrl = `${window.location.protocol === 'https:' ? 'https' : 'http'}://${window.location.host}/ws`

    stompClient = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${auth.token}`,
      },
      onConnect: async () => {
        connected.value = true
        // Poin 3: Reconnection Gap - Selalu tarik count terbaru dari DB saat koneksi pulih
        notifications.fetchUnreadCount()
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

      // Initialize ticket count and badge for fresh sessions
      notifications.fetchUnreadCount()

      tickets.forEach(t => {
        if (stompClient && connected.value) {
          // Subscribe to chat messages
          const chatSub = stompClient.subscribe(`/topic/chat/${t.id}`, (message) => {
            const msg = JSON.parse(message.body)
            if (msg.senderId !== auth.user?.id) {
              const currentPath = window.location.hash || window.location.pathname
              if (!currentPath.includes(`/tickets/${t.id}`)) {
                notifications.addUnread(t.id)
                // Poin 4: Suara / Push Notif
                triggerNotification(`Pesan baru di Tiket #${t.ticketNumber}`, msg.content || 'Lampiran dikirim')
              }
            }
          })
          subscriptions.push(chatSub)

          // Subscribe to ticket status changes
          const statusSub = stompClient.subscribe(`/topic/tickets/${t.id}/status`, () => {
            // Ticket status changed — could refresh ticket list if needed
          })
          subscriptions.push(statusSub)

          // Subscribe to ticket assignment changes
          const assignSub = stompClient.subscribe(`/topic/tickets/${t.id}/assigned`, () => {
            // Assignment changed
          })
          subscriptions.push(assignSub)
        }
      })

      // Subscribe to new ticket broadcasts (real-time badge)
      if (stompClient && connected.value) {
        const newTicketSub = stompClient.subscribe('/topic/tickets/new', (message) => {
          const ticket = JSON.parse(message.body)
          if (ticket.requesterId !== auth.user?.id) {
            notifications.addNewTicket(ticket.id, ticket)
            // Poin 4: Suara / Push Notif
            triggerNotification(
              `Tiket Baru: #${ticket.ticketNumber}`, 
              ticket.priority === 'L1' ? 'URGENT: ' + ticket.title : ticket.title
            )
          }
        })
        subscriptions.push(newTicketSub)
      }

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

  return { connect, disconnect, connected, initialized, subscribeAll }
}
