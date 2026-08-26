<template>
  <div>
    <div class="mb-6">
      <div class="flex items-center gap-2 text-sm text-gray-500 mb-1">
        <router-link to="/client-management" class="hover:text-blue-600 transition-colors">Client Management</router-link>
        <span class="text-gray-300">/</span>
        <router-link to="/clients" class="hover:text-blue-600 transition-colors">Clients</router-link>
        <span class="text-gray-300">/</span>
        <span class="font-medium text-gray-800">{{ client?.companyName || 'Loading...' }}</span>
      </div>
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-900">{{ client?.companyName || 'Client Detail' }}</h2>
        <div class="flex items-center gap-3" v-if="client">
          <router-link :to="'/quotas?clientId=' + client.id" class="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors text-sm">
            Top Up Kuota
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="client" class="space-y-6">
      
      <!-- SLA Performance Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-center">
          <p class="text-sm text-gray-500 font-medium mb-1">Total Tiket</p>
          <p class="text-2xl font-bold text-gray-900">{{ clientTickets.length }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-center">
          <p class="text-sm text-gray-500 font-medium mb-1">Open / In Progress</p>
          <p class="text-2xl font-bold text-blue-600">{{ activeTicketsCount }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-center">
          <p class="text-sm text-gray-500 font-medium mb-1">Resolved / Closed</p>
          <p class="text-2xl font-bold text-green-600">{{ resolvedTicketsCount }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-center">
          <p class="text-sm text-gray-500 font-medium mb-1">SLA Resolusi Terpenuhi</p>
          <p v-if="slaLoading" class="text-2xl font-bold text-gray-300">...</p>
          <p v-else :class="['text-2xl font-bold', slaColorClass]">{{ slaTerpenuhi }}</p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <!-- Info Perusahaan -->
        <div>
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Informasi Perusahaan</h4>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wide">Nama Kontak</p>
            <p class="text-sm font-medium mt-1">{{ client.contactPersonName || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wide">Email</p>
            <p class="text-sm font-medium mt-1">{{ client.contactPersonEmail || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wide">Telepon</p>
            <p class="text-sm font-medium mt-1">{{ client.contactPersonPhone || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wide">Status</p>
            <p class="text-sm font-medium mt-1">
              <span :class="['px-2.5 py-0.5 rounded-full text-xs', client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                {{ client.isActive ? 'Active' : 'Inactive' }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Users -->
        <div class="border border-gray-100 rounded-xl p-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
            <span>Users ({{ clientUsers.length }})</span>
          </h4>
          <div v-if="clientUsers.length === 0" class="text-sm text-gray-400 py-2 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            Belum ada user untuk client ini.
          </div>
          <div v-else class="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            <div v-for="u in clientUsers" :key="u.id" class="flex items-center gap-3 bg-blue-50/50 rounded-xl px-3 py-2.5 border border-blue-100/50">
              <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">{{ u.name.charAt(0) }}</div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ u.name }}</p>
                <p class="text-xs text-gray-500 truncate">{{ u.email }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Support Engineers -->
        <div class="border border-gray-100 rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-gray-700">Support Engineers ({{ clientSupports.length }})</h4>
            <router-link :to="'/client-supports?clientId=' + client.id" class="text-xs text-blue-600 hover:text-blue-800 font-medium">Kelola</router-link>
          </div>
          <div v-if="clientSupports.length === 0" class="text-sm text-gray-400 py-2 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            Belum ada support engineer untuk client ini.
          </div>
          <div v-else class="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            <div v-for="s in clientSupports" :key="s.id" class="flex items-center gap-3 bg-green-50/50 rounded-xl px-3 py-2.5 border border-green-100/50">
              <div class="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium">{{ s.supportUserName?.charAt(0) }}</div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ s.supportUserName }}</p>
                <p class="text-xs text-gray-500 truncate">{{ s.supportUserEmail }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Projects -->
        <div class="border border-gray-100 rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-gray-700">Projects ({{ clientProjects.length }})</h4>
            <router-link :to="'/projects?clientId=' + client.id" class="text-xs text-blue-600 hover:text-blue-800 font-medium">Kelola</router-link>
          </div>
          <div v-if="clientProjects.length === 0" class="text-sm text-gray-400 py-2 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            Belum ada project untuk client ini.
          </div>
          <div v-else class="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            <div v-for="p in clientProjects" :key="p.id" class="flex flex-col justify-center bg-indigo-50/50 rounded-xl px-3 py-2.5 border border-indigo-100/50">
              <span class="text-sm font-medium text-gray-900">{{ p.projectName }}</span>
              <span class="text-xs text-gray-500 mt-0.5">{{ p.description || 'Tidak ada deskripsi' }}</span>
            </div>
          </div>
        </div>

        <!-- Quotas -->
        <div class="border border-gray-100 rounded-xl p-4">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-sm font-semibold text-gray-700">Kuota</h4>
            <router-link :to="'/quotas?clientId=' + client.id" class="text-xs text-blue-600 hover:text-blue-800 font-medium">Kelola</router-link>
          </div>
          <div v-if="clientQuotas.length === 0" class="text-sm text-gray-400 py-2 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            Belum ada kuota untuk client ini.
          </div>
          <div v-else class="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            <div v-for="q in clientQuotas" :key="q.id" class="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <p class="text-xs text-gray-500 mb-2 font-medium">Tahun {{ q.year }}</p>
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-white p-2 rounded border border-gray-100">
                  <span class="text-xs text-blue-600 block mb-0.5 font-medium">PM</span>
                  <span class="text-sm font-bold text-gray-900">{{ q.pmUsed }} <span class="text-gray-400 font-normal">/ {{ q.pmQuota }}</span></span>
                </div>
                <div class="bg-white p-2 rounded border border-gray-100">
                  <span class="text-xs text-orange-600 block mb-0.5 font-medium">CM</span>
                  <span class="text-sm font-bold text-gray-900">{{ q.cmUsed }} <span class="text-gray-400 font-normal">/ {{ q.cmQuota }}</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <!-- Recent Tickets -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-sm font-semibold text-gray-700">Tiket Terbaru</h4>
          <router-link v-if="client" :to="`/tickets?clientId=${client.id}`" class="text-xs text-blue-600 hover:text-blue-800 font-medium">Lihat Semua Tiket</router-link>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-gray-400 border-b border-gray-100 bg-gray-50">
              <tr>
                <th class="px-4 py-3 font-medium rounded-tl-lg">Ticket #</th>
                <th class="px-4 py-3 font-medium">Judul Tiket</th>
                <th class="px-4 py-3 font-medium">Status</th>
                <th class="px-4 py-3 font-medium">Jenis</th>
                <th class="px-4 py-3 font-medium rounded-tr-lg">Dibuat Pada</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-if="recentTickets.length === 0">
                <td colspan="5" class="py-6 text-center text-gray-400">Belum ada tiket untuk klien ini.</td>
              </tr>
              <tr v-for="t in recentTickets" :key="t.id" class="hover:bg-blue-50/30 cursor-pointer transition-colors" @click="router.push(`/tickets/${t.id}`)">
                <td class="px-4 py-3 font-mono text-xs text-blue-600 font-medium">{{ t.ticketNumber }}</td>
                <td class="px-4 py-3 font-medium text-gray-900">{{ t.title }}</td>
                <td class="px-4 py-3"><StatusBadge :status="t.status" /></td>
                <td class="px-4 py-3">
                  <span :class="['px-2.5 py-0.5 rounded text-[10px] font-bold text-white', t.maintenanceType === 'PM' ? 'bg-[#10b981]' : 'bg-[#f97316]']">{{ t.maintenanceType }}</span>
                </td>
                <td class="px-4 py-3 text-gray-500 text-xs">{{ new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}</td>
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
import { useRoute, useRouter } from 'vue-router'
import { getClientById } from '../api/clients'
import { getUsers } from '../api/users'
import { getProjectsByClientId } from '../api/projects'
import { getClientQuotas } from '../api/quotas'
import { getClientSupports } from '../api/clientSupports'
import { getTickets } from '../api/tickets'
import { getSlaReport } from '../api/slaReport'
import StatusBadge from '../components/StatusBadge.vue'

const route = useRoute()
const router = useRouter()
const clientId = route.params.id

const client = ref(null)
const loading = ref(true)
const clientUsers = ref([])
const clientProjects = ref([])
const clientQuotas = ref([])
const clientSupports = ref([])
const clientTickets = ref([])
const clientSla = ref(null)
const slaLoading = ref(false)

const activeTicketsCount = computed(() => clientTickets.value.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length)
const resolvedTicketsCount = computed(() => clientTickets.value.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length)
const recentTickets = computed(() => {
  return [...clientTickets.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
})

const slaTerpenuhiPct = computed(() => clientSla.value?.resolution?.compliancePercent)
const slaTerpenuhi = computed(() => {
  if (slaTerpenuhiPct.value === undefined) return 'N/A'
  return slaTerpenuhiPct.value.toFixed(1) + '%'
})
const slaColorClass = computed(() => {
  const pct = slaTerpenuhiPct.value
  if (pct === undefined) return 'text-gray-600'
  return pct >= 90 ? 'text-green-600' : pct >= 75 ? 'text-yellow-600' : 'text-red-600'
})

onMounted(async () => {
  if (!clientId) return
  
  loading.value = true
  try {
    const res = await getClientById(clientId)
    client.value = res.data

    try { const resUsers = await getUsers(); clientUsers.value = resUsers.data.filter(u => u.clientId === Number(clientId)) } catch {}
    try { const resProj = await getProjectsByClientId(clientId); clientProjects.value = resProj.data } catch {}
    try { const resQuotas = await getClientQuotas(); clientQuotas.value = resQuotas.data.filter(q => q.clientId === Number(clientId)) } catch {}
    try { const resSupports = await getClientSupports(clientId); clientSupports.value = resSupports.data } catch {}
    try { const resTickets = await getTickets(); clientTickets.value = resTickets.data.filter(t => t.clientId === Number(clientId)) } catch {}
    
    try { 
      slaLoading.value = true
      const resSla = await getSlaReport({ clientId })
      clientSla.value = resSla.data?.clients?.[0] || null
    } catch {} finally { slaLoading.value = false }
  } catch (err) {
    console.error('Failed to load client details:', err)
  } finally {
    loading.value = false
  }
})
</script>
