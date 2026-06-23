<template>
  <div>
    <ConfirmDialog ref="confirmDialog" />
    <div class="flex items-center justify-between mb-6">
      <div>
        <div class="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <router-link to="/client-management" class="hover:text-blue-600 transition-colors">Client Management</router-link>
          <span class="text-gray-300">/</span>
          <span class="font-medium text-gray-800">Clients</span>
        </div>
        <h2 class="text-2xl font-bold text-gray-900">Clients</h2>
        <p class="text-gray-500 text-sm mt-1">{{ clients.length }} client(s) registered</p>
      </div>
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
        <div v-if="editingId" class="md:col-span-2">
          <label class="flex items-center gap-3 cursor-pointer">
            <div class="relative">
              <input type="checkbox" v-model="form.isActive" class="sr-only peer" @change="handleToggleStatus" />
              <div class="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors"></div>
              <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
            </div>
            <span class="text-sm font-medium text-gray-700">Client Aktif</span>
            <span v-if="!form.isActive" class="text-xs text-red-500 ml-2">(Client akan dinonaktifkan)</span>
          </label>
        </div>
      </div>
      <button type="submit" class="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium">{{ editingId ? 'Update' : 'Create' }}</button>
    </form>

    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input v-model="search" type="text" placeholder="Search clients..." class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <select v-model="filterStatus" class="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">All Status</option>
        <option value="ACTIVE">Active</option>
        <option value="INACTIVE">Inactive</option>
      </select>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <!-- Desktop Table -->
      <div class="hidden md:block overflow-auto max-h-[70vh]">
        <table class="w-full text-sm relative min-w-[700px]">
          <thead class="bg-gray-50/95 backdrop-blur sticky top-0 z-10 shadow-sm">
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
            <tr v-if="loading" v-for="i in 5" :key="'skel'+i" class="animate-pulse">
              <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-32"></div></td>
              <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
              <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-40"></div></td>
              <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
              <td class="px-6 py-4"><div class="h-5 bg-gray-200 rounded-full w-16"></div></td>
              <td class="px-6 py-4"><div class="flex gap-2"><div class="w-6 h-6 bg-gray-200 rounded"></div><div class="w-6 h-6 bg-gray-200 rounded"></div></div></td>
            </tr>
            <tr v-else-if="filtered.length === 0">
              <td colspan="6" class="text-center py-16">
                <div class="flex flex-col items-center justify-center">
                  <div class="text-gray-300 mb-3"><Building2 class="w-16 h-16" /></div>
                  <p class="text-gray-500 font-medium">Belum ada data client.</p>
                  <p class="text-gray-400 text-sm mt-1">Klik tombol New Client untuk mendaftarkan client baru.</p>
                </div>
              </td>
            </tr>
            <tr v-for="c in filtered" :key="c.id" :class="['cursor-pointer', c.isActive ? 'hover:bg-gray-50' : 'bg-gray-50/50 opacity-60']" @click="router.push('/clients/' + c.id)">
              <td class="px-6 py-3 font-medium text-gray-900">{{ c.companyName }}</td>
              <td class="px-6 py-3 text-gray-600">{{ c.contactPersonName || '-' }}</td>
              <td class="px-6 py-3 text-gray-600">{{ c.contactPersonEmail || '-' }}</td>
              <td class="px-6 py-3 text-gray-600">{{ c.contactPersonPhone || '-' }}</td>
              <td class="px-6 py-3">
                <span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium', c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">{{ c.isActive ? 'Active' : 'Inactive' }}</span>
              </td>
              <td class="px-6 py-3">
                <div class="flex gap-2">
                  <button @click.stop="startEdit(c)" class="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" v-tooltip="'Edit Client'"><Pencil class="w-4 h-4" /></button>
                  <button @click.stop="handleDelete(c.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-600" v-tooltip="'Hapus Client'"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="md:hidden flex flex-col divide-y divide-gray-100 overflow-auto max-h-[70vh]">
        <div v-if="loading" v-for="i in 5" :key="'m-skel-'+i" class="p-4 animate-pulse">
          <div class="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div class="grid grid-cols-2 gap-2 mb-3"><div class="h-4 bg-gray-200 rounded"></div><div class="h-4 bg-gray-200 rounded"></div></div>
          <div class="flex justify-between"><div class="h-5 bg-gray-200 rounded-full w-16"></div><div class="flex gap-2"><div class="w-6 h-6 bg-gray-200 rounded"></div><div class="w-6 h-6 bg-gray-200 rounded"></div></div></div>
        </div>
        <div v-else-if="filtered.length === 0" class="p-8 text-center">
          <div class="flex flex-col items-center justify-center">
            <div class="text-gray-300 mb-3"><Building2 class="w-12 h-12" /></div>
            <p class="text-gray-500 font-medium text-sm">Belum ada data client.</p>
          </div>
        </div>
        <div v-for="c in filtered" :key="'m-'+c.id" :class="['p-4 transition-colors cursor-pointer', c.isActive ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50 opacity-60']" @click="router.push('/clients/' + c.id)">
          <div class="flex items-start justify-between mb-3">
            <div>
              <h4 class="font-bold text-gray-900 text-base mb-1">{{ c.companyName }}</h4>
              <p class="text-sm text-gray-500">{{ c.contactPersonName || '-' }}</p>
            </div>
            <div class="flex gap-1" @click.stop>
              <button @click="startEdit(c)" class="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil class="w-4 h-4" /></button>
              <button @click="handleDelete(c.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 class="w-4 h-4" /></button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 mb-3">
            <div><p class="text-[10px] text-gray-400 uppercase tracking-wider">Email</p><p class="text-sm text-gray-700 truncate">{{ c.contactPersonEmail || '-' }}</p></div>
            <div><p class="text-[10px] text-gray-400 uppercase tracking-wider">Telepon</p><p class="text-sm text-gray-700">{{ c.contactPersonPhone || '-' }}</p></div>
          </div>
          <div><span :class="['px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase', c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">{{ c.isActive ? 'Active' : 'Inactive' }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getClients, createClient, updateClient, updateClientStatus, deleteClient } from '../api/clients'
import { getUsers } from '../api/users'
import { getProjectsByClientId } from '../api/projects'
import { getClientQuotas } from '../api/quotas'
import { getClientSupports } from '../api/clientSupports'
import { Search, Plus, X, Pencil, Trash2, Building2 } from 'lucide-vue-next'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { useToastStore } from '../stores/toast'

const router = useRouter()
const confirmDialog = ref(null)
const toast = useToastStore()

const clients = ref([])
const showForm = ref(false)
const loading = ref(true)
const editingId = ref(null)
const form = reactive({ companyName: '', contactPersonName: '', contactPersonEmail: '', contactPersonPhone: '', isActive: true })
const search = ref('')
const filterStatus = ref('')

const filtered = computed(() => clients.value.filter(c => {
  const matchSearch = c.companyName.toLowerCase().includes(search.value.toLowerCase()) ||
    (c.contactPersonName && c.contactPersonName.toLowerCase().includes(search.value.toLowerCase())) ||
    (c.contactPersonEmail && c.contactPersonEmail.toLowerCase().includes(search.value.toLowerCase()))
  const matchStatus = !filterStatus.value || (filterStatus.value === 'ACTIVE' ? c.isActive : !c.isActive)
  return matchSearch && matchStatus
}))

onMounted(async () => {
  loading.value = true
  try { clients.value = (await getClients()).data } catch { clients.value = [] }
  finally { loading.value = false }
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

function handleGlobalKeydown(e) {
  if (e.key === 'Escape') {
    if (showForm.value) {
      showForm.value = false
      editingId.value = null
    }
  }
}

function toggleForm() {
  showForm.value = !showForm.value
  editingId.value = null
  Object.assign(form, { companyName: '', contactPersonName: '', contactPersonEmail: '', contactPersonPhone: '', isActive: true })
}

function startEdit(c) {
  editingId.value = c.id
  Object.assign(form, {
    companyName: c.companyName || '',
    contactPersonName: c.contactPersonName || '',
    contactPersonEmail: c.contactPersonEmail || '',
    contactPersonPhone: c.contactPersonPhone || '',
    isActive: c.isActive !== false,
  })
  showForm.value = true
}

async function handleSubmit() {
  const actionName = editingId.value ? 'Pembaruan' : 'Pembuatan'
  const actionText = editingId.value ? 'memperbarui' : 'membuat'
  const actionLabel = editingId.value ? 'Ya, Perbarui' : 'Ya, Buat'

  const confirmed = await confirmDialog.value.open({ 
    title: `Konfirmasi ${actionName} Client`, 
    message: `Apakah Anda yakin ingin ${actionText} client ini?`,
    confirmLabel: actionLabel,
    confirmColor: 'blue'
  })
  if (!confirmed) return

  const payload = { companyName: form.companyName, contactPersonName: form.contactPersonName, contactPersonEmail: form.contactPersonEmail, contactPersonPhone: form.contactPersonPhone }
  try {
    if (editingId.value) {
      await updateClient(editingId.value, payload)
      toast.success('Client berhasil diperbarui')
    } else {
      await createClient(payload)
      toast.success('Client berhasil ditambahkan')
    }
    clients.value = (await getClients()).data
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal menyimpan client')
  }
  showForm.value = false
  editingId.value = null
  Object.assign(form, { companyName: '', contactPersonName: '', contactPersonEmail: '', contactPersonPhone: '', isActive: true })
}

async function handleToggleStatus() {
  if (!editingId.value) return
  try {
    await updateClientStatus(editingId.value, form.isActive)
    clients.value = (await getClients()).data
    toast.success(`Client ${form.isActive ? 'diaktifkan' : 'dinonaktifkan'}`)
  } catch (err) {
    form.isActive = !form.isActive
    toast.error(err?.response?.data?.message || 'Gagal mengubah status client')
  }
}

async function handleDelete(id) {
  const confirmed = await confirmDialog.value.open({ title: 'Hapus Client', message: 'Apakah kamu yakin ingin menghapus client ini? Semua data terkait akan ikut terhapus.' })
  if (!confirmed) return
  try {
    await deleteClient(id)
    clients.value = (await getClients()).data
    toast.success('Client berhasil dihapus')
  } catch (err) {
    toast.error(err?.response?.data?.message || 'Gagal menghapus client')
  }
}
</script>
