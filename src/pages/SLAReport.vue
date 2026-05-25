<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div><h2 class="text-2xl font-bold text-gray-900">SLA Report</h2><p class="text-gray-500 text-sm mt-1">Service Level Agreement performance monitoring</p></div>
      <div class="flex gap-2">
        <select v-model="selectedYear" class="border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="2026">2026</option><option value="2025">2025</option></select>
        <select v-model="selectedMonth" class="border border-gray-300 rounded-lg px-3 py-2 text-sm"><option value="all">All Months</option><option v-for="m in 12" :key="m" :value="String(m).padStart(2,'0')">{{ new Date(2026, m-1).toLocaleString('en', {month:'long'}) }}</option></select>
      </div>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard title="Overall SLA" :value="overallSLA + '%'" :color="Number(overallSLA) >= 90 ? 'green' : Number(overallSLA) >= 75 ? 'yellow' : 'red'" />
      <StatCard title="Resolved On Time" :value="totalOnTime" color="green" />
      <StatCard title="Resolved Late" :value="totalLate" color="red" />
      <StatCard title="Pending" :value="totalPending" color="yellow" />
    </div>

    <!-- SLA Targets -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">SLA Targets by Priority</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="(target, priority) in slaTargets" :key="priority" class="border border-gray-200 rounded-lg p-4">
          <PriorityBadge :priority="priority" class="mb-2" />
          <div class="space-y-1 text-sm mt-2">
            <div class="flex justify-between"><span class="text-gray-500">Response</span><span class="font-medium">{{ target.responseHours }}h</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Resolution</span><span class="font-medium">{{ target.resolutionHours }}h</span></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div class="px-6 py-4 border-b border-gray-200"><h3 class="text-lg font-semibold text-gray-900">SLA Performance by Client</h3></div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr class="text-left text-gray-600"><th class="px-6 py-3 font-medium">Client</th><th class="px-6 py-3 font-medium">Total</th><th class="px-6 py-3 font-medium">On Time</th><th class="px-6 py-3 font-medium">Late</th><th class="px-6 py-3 font-medium">Pending</th><th class="px-6 py-3 font-medium">SLA %</th><th class="px-6 py-3 font-medium">Avg Resolution</th><th class="px-6 py-3 font-medium">Status</th></tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="r in report" :key="r.clientId" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-900">{{ r.clientCompanyName }}</td>
            <td class="px-6 py-4">{{ r.totalTickets }}</td>
            <td class="px-6 py-4 text-green-600 font-medium">{{ r.resolvedOnTime }}</td>
            <td class="px-6 py-4 text-red-600 font-medium">{{ r.resolvedLate }}</td>
            <td class="px-6 py-4 text-yellow-600 font-medium">{{ r.pending }}</td>
            <td class="px-6 py-4"><span :class="['font-bold', r.slaPercentage >= 90 ? 'text-green-600' : r.slaPercentage >= 75 ? 'text-yellow-600' : 'text-red-600']">{{ r.slaPercentage }}%</span></td>
            <td class="px-6 py-4 text-gray-600">{{ r.avgResolutionHours }}h</td>
            <td class="px-6 py-4">
              <span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium border', r.slaPercentage >= 90 ? 'bg-green-100 text-green-800 border-green-200' : r.slaPercentage >= 75 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200']">
                {{ r.slaPercentage >= 90 ? 'Met' : r.slaPercentage >= 75 ? 'At Risk' : 'Breached' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Visual bars -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">SLA Achievement</h3>
      <div class="space-y-4">
        <div v-for="r in report" :key="r.clientId">
          <div class="flex justify-between text-sm mb-1">
            <span class="font-medium text-gray-700">{{ r.clientCompanyName }}</span>
            <span :class="['font-medium', r.slaPercentage >= 90 ? 'text-green-600' : r.slaPercentage >= 75 ? 'text-yellow-600' : 'text-red-600']">{{ r.slaPercentage }}%</span>
          </div>
          <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div :class="['h-full rounded-full transition-all duration-500', r.slaPercentage >= 90 ? 'bg-green-500' : r.slaPercentage >= 75 ? 'bg-yellow-500' : 'bg-red-500']" :style="{ width: r.slaPercentage + '%' }"></div>
          </div>
        </div>
        <div class="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-full bg-green-500"></div><span>Above 90%</span></div>
          <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-full bg-yellow-500"></div><span>75-90%</span></div>
          <div class="flex items-center gap-1"><div class="w-3 h-3 rounded-full bg-red-500"></div><span>Below 75%</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StatCard from '../components/StatCard.vue'
import PriorityBadge from '../components/PriorityBadge.vue'

const slaTargets = {
  L1: { responseHours: 1, resolutionHours: 4 },
  L2: { responseHours: 2, resolutionHours: 8 },
  L3: { responseHours: 4, resolutionHours: 24 },
  L4: { responseHours: 8, resolutionHours: 48 },
}

const report = ref([])
const selectedYear = ref('2026')
const selectedMonth = ref('all')

const totalOnTime = computed(() => report.value.reduce((s, r) => s + r.resolvedOnTime, 0))
const totalLate = computed(() => report.value.reduce((s, r) => s + r.resolvedLate, 0))
const totalPending = computed(() => report.value.reduce((s, r) => s + r.pending, 0))
const overallSLA = computed(() => {
  const resolved = totalOnTime.value + totalLate.value
  return resolved > 0 ? ((totalOnTime.value / resolved) * 100).toFixed(1) : '0'
})
</script>
