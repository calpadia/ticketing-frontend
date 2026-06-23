<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Client Management Portal</h2>
      <p class="text-gray-500 text-sm mt-1">Overview komprehensif data klien, kuota, dan proyek</p>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <StatCard title="Total Clients" :value="clients.length" color="indigo" />
      <StatCard title="Active Clients" :value="activeClientsCount" color="blue" />
      <StatCard title="Total Projects" :value="projects.length" color="purple" />
      <StatCard title="Total PM Quota" :value="totalPmQuota" color="green" />
      <StatCard title="Total CM Quota" :value="totalCmQuota" color="orange" />
    </div>

    <!-- Quick Access Links -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <router-link to="/clients" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center hover:shadow-md hover:border-blue-300 transition-all group">
        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Building2 class="w-6 h-6" />
        </div>
        <h3 class="font-bold text-gray-900 mb-1">Clients Database</h3>
        <p class="text-xs text-gray-500">Kelola profil & status klien</p>
      </router-link>

      <router-link to="/client-onboarding" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center hover:shadow-md hover:teal-300 transition-all group">
        <div class="w-12 h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <UserPlus class="w-6 h-6" />
        </div>
        <h3 class="font-bold text-gray-900 mb-1">Onboarding</h3>
        <p class="text-xs text-gray-500">Registrasi PIC & lisensi klien</p>
      </router-link>

      <router-link to="/projects" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center hover:shadow-md hover:purple-300 transition-all group">
        <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <FolderKanban class="w-6 h-6" />
        </div>
        <h3 class="font-bold text-gray-900 mb-1">Projects</h3>
        <p class="text-xs text-gray-500">Manajemen proyek tiap klien</p>
      </router-link>

      <router-link to="/service-catalog" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center hover:shadow-md hover:orange-300 transition-all group">
        <div class="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <ClipboardList class="w-6 h-6" />
        </div>
        <h3 class="font-bold text-gray-900 mb-1">Service & Quota</h3>
        <p class="text-xs text-gray-500">Atur jatah maintenance</p>
      </router-link>
    </div>

    <!-- Active Clients Overview -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-bold text-gray-900">Client Quota Overview (Current Year)</h3>
        <router-link to="/service-catalog" class="text-sm font-medium text-blue-600 hover:underline">View All Quotas &rarr;</router-link>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left min-w-[600px]">
          <thead class="text-xs text-gray-400 border-b border-gray-100 uppercase bg-gray-50/50">
            <tr>
              <th class="py-3 px-4 font-semibold">Client Name</th>
              <th class="py-3 px-4 font-semibold">PM Quota Used</th>
              <th class="py-3 px-4 font-semibold">CM Quota Used</th>
              <th class="py-3 px-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="4" class="py-6 text-center text-gray-400">Loading data...</td>
            </tr>
            <tr v-else-if="clientOverviews.length === 0">
              <td colspan="4" class="py-6 text-center text-gray-400">Belum ada data klien/kuota</td>
            </tr>
            <tr v-for="c in clientOverviews" :key="c.id" class="hover:bg-gray-50 transition-colors cursor-pointer group" @click="router.push('/service-catalog?clientId=' + c.id)">
              <td class="py-4 px-4 font-bold text-gray-900">{{ c.companyName }}</td>
              <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-24">
                    <div class="h-full bg-green-500 rounded-full" :style="{ width: c.pmPercentage + '%' }"></div>
                  </div>
                  <span class="text-xs font-medium text-gray-600 w-12">{{ c.pmUsed }}/{{ c.pmTotal }}</span>
                </div>
              </td>
              <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-24">
                    <div class="h-full bg-orange-500 rounded-full" :style="{ width: c.cmPercentage + '%' }"></div>
                  </div>
                  <span class="text-xs font-medium text-gray-600 w-12">{{ c.cmUsed }}/{{ c.cmTotal }}</span>
                </div>
              </td>
              <td class="py-4 px-4 text-right">
                <span :class="['px-2.5 py-1 rounded text-[10px] font-bold', c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                  {{ c.isActive ? 'ACTIVE' : 'INACTIVE' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getClients } from '../api/clients'
import { getClientQuotas } from '../api/quotas'
import { getProjects } from '../api/projects'
import { Building2, UserPlus, FolderKanban, ClipboardList } from 'lucide-vue-next'
import StatCard from '../components/StatCard.vue'


const router = useRouter()
const clients = ref([])
const quotas = ref([])
const projects = ref([])
const loading = ref(true)

const currentYear = new Date().getFullYear()

const activeClientsCount = computed(() => clients.value.filter(c => c.isActive).length)

const totalPmQuota = computed(() => quotas.value.filter(q => q.year === currentYear).reduce((sum, q) => sum + q.pmQuota, 0))
const totalCmQuota = computed(() => quotas.value.filter(q => q.year === currentYear).reduce((sum, q) => sum + q.cmQuota, 0))

const clientOverviews = computed(() => {
  return clients.value.map(c => {
    const cq = quotas.value.find(q => q.clientId === c.id && q.year === currentYear) || { pmQuota: 0, pmUsed: 0, cmQuota: 0, cmUsed: 0 }
    return {
      id: c.id,
      companyName: c.companyName,
      isActive: c.isActive,
      pmTotal: cq.pmQuota,
      pmUsed: cq.pmUsed,
      pmPercentage: cq.pmQuota ? Math.min((cq.pmUsed / cq.pmQuota) * 100, 100) : 0,
      cmTotal: cq.cmQuota,
      cmUsed: cq.cmUsed,
      cmPercentage: cq.cmQuota ? Math.min((cq.cmUsed / cq.cmQuota) * 100, 100) : 0,
    }
  }).slice(0, 10) // Show top 10
})

onMounted(async () => {
  try {
    const [clientsRes, quotasRes, projectsRes] = await Promise.all([
      getClients().catch(() => ({ data: [] })),
      getClientQuotas().catch(() => ({ data: [] })),
      getProjects().catch(() => ({ data: [] }))
    ])
    clients.value = clientsRes.data
    quotas.value = quotasRes.data
    projects.value = projectsRes.data
  } finally {
    loading.value = false
  }
})
</script>
