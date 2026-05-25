<template>
  <div>
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
      <button type="submit" class="mt-4 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium">{{ editingId ? 'Update' : 'Create' }}</button>
    </form>

    <div class="relative mb-4"><Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input v-model="search" type="text" placeholder="Search by client..." class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <p v-if="filtered.length === 0" class="col-span-full text-center py-8 text-gray-500">No quotas found.</p>
      <div v-for="q in filtered" :key="q.id" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div class="flex items-start justify-between mb-4">
          <div><h4 class="font-semibold text-gray-900">{{ q.clientCompanyName }}</h4><p class="text-sm text-gray-500">Year: {{ q.year }}</p></div>
          <div class="flex gap-1">
            <button @click="startEdit(q)" class="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil class="w-4 h-4" /></button>
            <button @click="handleDelete(q.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 class="w-4 h-4" /></button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <QuotaBar label="PM" :used="q.pmUsed" :total="q.pmQuota" color="blue" />
          <QuotaBar label="CM" :used="q.cmUsed" :total="q.cmQuota" color="orange" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getClientQuotas, createClientQuota, updateClientQuota, deleteClientQuota } from '../api/quotas'
import { getClients } from '../api/clients'
import { Search, Plus, X, Pencil, Trash2 } from 'lucide-vue-next'
import QuotaBar from '../components/QuotaBar.vue'

const quotas = ref([])
const clients = ref([])
const showForm = ref(false)
const editingId = ref(null)
const form = reactive({ clientId: '', year: new Date().getFullYear(), pmQuota: 0, cmQuota: 0 })
const search = ref('')

const filtered = computed(() => quotas.value.filter(q => q.clientCompanyName?.toLowerCase().includes(search.value.toLowerCase())))

onMounted(async () => {
  try { const [qRes, cRes] = await Promise.all([getClientQuotas(), getClients()]); quotas.value = qRes.data; clients.value = cRes.data }
  catch { quotas.value = []; clients.value = [] }
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
  if (!confirm('Delete this quota?')) return
  try { await deleteClientQuota(id); quotas.value = (await getClientQuotas()).data } catch { /* API unavailable */ }
}
</script>
