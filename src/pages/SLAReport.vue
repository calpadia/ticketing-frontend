<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div><h2 class="text-2xl font-bold text-gray-900">SLA Report</h2><p class="text-gray-500 text-sm mt-1">Service Level Agreement performance monitoring</p></div>
      <div class="flex items-end gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1.5">From Date</label>
          <input v-model="filterFrom" type="date" class="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1.5">To Date</label>
          <input v-model="filterTo" type="date" class="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        <button @click="loadReport" class="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm hover:bg-blue-700 font-medium h-[42px] transition-colors hover:shadow-md hover:shadow-blue-600/20">Filter</button>
      </div>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" v-if="report">
      <StatCard title="Overall Response SLA" :value="overallResponseSla + '%'" :color="Number(overallResponseSla) >= 90 ? 'green' : Number(overallResponseSla) >= 75 ? 'yellow' : 'red'" />
      <StatCard title="Overall Resolution SLA" :value="overallResolutionSla + '%'" :color="Number(overallResolutionSla) >= 90 ? 'green' : Number(overallResolutionSla) >= 75 ? 'yellow' : 'red'" />
      <StatCard title="Total Tickets" :value="totalTickets" color="blue" />
      <StatCard title="Generated" :value="report.generatedAt ? formatDate(report.generatedAt) : '-'" color="indigo" />
    </div>

    <!-- SLA Targets -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6" v-if="report?.targets">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">SLA Targets by Priority</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="t in report.targets" :key="t.priority" class="border border-gray-200 rounded-xl p-4">
          <PriorityBadge :priority="t.priority" />
          <div class="space-y-1 text-sm mt-2">
            <div class="flex justify-between"><span class="text-gray-500">Response</span><span class="font-medium">{{ t.responseHours }}h</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Resolution</span><span class="font-medium">{{ t.resolutionHours }}h</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Per-client table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 flex flex-col" v-if="report?.clients">
      <div class="px-6 py-4 border-b border-gray-200 shrink-0"><h3 class="text-lg font-semibold text-gray-900">SLA Performance by Client</h3></div>
      <div class="overflow-auto max-h-[65vh]">
        <table class="w-full text-sm relative">
          <thead class="bg-gray-50/95 backdrop-blur sticky top-0 z-10 shadow-sm">
            <tr class="text-left text-gray-600">
              <th class="px-6 py-3 font-medium">Client</th>
              <th class="px-6 py-3 font-medium">Tickets</th>
              <th class="px-6 py-3 font-medium has-tooltip" data-tooltip="Memenuhi / Melewati / Masih Berjalan">Response Stats (?)</th>
              <th class="px-6 py-3 font-medium has-tooltip" data-tooltip="Persentase kelulusan SLA Respons">Response SLA (%)</th>
              <th class="px-6 py-3 font-medium">Avg Response</th>
              <th class="px-6 py-3 font-medium has-tooltip" data-tooltip="Memenuhi / Melewati / Masih Berjalan">Resolution Stats (?)</th>
              <th class="px-6 py-3 font-medium has-tooltip" data-tooltip="Persentase kelulusan SLA Resolusi">Resolution SLA (%)</th>
              <th class="px-6 py-3 font-medium">Avg Resolution</th>
              <th class="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="filteredClients.length === 0"><td colspan="9" class="text-center py-8 text-gray-500">No data available.</td></tr>
            <tr v-for="c in paginatedClients" :key="c.clientId" class="hover:bg-gray-50">
              <td class="px-6 py-4 font-medium text-gray-900">{{ c.clientName }}</td>
              <td class="px-6 py-4">{{ c.totalTickets }}</td>
              <td class="px-6 py-4">
                <button @click="openDrillDown(c.clientName, 'Response', 'Met (Memenuhi)', c.response?.metTickets)" class="text-green-600 font-bold hover:underline has-tooltip" data-tooltip="Met (Sukses)">{{ c.response?.met || 0 }}</button> <span class="text-gray-300 mx-1">/</span> 
                <button @click="openDrillDown(c.clientName, 'Response', 'Missed (Gagal)', c.response?.missedTickets)" class="text-red-600 font-bold hover:underline has-tooltip" data-tooltip="Missed (Gagal)">{{ c.response?.missed || 0 }}</button> <span class="text-gray-300 mx-1">/</span> 
                <button @click="openDrillDown(c.clientName, 'Response', 'Pending (Berjalan)', c.response?.pendingTickets)" class="text-gray-400 font-medium hover:underline has-tooltip" data-tooltip="Pending (Berjalan)">{{ c.response?.pending || 0 }}</button>
              </td>
              <td class="px-6 py-4"><span :class="['font-bold', slaColor(c.response?.compliancePercent)]">{{ (c.response?.compliancePercent || 0).toFixed(1) }}%</span></td>
              <td class="px-6 py-4 text-gray-600 font-medium">{{ formatHoursToHumanFriendly(c.response?.averageHours) }}</td>
              <td class="px-6 py-4">
                <button @click="openDrillDown(c.clientName, 'Resolution', 'Met (Memenuhi)', c.resolution?.metTickets)" class="text-green-600 font-bold hover:underline has-tooltip" data-tooltip="Met (Sukses)">{{ c.resolution?.met || 0 }}</button> <span class="text-gray-300 mx-1">/</span> 
                <button @click="openDrillDown(c.clientName, 'Resolution', 'Missed (Gagal)', c.resolution?.missedTickets)" class="text-red-600 font-bold hover:underline has-tooltip" data-tooltip="Missed (Gagal)">{{ c.resolution?.missed || 0 }}</button> <span class="text-gray-300 mx-1">/</span> 
                <button @click="openDrillDown(c.clientName, 'Resolution', 'Pending (Berjalan)', c.resolution?.pendingTickets)" class="text-gray-400 font-medium hover:underline has-tooltip" data-tooltip="Pending (Berjalan)">{{ c.resolution?.pending || 0 }}</button>
              </td>
              <td class="px-6 py-4"><span :class="['font-bold', slaColor(c.resolution?.compliancePercent)]">{{ (c.resolution?.compliancePercent || 0).toFixed(1) }}%</span></td>
              <td class="px-6 py-4 text-gray-600 font-medium">{{ formatHoursToHumanFriendly(c.resolution?.averageHours) }}</td>
              <td class="px-6 py-4"><span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium border', minStatusClass(c.response?.compliancePercent, c.resolution?.compliancePercent)]">{{ minStatusLabel(c.response?.compliancePercent, c.resolution?.compliancePercent) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
        <p class="text-sm text-gray-500">Showing {{ (currentPage - 1) * perPage + 1 }} to {{ Math.min(currentPage * perPage, filteredClients.length) }} of {{ filteredClients.length }}</p>
        <div class="flex gap-1">
          <button v-for="p in totalPages" :key="p" @click="currentPage = p" :class="['px-3 py-1 rounded text-sm', currentPage === p ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-100']">{{ p }}</button>
        </div>
      </div>
    </div>

    <!-- Visual bars -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6" v-if="report?.clients?.length > 0">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Resolution SLA Achievement</h3>
      <div class="space-y-4">
        <div v-for="c in report.clients" :key="c.clientId">
          <div class="flex justify-between text-sm mb-1">
            <span class="font-medium text-gray-700">{{ c.clientName }}</span>
            <span :class="['font-medium', slaColor(c.resolution?.compliancePercent)]">{{ (c.resolution?.compliancePercent || 0).toFixed(1) }}%</span>
          </div>
          <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div :class="['h-full rounded-full transition-all duration-500', slaBarColor(c.resolution?.compliancePercent)]" :style="{ width: (c.resolution?.compliancePercent || 0) + '%' }"></div>
          </div>
        </div>
        <div class="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-full bg-green-500"></div><span>Above 90%</span></div>
          <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-full bg-yellow-500"></div><span>75-90%</span></div>
          <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-full bg-red-500"></div><span>Below 75%</span></div>
        </div>
      </div>
    </div>

    <div v-if="!report && !loading" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
      No SLA data available.
    </div>

    <!-- Drill Down Modal -->
    <div v-if="drillDown.isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="drillDown.isOpen = false"></div>
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[85vh]">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div>
            <h3 class="text-lg font-bold text-gray-900">{{ drillDown.clientName }}</h3>
            <p class="text-sm text-gray-500">Daftar Tiket: <span class="font-bold text-gray-700">{{ drillDown.slaType }} - {{ drillDown.statusType }}</span></p>
          </div>
          <button @click="drillDown.isOpen = false" class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="overflow-y-auto p-6">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-gray-500 bg-gray-50 uppercase border-y border-gray-200">
              <tr>
                <th class="px-4 py-3 font-semibold">Nomor Tiket</th>
                <th class="px-4 py-3 font-semibold">Judul Tiket</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-if="!drillDown.tickets?.length">
                <td colspan="2" class="px-4 py-8 text-center text-gray-500">Tidak ada data tiket.</td>
              </tr>
              <tr v-for="t in drillDown.tickets" :key="t.id" class="hover:bg-blue-50/50 group cursor-pointer transition-colors" @click="goToTicket(t.id)">
                <td class="px-4 py-3 font-mono font-bold text-blue-600 group-hover:text-blue-800">{{ t.ticketNumber }}</td>
                <td class="px-4 py-3 font-medium text-gray-700 group-hover:text-gray-900">{{ t.title }}</td>
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
import { getSlaReport } from '../api/slaReport'
import StatCard from '../components/StatCard.vue'
import PriorityBadge from '../components/PriorityBadge.vue'

const report = ref(null)
const loading = ref(true)
const filterFrom = ref('')
const filterTo = ref('')
const currentPage = ref(1)
const perPage = 10
const router = useRouter()

const drillDown = ref({
  isOpen: false,
  clientName: '',
  slaType: '',
  statusType: '',
  tickets: []
})

const openDrillDown = (clientName, slaType, statusType, tickets) => {
  if (!tickets || tickets.length === 0) return
  drillDown.value = {
    isOpen: true,
    clientName,
    slaType,
    statusType,
    tickets
  }
}

const goToTicket = (id) => {
  if (id) router.push(`/tickets/${id}`)
}

const filteredClients = computed(() => report.value?.clients || [])
const totalPages = computed(() => Math.ceil(filteredClients.value.length / perPage))
const paginatedClients = computed(() => filteredClients.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage))

const totalTickets = computed(() => report.value?.clients?.reduce((sum, c) => sum + c.totalTickets, 0) || 0)
const overallResponseSla = computed(() => {
  if (!report.value?.clients?.length) return '0'
  const clients = report.value.clients.filter(c => c.response)
  if (!clients.length) return '0'
  const avg = clients.reduce((sum, c) => sum + (c.response?.compliancePercent || 0), 0) / clients.length
  return avg.toFixed(1)
})
const overallResolutionSla = computed(() => {
  if (!report.value?.clients?.length) return '0'
  const clients = report.value.clients.filter(c => c.resolution)
  if (!clients.length) return '0'
  const avg = clients.reduce((sum, c) => sum + (c.resolution?.compliancePercent || 0), 0) / clients.length
  return avg.toFixed(1)
})

onMounted(() => loadReport())

async function loadReport() {
  loading.value = true
  try {
    const params = {}
    if (filterFrom.value) params.from = filterFrom.value
    if (filterTo.value) params.to = filterTo.value
    const res = await getSlaReport(params)
    report.value = res.data
  } catch {
    report.value = null
  } finally {
    loading.value = false
  }
}

function slaColor(pct) {
  if (!pct) return 'text-gray-400'
  return pct >= 90 ? 'text-green-600' : pct >= 75 ? 'text-yellow-600' : 'text-red-600'
}
function slaBarColor(pct) {
  if (!pct) return 'bg-gray-300'
  return pct >= 90 ? 'bg-green-500' : pct >= 75 ? 'bg-yellow-500' : 'bg-red-500'
}
function minStatusLabel(response, resolution) {
  const min = Math.min(response || 0, resolution || 0)
  return min >= 90 ? 'Met' : min >= 75 ? 'At Risk' : 'Breached'
}
function minStatusClass(response, resolution) {
  const min = Math.min(response || 0, resolution || 0)
  return min >= 90 ? 'bg-green-100 text-green-800 border-green-200' : 
         min >= 75 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
         'bg-red-100 text-red-800 border-red-200'
}
function formatHoursToHumanFriendly(hours) {
  if (!hours || hours === 0) return '0j 0m'
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h >= 24) {
    const d = Math.floor(h / 24)
    const remainingH = h % 24
    return `${d}hri ${remainingH}j`
  }
  return `${h}j ${m}m`
}
function formatDate(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }
</script>

