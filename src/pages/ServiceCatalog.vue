<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Service Catalog</h2>
        <p class="text-gray-500 text-sm mt-1">Kelola layanan maintenance yang dimiliki setiap client</p>
      </div>
      <button @click="toggleForm()" class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium">
        <component :is="showForm ? X : Plus" class="w-4 h-4" /> {{ showForm ? 'Cancel' : 'Add Service' }}
      </button>
    </div>

    <!-- Form -->
    <form v-if="showForm" @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 class="text-lg font-semibold mb-4">{{ editingId !== null ? 'Edit Service' : 'Add New Service' }}</h3>
      <div v-if="error" class="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">{{ error }}</div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Client *</label>
          <select v-model="form.clientId" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="">Select client</option>
            <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Services *</label>
          <div class="flex flex-col gap-2 mt-1">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="form.hasPM" class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span class="text-sm text-gray-700">Preventive Maintenance (PM)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="form.hasCM" class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span class="text-sm text-gray-700">Corrective Maintenance (CM)</span>
            </label>
          </div>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea v-model="form.notes" rows="2" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Optional notes about the service agreement"></textarea>
        </div>
      </div>
      <button type="submit" class="mt-4 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium">
        {{ editingId !== null ? 'Update' : 'Add Service' }}
      </button>
    </form>

    <!-- Search -->
    <div class="relative mb-4">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input v-model="search" type="text" placeholder="Search by client name..." class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr class="text-left text-gray-600">
            <th class="px-6 py-3 font-medium">Client</th>
            <th class="px-6 py-3 font-medium">Services</th>
            <th class="px-6 py-3 font-medium">Notes</th>
            <th class="px-6 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="filtered.length === 0">
            <td colspan="4" class="text-center py-8 text-gray-500">No service catalog entries found.</td>
          </tr>
          <tr v-for="item in filtered" :key="item.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm">
                  {{ item.clientName.charAt(0).toUpperCase() }}
                </div>
                <span class="font-medium text-gray-900">{{ item.clientName }}</span>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex gap-2">
                <span v-if="item.hasPM" class="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-purple-100 text-purple-800 border-purple-200">PM</span>
                <span v-if="item.hasCM" class="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-teal-100 text-teal-800 border-teal-200">CM</span>
              </div>
            </td>
            <td class="px-6 py-4 text-gray-600 text-sm">{{ item.notes || '-' }}</td>
            <td class="px-6 py-4">
              <div class="flex gap-2">
                <button @click="startEdit(item)" class="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil class="w-4 h-4" /></button>
                <button @click="handleDelete(item.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 class="w-4 h-4" /></button>
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
import { getClients } from '../api/clients'
import { Search, Plus, X, Pencil, Trash2 } from 'lucide-vue-next'

const clients = ref([])
const catalog = ref([])
const showForm = ref(false)
const editingId = ref(null)
const error = ref('')
const search = ref('')
const form = reactive({ clientId: '', hasPM: false, hasCM: false, notes: '' })

// Mock initial service catalog data
const mockCatalog = []

const filtered = computed(() =>
  catalog.value.filter(item => item.clientName.toLowerCase().includes(search.value.toLowerCase()))
)

onMounted(async () => {
  try {
    clients.value = (await getClients()).data
  } catch {
    clients.value = []
  }
  // Load catalog from localStorage or use mock
  const saved = localStorage.getItem('serviceCatalog')
  catalog.value = saved ? JSON.parse(saved) : mockCatalog
})

function saveCatalog() {
  localStorage.setItem('serviceCatalog', JSON.stringify(catalog.value))
}

function toggleForm() {
  showForm.value = !showForm.value
  editingId.value = null
  Object.assign(form, { clientId: '', hasPM: false, hasCM: false, notes: '' })
  error.value = ''
}

function startEdit(item) {
  editingId.value = item.id
  Object.assign(form, { clientId: item.clientId, hasPM: item.hasPM, hasCM: item.hasCM, notes: item.notes })
  showForm.value = true
  error.value = ''
}

function handleSubmit() {
  if (!form.clientId) { error.value = 'Please select a client'; return }
  if (!form.hasPM && !form.hasCM) { error.value = 'Please select at least one service'; return }

  const clientName = clients.value.find(c => c.id === Number(form.clientId))?.companyName || ''

  if (editingId.value !== null) {
    catalog.value = catalog.value.map(item =>
      item.id === editingId.value
        ? { ...item, clientId: Number(form.clientId), clientName, hasPM: form.hasPM, hasCM: form.hasCM, notes: form.notes }
        : item
    )
  } else {
    // Check if client already exists
    const exists = catalog.value.find(item => item.clientId === Number(form.clientId))
    if (exists) { error.value = 'This client already has a service entry. Please edit the existing one.'; return }

    catalog.value.push({
      id: Date.now(),
      clientId: Number(form.clientId),
      clientName,
      hasPM: form.hasPM,
      hasCM: form.hasCM,
      notes: form.notes,
    })
  }

  saveCatalog()
  showForm.value = false
  editingId.value = null
  Object.assign(form, { clientId: '', hasPM: false, hasCM: false, notes: '' })
  error.value = ''
}

function handleDelete(id) {
  if (!confirm('Are you sure you want to delete this service entry?')) return
  catalog.value = catalog.value.filter(item => item.id !== id)
  saveCatalog()
}
</script>
