<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Tickets</h2>
        <p class="text-gray-500 text-sm mt-1">{{ filtered.length }} ticket(s) found</p>
      </div>
      <button @click="showForm = !showForm" class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium">
        <component :is="showForm ? X : Plus" class="w-4 h-4" /> {{ showForm ? 'Cancel' : 'New Ticket' }}
      </button>
    </div>

    <!-- Create form -->
    <form v-if="showForm" @submit.prevent="handleCreate" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 class="text-lg font-semibold mb-4">Create New Ticket</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Title *</label><input v-model="form.title" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Priority *</label><select v-model="form.priority" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="L1">L1 - Critical</option><option value="L2">L2 - High</option><option value="L3">L3 - Medium</option><option value="L4">L4 - Low</option></select></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Type *</label><select v-model="form.maintenanceType" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="PM">PM (Preventive)</option><option value="CM">CM (Corrective)</option></select></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Client *</label><select v-model="form.clientId" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required><option value="">Select client</option><option v-for="c in clients" :key="c.id" :value="c.id">{{ c.companyName }}</option></select></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Requester *</label><select v-model="form.requesterId" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required><option value="">Select requester</option><option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }}</option></select></div>
        <div class="md:col-span-2"><label class="block text-sm font-medium text-gray-700 mb-1">Description *</label><textarea v-model="form.description" rows="3" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required></textarea></div>
      </div>
      <button type="submit" class="mt-4 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium">Create Ticket</button>
    </form>

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
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr class="text-left text-gray-600">
            <th class="px-6 py-3 font-medium">Ticket #</th><th class="px-6 py-3 font-medium">Title</th><th class="px-6 py-3 font-medium">Status</th><th class="px-6 py-3 font-medium">Priority</th><th class="px-6 py-3 font-medium">Type</th><th class="px-6 py-3 font-medium">Client</th><th class="px-6 py-3 font-medium">Created</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="paginated.length === 0"><td colspan="7" class="text-center py-8 text-gray-500">No tickets found.</td></tr>
          <tr v-for="t in paginated" :key="t.id" class="hover:bg-gray-50 cursor-pointer" @click="selectedTicket = t">
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
      <div v-if="totalPages > 1" class="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
        <p class="text-sm text-gray-500">Showing {{ (currentPage-1)*perPage+1 }} to {{ Math.min(currentPage*perPage, filtered.length) }} of {{ filtered.length }}</p>
        <div class="flex gap-1">
          <button v-for="p in totalPages" :key="p" @click="currentPage = p" :class="['px-3 py-1 rounded text-sm', currentPage === p ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-100']">{{ p }}</button>
        </div>
      </div>
    </div>

    <!-- Detail modal -->
    <div v-if="selectedTicket" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="selectedTicket = null">
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold">Ticket Detail</h3>
          <button @click="selectedTicket = null" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        <div class="space-y-3">
          <div class="flex gap-2"><StatusBadge :status="selectedTicket.status" /><PriorityBadge :priority="selectedTicket.priority" /></div>
          <div><p class="text-xs text-gray-500">Ticket Number</p><p class="font-mono text-sm">{{ selectedTicket.ticketNumber }}</p></div>
          <div><p class="text-xs text-gray-500">Title</p><p class="font-medium">{{ selectedTicket.title }}</p></div>
          <div><p class="text-xs text-gray-500">Description</p><p class="text-sm text-gray-700">{{ selectedTicket.description }}</p></div>
          <div class="grid grid-cols-2 gap-4">
            <div><p class="text-xs text-gray-500">Client</p><p class="text-sm font-medium">{{ selectedTicket.clientCompanyName }}</p></div>
            <div><p class="text-xs text-gray-500">Requester</p><p class="text-sm font-medium">{{ selectedTicket.requesterName }}</p></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { getTickets } from '../api/tickets'
import { getClients } from '../api/clients'
import { getUsers } from '../api/users'
import { createTicket } from '../api/tickets'
import { Search, Plus, X } from 'lucide-vue-next'
import StatusBadge from '../components/StatusBadge.vue'
import PriorityBadge from '../components/PriorityBadge.vue'

const tickets = ref([])
const clients = ref([])
const users = ref([])
const showForm = ref(false)
const search = ref('')
const filterStatus = ref('')
const filterPriority = ref('')
const currentPage = ref(1)
const perPage = 5
const selectedTicket = ref(null)
const form = reactive({ title: '', description: '', priority: 'L1', maintenanceType: 'PM', clientId: '', requesterId: '' })

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
  try {
    const [tRes, cRes, uRes] = await Promise.all([getTickets(), getClients(), getUsers()])
    tickets.value = tRes.data; clients.value = cRes.data; users.value = uRes.data
  } catch { tickets.value = []; clients.value = []; users.value = [] }
})

async function handleCreate() {
  try {
    await createTicket({ ...form, clientId: Number(form.clientId), requesterId: Number(form.requesterId) })
    showForm.value = false
    const res = await getTickets(); tickets.value = res.data
  } catch {
    showForm.value = false
  }
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }
</script>
