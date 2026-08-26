<template>
  <div>
    <ConfirmDialog ref="confirmDialog" />
    <div class="flex items-center justify-between mb-6">
      <div><h2 class="text-2xl font-bold text-gray-900">Client Quotas</h2><p class="text-gray-500 text-sm mt-1">Manage PM & CM quota allocations</p></div>
      <button @click="toggleForm()" class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 font-medium">
        <component :is="showForm ? X : Plus" class="w-4 h-4" /> {{ showForm ? 'Cancel' : 'New Quota' }}
      </button>
    </div>

    <transition name="fade">
      <form v-if="showForm" @submit.prevent="handleSubmit" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <div class="mb-6">
          <h3 class="text-xl font-bold text-gray-900">{{ editingId ? 'Edit Quota' : 'Create New Quota' }}</h3>
          <p class="text-sm text-gray-500 mt-1">Isi alokasi kuota PM dan CM untuk tahun terpilih</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Client *</label>
            <div class="relative">
              <select v-model="form.clientId" class="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-700 rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer" required>
                <option value="">Select client</option>
                <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
              </select>
              <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div><label class="block text-sm font-medium text-gray-700 mb-2">Year *</label><input v-model.number="form.year" type="number" class="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required /></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-2">PM Quota *</label><input v-model.number="form.pmQuota" type="number" min="0" class="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required /></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-2">CM Quota *</label><input v-model.number="form.cmQuota" type="number" min="0" class="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required /></div>
        </div>
        <div class="mt-8 flex justify-end">
          <button type="submit" class="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 font-medium transition-all">{{ editingId ? 'Simpan Perubahan' : 'Buat Quota' }}</button>
        </div>
      </form>
    </transition>

    <div class="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 mb-6 w-full">
      <div class="relative w-full">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input v-model="search" type="text" placeholder="Search by client..." class="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-11 pr-4 py-2 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto max-h-[70vh]">
      <table class="w-full text-sm relative">
        <thead class="bg-gray-50/95 backdrop-blur sticky top-0 z-10 shadow-sm">
          <tr class="text-left text-gray-600">
            <th class="px-6 py-3 font-medium">Client</th>
            <th class="px-6 py-3 font-medium">Year</th>
            <th class="px-6 py-3 font-medium">PM Progress</th>
            <th class="px-6 py-3 font-medium">CM Progress</th>
            <th class="px-6 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="filtered.length === 0"><td colspan="5" class="text-center py-8 text-gray-500">No quotas found.</td></tr>
          <tr v-for="q in filtered" :key="q.id" class="hover:bg-gray-50">
            <td class="px-6 py-3 font-medium text-gray-900">{{ q.clientCompanyName }}</td>
            <td class="px-6 py-3 text-gray-600">{{ q.year }}</td>
            <td class="px-6 py-4 min-w-[180px]">
              <div class="flex items-center gap-2">
                <div class="flex-1 h-2.5 bg-blue-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all" :class="q.pmUsed >= q.pmQuota ? 'bg-red-500' : 'bg-blue-500'" :style="{ width: Math.min((q.pmUsed / (q.pmQuota || 1)) * 100, 100) + '%' }"></div>
                </div>
                <span :class="['text-xs font-medium whitespace-nowrap', q.pmUsed >= q.pmQuota ? 'text-red-600' : 'text-gray-600']">{{ q.pmUsed }}/{{ q.pmQuota }}</span>
              </div>
            </td>
            <td class="px-6 py-4 min-w-[180px]">
              <div class="flex items-center gap-2">
                <div class="flex-1 h-2.5 bg-orange-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all" :class="q.cmUsed >= q.cmQuota ? 'bg-red-500' : 'bg-orange-500'" :style="{ width: Math.min((q.cmUsed / (q.cmQuota || 1)) * 100, 100) + '%' }"></div>
                </div>
                <span :class="['text-xs font-medium whitespace-nowrap', q.cmUsed >= q.cmQuota ? 'text-red-600' : 'text-gray-600']">{{ q.cmUsed }}/{{ q.cmQuota }}</span>
              </div>
            </td>
            <td class="px-6 py-3">
              <div class="flex gap-2">
                <button @click="startEdit(q)" class="p-1.5 rounded-xl hover:bg-blue-50 text-blue-600" v-tooltip="'Edit Quota'"><Pencil class="w-4 h-4" /></button>
                <button @click="handleDelete(q.id)" class="p-1.5 rounded-xl hover:bg-red-50 text-red-600" v-tooltip="'Hapus Quota'"><Trash2 class="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { getClientQuotas, createClientQuota, updateClientQuota, deleteClientQuota } from '../api/quotas'
import { getClients } from '../api/clients'
import { Search, Plus, X, Pencil, Trash2, ChevronDown } from 'lucide-vue-next'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const confirmDialog = ref(null)
const route = useRoute()
import QuotaBar from '../components/QuotaBar.vue'

const quotas = ref([])
const clients = ref([])
const showForm = ref(false)
const editingId = ref(null)
const form = reactive({ clientId: '', year: new Date().getFullYear(), pmQuota: 0, cmQuota: 0 })
const search = ref('')

const filtered = computed(() => quotas.value.filter(q => q.clientCompanyName?.toLowerCase().includes(search.value.toLowerCase())))

onMounted(async () => {
  try { const res = await getClientQuotas(); quotas.value = res.data } catch { quotas.value = [] }
  try { const res = await getClients(); clients.value = res.data } catch { clients.value = [] }
  // Auto-fill client from query param
  if (route.query.clientId) {
    form.clientId = route.query.clientId
    showForm.value = true
  }
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => window.removeEventListener('keydown', handleGlobalKeydown))

function handleGlobalKeydown(e) {
  if (e.key === 'Escape' && showForm.value) {
    showForm.value = false
    editingId.value = null
  }
}

function toggleForm() { showForm.value = !showForm.value; editingId.value = null; Object.assign(form, { clientId: '', year: new Date().getFullYear(), pmQuota: 0, cmQuota: 0 }) }
function startEdit(q) { editingId.value = q.id; Object.assign(form, { clientId: q.clientId, year: q.year, pmQuota: q.pmQuota, cmQuota: q.cmQuota }); showForm.value = true }

async function handleSubmit() {
  const payload = { clientId: Number(form.clientId), year: form.year, pmQuota: form.pmQuota, cmQuota: form.cmQuota }
  try {
    if (editingId.value) await updateClientQuota(editingId.value, payload)
    else await createClientQuota(payload)
    quotas.value = (await getClientQuotas()).data
  } catch (err) {
    if (!err.response) {
      // API unavailable
    }
  }
  showForm.value = false; editingId.value = null
}

async function handleDelete(id) {
  const confirmed = await confirmDialog.value.open({ title: 'Hapus Quota', message: 'Apakah kamu yakin ingin menghapus quota ini?' })
  if (!confirmed) return
  try { await deleteClientQuota(id); quotas.value = (await getClientQuotas()).data } catch { /* API unavailable */ }
}
</script>

