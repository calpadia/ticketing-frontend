<template>
  <div>
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
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan *</label>
          <input v-model="form.companyName" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="PT Example Indonesia" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Kontak *</label>
          <input v-model="form.contactName" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input v-model="form.email" type="email" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="contact@company.com" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon *</label>
          <input v-model="form.phone" type="tel" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="08123456789" required />
        </div>
      </div>
      <button type="submit" class="mt-4 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium">{{ editingId ? 'Update' : 'Create' }}</button>
    </form>

    <div class="relative mb-4"><Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input v-model="search" type="text" placeholder="Search clients..." class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <p v-if="filtered.length === 0" class="col-span-full text-center py-8 text-gray-500">No clients found.</p>
      <div v-for="c in filtered" :key="c.id" class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <h4 class="font-semibold text-gray-900">{{ c.companyName }}</h4>
            <p class="text-sm text-gray-600 mt-1" v-if="c.contactName">{{ c.contactName }}</p>
            <div class="flex flex-col gap-0.5 mt-2 text-xs text-gray-500">
              <span v-if="c.email">{{ c.email }}</span>
              <span v-if="c.phone">{{ c.phone }}</span>
            </div>
          </div>
          <span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium', c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">{{ c.isActive ? 'Active' : 'Inactive' }}</span>
        </div>
        <div class="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <button @click="startEdit(c)" class="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"><Pencil class="w-3.5 h-3.5" /> Edit</button>
          <button @click="handleDelete(c.id)" class="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"><Trash2 class="w-3.5 h-3.5" /> Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getClients, createClient, updateClient, deleteClient } from '../api/clients'
import { Search, Plus, X, Pencil, Trash2 } from 'lucide-vue-next'

const clients = ref([])
const showForm = ref(false)
const editingId = ref(null)
const form = reactive({ companyName: '', contactName: '', email: '', phone: '' })
const search = ref('')

const filtered = computed(() => clients.value.filter(c =>
  c.companyName.toLowerCase().includes(search.value.toLowerCase()) ||
  (c.contactName && c.contactName.toLowerCase().includes(search.value.toLowerCase())) ||
  (c.email && c.email.toLowerCase().includes(search.value.toLowerCase()))
))

onMounted(async () => { try { clients.value = (await getClients()).data } catch { clients.value = [] } })

function toggleForm() {
  showForm.value = !showForm.value
  editingId.value = null
  Object.assign(form, { companyName: '', contactName: '', email: '', phone: '' })
}

function startEdit(c) {
  editingId.value = c.id
  Object.assign(form, {
    companyName: c.companyName || '',
    contactName: c.contactName || '',
    email: c.email || '',
    phone: c.phone || '',
  })
  showForm.value = true
}

async function handleSubmit() {
  const payload = { companyName: form.companyName, contactName: form.contactName, email: form.email, phone: form.phone }
  try {
    if (editingId.value) await updateClient(editingId.value, payload)
    else await createClient(payload)
    clients.value = (await getClients()).data
  } catch {
    // API unavailable
  }
  showForm.value = false
  editingId.value = null
  Object.assign(form, { companyName: '', contactName: '', email: '', phone: '' })
}

async function handleDelete(id) {
  if (!confirm('Delete this client?')) return
  try { await deleteClient(id); clients.value = (await getClients()).data } catch { /* API unavailable */ }
}
</script>
