<template>
  <div>
    <ConfirmDialog ref="confirmDialog" />
    <div class="mb-6">
      <div class="flex items-center gap-2 text-sm text-gray-500 mb-1">
        <router-link to="/client-management" class="hover:text-blue-600 transition-colors">Client Management</router-link>
        <span class="text-gray-300">/</span>
        <span class="font-medium text-gray-800">Support Assignment</span>
      </div>
      <h2 class="text-2xl font-bold text-gray-900">Client Support Assignment</h2>
      <p class="text-gray-500 text-sm mt-1">Kelola support engineer yang bertanggung jawab untuk setiap client</p>
    </div>

    <!-- Client selector -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
      <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Client</label>
      <div class="relative w-full max-w-md">
        <select v-model="selectedClientId" @change="loadSupports" class="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-700 rounded-xl pl-4 pr-10 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
          <option value="">-- Pilih Client --</option>
          <option v-for="c in activeClients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
        </select>
        <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>

    <!-- Content when client selected -->
    <div v-if="selectedClientId">
      <!-- Current supports -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-900">Support Engineer Aktif</h3>
          <button @click="showAddForm = !showAddForm" class="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 text-sm font-medium transition-all">
            <component :is="showAddForm ? X : Plus" class="w-4 h-4" /> 
            <span class="hidden sm:inline">{{ showAddForm ? 'Batal' : 'Tambah Support' }}</span>
          </button>
        </div>

        <div v-if="supports.length === 0" class="flex flex-col items-center justify-center py-10 text-gray-500">
          <Users class="w-10 h-10 mb-3 text-gray-300" />
          <p class="text-sm">Belum ada support engineer yang ditugaskan untuk client ini.</p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="s in supports" :key="s.id" class="flex items-center gap-4 bg-gray-50/80 border border-gray-100 rounded-xl px-5 py-4 transition-colors hover:bg-gray-50">
            <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-sm">
              {{ s.supportUserName?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900">{{ s.supportUserName }}</p>
              <p class="text-xs text-gray-500">{{ s.supportUserEmail }}</p>
            </div>
            <p class="text-xs font-medium text-gray-400 hidden sm:block bg-white px-2 py-1 rounded-md border border-gray-100">{{ formatDate(s.assignedAt) }}</p>
            <button @click="handleRemove(s.supportUserId)" class="p-2 rounded-xl bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-600 transition-all ml-2 shadow-sm" v-tooltip="'Hapus Support'">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Add support form -->
      <transition name="fade">
        <div v-if="showAddForm" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Tambah Support Engineer</h3>
          <div class="border border-gray-200 rounded-xl max-h-64 overflow-y-auto mb-6 bg-gray-50/30">
            <label v-for="u in availableSupports" :key="u.id"
              class="flex items-center gap-4 px-5 py-4 hover:bg-blue-50/50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors">
              <input type="checkbox" :value="u.id" v-model="selectedSupportIds" class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20" />
              <div class="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shadow-sm">{{ u.name.charAt(0) }}</div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-900">{{ u.name }}</p>
                <p class="text-xs text-gray-500">{{ u.email }}</p>
              </div>
              <span class="text-xs font-medium px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700">{{ u.role }}</span>
            </label>
            <div v-if="availableSupports.length === 0" class="flex flex-col items-center justify-center py-8 text-gray-500">
              <CheckCircle class="w-8 h-8 mb-2 text-gray-300" />
              <p class="text-sm">Semua support sudah ditugaskan ke client ini.</p>
            </div>
          </div>
          <div class="flex justify-end">
            <button @click="handleAdd" :disabled="selectedSupportIds.length === 0" class="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 font-medium disabled:opacity-50 transition-all text-sm">
              <UserPlus class="w-4 h-4" />
              <span>Tambah {{ selectedSupportIds.length > 0 ? selectedSupportIds.length : '' }} Support</span>
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getClients } from '../api/clients'
import { getUsers } from '../api/users'
import { getClientSupports, addClientSupports, removeClientSupports } from '../api/clientSupports'
import { Plus, X, Trash2, ChevronDown, Users, CheckCircle, UserPlus } from 'lucide-vue-next'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const route = useRoute()
const clients = ref([])
const users = ref([])
const supports = ref([])
const selectedClientId = ref('')
const showAddForm = ref(false)
const selectedSupportIds = ref([])
const confirmDialog = ref(null)

const availableSupports = computed(() => {
  const assignedIds = supports.value.map(s => s.supportUserId)
  return users.value.filter(u => (u.role === 'SUPPORT' || u.role === 'TECHNICAL_SUPPORT' || u.role === 'ADMIN') && !assignedIds.includes(u.id))
})

const activeClients = computed(() => clients.value.filter(c => c.isActive))

onMounted(async () => {
  try { clients.value = (await getClients()).data } catch { clients.value = [] }
  try { users.value = (await getUsers()).data } catch { users.value = [] }
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
  const confirmed = await confirmDialog.value.open({
    title: 'Hapus Support Engineer',
    message: 'Apakah kamu yakin ingin menghapus support ini dari client?',
    confirmLabel: 'Ya, Hapus',
    confirmColor: 'red'
  })
  if (!confirmed) return
  try {
    await removeClientSupports(Number(selectedClientId.value), [supportUserId])
    supports.value = (await getClientSupports(selectedClientId.value)).data
  } catch {}
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
