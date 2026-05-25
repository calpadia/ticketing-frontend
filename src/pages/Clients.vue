<template>
  <div>
    <ConfirmDialog ref="confirmDialog" />
    <div class="flex items-center justify-between mb-6">
      <div><h2 class="text-2xl font-bold text-gray-900">Clients</h2><p class="text-gray-500 text-sm mt-1">{{ clients.length }} client(s) registered</p></div>
      <button @click="toggleForm()" class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium">
        <component :is="showForm ? X : Plus" class="w-4 h-4" /> {{ showForm ? 'Cancel' : 'New Client' }}
      </button>
    </div>

    <form v-if="showForm" @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 class="text-lg font-semibold mb-4">{{ editingId ? 'Edit Client' : 'Create New Client' }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Client *</label>
          <input v-model="form.companyName" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="PT Example Indonesia" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Kontak *</label>
          <input v-model="form.contactPersonName" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input v-model="form.contactPersonEmail" type="email" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="contact@company.com" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon *</label>
          <input v-model="form.contactPersonPhone" type="tel" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="08123456789" required />
        </div>
      </div>
      <button type="submit" class="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium">{{ editingId ? 'Update' : 'Create' }}</button>
    </form>

    <div class="relative mb-4"><Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input v-model="search" type="text" placeholder="Search clients..." class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr class="text-left text-gray-600">
            <th class="px-6 py-3 font-medium">Nama Perusahaan</th>
            <th class="px-6 py-3 font-medium">Nama Kontak</th>
            <th class="px-6 py-3 font-medium">Email</th>
            <th class="px-6 py-3 font-medium">Telepon</th>
            <th class="px-6 py-3 font-medium">Status</th>
            <th class="px-6 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="filtered.length === 0"><td colspan="6" class="text-center py-8 text-gray-500">No clients found.</td></tr>
          <tr v-for="c in filtered" :key="c.id" class="hover:bg-gray-50">
            <td class="px-6 py-3 font-medium text-gray-900">{{ c.companyName }}</td>
            <td class="px-6 py-3 text-gray-600">{{ c.contactPersonName || '-' }}</td>
            <td class="px-6 py-3 text-gray-600">{{ c.contactPersonEmail || '-' }}</td>
            <td class="px-6 py-3 text-gray-600">{{ c.contactPersonPhone || '-' }}</td>
            <td class="px-6 py-3">
              <span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium', c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">{{ c.isActive ? 'Active' : 'Inactive' }}</span>
            </td>
            <td class="px-6 py-3">
              <div class="flex gap-2">
                <button @click="startEdit(c)" class="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil class="w-4 h-4" /></button>
                <button @click="handleDelete(c.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 class="w-4 h-4" /></button>
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
import { getClients, createClient, updateClient, deleteClient } from '../api/clients'
import { Search, Plus, X, Pencil, Trash2 } from 'lucide-vue-next'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const confirmDialog = ref(null)

const clients = ref([])
const showForm = ref(false)
const editingId = ref(null)
const form = reactive({ companyName: '', contactPersonName: '', contactPersonEmail: '', contactPersonPhone: '' })
const search = ref('')

const filtered = computed(() => clients.value.filter(c =>
  c.companyName.toLowerCase().includes(search.value.toLowerCase()) ||
  (c.contactPersonName && c.contactPersonName.toLowerCase().includes(search.value.toLowerCase())) ||
  (c.contactPersonEmail && c.contactPersonEmail.toLowerCase().includes(search.value.toLowerCase()))
))

onMounted(async () => { try { clients.value = (await getClients()).data } catch { clients.value = [] } })

function toggleForm() {
  showForm.value = !showForm.value
  editingId.value = null
  Object.assign(form, { companyName: '', contactPersonName: '', contactPersonEmail: '', contactPersonPhone: '' })
}

function startEdit(c) {
  editingId.value = c.id
  Object.assign(form, {
    companyName: c.companyName || '',
    contactPersonName: c.contactPersonName || '',
    contactPersonEmail: c.contactPersonEmail || '',
    contactPersonPhone: c.contactPersonPhone || '',
  })
  showForm.value = true
}

async function handleSubmit() {
  const payload = { companyName: form.companyName, contactPersonName: form.contactPersonName, contactPersonEmail: form.contactPersonEmail, contactPersonPhone: form.contactPersonPhone }
  try {
    if (editingId.value) await updateClient(editingId.value, payload)
    else await createClient(payload)
    clients.value = (await getClients()).data
  } catch {
    // API unavailable
  }
  showForm.value = false
  editingId.value = null
  Object.assign(form, { companyName: '', contactPersonName: '', contactPersonEmail: '', contactPersonPhone: '' })
}

async function handleDelete(id) {
  const confirmed = await confirmDialog.value.open({ title: 'Hapus Client', message: 'Apakah kamu yakin ingin menghapus client ini?' })
  if (!confirmed) return
  try { await deleteClient(id); clients.value = (await getClients()).data } catch { /* API unavailable */ }
}
</script>
