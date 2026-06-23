<template>
  <div class="flex h-[calc(100vh-3rem)] gap-4">
    <!-- Ticket list (left panel) — full width on mobile, fixed width on desktop -->
    <div :class="[
      'bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden',
      'w-full lg:w-80',
      activeTicket ? 'hidden lg:flex' : 'flex'
    ]">
      <div class="p-4 border-b border-gray-200">
        <h3 class="font-semibold text-gray-900 mb-3">Tickets</h3>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input v-model="searchTicket" type="text" placeholder="Cari ticket..." class="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div v-if="filteredTickets.length === 0" class="p-4 text-center text-sm text-gray-500">
          Tidak ada ticket.
        </div>
        <div
          v-for="t in filteredTickets"
          :key="t.id"
          @click="selectTicket(t)"
          :class="[
            'px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors relative',
            activeTicket?.id === t.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50'
          ]"
        >
          <div class="flex items-center justify-between">
            <span class="font-mono text-xs text-blue-600">{{ t.ticketNumber }}</span>
            <div class="flex items-center gap-2">
              <span v-if="notifications.getUnread(t.id) > 0" class="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {{ notifications.getUnread(t.id) }}
              </span>
              <StatusBadge :status="t.status" />
            </div>
          </div>
          <p class="text-sm font-medium text-gray-900 mt-1 truncate">{{ t.title }}</p>
          <p class="text-xs text-gray-500 mt-0.5">{{ t.clientCompanyName }}</p>
        </div>
      </div>
    </div>

    <!-- Chat area (right panel) — full width on mobile when ticket selected -->
    <div :class="[
      'flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden',
      activeTicket ? 'flex' : 'hidden lg:flex'
    ]">
      <!-- Chat header -->
      <div v-if="activeTicket" class="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
        <!-- Back button on mobile -->
        <button @click="activeTicket = null" class="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 shrink-0">
          <ChevronLeft class="w-5 h-5" />
        </button>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-gray-900 truncate text-sm">{{ activeTicket.title }}</h3>
          <p class="text-xs text-gray-500 mt-0.5 truncate">{{ activeTicket.ticketNumber }} • {{ activeTicket.clientCompanyName }}</p>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <PriorityBadge :priority="activeTicket.priority" />
          <StatusBadge :status="activeTicket.status" />
        </div>
      </div>
      <div v-else class="px-6 py-4 border-b border-gray-200">
        <h3 class="font-semibold text-gray-500">Pilih ticket untuk memulai chat</h3>
      </div>

      <!-- Messages -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <div v-if="!activeTicket" class="flex items-center justify-center h-full">
          <div class="text-center">
            <MessageCircle class="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500">Pilih ticket dari daftar di sebelah kiri untuk melihat dan mengirim pesan.</p>
          </div>
        </div>

        <div v-else-if="messages.length === 0" class="flex items-center justify-center h-full">
          <div class="text-center">
            <MessageCircle class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500 text-sm">Belum ada pesan. Mulai percakapan.</p>
          </div>
        </div>

        <div v-for="msg in messages" :key="msg.id" :class="['flex', msg.senderId === currentUserId ? 'justify-end' : 'justify-start']">
          <div :class="['max-w-[80%] rounded-xl px-3 py-2.5', msg.senderId === currentUserId ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-900']">
            <div class="flex items-center gap-2 mb-1">
              <span :class="['text-xs font-medium', msg.senderId === currentUserId ? 'text-blue-200' : 'text-gray-500']">
                {{ msg.senderName }}
              </span>
              <span :class="['text-xs px-1.5 py-0.5 rounded', msg.senderId === currentUserId ? 'bg-blue-500 text-blue-100' : 'bg-gray-100 text-gray-500']">
                {{ msg.senderRole }}
              </span>
            </div>
            <p v-if="msg.content" class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
            <div v-if="msg.attachments && msg.attachments.length > 0" class="mt-2 space-y-1">
              <button v-for="att in msg.attachments" :key="att.id" @click="handleDownloadChatFile(att.id, att.fileName)"
                :class="['flex items-center gap-2 text-xs px-2 py-1 rounded', msg.senderId === currentUserId ? 'bg-blue-500 text-blue-100 hover:bg-blue-400' : 'bg-gray-100 text-blue-600 hover:bg-gray-200']">
                <Paperclip class="w-3 h-3" />
                <span class="truncate max-w-[150px]">{{ att.fileName }}</span>
              </button>
            </div>
            <p :class="['text-xs mt-1', msg.senderId === currentUserId ? 'text-blue-200' : 'text-gray-400']">
              {{ formatTime(msg.sentAt) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Input area -->
      <div v-if="activeTicket" class="px-4 py-3 border-t border-gray-200">
        <div v-if="pendingFiles.length > 0" class="flex flex-wrap gap-2 mb-3">
          <div v-for="(file, i) in pendingFiles" :key="i" class="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 text-xs">
            <Paperclip class="w-3 h-3 text-blue-500" />
            <span class="text-blue-700 truncate max-w-[120px]">{{ file.name }}</span>
            <button @click="pendingFiles.splice(i, 1)" class="text-red-400 hover:text-red-600 ml-1"><X class="w-3 h-3" /></button>
          </div>
        </div>
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <input ref="chatFileInput" type="file" class="hidden" multiple @change="handleFileAdd" />
          <button type="button" @click="$refs.chatFileInput.click()" :disabled="!connected" class="border border-gray-300 rounded-lg px-3 py-2.5 hover:bg-gray-50 disabled:opacity-50 transition-colors shrink-0">
            <Paperclip class="w-4 h-4 text-gray-500" />
          </button>
          <input
            v-model="newMessage"
            type="text"
            placeholder="Ketik pesan..."
            class="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
            :disabled="!connected"
          />
          <button
            type="submit"
            :disabled="(!newMessage.trim() && pendingFiles.length === 0) || !connected || uploading"
            class="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shrink-0"
          >
            <Send v-if="!uploading" class="w-4 h-4" />
            <span v-else class="text-xs">...</span>
          </button>
        </form>
        <p v-if="!connected" class="text-xs text-yellow-600 mt-2">Menghubungkan ke server chat...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs'
import { getTickets } from '../api/tickets'
import { getChatHistory, uploadChatFile, downloadChatAttachment } from '../api/chat'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import { Search, MessageCircle, Send, Paperclip, X, ChevronLeft } from 'lucide-vue-next'
import StatusBadge from '../components/StatusBadge.vue'
import PriorityBadge from '../components/PriorityBadge.vue'

const auth = useAuthStore()
const notifications = useNotificationStore()
const currentUserId = computed(() => auth.user?.id)

const tickets = ref([])
const activeTicket = ref(null)
const messages = ref([])
const newMessage = ref('')
const searchTicket = ref('')
const connected = ref(false)
const messagesContainer = ref(null)
const pendingFiles = ref([])
const uploading = ref(false)

let stompClient = null

const filteredTickets = computed(() =>
  tickets.value.filter(t =>
    t.title.toLowerCase().includes(searchTicket.value.toLowerCase()) ||
    t.ticketNumber.toLowerCase().includes(searchTicket.value.toLowerCase()) ||
    (t.clientCompanyName && t.clientCompanyName.toLowerCase().includes(searchTicket.value.toLowerCase()))
  )
)

const route = useRoute()

onMounted(async () => {
  try { const res = await getTickets(); tickets.value = res.data } catch { tickets.value = [] }
  connectWebSocket()

  // Auto-select ticket if ticketId is in query params
  const ticketId = route.query.ticketId
  if (ticketId) {
    const ticket = tickets.value.find(t => t.id === Number(ticketId))
    if (ticket) selectTicket(ticket)
  }
})

onUnmounted(() => {
  if (stompClient) {
    stompClient.deactivate()
  }
})

function connectWebSocket() {
  const wsUrl = `${window.location.protocol === 'https:' ? 'https' : 'http'}://${window.location.host}/ws`

  stompClient = new Client({
    webSocketFactory: () => new SockJS(wsUrl),
    connectHeaders: {
      Authorization: `Bearer ${auth.token}`,
    },
    onConnect: () => {
      connected.value = true
      subscribeToAllTickets()
    },
    onDisconnect: () => {
      connected.value = false
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame)
      connected.value = false
    },
    reconnectDelay: 5000,
  })

  stompClient.activate()
}

function subscribeToTicket(ticketId) {
  // No separate subscription needed - handled by subscribeToAllTickets
}

// Subscribe to all ticket chats for notifications
let allSubscriptions = []

function subscribeToAllTickets() {
  // Unsubscribe existing
  allSubscriptions.forEach(sub => sub.unsubscribe())
  allSubscriptions = []

  tickets.value.forEach(t => {
    if (stompClient && connected.value) {
      const sub = stompClient.subscribe(`/topic/chat/${t.id}`, (message) => {
        const msg = JSON.parse(message.body)

        // If it's the active ticket, add to messages
        if (activeTicket.value && activeTicket.value.id === t.id) {
          if (!messages.value.find(m => m.id === msg.id)) {
            messages.value.push(msg)
            scrollToBottom()
          }
        } else if (msg.senderId !== currentUserId.value) {
          // Not active ticket and not from self - mark as unread
          notifications.addUnread(t.id)
        }
      })
      allSubscriptions.push(sub)
    }
  })
}

async function selectTicket(ticket) {
  activeTicket.value = ticket
  messages.value = []
  notifications.clearUnread(ticket.id)

  // Load chat history
  try {
    const res = await getChatHistory(ticket.id)
    messages.value = res.data
  } catch {
    messages.value = []
  }

  // Subscribe to real-time updates
  subscribeToTicket(ticket.id)
  scrollToBottom()
}

async function sendMessage() {
  if ((!newMessage.value.trim() && pendingFiles.value.length === 0) || !activeTicket.value || !connected.value) return

  uploading.value = true
  let attachmentIds = []

  // Upload files first
  if (pendingFiles.value.length > 0) {
    try {
      for (const file of pendingFiles.value) {
        const res = await uploadChatFile(activeTicket.value.id, file)
        attachmentIds.push(res.data.id)
      }
    } catch {
      uploading.value = false
      return
    }
  }

  const payload = {
    ticketId: activeTicket.value.id,
    content: newMessage.value.trim() || null,
    attachmentIds: attachmentIds.length > 0 ? attachmentIds : null,
  }

  stompClient.publish({
    destination: '/app/chat.send',
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  })

  newMessage.value = ''
  pendingFiles.value = []
  uploading.value = false
}

function handleFileAdd(event) {
  const files = Array.from(event.target.files)
  pendingFiles.value.push(...files)
  event.target.value = ''
}

async function handleDownloadChatFile(id, fileName) {
  try {
    await downloadChatAttachment(id, fileName)
  } catch {
    // download failed
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>
