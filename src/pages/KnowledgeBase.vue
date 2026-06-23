<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Knowledge Base</h2>
      <p class="text-gray-500 text-sm mt-1">Referensi dari ticket yang telah selesai. Cari solusi sebelum membuat ticket baru.</p>
    </div>

    <!-- Search & Filter -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input v-model="search" type="text" placeholder="Cari berdasarkan judul, deskripsi, atau client..." class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <select v-model="filterType" class="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">All Types</option>
        <option value="PM">PM</option>
        <option value="CM">CM</option>
      </select>
      <select v-model="filterPriority" class="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">All Priority</option>
        <option value="L1">L1</option>
        <option value="L2">L2</option>
        <option value="L3">L3</option>
        <option value="L4">L4</option>
      </select>
    </div>

    <!-- Info banner -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
      <BookOpen class="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
      <div>
        <p class="text-sm text-blue-800 font-medium">Sebelum membuat ticket baru</p>
        <p class="text-sm text-blue-700 mt-0.5">Cek knowledge base terlebih dahulu. Mungkin masalah yang kamu alami sudah pernah ditangani sebelumnya.</p>
      </div>
    </div>

    <!-- Results count -->
    <p class="text-sm text-gray-500 mb-3">{{ filtered.length }} artikel ditemukan</p>

    <!-- Knowledge list -->
    <div class="space-y-4">
      <div v-if="filtered.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <BookOpen class="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p class="text-gray-500">Belum ada knowledge base yang tersedia.</p>
        <p class="text-gray-400 text-sm mt-1">Knowledge base akan terisi otomatis dari ticket yang telah selesai (Resolved/Closed).</p>
      </div>

      <div
        v-for="item in paginated"
        :key="item.id"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
        @click="selectedItem = item"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2">
              <span class="font-mono text-xs text-blue-600">{{ item.ticketNumber }}</span>
              <PriorityBadge :priority="item.priority" />
              <span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium border', item.maintenanceType === 'PM' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-teal-100 text-teal-800 border-teal-200']">{{ item.maintenanceType }}</span>
            </div>
            <h3 class="font-semibold text-gray-900 mb-1">{{ item.title }}</h3>
            <p class="text-sm text-gray-600 line-clamp-2">{{ item.description }}</p>
          </div>
          <div class="text-right shrink-0">
            <p class="text-xs text-gray-500">{{ item.clientCompanyName }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ formatDate(item.createdAt) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-6">
      <p class="text-sm text-gray-500">Showing {{ (currentPage - 1) * perPage + 1 }} to {{ Math.min(currentPage * perPage, filtered.length) }} of {{ filtered.length }}</p>
      <div class="flex gap-1">
        <button
          v-for="p in totalPages"
          :key="p"
          @click="currentPage = p"
          :class="['px-3 py-1 rounded text-sm', currentPage === p ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-100']"
        >{{ p }}</button>
      </div>
    </div>

    <!-- Detail modal -->
    <div v-if="selectedItem" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="selectedItem = null">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-900">Knowledge Detail</h3>
          <button @click="selectedItem = null" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>

        <div class="space-y-4">
          <div class="flex flex-wrap gap-2">
            <StatusBadge :status="selectedItem.status" />
            <PriorityBadge :priority="selectedItem.priority" />
            <span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium border', selectedItem.maintenanceType === 'PM' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-teal-100 text-teal-800 border-teal-200']">{{ selectedItem.maintenanceType }}</span>
          </div>

          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wide">Ticket Number</p>
            <p class="font-mono text-sm">{{ selectedItem.ticketNumber }}</p>
          </div>

          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wide">Title</p>
            <p class="font-semibold text-gray-900">{{ selectedItem.title }}</p>
          </div>

          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wide">Description</p>
            <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ selectedItem.description }}</p>
          </div>

          <!-- Resolution notes from support -->
          <div v-if="resolutionLog" class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <CheckCircle class="w-4 h-4 text-green-600" />
              <p class="text-xs font-semibold text-green-700 uppercase tracking-wide">Catatan Resolved</p>
            </div>
            <p v-if="resolutionLog.notes" class="text-sm text-gray-800 whitespace-pre-wrap">{{ resolutionLog.notes }}</p>
            <p v-else class="text-sm text-gray-400 italic">Tidak ada catatan.</p>
            <div class="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span>Oleh: <strong>{{ resolutionLog.changedByName }}</strong></span>
              <span>•</span>
              <span>{{ formatDate(resolutionLog.changedAt) }}</span>
            </div>
          </div>
          <div v-else-if="loadingResolution" class="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p class="text-sm text-gray-400 italic">Memuat catatan resolved...</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wide">Client</p>
              <p class="text-sm font-medium">{{ selectedItem.clientCompanyName }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 uppercase tracking-wide">Requester</p>
              <p class="text-sm font-medium">{{ selectedItem.requesterName }}</p>
            </div>
          </div>

          <div>
            <p class="text-xs text-gray-500 uppercase tracking-wide">Created At</p>
            <p class="text-sm">{{ formatDate(selectedItem.createdAt) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { getTickets, getTicketProgress } from '../api/tickets'
import { Search, BookOpen, X, CheckCircle } from 'lucide-vue-next'
import PriorityBadge from '../components/PriorityBadge.vue'
import StatusBadge from '../components/StatusBadge.vue'

const allTickets = ref([])
const search = ref('')
const filterType = ref('')
const filterPriority = ref('')
const currentPage = ref(1)
const perPage = 8
const selectedItem = ref(null)
const resolutionLog = ref(null)
const loadingResolution = ref(false)

// Only show RESOLVED and CLOSED tickets as knowledge base
const knowledgeItems = computed(() =>
  allTickets.value.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED')
)

const filtered = computed(() =>
  knowledgeItems.value.filter(item => {
    const matchSearch = !search.value ||
      item.title.toLowerCase().includes(search.value.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.value.toLowerCase()) ||
      item.clientCompanyName?.toLowerCase().includes(search.value.toLowerCase()) ||
      item.ticketNumber?.toLowerCase().includes(search.value.toLowerCase())
    const matchType = !filterType.value || item.maintenanceType === filterType.value
    const matchPriority = !filterPriority.value || item.priority === filterPriority.value
    return matchSearch && matchType && matchPriority
  })
)

const totalPages = computed(() => Math.ceil(filtered.value.length / perPage))
const paginated = computed(() => filtered.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage))

watch([search, filterType, filterPriority], () => { currentPage.value = 1 })

// Fetch resolution notes when detail is opened
watch(selectedItem, async (item) => {
  resolutionLog.value = null
  if (!item) return
  loadingResolution.value = true
  try {
    const res = await getTicketProgress(item.id)
    const logs = res.data || []
    // Find the log entry where status changed to RESOLVED
    resolutionLog.value = logs.find(l => l.toStatus === 'RESOLVED') || null
  } catch {
    resolutionLog.value = null
  } finally {
    loadingResolution.value = false
  }
})

onMounted(async () => {
  try {
    const res = await getTickets()
    allTickets.value = res.data
  } catch {
    allTickets.value = []
  }
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => window.removeEventListener('keydown', handleGlobalKeydown))

function handleGlobalKeydown(e) {
  if (e.key === 'Escape' && selectedItem.value) {
    selectedItem.value = null
  }
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
}
</script>
