<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Client Support Assignment</h2>
      <p class="text-gray-500 text-sm mt-1">Kelola support engineer yang bertanggung jawab untuk setiap client</p>
    </div>

    <!-- Client selector -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Client</label>
      <select v-model="selectedClientId" @change="loadSupports" class="w-full max-w-md border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
        <option value="">-- Pilih Client --</option>
        <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
      </select>
    </div>

    <!-- Content when client selected -->
    <div v-if="selectedClientId">
      <!-- Current supports -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Support Engineer Aktif</h3>
          <button @click="showAddForm = !showAddForm" class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus class="w-4 h-4" /> Tambah Support
          </button>
        </div>

        <div v-if="supports.length === 0" class="text-center py-8 text-gray-500 text-sm">
          Belum ada support engineer yang ditugaskan untuk client ini.
        </div>

        <div v-else class="space-y-2">
          <div v-for="s in supports" :key="s.id" class="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
            <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-sm">
              {{ s.supportUserName?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">{{ s.supportUserName }}</p>
              <p class="text-xs text-gray-500">{{ s.supportUserEmail }}</p>
            </div>
            <p class="text-xs text-gray-400">{{ formatDate(s.assignedAt) }}</p>
            <button @click="handleRemove(s.supportUserId)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Add support form -->
      <div v-if="showAddForm" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Tambah Support Engineer</h3>
        <div class="border border-gray-200 rounded-lg max-h-60 overflow-y-auto mb-4">
          <label v-for="u in availableSupports" :key="u.id"
            class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
            <input type="checkbox" :value="u.id" v-model="selectedSupportIds" class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-medium">{{ u.name.charAt(0) }}</div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">{{ u.name }}</p>
              <p class="text-xs text-gray-500">{{ u.email }}</p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{{ u.role }}</span>
          </label>
          <p v-if="availableSupports.length === 0" class="text-center py-4 text-sm text-gray-500">Semua support sudah ditugaskan ke client ini.</p>
        </div>
        <button @click="handleAdd" :disabled="selectedSupportIds.length === 0" class="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
          Tambah {{ selectedSupportIds.length }} Support
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getClients } from '../api/clients'
import { getUsers } from '../api/users'
import { getClientSupports, addClientSupports, removeClientSupports } from '../api/clientSupports'
import { mockClients, mockUsers } from '../utils/mockData'
import { Plus, Trash2 } from 'lucide-vue-next'

const route = useRoute()
const clients = ref([])
const users = ref([])
const supports = ref([])
const selectedClientId = ref('')
const showAddForm = ref(false)
const selectedSupportIds = ref([])

const availableSupports = computed(() => {
  const assignedIds = supports.value.map(s => s.supportUserId)
  return users.value.filter(u => (u.role === 'SUPPORT' || u.role === 'TECHNICAL_SUPPORT' || u.role === 'ADMIN') && !assignedIds.includes(u.id))
})

onMounted(async () => {
  try { clients.value = (await getClients()).data } catch { clients.value = mockClients }
  try { users.value = (await getUsers()).data } catch { users.value = mockUsers }
  // Auto-select client from query param
  if (route.query.clientId) {
    selectedClientId.value = route.query.clientId
    loadSupports()
  }
})

async function loadSupports() {
  supports.value = []
  showAddForm.value = false
  selectedSupportIds.value = []
  if (!selectedClientId.value) return
  try { supports.value = (await getClientSupports(selectedClientId.value)).data } catch { supports.value = [] }
}

async function handleAdd() {
  if (selectedSupportIds.value.length === 0) return
  try {
    await addClientSupports(Number(selectedClientId.value), selectedSupportIds.value.map(Number))
    supports.value = (await getClientSupports(selectedClientId.value)).data
    selectedSupportIds.value = []
    showAddForm.value = false
  } catch {}
}

async function handleRemove(supportUserId) {
  if (!confirm('Hapus support ini dari client?')) return
  try {
    await removeClientSupports(Number(selectedClientId.value), [supportUserId])
    supports.value = (await getClientSupports(selectedClientId.value)).data
  } catch {}
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
}
</script>
