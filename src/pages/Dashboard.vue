<template>
  <div>
    <div v-if="auth.user?.role === 'USER'">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Halo, Pak {{ auth.user?.name }}</h2>
          <p class="text-gray-500 text-sm mt-1">Status Maintenance <span class="font-bold text-gray-900">{{ auth.user?.clientName }}</span></p>
        </div>
        <button @click="router.push({ path: '/tickets', query: { create: 'true' } })" class="bg-[#e02424] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm transition-colors">
          + Buat Tiket Baru
        </button>
      </div>

      <!-- User Quota Warnings -->
      <div v-if="userQuotaWarnings.length > 0" class="mb-6 space-y-3">
        <div v-for="(warn, i) in userQuotaWarnings" :key="i"
          :class="['flex items-start gap-3 p-4 rounded-xl border', warn.level === 'danger' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800']">
          <AlertCircle v-if="warn.level === 'danger'" class="w-5 h-5 shrink-0 mt-0.5" />
          <AlertTriangle v-else class="w-5 h-5 shrink-0 mt-0.5" />
          <div class="flex-1">
            <h4 class="text-sm font-bold">{{ warn.level === 'danger' ? 'Kuota Habis' : 'Kuota Menipis' }}</h4>
            <p class="text-sm mt-1">{{ warn.msg }} Harap hubungi tim Support/Admin.</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- PM Quota Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden flex flex-col justify-between h-36">
          <div class="absolute left-0 top-4 bottom-4 w-1.5 rounded-r-full bg-[#10b981]"></div>
          <p class="text-xs text-gray-500 font-bold uppercase tracking-wide ml-3">PREVENTIVE MAINTENANCE (PM)</p>
          <div class="flex items-baseline gap-2 mt-1 ml-3">
            <span class="text-4xl font-bold text-gray-900">{{ String(Math.max(currentQuota.pmQuota - currentQuota.pmUsed, 0)).padStart(2, '0') }}</span>
            <span class="text-gray-400 font-medium">/ {{ currentQuota.pmQuota }} Tiket</span>
          </div>
          <div class="mt-4 ml-3">
            <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div class="h-full bg-[#10b981] rounded-full" :style="{ width: `${currentQuota.pmQuota ? (currentQuota.pmUsed / currentQuota.pmQuota) * 100 : 0}%` }"></div>
            </div>
            <div class="flex justify-between text-[11px] text-gray-400 font-medium">
              <span>Terpakai: {{ currentQuota.pmUsed }}</span>
              <span>Sisa: {{ Math.max(currentQuota.pmQuota - currentQuota.pmUsed, 0) }}</span>
            </div>
          </div>
        </div>

        <!-- CM Quota Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden flex flex-col justify-between h-36">
          <div class="absolute left-0 top-4 bottom-4 w-1.5 rounded-r-full bg-[#f97316]"></div>
          <p class="text-xs text-gray-500 font-bold uppercase tracking-wide ml-3">CORRECTIVE MAINTENANCE (CM)</p>
          <div class="flex items-baseline gap-2 mt-1 ml-3">
            <span class="text-4xl font-bold text-gray-900">{{ String(Math.max(currentQuota.cmQuota - currentQuota.cmUsed, 0)).padStart(2, '0') }}</span>
            <span class="text-gray-400 font-medium">/ {{ currentQuota.cmQuota }} Tiket</span>
          </div>
          <div class="mt-4 ml-3">
            <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div class="h-full bg-[#f97316] rounded-full" :style="{ width: `${currentQuota.cmQuota ? (currentQuota.cmUsed / currentQuota.cmQuota) * 100 : 0}%` }"></div>
            </div>
            <div class="flex justify-between text-[11px] text-gray-400 font-medium">
              <span>Terpakai: {{ currentQuota.cmUsed }}</span>
              <span>Sisa: {{ Math.max(currentQuota.cmQuota - currentQuota.cmUsed, 0) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-6">Update Tiket Terbaru</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left min-w-[600px]">
            <thead class="text-xs text-gray-400 border-b border-gray-100">
              <tr>
                <th class="pb-3 font-medium">ID Tiket</th>
                <th class="pb-3 font-medium">Jenis</th>
                <th class="pb-3 font-medium">Subjek</th>
                <th class="pb-3 font-medium">Status</th>
                <th class="pb-3 font-medium">Update</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-if="recentTickets.length === 0">
                <td colspan="5" class="py-6 text-center text-gray-400">Belum ada tiket</td>
              </tr>
              <tr v-for="t in recentTickets" :key="t.id" class="hover:bg-gray-50 cursor-pointer transition-colors group" @click="router.push(`/tickets/${t.id}`)">
                <td class="py-4 font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{ t.ticketNumber }}</td>
                <td class="py-4">
                  <span :class="['px-2.5 py-1 rounded text-[10px] font-bold text-white', t.maintenanceType === 'PM' ? 'bg-[#10b981]' : 'bg-[#f97316]']">{{ t.maintenanceType }}</span>
                </td>
                <td class="py-4 text-gray-700 font-medium">{{ t.title }}</td>
                <td class="py-4 text-gray-600">{{ statusLabel(t.status) }}</td>
                <td class="py-4 text-gray-600">{{ formatRelativeTime(t.updatedAt || t.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Admin/Support Dashboard -->
    <div v-else>
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p class="text-gray-500 text-sm mt-1">Overview sistem ticketing</p>
      </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <StatCard title="Total Tickets" :value="tickets.length" color="blue" class="cursor-pointer hover:-translate-y-1 transition-transform" @click="router.push('/tickets')" />
      <StatCard title="Open" :value="openCount" color="yellow" class="cursor-pointer hover:-translate-y-1 transition-transform" @click="router.push('/tickets?status=OPEN')" />
      <StatCard title="In Progress" :value="inProgressCount" color="indigo" class="cursor-pointer hover:-translate-y-1 transition-transform" @click="router.push('/tickets?status=IN_PROGRESS')" />
      <StatCard title="Resolved" :value="resolvedCount" color="green" class="cursor-pointer hover:-translate-y-1 transition-transform" @click="router.push('/tickets?status=RESOLVED')" />
      <StatCard title="Critical Quotas" :value="criticalClientQuotas.count" color="red" class="cursor-pointer hover:-translate-y-1 transition-transform" @click="router.push('/service-catalog')" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Ticket Status Distribution</h3>
        <div class="flex items-end gap-4 h-48">
          <BarItem label="Open" :value="openCount" :max="tickets.length" color="bg-yellow-500" class="cursor-pointer hover:opacity-80 transition-opacity" @click="router.push('/tickets?status=OPEN')" />
          <BarItem label="In Progress" :value="inProgressCount" :max="tickets.length" color="bg-blue-500" class="cursor-pointer hover:opacity-80 transition-opacity" @click="router.push('/tickets?status=IN_PROGRESS')" />
          <BarItem label="Resolved" :value="resolvedCount" :max="tickets.length" color="bg-green-500" class="cursor-pointer hover:opacity-80 transition-opacity" @click="router.push('/tickets?status=RESOLVED')" />
          <BarItem label="Closed" :value="closedCount" :max="tickets.length" color="bg-gray-400" class="cursor-pointer hover:opacity-80 transition-opacity" @click="router.push('/tickets?status=CLOSED')" />
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div class="space-y-2">
          <div class="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors" @click="router.push('/clients')">
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><Building2 class="w-5 h-5 text-gray-600" /></div>
            <div><p class="text-sm text-gray-500">Active Clients</p><p class="font-semibold">{{ clients.filter(c => c.isActive).length }} / {{ clients.length }}</p></div>
          </div>
          <div class="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors" @click="router.push('/users')">
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><UsersIcon class="w-5 h-5 text-gray-600" /></div>
            <div><p class="text-sm text-gray-500">Total Users</p><p class="font-semibold">{{ users.length }}</p></div>
          </div>
          <div class="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors" @click="router.push('/tickets')">
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><Ticket class="w-5 h-5 text-gray-600" /></div>
            <div><p class="text-sm text-gray-500">PM / CM</p><p class="font-semibold">{{ tickets.filter(t => t.maintenanceType === 'PM').length }} / {{ tickets.filter(t => t.maintenanceType === 'CM').length }}</p></div>
          </div>
          
          <div v-if="criticalClientQuotas.count > 0" class="flex items-start gap-3 cursor-pointer hover:bg-red-50 p-3 -mx-2 mt-2 rounded-lg transition-colors bg-red-50/50 border border-red-100" @click="router.push('/service-catalog')">
            <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0"><AlertTriangle class="w-5 h-5 text-red-600" /></div>
            <div>
              <p class="text-sm font-bold text-red-800">Klien Kritis (≥80%)</p>
              <p class="text-xs text-red-600 mt-1">{{ criticalClientQuotas.count }} klien butuh perhatian.<br/>(Cth: {{ criticalClientQuotas.clients.map(c => c.name).join(', ') }})</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
      <h3 class="text-lg font-bold text-gray-900 mb-6">Recent Tickets</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left min-w-[600px]">
          <thead class="text-xs text-gray-400 border-b border-gray-100">
            <tr>
              <th class="pb-3 font-medium">Ticket #</th>
              <th class="pb-3 font-medium">Title</th>
              <th class="pb-3 font-medium">Status</th>
              <th class="pb-3 font-medium">Priority</th>
              <th class="pb-3 font-medium">Client</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="recentTickets.length === 0">
              <td colspan="5" class="py-6 text-center text-gray-400">Belum ada tiket</td>
            </tr>
            <tr v-for="t in recentTickets" :key="t.id" class="hover:bg-gray-50 cursor-pointer transition-colors group" @click="router.push(`/tickets/${t.id}`)">
              <td class="py-4 font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{{ t.ticketNumber }}</td>
              <td class="py-4 font-medium text-gray-900">{{ t.title }}</td>
              <td class="py-4"><StatusBadge :status="t.status" /></td>
              <td class="py-4"><PriorityBadge :priority="t.priority" /></td>
              <td class="py-4 text-gray-600">{{ t.clientCompanyName }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTickets } from '../api/tickets'
import { getClients } from '../api/clients'
import { getUsers } from '../api/users'
import { getMyQuotas, getClientQuotas } from '../api/quotas'
import { useAuthStore } from '../stores/auth'
import { Building2, Users as UsersIcon, Ticket, AlertTriangle, AlertCircle } from 'lucide-vue-next'
import StatCard from '../components/StatCard.vue'
import BarItem from '../components/BarItem.vue'
import StatusBadge from '../components/StatusBadge.vue'
import PriorityBadge from '../components/PriorityBadge.vue'

const auth = useAuthStore()
const router = useRouter()
const tickets = ref([])
const clients = ref([])
const users = ref([])
const quotas = ref([])
const allQuotas = ref([])

const currentQuota = computed(() => {
  const currentYear = new Date().getFullYear()
  const q = quotas.value.find(q => q.year === currentYear)
  return q || { pmQuota: 0, pmUsed: 0, cmQuota: 0, cmUsed: 0 }
})

function statusLabel(status) {
  const map = { OPEN: 'Open', IN_PROGRESS: 'Diproses', RESOLVED: 'Resolved', CLOSED: 'Selesai' }
  return map[status] || status
}

function formatRelativeTime(dateString) {
  if (!dateString) return '-'
  const diff = Date.now() - new Date(dateString).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Baru saja'
  if (hours < 24) return `${hours} Jam lalu`
  if (hours < 48) return 'Kemarin'
  return Math.floor(hours / 24) + ' Hari lalu'
}

const openCount = computed(() => tickets.value.filter(t => t.status === 'OPEN').length)
const inProgressCount = computed(() => tickets.value.filter(t => t.status === 'IN_PROGRESS').length)
const resolvedCount = computed(() => tickets.value.filter(t => t.status === 'RESOLVED').length)
const closedCount = computed(() => tickets.value.filter(t => t.status === 'CLOSED').length)
const recentTickets = computed(() => [...tickets.value].reverse().slice(0, 5))

// USER Role warnings
const userQuotaWarnings = computed(() => {
  const warnings = []
  const q = currentQuota.value
  
  if (q.pmQuota > 0) {
    const pmPct = q.pmUsed / q.pmQuota
    if (pmPct >= 1) warnings.push({ type: 'PM', level: 'danger', msg: `Kuota Preventive Maintenance (PM) Anda telah habis (0 tersisa).` })
    else if (pmPct >= 0.8) warnings.push({ type: 'PM', level: 'warning', msg: `Kuota PM Anda tersisa ${q.pmQuota - q.pmUsed} tiket.` })
  }
  if (q.cmQuota > 0) {
    const cmPct = q.cmUsed / q.cmQuota
    if (cmPct >= 1) warnings.push({ type: 'CM', level: 'danger', msg: `Kuota Corrective Maintenance (CM) Anda telah habis (0 tersisa).` })
    else if (cmPct >= 0.8) warnings.push({ type: 'CM', level: 'warning', msg: `Kuota CM Anda tersisa ${q.cmQuota - q.cmUsed} tiket.` })
  }
  return warnings
})

// ADMIN/SUPPORT Role warnings
const criticalClientQuotas = computed(() => {
  const currentYear = new Date().getFullYear()
  const currentYearQuotas = allQuotas.value.filter(q => q.year === currentYear)
  
  let count = 0
  const criticalClients = []
  
  currentYearQuotas.forEach(q => {
    let isCritical = false
    const pmPct = q.pmQuota > 0 ? q.pmUsed / q.pmQuota : 0
    const cmPct = q.cmQuota > 0 ? q.cmUsed / q.cmQuota : 0
    
    if (pmPct >= 0.8 || cmPct >= 0.8) isCritical = true
    
    if (isCritical) {
      count++
      const client = clients.value.find(c => c.id === q.clientId)
      if (client && !criticalClients.find(c => c.name === client.companyName)) {
        criticalClients.push({ name: client.companyName, pmPct, cmPct })
      }
    }
  })
  
  return { count, clients: criticalClients.slice(0, 3) } // Top 3
})

onMounted(async () => {
  try { const res = await getTickets(); tickets.value = res.data } catch { tickets.value = [] }
  if (auth.isAdmin || auth.user?.role === 'SUPPORT') {
    try { const res = await getClients(); clients.value = res.data } catch { clients.value = [] }
    try { const res = await getUsers(); users.value = res.data } catch { users.value = [] }
    try { const res = await getClientQuotas(); allQuotas.value = res.data } catch { allQuotas.value = [] }
  } else if (auth.user?.role === 'USER') {
    try { const res = await getMyQuotas(); quotas.value = res.data } catch { quotas.value = [] }
  }
})
</script>
