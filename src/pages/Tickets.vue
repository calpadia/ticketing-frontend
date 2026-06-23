<template>
  <div>
    <ConfirmDialog ref="confirmDialog" />
    <!-- List view -->
    <div v-if="!showForm">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 class="text-xl lg:text-2xl font-bold text-gray-900">Tickets</h2>
          <p class="text-gray-500 text-sm mt-1">{{ filtered.length }} ticket(s) found</p>
        </div>
        <div class="flex gap-2">
          <button @click="handleExport" :disabled="loadingExport" class="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50">
            <Loader2 v-if="loadingExport" class="w-4 h-4 animate-spin" />
            <FileDown v-else class="w-4 h-4" /> {{ loadingExport ? 'Exporting...' : 'Export CSV' }}
          </button>
          <button v-if="auth.user?.role === 'ADMIN' || auth.user?.role === 'USER'" @click="showForm = true" class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium">
            <Plus class="w-4 h-4" /> Registrasi Tiket
          </button>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="flex flex-col sm:flex-row gap-3 mb-4">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input v-model="search" type="text" placeholder="Search tickets..." class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select v-model="filterStatus" class="border border-gray-300 rounded-lg px-3 py-2.5 text-sm"><option value="">All Status</option><option value="OPEN">Open</option><option value="IN_PROGRESS">In Progress</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></select>
        <select v-model="filterPriority" class="border border-gray-300 rounded-lg px-3 py-2.5 text-sm"><option value="">All Priority</option><option value="L1">L1</option><option value="L2">L2</option><option value="L3">L3</option><option value="L4">L4</option></select>
        <select v-if="auth.isAdmin" v-model="filterClient" class="border border-gray-300 rounded-lg px-3 py-2.5 text-sm max-w-[200px] truncate"><option value="">All Clients</option><option v-for="c in clients" :key="c.id" :value="c.id">{{ c.companyName }}</option></select>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <!-- Desktop Table (Hidden on small screens) -->
        <div class="hidden md:block overflow-auto max-h-[65vh]">
          <table class="w-full text-sm min-w-[700px] relative">
            <thead class="bg-gray-50/95 backdrop-blur sticky top-0 z-10 shadow-sm">
              <tr class="text-left text-gray-600">
                <th class="px-6 py-3 font-medium">Ticket #</th>
                <th class="px-6 py-3 font-medium">Title</th>
                <th class="px-6 py-3 font-medium">Status</th>
                <th class="px-6 py-3 font-medium">Priority</th>
                <th class="px-6 py-3 font-medium">Type</th>
                <th class="px-6 py-3 font-medium">Client</th>
                <th class="px-6 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="loading" v-for="i in 5" :key="'skel'+i" class="animate-pulse">
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-48"></div></td>
                <td class="px-6 py-4"><div class="h-5 bg-gray-200 rounded-full w-20"></div></td>
                <td class="px-6 py-4"><div class="h-5 bg-gray-200 rounded w-10"></div></td>
                <td class="px-6 py-4"><div class="h-5 bg-gray-200 rounded-full w-8"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-32"></div></td>
                <td class="px-6 py-4"><div class="h-3 bg-gray-200 rounded w-20"></div></td>
              </tr>
              <tr v-else-if="paginated.length === 0">
                <td colspan="7" class="text-center py-16">
                  <div class="flex flex-col items-center justify-center">
                    <div class="text-gray-300 mb-3"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg></div>
                    <p class="text-gray-500 font-medium">Belum ada tiket.</p>
                    <p class="text-gray-400 text-sm mt-1">Klik Registrasi Tiket untuk membuat tiket baru.</p>
                  </div>
                </td>
              </tr>
              <tr v-for="t in paginated" :key="t.id" :class="['cursor-pointer hover:bg-gray-50', t.priority === 'L1' ? 'border-l-4 border-l-red-500' : '']" @click="openTicketDetail(t)">
                <td class="px-6 py-3 font-mono text-xs text-blue-600">{{ t.ticketNumber }}</td>
                <td class="px-6 py-3">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-gray-900">{{ t.title }}</span>
                    <span v-if="notifications.getUnread(t.id) > 0" class="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-green-500 text-white text-[10px] font-bold shadow-sm">
                      {{ notifications.getUnread(t.id) }}
                    </span>
                    <span v-if="notifications.isNewTicket(t.id)" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white animate-pulse">NEW</span>
                  </div>
                </td>
                <td class="px-6 py-3"><StatusBadge :status="t.status" /></td>
                <td class="px-6 py-3"><PriorityBadge :priority="t.priority" /></td>
                <td class="px-6 py-3"><span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium border', t.maintenanceType === 'PM' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-teal-100 text-teal-800 border-teal-200']">{{ t.maintenanceType }}</span></td>
                <td class="px-6 py-3 text-gray-600">{{ t.clientCompanyName }}</td>
                <td class="px-6 py-3 text-gray-500 text-xs">{{ formatDate(t.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Mobile Cards (Hidden on md and larger) -->
        <div class="md:hidden flex flex-col divide-y divide-gray-100 overflow-auto max-h-[70vh]">
          <!-- Skeletons -->
          <div v-if="loading" v-for="i in 5" :key="'m-skel-'+i" class="p-4 animate-pulse">
            <div class="flex justify-between mb-3"><div class="h-4 bg-gray-200 rounded w-20"></div><div class="h-5 bg-gray-200 rounded-full w-16"></div></div>
            <div class="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div class="flex justify-between items-center"><div class="flex gap-2"><div class="h-5 bg-gray-200 rounded w-10"></div><div class="h-5 bg-gray-200 rounded w-8"></div></div><div class="h-3 bg-gray-200 rounded w-16"></div></div>
          </div>
          <!-- Empty -->
          <div v-else-if="paginated.length === 0" class="p-8 text-center">
            <div class="flex flex-col items-center justify-center">
              <div class="text-gray-300 mb-3"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ticket"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg></div>
              <p class="text-gray-500 font-medium text-sm">Belum ada tiket.</p>
            </div>
          </div>
          <!-- Cards -->
          <div v-for="t in paginated" :key="'m-'+t.id" class="p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors" :class="[t.priority === 'L1' ? 'border-l-4 border-l-red-500' : '']" @click="openTicketDetail(t)">
            <div class="flex justify-between items-start mb-2">
              <span class="font-mono text-xs text-blue-600 font-medium">{{ t.ticketNumber }}</span>
              <StatusBadge :status="t.status" />
            </div>
            <h4 class="font-medium text-gray-900 mb-1 flex items-center gap-2">
              {{ t.title }}
              <span v-if="notifications.getUnread(t.id) > 0" class="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-green-500 text-white text-[10px] font-bold shadow-sm">{{ notifications.getUnread(t.id) }}</span>
              <span v-if="notifications.isNewTicket(t.id)" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white animate-pulse shrink-0">NEW</span>
            </h4>
            <p class="text-sm text-gray-500 mb-3">{{ t.clientCompanyName }}</p>
            <div class="flex items-center justify-between">
              <div class="flex gap-2">
                <PriorityBadge :priority="t.priority" />
                <span :class="['px-2 py-0.5 rounded text-[10px] font-medium border', t.maintenanceType === 'PM' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-teal-100 text-teal-800 border-teal-200']">{{ t.maintenanceType }}</span>
              </div>
              <span class="text-xs text-gray-400">{{ formatDate(t.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p class="text-sm text-gray-500">Showing {{ (currentPage-1)*perPage+1 }} to {{ Math.min(currentPage*perPage, filtered.length) }} of {{ filtered.length }}</p>
          <div class="flex gap-1">
            <button v-for="p in totalPages" :key="p" @click="currentPage = p" :class="['px-3 py-1 rounded text-sm', currentPage === p ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-100']">{{ p }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Registration form -->
    <div v-else>
      <div class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full">
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Registrasi Tiket Dukungan Teknis</h3>
        <p class="text-sm text-gray-500 mb-6">Isi form berikut untuk mengajukan tiket dukungan teknis</p>

        <!-- Quota info bar -->
        <div class="grid grid-cols-1 sm:grid-cols-3 rounded-xl overflow-hidden border border-gray-200 mb-8">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 px-5 py-4 border-l-4 border-blue-600">
            <p class="text-xs text-blue-600 font-semibold uppercase tracking-wide">Sisa Kuota PM</p>
            <p class="text-2xl font-bold text-blue-700 mt-1">{{ quotaInfo.pmRemaining }} <span class="text-sm font-normal">Tiket</span></p>
          </div>
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 px-5 py-4 border-l border-gray-200">
            <p class="text-xs text-orange-600 font-semibold uppercase tracking-wide">Sisa Kuota CM</p>
            <p class="text-2xl font-bold text-orange-700 mt-1">{{ quotaInfo.cmRemaining }} <span class="text-sm font-normal">Tiket</span></p>
          </div>
          <div class="bg-gradient-to-br from-gray-50 to-gray-100 px-5 py-4 border-l border-gray-200">
            <p class="text-xs text-gray-500 font-semibold uppercase tracking-wide">Client</p>
            <p class="text-sm font-bold text-gray-900 mt-2">{{ selectedClientName || 'Belum dipilih' }}</p>
          </div>
        </div>

        <form @submit.prevent="handleCreate" class="space-y-6">
          <!-- Maintenance, Priority, Product Type -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Jenis Maintenance *</label>
              <select v-model="form.maintenanceType" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" required>
                <option value="">Pilih Jenis...</option>
                <option value="PM">PM (Preventive Maintenance)</option>
                <option value="CM">CM (Corrective Maintenance)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Urgensi (Priority Level) *</label>
              <select v-model="form.priority" @change="updateSLATargets" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" required>
                <option value="L1">Level 1 - Critical (System Down)</option>
                <option value="L2">Level 2 - High (Major Error)</option>
                <option value="L3">Level 3 - Medium (Normal)</option>
                <option value="L4">Level 4 - Low (Consultation)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Product Type</label>
              <select v-model="form.productType" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Pilih Product...</option>
                <option value="OPENTEXT_CONTENT_SERVER">Opentext Content Server</option>
                <option value="BRAVA_ENTERPRISE">Brava Enterprise</option>
                <option value="OPENTEXT_DIRECTORY_SERVICES">Opentext Directory Services</option>
                <option value="ARCHIVE_SERVER">Archive Server</option>
                <option value="APPWORKS">AppWorks</option>
                <option value="CUSTOM_APPS">Custom Apps</option>
              </select>
            </div>
          </div>

          <!-- SLA Target info -->
          <div class="bg-blue-50 border border-blue-100 rounded-lg px-5 py-3 flex gap-8 text-sm">
            <span class="text-blue-700">Target Respon: <strong class="text-blue-900">{{ slaTarget.response }}</strong></span>
            <span class="text-blue-700">Target Solusi: <strong class="text-blue-900">{{ slaTarget.resolution }}</strong></span>
          </div>

          <!-- Client & Requester -->
          <div v-if="auth.isAdmin" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Client *</label>
              <select v-model="form.clientId" @change="loadProjects" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" required>
                <option value="">Pilih Client...</option>
                <option v-for="c in activeClients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Project</label>
              <select v-model="form.projectId" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Pilih Project...</option>
                <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.projectName }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Requester *</label>
              <select v-model="form.requesterId" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" required>
                <option value="">Pilih Requester...</option>
                <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option>
              </select>
            </div>
          </div>
          <div v-else class="space-y-4">
            <div class="bg-gray-50 border border-gray-200 rounded-lg px-5 py-3">
              <div class="grid grid-cols-2 gap-4">
                <div><p class="text-xs text-gray-500">Client</p><p class="text-sm font-medium text-gray-900">{{ auth.user?.clientName || '-' }}</p></div>
                <div><p class="text-xs text-gray-500">Requester</p><p class="text-sm font-medium text-gray-900">{{ auth.user?.name }}</p></div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Project</label>
              <select v-model="form.projectId" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Pilih Project...</option>
                <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.projectName }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Subjek Masalah *</label>
            <input v-model="form.title" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Error Login pada Intelligent Capture" required />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi Detail *</label>
            <textarea v-model="form.description" rows="5" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jelaskan kendala yang dialami secara mendetail..." required></textarea>
          </div>

          <!-- Lampiran -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Lampiran Pendukung</label>
            <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
              @click="$refs.fileInput.click()" @dragover.prevent="dragOver = true" @dragleave="dragOver = false" @drop.prevent="handleDrop"
              :class="{ 'border-blue-400 bg-blue-50/30': dragOver }">
              <input ref="fileInput" type="file" class="hidden" multiple accept="image/*,.pdf,.log,.txt,.doc,.docx" @change="handleFileSelect" />
              <p v-if="attachments.length === 0" class="text-sm text-gray-500">Klik atau drag file untuk melampirkan screenshot atau log file (Max 5MB)</p>
              <div v-else class="space-y-2">
                <div v-for="(file, index) in attachments" :key="index" class="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <Paperclip class="w-4 h-4 text-gray-400 shrink-0" />
                    <span class="text-sm text-gray-700 truncate">{{ file.name }}</span>
                    <span class="text-xs text-gray-400 shrink-0">({{ formatFileSize(file.size) }})</span>
                  </div>
                  <button type="button" @click.stop="removeFile(index)" class="text-red-500 hover:text-red-700 shrink-0 ml-2"><X class="w-4 h-4" /></button>
                </div>
                <p class="text-xs text-gray-400 mt-2">Klik untuk menambah file lain</p>
              </div>
            </div>
          </div>

          <div class="flex gap-4 pt-4">
            <button type="button" @click="showForm = false" class="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium transition-colors">Batal</button>
            <button type="submit" :disabled="loadingCreate" class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
              <Loader2 v-if="loadingCreate" class="w-4 h-4 animate-spin" />
              {{ loadingCreate ? 'Mengirim...' : 'Kirim Tiket & Gunakan Kuota' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getTickets, createTicket, exportTicketsCsv } from '../api/tickets'
import { getClients } from '../api/clients'
import { getUsers } from '../api/users'
import { getClientQuotas, getMyQuotas } from '../api/quotas'
import { getProjectsByClientId } from '../api/projects'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import { useGlobalChat } from '../composables/useGlobalChat'
import { useToastStore } from '../stores/toast'
import { Search, Plus, X, Paperclip, FileDown, Loader2 } from 'lucide-vue-next'
import StatusBadge from '../components/StatusBadge.vue'
import PriorityBadge from '../components/PriorityBadge.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const confirmDialog = ref(null)
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const notifications = useNotificationStore()
const globalChat = useGlobalChat()
const toast = useToastStore()

const tickets = ref([])
const clients = ref([])
const users = ref([])
const activeClients = computed(() => clients.value.filter(c => c.isActive))
const quotas = ref([])
const showForm = ref(route.query.create === 'true')
const search = ref(route.query.search || '')
const filterStatus = ref(route.query.status || '')
const filterPriority = ref('')
const filterClient = ref(route.query.clientId ? Number(route.query.clientId) : '')
const currentPage = ref(1)
const perPage = 50
const loading = ref(true)
const loadingCreate = ref(false)
const loadingExport = ref(false)
const form = reactive({ title: '', description: '', priority: 'L3', maintenanceType: '', productType: '', clientId: '', projectId: '', requesterId: auth.user?.id || '' })
const attachments = ref([])
const dragOver = ref(false)
const projects = ref([])

const slaTargets = {
  L1: { response: '1 Jam', resolution: '4 Jam' },
  L2: { response: '2 Jam', resolution: '8 Jam' },
  L3: { response: '4 Jam', resolution: '24 Jam' },
  L4: { response: '8 Jam', resolution: '48 Jam' },
}
const slaTarget = ref(slaTargets['L3'])
function updateSLATargets() { slaTarget.value = slaTargets[form.priority] || slaTargets['L3'] }

const selectedClientName = computed(() => {
  if (!auth.isAdmin) return auth.user?.clientName || ''
  if (!form.clientId) return ''
  return clients.value.find(c => c.id === Number(form.clientId))?.companyName || ''
})

const quotaInfo = computed(() => {
  const clientId = auth.isAdmin ? Number(form.clientId) : auth.user?.clientId
  if (!clientId) return { pmRemaining: '-', cmRemaining: '-' }
  const q = quotas.value.find(q => q.clientId === clientId && q.year === new Date().getFullYear())
  if (!q) return { pmRemaining: '-', cmRemaining: '-' }
  return {
    pmRemaining: String(Math.max(q.pmQuota - q.pmUsed, 0)).padStart(2, '0'),
    cmRemaining: String(Math.max(q.cmQuota - q.cmUsed, 0)).padStart(2, '0'),
  }
})

const filtered = computed(() => {
  const result = tickets.value.filter(t => {
    const s = !search.value || t.title.toLowerCase().includes(search.value.toLowerCase()) || t.ticketNumber.toLowerCase().includes(search.value.toLowerCase())
    const st = !filterStatus.value || t.status === filterStatus.value
    const pr = !filterPriority.value || t.priority === filterPriority.value
    const cl = !filterClient.value || t.clientId === filterClient.value
    return s && st && pr && cl
  })
  
  // Sort: Unread (NEW) tickets first
  return result.sort((a, b) => {
    const aIsNew = notifications.isNewTicket(a.id) ? 1 : 0
    const bIsNew = notifications.isNewTicket(b.id) ? 1 : 0
    return bIsNew - aIsNew
  })
})
const totalPages = computed(() => Math.ceil(filtered.value.length / perPage))
const paginated = computed(() => filtered.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage))

watch([search, filterStatus, filterPriority, filterClient], () => { currentPage.value = 1 })
watch(() => route.query.search, (newVal) => {
  if (newVal !== undefined) search.value = newVal
})

watch(() => notifications.incomingTicket, (ticket) => {
  if (ticket && !tickets.value.find(t => t.id === ticket.id)) {
    tickets.value.unshift(ticket)
  }
})

onMounted(async () => {
  loading.value = true
  try { const res = await getTickets(); tickets.value = res.data; notifications.clearNewTickets(res.data.length) } catch { tickets.value = [] }
  if (auth.isAdmin) {
    try { clients.value = (await getClients()).data } catch { clients.value = [] }
    try { users.value = (await getUsers()).data } catch { users.value = [] }
  } else if (auth.user?.role === 'USER' && auth.user?.clientId) {
    try { projects.value = (await getProjectsByClientId(auth.user.clientId)).data } catch { projects.value = [] }
  }
  if (auth.user?.role === 'USER') {
    try { quotas.value = (await getMyQuotas()).data } catch { quotas.value = [] }
  } else if (auth.isAdmin) {
    try { quotas.value = (await getClientQuotas()).data } catch { quotas.value = [] }
  }
  loading.value = false
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => window.removeEventListener('keydown', handleGlobalKeydown))

function handleGlobalKeydown(e) {
  if (e.key === 'Escape' && showForm.value) {
    showForm.value = false
  }
}

function openTicketDetail(ticket) {
  notifications.markTicketSeen(ticket.id)
  router.push(`/tickets/${ticket.id}`)
}

async function handleExport() {
  loadingExport.value = true
  try {
    await exportTicketsCsv()
    toast.success('Export CSV berhasil')
  } catch {
    toast.error('Gagal mengexport CSV')
  } finally {
    loadingExport.value = false
  }
}

async function loadProjects() {
  form.projectId = ''
  if (!form.clientId) { projects.value = []; return }
  try { projects.value = (await getProjectsByClientId(Number(form.clientId))).data }
  catch { projects.value = [] }
}

async function handleCreate() {
  const confirmed = await confirmDialog.value.open({ 
    title: 'Konfirmasi Pembuatan Tiket', 
    message: `Anda akan membuat tiket dukungan teknis (${form.maintenanceType}). Tindakan ini akan memotong sisa kuota tiket perusahaan Anda. Apakah Anda yakin ingin melanjutkan?`,
    confirmLabel: 'Ya, Buat Tiket & Potong Kuota',
    confirmColor: 'blue'
  })
  if (!confirmed) return

  const payload = {
    title: form.title,
    description: form.description,
    priority: form.priority,
    maintenanceType: form.maintenanceType,
    productType: form.productType || null,
    clientId: auth.isAdmin ? Number(form.clientId) : (auth.user?.clientId || Number(form.clientId)),
    projectId: form.projectId ? Number(form.projectId) : null,
    requesterId: Number(form.requesterId) || auth.user?.id,
  }
  loadingCreate.value = true
  try {
    await createTicket(payload, attachments.value)
    showForm.value = false
    tickets.value = (await getTickets()).data
    if (globalChat.connected) {
      globalChat.subscribeAll()
    }
    Object.assign(form, { title: '', description: '', priority: 'L3', maintenanceType: '', productType: '', clientId: '', projectId: '', requesterId: auth.user?.id || '' })
    attachments.value = []
    projects.value = []
    toast.success('Tiket berhasil dibuat')
  } catch (err) {
    if (err?.response?.status === 422) {
      // Error kuota (422) sudah otomatis ditampilkan oleh global interceptor di axios.js (toast kuning)
      // Jadi kita tidak perlu memunculkan toast merah lagi di sini agar tidak dobel.
      return
    }
    
    const msg = err?.response?.data?.message || ''
    toast.error(msg || 'Gagal membuat tiket. Silakan coba lagi.')
  } finally {
    loadingCreate.value = false
  }
}

function handleFileSelect(e) { addFiles(Array.from(e.target.files)); e.target.value = '' }
function handleDrop(e) { dragOver.value = false; addFiles(Array.from(e.dataTransfer.files)) }
function addFiles(files) {
  const maxSize = 5 * 1024 * 1024
  for (const file of files) {
    if (file.size > maxSize) { alert(`File "${file.name}" melebihi batas 5MB`); continue }
    attachments.value.push(file)
  }
}
function removeFile(index) { attachments.value.splice(index, 1) }
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
function formatDate(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }
</script>
