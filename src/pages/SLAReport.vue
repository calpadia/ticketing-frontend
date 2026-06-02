<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div><h2 class="text-2xl font-bold text-gray-900">SLA Report</h2><p class="text-gray-500 text-sm mt-1">Service Level Agreement performance monitoring</p></div>
      <div class="flex gap-2">
        <input v-model="filterFrom" type="date" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input v-model="filterTo" type="date" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <button @click="loadReport" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 font-medium">Filter</button>
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
        <div v-for="t in report.targets" :key="t.priority" class="border border-gray-200 rounded-lg p-4">
          <PriorityBadge :priority="t.priority" />
          <div class="space-y-1 text-sm mt-2">
            <div class="flex justify-between"><span class="text-gray-500">Response</span><span class="font-medium">{{ t.responseHours }}h</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Resolution</span><span class="font-medium">{{ t.resolutionHours }}h</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Per-client table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6" v-if="report?.clients">
      <div class="px-6 py-4 border-b border-gray-200"><h3 class="text-lg font-semibold text-gray-900">SLA Performance by Client</h3></div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr class="text-left text-gray-600">
              <th class="px-6 py-3 font-medium">Client</th>
              <th class="px-6 py-3 font-medium">Tickets</th>
              <th class="px-6 py-3 font-medium">Response Met</th>
              <th class="px-6 py-3 font-medium">Response SLA</th>
              <th class="px-6 py-3 font-medium">Avg Response</th>
              <th class="px-6 py-3 font-medium">Resolution Met</th>
              <th class="px-6 py-3 font-medium">Resolution SLA</th>
              <th class="px-6 py-3 font-medium">Avg Resolution</th>
              <th class="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="report.clients.length === 0"><td colspan="9" class="text-center py-8 text-gray-500">No data available.</td></tr>
            <tr v-for="c in report.clients" :key="c.clientId" class="hover:bg-gray-50">
              <td class="px-6 py-4 font-medium text-gray-900">{{ c.clientName }}</td>
              <td class="px-6 py-4">{{ c.totalTickets }}</td>
              <td class="px-6 py-4 text-green-600 font-medium">{{ c.response?.met || 0 }}</td>
              <td class="px-6 py-4"><SlaPercent :value="c.response?.compliancePercent" /></td>
              <td class="px-6 py-4 text-gray-600">{{ (c.response?.averageHours || 0).toFixed(1) }}h</td>
              <td class="px-6 py-4 text-green-600 font-medium">{{ c.resolution?.met || 0 }}</td>
              <td class="px-6 py-4"><SlaPercent :value="c.resolution?.compliancePercent" /></td>
              <td class="px-6 py-4 text-gray-600">{{ (c.resolution?.averageHours || 0).toFixed(1) }}h</td>
              <td class="px-6 py-4"><SlaStatus :response="c.response?.compliancePercent" :resolution="c.resolution?.compliancePercent" /></td>
            </tr>
          </tbody>
        </table>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getSlaReport } from '../api/slaReport'
import StatCard from '../components/StatCard.vue'
import PriorityBadge from '../components/PriorityBadge.vue'

const report = ref(null)
const loading = ref(true)
const filterFrom = ref('')
const filterTo = ref('')

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
function formatDate(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }
</script>

<script>
const SlaPercent = {
  props: ['value'],
  template: `<span :class="['font-bold', value >= 90 ? 'text-green-600' : value >= 75 ? 'text-yellow-600' : 'text-red-600']">{{ (value || 0).toFixed(1) }}%</span>`
}
const SlaStatus = {
  props: ['response', 'resolution'],
  template: `<span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium border', min >= 90 ? 'bg-green-100 text-green-800 border-green-200' : min >= 75 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200']">{{ min >= 90 ? 'Met' : min >= 75 ? 'At Risk' : 'Breached' }}</span>`,
  computed: { min() { return Math.min(this.response || 0, this.resolution || 0) } }
}
export default { components: { SlaPercent, SlaStatus } }
</script>
