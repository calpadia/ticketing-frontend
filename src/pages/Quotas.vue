<template>
  <div>
    <ConfirmDialog ref="confirmDialog" />
    <div class="flex items-center justify-between mb-6">
      <div><h2 class="text-2xl font-bold text-gray-900">Client Quotas</h2><p class="text-gray-500 text-sm mt-1">Manage PM & CM quota allocations</p></div>
      <button @click="toggleForm()" class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium">
        <component :is="showForm ? X : Plus" class="w-4 h-4" /> {{ showForm ? 'Cancel' : 'New Quota' }}
      </button>
    </div>

    <form v-if="showForm" @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 class="text-lg font-semibold mb-4">{{ editingId ? 'Edit Quota' : 'Create New Quota' }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Client *</label><select v-model="form.clientId" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required><option value="">Select client</option><option v-for="c in clients" :key="c.id" :value="c.id">{{ c.companyName }}</option></select></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Year *</label><input v-model.number="form.year" type="number" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">PM Quota *</label><input v-model.number="form.pmQuota" type="number" min="0" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">CM Quota *</label><input v-model.number="form.cmQuota" type="number" min="0" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
      </div>
      <button type="submit" class="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium">{{ editingId ? 'Update' : 'Create' }}</button>
    </form>

    <div class="relative mb-4"><Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input v-model="search" type="text" placeholder="Search by client..." class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
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
                <button @click="startEdit(q)" class="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil class="w-4 h-4" /></button>
                <button @click="handleDelete(q.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 class="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getClientQuotas, createClientQuota, updateClientQuota, deleteClientQuota } from '../api/quotas'
import { getClients } from '../api/clients'
import { mockQuotas, mockClients } from '../utils/mockData'
import { Search, Plus, X, Pencil, Trash2 } from 'lucide-vue-next'
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
  try { const res = await getClientQuotas(); quotas.value = res.data } catch { quotas.value = mockQuotas }
  try { const res = await getClients(); clients.value = res.data } catch { clients.value = mockClients }
  // Auto-fill client from query param
  if (route.query.clientId) {
    form.clientId = route.query.clientId
    showForm.value = true
  }
})

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
