<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
      <p class="text-gray-500 text-sm mt-1">Overview sistem ticketing</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard title="Total Tickets" :value="tickets.length" color="blue" />
      <StatCard title="Open" :value="openCount" color="yellow" />
      <StatCard title="In Progress" :value="inProgressCount" color="indigo" />
      <StatCard title="Resolved" :value="resolvedCount" color="green" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Ticket Status Distribution</h3>
        <div class="flex items-end gap-4 h-48">
          <BarItem label="Open" :value="openCount" :max="tickets.length" color="bg-yellow-500" />
          <BarItem label="In Progress" :value="inProgressCount" :max="tickets.length" color="bg-blue-500" />
          <BarItem label="Resolved" :value="resolvedCount" :max="tickets.length" color="bg-green-500" />
          <BarItem label="Closed" :value="closedCount" :max="tickets.length" color="bg-gray-400" />
        </div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><Building2 class="w-5 h-5 text-gray-600" /></div>
            <div><p class="text-sm text-gray-500">Active Clients</p><p class="font-semibold">{{ clients.filter(c => c.isActive).length }} / {{ clients.length }}</p></div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><UsersIcon class="w-5 h-5 text-gray-600" /></div>
            <div><p class="text-sm text-gray-500">Total Users</p><p class="font-semibold">{{ users.length }}</p></div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><Ticket class="w-5 h-5 text-gray-600" /></div>
            <div><p class="text-sm text-gray-500">PM / CM</p><p class="font-semibold">{{ tickets.filter(t => t.maintenanceType === 'PM').length }} / {{ tickets.filter(t => t.maintenanceType === 'CM').length }}</p></div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200"><h3 class="text-lg font-semibold text-gray-900">Recent Tickets</h3></div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr class="text-left text-gray-600">
            <th class="px-6 py-3 font-medium">Ticket #</th>
            <th class="px-6 py-3 font-medium">Title</th>
            <th class="px-6 py-3 font-medium">Status</th>
            <th class="px-6 py-3 font-medium">Priority</th>
            <th class="px-6 py-3 font-medium">Client</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="t in recentTickets" :key="t.id" class="hover:bg-gray-50">
            <td class="px-6 py-3 font-mono text-xs text-blue-600">{{ t.ticketNumber }}</td>
            <td class="px-6 py-3 font-medium text-gray-900">{{ t.title }}</td>
            <td class="px-6 py-3"><StatusBadge :status="t.status" /></td>
            <td class="px-6 py-3"><PriorityBadge :priority="t.priority" /></td>
            <td class="px-6 py-3 text-gray-600">{{ t.clientCompanyName }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getTickets } from '../api/tickets'
import { getClients } from '../api/clients'
import { getUsers } from '../api/users'
import { useAuthStore } from '../stores/auth'
import { Building2, Users as UsersIcon, Ticket } from 'lucide-vue-next'
import StatCard from '../components/StatCard.vue'
import BarItem from '../components/BarItem.vue'
import StatusBadge from '../components/StatusBadge.vue'
import PriorityBadge from '../components/PriorityBadge.vue'

const auth = useAuthStore()
const tickets = ref([])
const clients = ref([])
const users = ref([])

const openCount = computed(() => tickets.value.filter(t => t.status === 'OPEN').length)
const inProgressCount = computed(() => tickets.value.filter(t => t.status === 'IN_PROGRESS').length)
const resolvedCount = computed(() => tickets.value.filter(t => t.status === 'RESOLVED').length)
const closedCount = computed(() => tickets.value.filter(t => t.status === 'CLOSED').length)
const recentTickets = computed(() => [...tickets.value].reverse().slice(0, 5))

onMounted(async () => {
  try { const res = await getTickets(); tickets.value = res.data } catch { tickets.value = [] }
  if (auth.isAdmin) {
    try { const res = await getClients(); clients.value = res.data } catch { clients.value = [] }
    try { const res = await getUsers(); users.value = res.data } catch { users.value = [] }
  }
})
</script>
