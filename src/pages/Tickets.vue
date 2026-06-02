<template>
  <div>
    <!-- List view -->
    <div v-if="!showForm">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 class="text-xl lg:text-2xl font-bold text-gray-900">Tickets</h2>
          <p class="text-gray-500 text-sm mt-1">{{ filtered.length }} ticket(s) found</p>
        </div>
        <div class="flex gap-2">
          <button @click="handleExport" class="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 font-medium">
            <FileDown class="w-4 h-4" /> Export CSV
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
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
        <table class="w-full text-sm min-w-[700px]">
          <thead class="bg-gray-50">
            <tr class="text-left text-gray-600">
              <th class="px-6 py-3 font-medium">Ticket #</th><th class="px-6 py-3 font-medium">Title</th><th class="px-6 py-3 font-medium">Status</th><th class="px-6 py-3 font-medium">Priority</th><th class="px-6 py-3 font-medium">Type</th><th class="px-6 py-3 font-medium">Client</th><th class="px-6 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="paginated.length === 0"><td colspan="7" class="text-center py-8 text-gray-500">No tickets found.</td></tr>
            <tr v-for="t in paginated" :key="t.id" class="hover:bg-gray-50 cursor-pointer" @click="openTicketDetail(t)">
              <td class="px-6 py-3 font-mono text-xs text-blue-600">{{ t.ticketNumber }}</td>
              <td class="px-6 py-3 font-medium text-gray-900">{{ t.title }}</td>
              <td class="px-6 py-3"><StatusBadge :status="t.status" /></td>
              <td class="px-6 py-3"><PriorityBadge :priority="t.priority" /></td>
              <td class="px-6 py-3"><span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium border', t.maintenanceType === 'PM' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-teal-100 text-teal-800 border-teal-200']">{{ t.maintenanceType }}</span></td>
              <td class="px-6 py-3 text-gray-600">{{ t.clientCompanyName }}</td>
              <td class="px-6 py-3 text-gray-500 text-xs">{{ formatDate(t.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
        </div>
        <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          <p class="text-sm text-gray-500">Showing {{ (currentPage-1)*perPage+1 }} to {{ Math.min(currentPage*perPage, filtered.length) }} of {{ filtered.length }}</p>
          <div class="flex gap-1">
            <button v-for="p in totalPages" :key="p" @click="currentPage = p" :class="['px-3 py-1 rounded text-sm', currentPage === p ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-100']">{{ p }}</button>
          </div>
        </div>
      </div>

      <!-- Detail modal -->
      <div v-if="selectedTicket" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="selectedTicket = null">
        <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col" @click.stop>
          <!-- Fixed header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <h3 class="text-lg font-bold">Ticket Detail</h3>
            <button @click="selectedTicket = null" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
          </div>
          <!-- Scrollable content -->
          <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div class="flex flex-wrap gap-2">
              <StatusBadge :status="selectedTicket.status" />
              <PriorityBadge :priority="selectedTicket.priority" />
              <span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium border', selectedTicket.maintenanceType === 'PM' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-teal-100 text-teal-800 border-teal-200']">{{ selectedTicket.maintenanceType }}</span>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div><p class="text-xs text-gray-500">Ticket Number</p><p class="font-mono text-sm">{{ selectedTicket.ticketNumber }}</p></div>
              <div><p class="text-xs text-gray-500">Created</p><p class="text-sm">{{ formatDate(selectedTicket.createdAt) }}</p></div>
            </div>
            <div><p class="text-xs text-gray-500">Title</p><p class="font-medium">{{ selectedTicket.title }}</p></div>
            <div><p class="text-xs text-gray-500">Description</p><p class="text-sm text-gray-700 whitespace-pre-wrap">{{ selectedTicket.description }}</p></div>
            <div class="grid grid-cols-2 gap-4">
              <div><p class="text-xs text-gray-500">Client</p><p class="text-sm font-medium">{{ selectedTicket.clientCompanyName }}</p></div>
              <div><p class="text-xs text-gray-500">Requester</p><p class="text-sm font-medium">{{ selectedTicket.requesterName }}</p></div>
            </div>

            <!-- Open Chat button -->
            <button @click="goToChat(selectedTicket)" class="w-full flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2.5 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors">
              <MessageCircle class="w-4 h-4" />
              Buka Chat Ticket Ini
            </button>

            <!-- Attachments -->
            <div v-if="ticketAttachments.length > 0">
              <p class="text-xs text-gray-500 mb-2">Attachments</p>
              <div class="space-y-1">
                <button v-for="att in ticketAttachments" :key="att.id" @click="downloadAttachment(att.id, att.fileName)"
                  class="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 rounded-lg px-3 py-2 w-full text-left">
                  <Download class="w-4 h-4" />
                  <span>{{ att.fileName }}</span>
                  <span class="text-xs text-gray-400 ml-auto">{{ att.fileType }}</span>
                </button>
              </div>
            </div>

            <!-- Update Status (Admin/Support) -->
            <div v-if="canManageTickets" class="border-t border-gray-200 pt-4">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium text-gray-700">Update Status</p>
                <button @click="showStatusForm = !showStatusForm" class="text-xs text-blue-600 hover:text-blue-800">
                  {{ showStatusForm ? 'Cancel' : 'Change Status' }}
                </button>
              </div>
              <form v-if="showStatusForm" @submit.prevent="handleUpdateStatus" class="space-y-3">
                <select v-model="statusForm.status" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Pilih status baru...</option>
                  <option v-for="s in allowedTransitions" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
                <textarea v-model="statusForm.notes" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Catatan perubahan (opsional)"></textarea>
                <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 font-medium">Update Status</button>
              </form>
            </div>

            <!-- Assignments (Admin/Support) -->
            <div v-if="canAssignTickets" class="border-t border-gray-200 pt-4">
              <div class="flex items-center justify-between mb-2">
                <p class="text-sm font-medium text-gray-700 flex items-center gap-2"><UserCheck class="w-4 h-4" /> Assigned Support</p>
                <button @click="showAssignForm = !showAssignForm" class="text-xs text-blue-600 hover:text-blue-800">
                  {{ showAssignForm ? 'Cancel' : 'Assign' }}
                </button>
              </div>
              <!-- Current assignments -->
              <div v-if="ticketAssignments.length > 0" class="space-y-2 mb-3">
                <div v-for="a in ticketAssignments" :key="a.id" class="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                  <div class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium">{{ a.assignedToName?.charAt(0) }}</div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ a.assignedToName }}</p>
                    <p class="text-xs text-gray-500">{{ a.assignedToEmail }}</p>
                  </div>
                </div>
              </div>
              <p v-else class="text-xs text-gray-400 mb-3">Belum ada support yang ditugaskan.</p>
              <!-- Assign form -->
              <form v-if="showAssignForm" @submit.prevent="handleAssign" class="space-y-3">
                <div>
                  <label class="block text-xs text-gray-500 mb-2">Pilih Support Engineer</label>
                  <div class="border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                    <label v-for="u in assignableUsers" :key="u.id"
                      class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                      <input type="checkbox" :value="u.id" v-model="assignForm.supportUserIds" class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium">{{ u.name.charAt(0) }}</div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">{{ u.name }}</p>
                        <p class="text-xs text-gray-400">{{ u.role }}</p>
                      </div>
                    </label>
                  </div>
                </div>
                <textarea v-model="assignForm.notes" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Catatan assignment (opsional)"></textarea>
                <button type="submit" :disabled="assignForm.supportUserIds.length === 0" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 font-medium disabled:opacity-50">Assign</button>
              </form>
            </div>

            <!-- Progress Log -->
            <div v-if="progressLogs.length > 0" class="border-t border-gray-200 pt-4">
              <p class="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2"><Clock class="w-4 h-4" /> Progress Log</p>
              <div class="space-y-3">
                <div v-for="log in progressLogs" :key="log.id" class="flex gap-3">
                  <div class="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <StatusBadge :status="log.fromStatus" />
                      <span class="text-xs text-gray-400">→</span>
                      <StatusBadge :status="log.toStatus" />
                    </div>
                    <p class="text-xs text-gray-500 mt-1">{{ log.changedByName }} • {{ formatDate(log.changedAt) }}</p>
                    <p v-if="log.notes" class="text-xs text-gray-600 mt-0.5">{{ log.notes }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- end scrollable content -->
        </div>
        <!-- end modal card -->
      </div>
    </div>

    <!-- Registration form (full page) -->
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
          <!-- Jenis Maintenance & Priority -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option value="L1">Level 1 - Critical (Urgent)</option>
                <option value="L2">Level 2 - High</option>
                <option value="L3">Level 3 - Medium (Normal)</option>
                <option value="L4">Level 4 - Low</option>
              </select>
            </div>
          </div>

          <!-- SLA Target info -->
          <div class="bg-blue-50 border border-blue-100 rounded-lg px-5 py-3 flex gap-8 text-sm">
            <span class="text-blue-700">Target Respon: <strong class="text-blue-900">{{ slaTarget.response }}</strong></span>
            <span class="text-blue-700">Target Solusi: <strong class="text-blue-900">{{ slaTarget.resolution }}</strong></span>
          </div>

          <!-- Client & Requester (admin: dropdown, user: auto-filled info) -->
          <div v-if="auth.isAdmin" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Client *</label>
              <select v-model="form.clientId" @change="loadProjects" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" required>
                <option value="">Pilih Client...</option>
                <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
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
                <div>
                  <p class="text-xs text-gray-500">Client</p>
                  <p class="text-sm font-medium text-gray-900">{{ auth.user?.clientName || '-' }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">Requester</p>
                  <p class="text-sm font-medium text-gray-900">{{ auth.user?.name }}</p>
                </div>
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

          <!-- Subjek Masalah -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Subjek Masalah *</label>
            <input v-model="form.title" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Contoh: Error Login pada Intelligent Capture" required />
          </div>

          <!-- Deskripsi Detail -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi Detail *</label>
            <textarea v-model="form.description" rows="5" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jelaskan kendala yang dialami secara mendetail..." required></textarea>
          </div>

          <!-- Lampiran -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Lampiran Pendukung</label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
              @click="$refs.fileInput.click()"
              @dragover.prevent="dragOver = true"
              @dragleave="dragOver = false"
              @drop.prevent="handleDrop"
              :class="{ 'border-blue-400 bg-blue-50/30': dragOver }"
            >
              <input ref="fileInput" type="file" class="hidden" multiple accept="image/*,.pdf,.log,.txt,.doc,.docx" @change="handleFileSelect" />
              <p v-if="attachments.length === 0" class="text-sm text-gray-500">Klik atau drag file untuk melampirkan screenshot atau log file (Max 5MB)</p>
              <div v-else class="space-y-2">
                <div v-for="(file, index) in attachments" :key="index" class="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <Paperclip class="w-4 h-4 text-gray-400 shrink-0" />
                    <span class="text-sm text-gray-700 truncate">{{ file.name }}</span>
                    <span class="text-xs text-gray-400 shrink-0">({{ formatFileSize(file.size) }})</span>
                  </div>
                  <button type="button" @click.stop="removeFile(index)" class="text-red-500 hover:text-red-700 shrink-0 ml-2">
                    <X class="w-4 h-4" />
                  </button>
                </div>
                <p class="text-xs text-gray-400 mt-2">Klik untuk menambah file lain</p>
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex gap-4 pt-4">
            <button type="button" @click="showForm = false" class="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-medium transition-colors">
              Batal
            </button>
            <button type="submit" class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm">
              Kirim Tiket & Gunakan Kuota
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getTickets } from '../api/tickets'
import { getClients } from '../api/clients'
import { getUsers, getAssignableEngineers } from '../api/users'
import { getClientQuotas, getMyQuotas } from '../api/quotas'
import { getProjectsByClientId } from '../api/projects'
import { createTicket, updateTicketStatus, getTicketProgress, exportTicketsCsv } from '../api/tickets'
import { getAttachmentsByTicketId, downloadAttachment } from '../api/attachments'
import { assignTicket, getTicketAssignments } from '../api/assignments'
import { useAuthStore } from '../stores/auth'
import { mockTickets, mockClients, mockUsers, mockQuotas, mockProjects } from '../utils/mockData'
import { Search, Plus, X, Paperclip, Download, Clock, MessageCircle, UserCheck, FileDown } from 'lucide-vue-next'
import StatusBadge from '../components/StatusBadge.vue'
import PriorityBadge from '../components/PriorityBadge.vue'

import { useNotificationStore } from '../stores/notifications'

const auth = useAuthStore()
const router = useRouter()
const notifications = useNotificationStore()
const canManageTickets = computed(() => ['ADMIN', 'SUPPORT', 'TECHNICAL_SUPPORT'].includes(auth.user?.role))
const canAssignTickets = computed(() => ['ADMIN', 'SUPPORT'].includes(auth.user?.role))

const tickets = ref([])
const clients = ref([])
const users = ref([])
const quotas = ref([])
const showForm = ref(false)
const search = ref('')
const filterStatus = ref('')
const filterPriority = ref('')
const currentPage = ref(1)
const perPage = 50
const selectedTicket = ref(null)
const form = reactive({ title: '', description: '', priority: 'L3', maintenanceType: '', clientId: '', projectId: '', requesterId: auth.user?.id || '' })
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

function updateSLATargets() {
  slaTarget.value = slaTargets[form.priority] || slaTargets['L3']
}

const selectedClientName = computed(() => {
  if (!auth.isAdmin) return auth.user?.clientName || ''
  if (!form.clientId) return ''
  const client = clients.value.find(c => c.id === Number(form.clientId))
  return client ? client.companyName : ''
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

const filtered = computed(() => tickets.value.filter(t => {
  const s = !search.value || t.title.toLowerCase().includes(search.value.toLowerCase()) || t.ticketNumber.toLowerCase().includes(search.value.toLowerCase())
  const st = !filterStatus.value || t.status === filterStatus.value
  const pr = !filterPriority.value || t.priority === filterPriority.value
  return s && st && pr
}))
const totalPages = computed(() => Math.ceil(filtered.value.length / perPage))
const paginated = computed(() => filtered.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage))

watch([search, filterStatus, filterPriority], () => { currentPage.value = 1 })

onMounted(async () => {
  try { const res = await getTickets(); tickets.value = res.data; notifications.clearNewTickets(res.data.length) } catch { tickets.value = mockTickets }
  if (auth.isAdmin) {
    try { const res = await getClients(); clients.value = res.data } catch { clients.value = mockClients }
    try { const res = await getUsers(); users.value = res.data } catch { users.value = mockUsers }
  } else if (auth.user?.role === 'USER') {
    // Load projects for user's client
    if (auth.user?.clientId) {
      try { const res = await getProjectsByClientId(auth.user.clientId); projects.value = res.data }
      catch { projects.value = mockProjects.filter(p => p.clientId === auth.user.clientId) }
    }
  }
  if (auth.user?.role === 'USER') {
    try {
      const res = await getMyQuotas()
      quotas.value = res.data
    } catch { quotas.value = mockQuotas }
  } else if (auth.isAdmin) {
    try {
      const res = await getClientQuotas()
      quotas.value = res.data
    } catch { quotas.value = mockQuotas }
  }
})

async function handleExport() {
  try {
    await exportTicketsCsv()
  } catch {}
}

function goToChat(ticket) {
  selectedTicket.value = null
  router.push({ path: '/chat', query: { ticketId: ticket.id } })
}

async function loadProjects() {
  form.projectId = ''
  if (!form.clientId) { projects.value = []; return }
  try { const res = await getProjectsByClientId(Number(form.clientId)); projects.value = res.data }
  catch { projects.value = mockProjects.filter(p => p.clientId === Number(form.clientId)) }
}

async function handleCreate() {
  const payload = {
    title: form.title,
    description: form.description,
    priority: form.priority,
    maintenanceType: form.maintenanceType,
    clientId: auth.isAdmin ? Number(form.clientId) : (auth.user?.clientId || Number(form.clientId)),
    projectId: form.projectId ? Number(form.projectId) : null,
    requesterId: Number(form.requesterId) || auth.user?.id,
  }
  try {
    await createTicket(payload, attachments.value)
    showForm.value = false
    const res = await getTickets(); tickets.value = res.data
    // Reset form
    Object.assign(form, { title: '', description: '', priority: 'L3', maintenanceType: '', clientId: '', projectId: '', requesterId: auth.user?.id || '' })
    attachments.value = []
    projects.value = []
  } catch {
    // handle error
  }
}

// Ticket detail - progress & status update
const progressLogs = ref([])
const ticketAttachments = ref([])
const statusForm = reactive({ status: '', notes: '' })
const showStatusForm = ref(false)
const ticketAssignments = ref([])
const showAssignForm = ref(false)
const assignForm = reactive({ supportUserIds: [], notes: '' })
const assignableUsers = ref([])

const allowedTransitions = computed(() => {
  const current = selectedTicket.value?.status
  const transitions = {
    OPEN: [{ value: 'IN_PROGRESS', label: 'In Progress' }],
    IN_PROGRESS: [{ value: 'RESOLVED', label: 'Resolved' }],
    RESOLVED: [{ value: 'CLOSED', label: 'Closed' }, { value: 'IN_PROGRESS', label: 'In Progress (Reopen)' }],
    CLOSED: [],
  }
  return transitions[current] || []
})

async function openTicketDetail(ticket) {
  selectedTicket.value = ticket
  progressLogs.value = []
  ticketAttachments.value = []
  ticketAssignments.value = []
  assignableUsers.value = []
  showStatusForm.value = false
  showAssignForm.value = false
  try { const res = await getTicketProgress(ticket.id); progressLogs.value = res.data } catch {}
  if (ticket.attachments) {
    ticketAttachments.value = ticket.attachments
  } else {
    try { const res = await getAttachmentsByTicketId(ticket.id); ticketAttachments.value = res.data } catch {}
  }
  if (ticket.assignments) {
    ticketAssignments.value = ticket.assignments
  } else {
    try { const res = await getTicketAssignments(ticket.id); ticketAssignments.value = res.data } catch {}
  }
  // Load assignable users for assign form
  if (canAssignTickets.value) {
    try { assignableUsers.value = (await getAssignableEngineers()).data } catch { assignableUsers.value = users.value.filter(u => u.role === 'SUPPORT' || u.role === 'TECHNICAL_SUPPORT' || u.role === 'ADMIN') }
  }
}

async function handleUpdateStatus() {
  if (!statusForm.status || !selectedTicket.value) return
  try {
    await updateTicketStatus(selectedTicket.value.id, {
      status: statusForm.status,
      changedBy: auth.user?.id,
      notes: statusForm.notes,
    })
    const res = await getTickets(); tickets.value = res.data
    const updated = tickets.value.find(t => t.id === selectedTicket.value.id)
    if (updated) selectedTicket.value = updated
    const logRes = await getTicketProgress(selectedTicket.value.id); progressLogs.value = logRes.data
    showStatusForm.value = false
    statusForm.status = ''
    statusForm.notes = ''
  } catch {}
}

async function handleAssign() {
  if (assignForm.supportUserIds.length === 0 || !selectedTicket.value) return
  try {
    await assignTicket(selectedTicket.value.id, {
      supportUserIds: assignForm.supportUserIds.map(Number),
      notes: assignForm.notes,
    })
    const res = await getTicketAssignments(selectedTicket.value.id)
    ticketAssignments.value = res.data
    showAssignForm.value = false
    assignForm.supportUserIds = []
    assignForm.notes = ''
  } catch {}
}

function handleFileSelect(event) {
  const files = Array.from(event.target.files)
  addFiles(files)
  event.target.value = ''
}

function handleDrop(event) {
  dragOver.value = false
  const files = Array.from(event.dataTransfer.files)
  addFiles(files)
}

function addFiles(files) {
  const maxSize = 5 * 1024 * 1024 // 5MB
  for (const file of files) {
    if (file.size > maxSize) {
      alert(`File "${file.name}" melebihi batas 5MB`)
      continue
    }
    attachments.value.push(file)
  }
}

function removeFile(index) {
  attachments.value.splice(index, 1)
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }
</script>
