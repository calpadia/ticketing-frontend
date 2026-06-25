<template>
  <div v-if="loading" class="flex items-center justify-center py-20">
    <div class="text-gray-500 text-sm">Memuat ticket...</div>
  </div>
  <div v-else-if="!ticket" class="flex items-center justify-center py-20">
    <div class="text-center">
      <div class="text-4xl mb-4">🎫</div>
      <h3 class="text-lg font-semibold text-gray-700 mb-2">Ticket tidak ditemukan</h3>
      <p class="text-sm text-gray-500 mb-4">Ticket yang kamu cari tidak ada atau kamu tidak memiliki akses.</p>
      <button @click="router.push('/tickets')" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700" v-tooltip="'Kembali ke halaman daftar tiket'">
        Kembali ke Tickets
      </button>
    </div>
  </div>
  <div v-else>
    <ConfirmDialog ref="confirmDialog" />
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
      <button @click="router.push('/tickets')" class="flex items-center gap-1 hover:text-gray-900 transition-colors" v-tooltip="'Kembali ke halaman daftar tiket'">
        <ChevronLeft class="w-4 h-4" /> Tickets
      </button>
      <span class="text-gray-300">/</span>
      <span class="font-medium text-gray-800">{{ ticket.ticketNumber }}</span>
    </div>

    <!-- Closed banner -->
    <div v-if="ticket.status === 'CLOSED'" class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg mb-4">
      <AlertCircle class="w-4 h-4 shrink-0" />
      Tiket ini telah <strong class="mx-1">ditutup (CLOSED)</strong>. Tidak ada aktivitas lebih lanjut yang diperlukan.
    </div>

    <!-- Main layout -->
    <div class="flex flex-col lg:flex-row gap-5">
      <!-- LEFT: Main content -->
      <div class="flex-1 space-y-5 min-w-0">

        <!-- Header card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p class="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">CLIENT: {{ ticket.clientCompanyName }}</p>
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <h1 class="text-xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
              <button @click="copyTicketNumber" class="flex items-center gap-1.5 hover:text-blue-600 transition-colors group" v-tooltip="'Copy Ticket Number'">
                #{{ ticket.ticketNumber }}
                <Copy class="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <span>: {{ ticket.title }}</span>
            </h1>
            <StatusBadge :status="ticket.status" />
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Project Name</p>
              <p class="text-sm font-medium text-gray-800">{{ ticket.projectName || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Product Type</p>
              <p class="text-sm font-medium text-gray-800">{{ productTypeLabel(ticket.productType) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Maintenance Type</p>
              <span :class="['px-2.5 py-0.5 rounded-full text-xs font-semibold border', ticket.maintenanceType === 'PM' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-teal-100 text-teal-800 border-teal-200']">
                {{ ticket.maintenanceType === 'PM' ? 'Preventive Maintenance (PM)' : 'Corrective Maintenance (CM)' }}
              </span>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Priority</p>
              <PriorityBadge :priority="ticket.priority" />
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Requester</p>
              <p class="text-sm font-medium text-gray-800">{{ ticket.requesterName }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Created</p>
              <p class="text-sm font-medium text-gray-800">{{ formatDate(ticket.createdAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Issue Description -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FileText class="w-4 h-4" /> Issue Description</h3>
          <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ ticket.description }}</p>
        </div>

        <!-- Attachments -->
        <div v-if="attachments.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Paperclip class="w-4 h-4" /> Attachments</h3>
          <div class="space-y-2">
            <button v-for="att in attachments" :key="att.id" @click="handleDownloadAttachment(att.id, att.fileName)"
              class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg px-3 py-2 w-full text-left"
              v-tooltip="'Unduh lampiran ini'">
              <Download class="w-4 h-4 shrink-0" /><span class="flex-1 truncate">{{ att.fileName }}</span>
              <span class="text-xs text-gray-400">{{ att.fileType }}</span>
            </button>
          </div>
        </div>

        <!-- Internal Worklog -->
        <div v-if="isSupport" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Clock class="w-4 h-4" /> Internal Worklog</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm min-w-[500px]">
              <thead class="bg-gray-50">
                <tr class="text-left text-xs text-gray-500 border-b border-gray-200">
                  <th class="py-2 pr-4 font-medium">Resource</th>
                  <th class="py-2 pr-4 font-medium">Task / Activity</th>
                  <th class="py-2 pr-4 font-medium">Live Timer</th>
                  <th class="py-2 font-medium">Logged Duration</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-if="worklogs.length === 0">
                  <td colspan="4" class="py-4 text-center text-gray-400 text-xs">Belum ada worklog.</td>
                </tr>
                <tr v-for="wl in worklogs" :key="wl.id" class="text-gray-700">
                  <td class="py-2.5 pr-4 font-semibold">
                    <template v-if="wl.taskNotes && wl.taskNotes.match(/^\\[(.*?)\\] /)">
                      <span>{{ wl.taskNotes.match(/^\\[(.*?)\\] /)[1] }}</span>
                      <span class="text-[10px] font-normal text-gray-400 block mt-0.5">Started by: {{ wl.userName }}</span>
                    </template>
                    <template v-else>
                      <span>{{ wl.userName }}</span>
                      <span class="font-normal text-gray-400 ml-1">({{ wl.userRoleLabel }})</span>
                    </template>
                  </td>
                  <td class="py-2.5 pr-4 text-gray-600">{{ wl.taskNotes ? wl.taskNotes.replace(/^\\[.*?\\] /, '') : '-' }}</td>
                  <td class="py-2.5 pr-4">
                    <span v-if="wl.isRunning || wl.running" class="text-green-600 font-mono font-bold">{{ getLiveTimer(wl.id) }}</span>
                    <span v-else class="text-gray-400 font-mono">--:--</span>
                  </td>
                  <td class="py-2.5">
                    <button v-if="(wl.isRunning || wl.running) && isSupport" @click="handleStopWorklog(wl)"
                      :disabled="loadingStop[wl.id]"
                      class="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold px-3 py-1 rounded transition-colors flex items-center gap-1"
                      v-tooltip="'Hentikan pencatatan waktu'">
                      <Loader2 v-if="loadingStop[wl.id]" class="w-3 h-3 animate-spin" />
                      <span v-else>Stop</span>
                    </button>
                    <span v-else-if="wl.isRunning || wl.running" class="text-green-500 font-mono font-bold text-xs">Running...</span>
                    <span v-else class="font-bold text-gray-800">{{ formatDuration(wl.loggedDurationSeconds) }} <span class="text-green-600 text-xs font-normal">(Logged)</span></span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Progress Log -->
        <div v-if="progressLogs.length > 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Activity class="w-4 h-4" /> Progress Log</h3>
          <div class="space-y-3">
            <div v-for="log in progressLogs" :key="log.id" class="flex gap-3">
              <div class="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
              <div class="flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <StatusBadge :status="log.fromStatus" />
                  <span class="text-xs text-gray-400">→</span>
                  <StatusBadge :status="log.toStatus" />
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ log.changedByName }} • {{ formatDate(log.changedAt) }}</p>
                <p v-if="log.notes" class="text-xs text-gray-600 mt-0.5 bg-gray-50 rounded px-2 py-1">{{ log.notes }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Communication with Client (Chat) -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col" style="height: 480px;">
          <div class="px-5 py-4 border-b border-gray-200 shrink-0">
            <h3 class="text-sm font-semibold text-gray-700 flex items-center gap-2"><MessageCircle class="w-4 h-4" /> Communication with Client</h3>
          </div>
          <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            <div v-if="messages.length === 0" class="flex items-center justify-center h-full">
              <p class="text-sm text-gray-400">Belum ada pesan. Mulai percakapan.</p>
            </div>
            <div v-for="msg in messages" :key="msg.id" :class="['flex', msg.senderId === currentUserId ? 'justify-end' : 'justify-start']">
              <div :class="['max-w-[75%] rounded-xl px-3 py-2', msg.senderId === currentUserId ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-900']">
                <div class="flex items-center gap-1.5 mb-1">
                  <span :class="['text-xs font-medium', msg.senderId === currentUserId ? 'text-blue-200' : 'text-gray-500']">{{ msg.senderName }}</span>
                  <span :class="['text-[10px] px-1.5 py-0.5 rounded', msg.senderId === currentUserId ? 'bg-blue-500 text-blue-100' : 'bg-gray-100 text-gray-500']">{{ msg.senderRole }}</span>
                </div>
                <p v-if="msg.content" class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
                <div v-if="msg.attachments?.length > 0" class="mt-1.5 space-y-1">
                  <button v-for="att in msg.attachments" :key="att.id" @click="handleDownloadChatFile(att.id, att.fileName)"
                    :class="['flex items-center gap-1.5 text-xs px-2 py-1 rounded', msg.senderId === currentUserId ? 'bg-blue-500 text-blue-100' : 'bg-gray-100 text-blue-600']"
                    v-tooltip="'Unduh lampiran chat'">
                    <Paperclip class="w-3 h-3" /><span class="truncate max-w-[140px]">{{ att.fileName }}</span>
                  </button>
                </div>
                <p :class="['text-xs mt-1', msg.senderId === currentUserId ? 'text-blue-200' : 'text-gray-400']">{{ formatTime(msg.sentAt) }}</p>
              </div>
            </div>
          </div>
          <div class="px-4 py-3 border-t border-gray-200 shrink-0">
            <div v-if="pendingFiles.length > 0" class="flex flex-wrap gap-1.5 mb-2">
              <div v-for="(file, i) in pendingFiles" :key="i" class="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded px-2 py-0.5 text-xs">
                <Paperclip class="w-3 h-3 text-blue-500" /><span class="text-blue-700 truncate max-w-[100px]">{{ file.name }}</span>
                <button @click="pendingFiles.splice(i,1)" class="text-red-400 ml-1"><X class="w-3 h-3" /></button>
              </div>
            </div>
            <form @submit.prevent="sendMessage" class="flex gap-2">
              <input ref="chatFileInput" type="file" class="hidden" multiple @change="handleFileAdd" />
              <button type="button" @click="$refs.chatFileInput.click()" :disabled="!chatConnected" class="border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 disabled:opacity-40 shrink-0" v-tooltip="'Lampirkan file/dokumen ke chat'">
                <Paperclip class="w-4 h-4 text-gray-500" />
              </button>
              <input v-model="newMessage" type="text" placeholder="Type message to client..." class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0" :disabled="!chatConnected" />
              <button type="submit" :disabled="(!newMessage.trim() && pendingFiles.length === 0) || !chatConnected || uploading"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-40 font-medium text-sm shrink-0"
                v-tooltip="'Kirim pesan ke client/support'">
                <Send v-if="!uploading" class="w-4 h-4" /><span v-else class="text-xs">...</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- RIGHT: Control panel -->
      <div class="lg:w-72 space-y-4 shrink-0">
        <!-- SLA Countdown -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">SLA COUNTDOWN ({{ ticket.priority }} - {{ slaLabel }})</p>
          <div :class="['text-3xl font-bold font-mono text-center py-2', slaColor]">{{ slaCountdown }}</div>
          <p v-if="slaBreached" class="text-xs text-red-500 text-center mt-1">SLA telah terlampaui</p>
          <p v-else class="text-xs text-gray-400 text-center mt-1">Tersisa hingga resolusi</p>
        </div>

        <!-- Update Status (SUPPORT only) -->
        <div v-if="isSupport" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-3">
          <h3 class="text-sm font-semibold text-gray-700">Update Status</h3>
          <select v-model="statusForm.status" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Pilih status baru...</option>
            <option v-for="s in allowedTransitions" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
          <textarea v-model="statusForm.notes" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Catatan perubahan (opsional)"></textarea>
          <button v-if="statusForm.status" @click="submitStatus" :disabled="loadingStatus"
            class="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            v-tooltip="'Simpan pembaruan status tiket'">
            <Loader2 v-if="loadingStatus" class="w-4 h-4 animate-spin" />
            <span>{{ loadingStatus ? 'Memperbarui...' : 'Update Status' }}</span>
          </button>
          <!-- Close Ticket -->
          <button v-if="ticket.status !== 'CLOSED'" @click="handleCloseTicket" :disabled="loadingClose"
            class="w-full bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            v-tooltip="'Tandai tiket ini selesai/ditutup'">
            <Loader2 v-if="loadingClose" class="w-4 h-4 animate-spin" />
            <XCircle v-else class="w-4 h-4" />
            {{ loadingClose ? 'Menutup...' : 'Close Ticket (Solved)' }}
          </button>
          <p v-if="ticket.status === 'CLOSED'" class="text-xs text-gray-400 text-center">Tiket ini sudah ditutup.</p>
        </div>

        <!-- Assignment Control (SUPPORT only) -->
        <div v-if="isSupport" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Assignment Control</h3>
          <p class="text-xs text-gray-400 mb-2">ASSIGNED RESOURCES</p>
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="a in activeAssignments" :key="a.id" class="px-2.5 py-1 bg-blue-600 text-white text-xs rounded-lg font-medium">{{ a.assignedToName }}</span>
            <span v-if="activeAssignments.length === 0" class="text-xs text-gray-400 italic">Belum ada</span>
          </div>
          <p class="text-xs text-gray-400 mb-1">SELECT SHADOW RESOURCE</p>
          <select v-model="assignForm.userId" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">-- Choose Technician --</option>
            <option v-for="u in filteredAssignableUsers" :key="u.id" :value="u.id">{{ u.name }} ({{ u.role }})</option>
          </select>
          <p class="text-xs text-gray-400 mb-1">SPECIFIC TASK INSTRUCTION</p>
          <input v-model="assignForm.notes" type="text" placeholder="e.g. Check firewall logs at branch" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button @click="handleAssign" :disabled="!assignForm.userId || loadingAssign"
            class="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-40 flex items-center justify-center gap-2"
            v-tooltip="'Tugaskan teknisi dan mulai timer worklog'">
            <Loader2 v-if="loadingAssign" class="w-4 h-4 animate-spin" />
            <UserCheck v-else class="w-4 h-4" />
            {{ loadingAssign ? 'Assigning...' : 'Assign & Start Timer' }}
          </button>
        </div>

        <!-- Update Ticket Level (SUPPORT only) -->
        <div v-if="isSupport" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">UPDATE TICKET LEVEL</p>
          <select v-model="newPriority" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="L1">L1 - Critical (4h)</option>
            <option value="L2">L2 - High (8h)</option>
            <option value="L3">L3 - Medium (24h)</option>
            <option value="L4">L4 - Low (48h)</option>
          </select>
          <p class="text-xs text-gray-400 mt-2">Mengubah level akan mempengaruhi SLA countdown.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Client as StompClient } from '@stomp/stompjs'
import SockJS from 'sockjs-client/dist/sockjs'
import { getTicketById, getTicketProgress, updateTicketStatus } from '../api/tickets'
import { getAttachmentsByTicketId, downloadAttachment } from '../api/attachments'
import { getTicketAssignments, assignTicket } from '../api/assignments'
import { getChatHistory, uploadChatFile, downloadChatAttachment } from '../api/chat'
import { getAssignableEngineers } from '../api/users'
import { getClientSupports } from '../api/clientSupports'
import { getWorklogs, startWorklog, stopWorklog } from '../api/worklogs'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import { useToastStore } from '../stores/toast'
import { ChevronLeft, AlertCircle, FileText, Paperclip, Download, Clock, Activity, MessageCircle, Send, X, UserCheck, XCircle, CheckCircle, Loader2, Copy } from 'lucide-vue-next'
import StatusBadge from '../components/StatusBadge.vue'
import PriorityBadge from '../components/PriorityBadge.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { triggerNotification } from '../utils/notify'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const notifications = useNotificationStore()
const toast = useToastStore()
const currentUserId = computed(() => auth.user?.id)
const confirmDialog = ref(null)

const isSupport = computed(() => auth.user?.role === 'SUPPORT' || auth.user?.role === 'ADMIN')

const ticket = ref(null)
const loading = ref(true)
const progressLogs = ref([])
const attachments = ref([])
const assignments = ref([])
const assignableUsers = ref([])
const worklogs = ref([])

// Live timer state: map worklogId -> elapsed seconds (counting up from startedAt)
const liveTimers = ref({})
let timerInterval = null

// Chat state
const messages = ref([])
const newMessage = ref('')
const pendingFiles = ref([])
const uploading = ref(false)
const chatConnected = ref(false)
const messagesContainer = ref(null)
let stompClient = null

// Forms
const statusForm = reactive({ status: '', notes: '' })
const assignForm = reactive({ userId: '', notes: '' })
const newPriority = ref('')

// Loading states
const loadingAssign = ref(false)
const loadingStatus = ref(false)
const loadingClose = ref(false)
const loadingStop = ref({})

// SLA
const slaCountdown = ref('--:--:--')
const slaBreached = ref(false)
const slaColor = ref('text-gray-800')
let slaTimer = null

const PRODUCT_LABELS = {
  OPENTEXT_CONTENT_SERVER: 'Opentext Content Server',
  BRAVA_ENTERPRISE: 'Brava Enterprise',
  OPENTEXT_DIRECTORY_SERVICES: 'Opentext Directory Services',
  ARCHIVE_SERVER: 'Archive Server',
  APPWORKS: 'AppWorks',
  CUSTOM_APPS: 'Custom Apps',
}
const SLA_RESOLUTION_HOURS = { L1: 4, L2: 8, L3: 24, L4: 48 }

const slaLabel = computed(() => {
  const h = SLA_RESOLUTION_HOURS[ticket.value?.priority] || 24
  return `${h}h`
})

const activeAssignments = computed(() => assignments.value.filter(a => a.active))

// Assignable users: client's support engineers + TECHNICAL_SUPPORT users
const filteredAssignableUsers = computed(() => {
  // assignableUsers already filtered by backend (SUPPORT + TECHNICAL_SUPPORT for caller role)
  return assignableUsers.value
})

const allowedTransitions = computed(() => {
  const current = ticket.value?.status
  const map = {
    OPEN: [{ value: 'IN_PROGRESS', label: 'In Progress' }],
    IN_PROGRESS: [{ value: 'RESOLVED', label: 'Resolved' }],
    RESOLVED: [{ value: 'CLOSED', label: 'Closed' }, { value: 'IN_PROGRESS', label: 'In Progress (Reopen)' }],
    CLOSED: [],
  }
  return map[current] || []
})

function productTypeLabel(val) { return PRODUCT_LABELS[val] || val || '-' }

// ========== SLA Timer ==========
function startSlaTimer() {
  if (!ticket.value?.createdAt) return
  const hours = SLA_RESOLUTION_HOURS[newPriority.value || ticket.value.priority] || 24
  const deadline = new Date(ticket.value.createdAt).getTime() + hours * 3600 * 1000

  function update() {
    const diff = deadline - Date.now()
    if (diff <= 0) {
      slaBreached.value = true
      slaColor.value = 'text-red-600'
      const abs = Math.abs(diff)
      slaCountdown.value = `-${fmt(abs)}`
    } else {
      slaBreached.value = false
      const pct = diff / (hours * 3600 * 1000)
      slaColor.value = pct < 0.2 ? 'text-red-600' : pct < 0.5 ? 'text-yellow-600' : 'text-gray-800'
      slaCountdown.value = fmt(diff)
    }
  }
  function fmt(ms) {
    const h = Math.floor(ms / 3600000).toString().padStart(2, '0')
    const m = Math.floor((ms % 3600000) / 60000).toString().padStart(2, '0')
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }
  update()
  slaTimer = setInterval(update, 1000)
}

// ========== Worklog Timers ==========
function initLiveTimers() {
  // Clear any existing interval
  if (timerInterval) clearInterval(timerInterval)
  liveTimers.value = {}

  // Initialize elapsed seconds for running worklogs
  worklogs.value.forEach(wl => {
    if ((wl.isRunning || wl.running) && wl.startedAt) {
      const elapsed = Math.floor((Date.now() - new Date(wl.startedAt).getTime()) / 1000)
      liveTimers.value[wl.id] = elapsed
    }
  })

  // Tick every second
  timerInterval = setInterval(() => {
    worklogs.value.forEach(wl => {
      if (wl.isRunning || wl.running) {
        liveTimers.value[wl.id] = (liveTimers.value[wl.id] || 0) + 1
      }
    })
  }, 1000)
}

function getLiveTimer(worklogId) {
  const secs = liveTimers.value[worklogId] || 0
  const h = Math.floor(secs / 3600).toString().padStart(2, '0')
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

function formatDuration(seconds) {
  if (!seconds) return '-'
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

// ========== Chat ==========
function scrollToBottom() {
  nextTick(() => { if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight })
}

function connectChat(ticketId) {
  if (auth.token === 'demo-token') return
  const wsUrl = `${location.protocol === 'https:' ? 'https' : 'http'}://${location.host}/ws`
  stompClient = new StompClient({
    webSocketFactory: () => new SockJS(wsUrl),
    connectHeaders: { Authorization: `Bearer ${auth.token}` },
    onConnect: () => {
      chatConnected.value = true
      stompClient.subscribe(`/topic/chat/${ticketId}`, (msg) => {
        const data = JSON.parse(msg.body)
        if (!messages.value.find(m => m.id === data.id)) {
          messages.value.push(data)
          scrollToBottom()
          
          // Perbaikan: Update last_read_at di Backend agar pesan ini tidak dianggap unread
          if (data.senderId !== currentUserId.value) {
            if (document.visibilityState === 'visible') {
              notifications.markTicketSeen(ticketId)
            } else {
              // Jika tab sedang background, tampilkan notifikasi push
              notifications.addUnread()
              triggerNotification(`Pesan baru di Tiket #${ticket.value?.ticketNumber || ticketId}`, data.content || 'Lampiran baru diterima')
            }
          }
        }
      })
    },
    onDisconnect: () => { chatConnected.value = false },
    reconnectDelay: 5000,
  })
  stompClient.activate()
}

// ========== Lifecycle ==========
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    const id = route.params.id
    if (id) notifications.markTicketSeen(id)
  }
}

onMounted(async () => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // Request permission untuk browser notification
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission()
  }

  const id = route.params.id
  notifications.markTicketSeen(id)
  try {
    const res = await getTicketById(id)
    ticket.value = res.data
    newPriority.value = res.data.priority
    startSlaTimer()
  } catch { loading.value = false; return }
  loading.value = false

  const promises = [
    getTicketProgress(id).then(r => { progressLogs.value = r.data }),
    getAttachmentsByTicketId(id).then(r => { attachments.value = r.data }),
    getChatHistory(id).then(r => { messages.value = r.data; scrollToBottom() }),
  ]
  if (isSupport.value) {
    promises.push(getTicketAssignments(id).then(r => { assignments.value = r.data }))
    promises.push(getWorklogs(id).then(r => { worklogs.value = r.data; initLiveTimers() }))
  }
  await Promise.allSettled(promises)

  if (isSupport.value) {
    // Load assignable users: backend returns TECHNICAL_SUPPORT for SUPPORT callers
    try {
      const engineers = await getAssignableEngineers()
      assignableUsers.value = engineers.data
    } catch {}
  }

  connectChat(id)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  if (stompClient) stompClient.deactivate()
  if (slaTimer) clearInterval(slaTimer)
  if (timerInterval) clearInterval(timerInterval)
  
  // Pastikan waktu keluar juga tercatat sebagai last_read_at
  const id = route.params.id
  if (id) notifications.markTicketSeen(id)
})

// ========== Actions ==========
async function submitStatus() {
  if (!statusForm.status || !ticket.value) return
  loadingStatus.value = true
  try {
    await updateTicketStatus(ticket.value.id, { status: statusForm.status, changedBy: auth.user?.id, notes: statusForm.notes })
    ticket.value = (await getTicketById(ticket.value.id)).data
    progressLogs.value = (await getTicketProgress(ticket.value.id)).data
    statusForm.status = ''
    statusForm.notes = ''
    toast.success('Status ticket berhasil diperbarui')
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal memperbarui status ticket')
  } finally {
    loadingStatus.value = false
  }
}

async function handleCloseTicket() {
  const confirmed = await confirmDialog.value.open({
    title: 'Close Ticket',
    message: 'Apakah kamu yakin ingin menutup ticket ini? Aksi ini tidak dapat dibatalkan.',
    confirmLabel: 'Close Ticket',
    confirmColor: 'red',
  })
  if (!confirmed) return

  loadingClose.value = true
  try {
    await updateTicketStatus(ticket.value.id, { status: 'CLOSED', changedBy: auth.user?.id, notes: statusForm.notes || 'Ticket closed.' })
    ticket.value = (await getTicketById(ticket.value.id)).data
    progressLogs.value = (await getTicketProgress(ticket.value.id)).data
    statusForm.status = ''
    statusForm.notes = ''
    toast.success('Ticket berhasil ditutup')
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal menutup ticket')
  } finally {
    loadingClose.value = false
  }
}

async function handleAssign() {
  if (!assignForm.userId || !ticket.value) return
  loadingAssign.value = true
  try {
    await assignTicket(ticket.value.id, { supportUserIds: [Number(assignForm.userId)], notes: assignForm.notes })
    assignments.value = (await getTicketAssignments(ticket.value.id)).data
    
    await startWorklog(ticket.value.id, { 
      taskNotes: assignForm.notes || null,
      targetUserId: Number(assignForm.userId)
    })
    
    const wlRes = await getWorklogs(ticket.value.id)
    worklogs.value = wlRes.data
    initLiveTimers()
    assignForm.userId = ''
    assignForm.notes = ''
    toast.success('Assignment berhasil, timer dimulai')
  } catch (err) {
    const msg = err?.response?.data?.message || ''
    if (msg.includes('timer aktif')) {
      toast.warning('User ini masih memiliki timer aktif. Hentikan timer terlebih dahulu.')
      // Try worklog only
      try {
        await startWorklog(ticket.value.id, { 
          taskNotes: assignForm.notes || null,
          targetUserId: Number(assignForm.userId)
        })
        
        const wlRes = await getWorklogs(ticket.value.id)
        worklogs.value = wlRes.data
        initLiveTimers()
        assignForm.userId = ''
        assignForm.notes = ''
        toast.success('Timer baru dimulai')
      } catch (wlErr) {
        toast.error(wlErr?.response?.data?.message || 'Gagal memulai timer')
      }
    } else {
      toast.error(msg || 'Gagal melakukan assignment')
    }
  } finally {
    loadingAssign.value = false
  }
}

async function handleStopWorklog(wl) {
  const elapsed = liveTimers.value[wl.id] || 0
  const stoppedAt = new Date().toISOString().slice(0, 19)
  loadingStop.value = { ...loadingStop.value, [wl.id]: true }
  try {
    await stopWorklog(ticket.value.id, wl.id, {
      stoppedAt: stoppedAt,
      loggedDurationSeconds: elapsed,
      taskNotes: wl.taskNotes,
    })
    const wlRes = await getWorklogs(ticket.value.id)
    worklogs.value = wlRes.data
    initLiveTimers()
    toast.success(`Timer dihentikan. Durasi: ${formatDuration(elapsed)}`)
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal menghentikan timer')
  } finally {
    loadingStop.value = { ...loadingStop.value, [wl.id]: false }
  }
}

async function sendMessage() {
  if ((!newMessage.value.trim() && pendingFiles.value.length === 0) || !ticket.value || !chatConnected.value) return
  uploading.value = true
  let attachmentIds = []
  if (pendingFiles.value.length > 0) {
    try {
      for (const file of pendingFiles.value) {
        const res = await uploadChatFile(ticket.value.id, file)
        attachmentIds.push(res.data.id)
      }
    } catch { uploading.value = false; return }
  }
  stompClient.publish({
    destination: '/app/chat.send',
    body: JSON.stringify({ ticketId: ticket.value.id, content: newMessage.value.trim() || null, attachmentIds: attachmentIds.length ? attachmentIds : null }),
    headers: { Authorization: `Bearer ${auth.token}` },
  })
  newMessage.value = ''
  pendingFiles.value = []
  uploading.value = false
}

function handleFileAdd(e) { pendingFiles.value.push(...Array.from(e.target.files)); e.target.value = '' }
async function handleDownloadAttachment(id, name) { try { await downloadAttachment(id, name) } catch {} }
async function handleDownloadChatFile(id, name) { try { await downloadChatAttachment(id, name) } catch {} }

function formatDate(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }
function formatTime(d) { return d ? new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '' }

async function copyTicketNumber() {
  if (!ticket.value) return
  try {
    await navigator.clipboard.writeText(ticket.value.ticketNumber)
    toast.success('Ticket number disalin ke clipboard')
  } catch (err) {
    toast.error('Gagal menyalin ticket number')
  }
}
</script>
