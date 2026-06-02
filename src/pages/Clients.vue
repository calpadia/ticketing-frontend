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
          <tr v-for="c in filtered" :key="c.id" :class="['cursor-pointer', c.isActive ? 'hover:bg-gray-50' : 'bg-gray-50/50 opacity-60']" @click="openClientDetail(c)">
            <td class="px-6 py-3 font-medium text-gray-900">{{ c.companyName }}</td>
            <td class="px-6 py-3 text-gray-600">{{ c.contactPersonName || '-' }}</td>
            <td class="px-6 py-3 text-gray-600">{{ c.contactPersonEmail || '-' }}</td>
            <td class="px-6 py-3 text-gray-600">{{ c.contactPersonPhone || '-' }}</td>
            <td class="px-6 py-3">
              <span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium', c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">{{ c.isActive ? 'Active' : 'Inactive' }}</span>
            </td>
            <td class="px-6 py-3">
              <div class="flex gap-2">
                <button @click.stop="startEdit(c)" class="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil class="w-4 h-4" /></button>
                <button @click.stop="handleDelete(c.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 class="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Client Detail Modal -->
    <div v-if="selectedClient" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="selectedClient = null">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col" @click.stop>
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h3 class="text-lg font-bold text-gray-900">{{ selectedClient.companyName }}</h3>
          <button @click="selectedClient = null" class="text-gray-400 hover:text-gray-600"><X class="w-5 h-5" /></button>
        </div>
        <div class="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          <!-- Info Perusahaan -->
          <div>
            <h4 class="text-sm font-semibold text-gray-700 mb-2">Informasi Perusahaan</h4>
            <div class="grid grid-cols-2 gap-3 bg-gray-50 rounded-lg p-4">
              <div><p class="text-xs text-gray-500">Nama Kontak</p><p class="text-sm font-medium">{{ selectedClient.contactPersonName || '-' }}</p></div>
              <div><p class="text-xs text-gray-500">Email</p><p class="text-sm font-medium">{{ selectedClient.contactPersonEmail || '-' }}</p></div>
              <div><p class="text-xs text-gray-500">Telepon</p><p class="text-sm font-medium">{{ selectedClient.contactPersonPhone || '-' }}</p></div>
              <div><p class="text-xs text-gray-500">Status</p><p class="text-sm font-medium"><span :class="['px-2 py-0.5 rounded-full text-xs', selectedClient.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">{{ selectedClient.isActive ? 'Active' : 'Inactive' }}</span></p></div>
            </div>
          </div>

          <!-- Users -->
          <div>
            <h4 class="text-sm font-semibold text-gray-700 mb-2">Users ({{ clientUsers.length }})</h4>
            <div v-if="clientUsers.length === 0" class="text-xs text-gray-400">Belum ada user untuk client ini.</div>
            <div v-else class="space-y-1">
              <div v-for="u in clientUsers" :key="u.id" class="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                <div class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">{{ u.name.charAt(0) }}</div>
                <span class="text-sm text-gray-900">{{ u.name }}</span>
                <span class="text-xs text-gray-400 ml-auto">{{ u.email }}</span>
              </div>
            </div>
          </div>

          <!-- Projects -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-semibold text-gray-700">Projects ({{ clientProjects.length }})</h4>
              <router-link :to="'/projects?clientId=' + selectedClient.id" @click="selectedClient = null" class="text-xs text-blue-600 hover:text-blue-800">Kelola</router-link>
            </div>
            <div v-if="clientProjects.length === 0" class="text-xs text-gray-400">Belum ada project untuk client ini.</div>
            <div v-else class="space-y-1">
              <div v-for="p in clientProjects" :key="p.id" class="flex items-center justify-between bg-indigo-50 rounded-lg px-3 py-2">
                <span class="text-sm font-medium text-gray-900">{{ p.projectName }}</span>
                <span class="text-xs text-gray-500">{{ p.description || '' }}</span>
              </div>
            </div>
          </div>

          <!-- Quotas -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-semibold text-gray-700">Kuota</h4>
              <router-link :to="'/quotas?clientId=' + selectedClient.id" @click="selectedClient = null" class="text-xs text-blue-600 hover:text-blue-800">Kelola</router-link>
            </div>
            <div v-if="clientQuotas.length === 0" class="text-xs text-gray-400">Belum ada kuota untuk client ini.</div>
            <div v-else class="space-y-2">
              <div v-for="q in clientQuotas" :key="q.id" class="bg-gray-50 rounded-lg p-3">
                <p class="text-xs text-gray-500 mb-1">Tahun {{ q.year }}</p>
                <div class="grid grid-cols-2 gap-3">
                  <div><span class="text-xs text-blue-600">PM:</span> <span class="text-sm font-medium">{{ q.pmUsed }}/{{ q.pmQuota }}</span></div>
                  <div><span class="text-xs text-orange-600">CM:</span> <span class="text-sm font-medium">{{ q.cmUsed }}/{{ q.cmQuota }}</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Support Engineers -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-semibold text-gray-700">Support Engineers ({{ clientSupports.length }})</h4>
              <router-link :to="'/client-supports?clientId=' + selectedClient.id" @click="selectedClient = null" class="text-xs text-blue-600 hover:text-blue-800">Kelola</router-link>
            </div>
            <div v-if="clientSupports.length === 0" class="text-xs text-gray-400">Belum ada support engineer untuk client ini.</div>
            <div v-else class="space-y-1">
              <div v-for="s in clientSupports" :key="s.id" class="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
                <div class="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs">{{ s.supportUserName?.charAt(0) }}</div>
                <span class="text-sm text-gray-900">{{ s.supportUserName }}</span>
                <span class="text-xs text-gray-400 ml-auto">{{ s.supportUserEmail }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { getClients, createClient, updateClient, updateClientStatus, deleteClient } from '../api/clients'
import { getUsers } from '../api/users'
import { getProjectsByClientId } from '../api/projects'
import { getClientQuotas } from '../api/quotas'
import { getClientSupports } from '../api/clientSupports'
import { mockClients } from '../utils/mockData'
import { Search, Plus, X, Pencil, Trash2 } from 'lucide-vue-next'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const confirmDialog = ref(null)

const clients = ref([])
const showForm = ref(false)
const editingId = ref(null)
const form = reactive({ companyName: '', contactPersonName: '', contactPersonEmail: '', contactPersonPhone: '', isActive: true })
const search = ref('')
const selectedClient = ref(null)
const clientUsers = ref([])
const clientProjects = ref([])
const clientQuotas = ref([])
const clientSupports = ref([])

const filtered = computed(() => clients.value.filter(c =>
  c.companyName.toLowerCase().includes(search.value.toLowerCase()) ||
  (c.contactPersonName && c.contactPersonName.toLowerCase().includes(search.value.toLowerCase())) ||
  (c.contactPersonEmail && c.contactPersonEmail.toLowerCase().includes(search.value.toLowerCase()))
))

onMounted(async () => { try { clients.value = (await getClients()).data } catch { clients.value = mockClients } })

async function openClientDetail(client) {
  selectedClient.value = client
  clientUsers.value = []
  clientProjects.value = []
  clientQuotas.value = []
  clientSupports.value = []

  try { const res = await getUsers(); clientUsers.value = res.data.filter(u => u.clientId === client.id) } catch {}
  try { const res = await getProjectsByClientId(client.id); clientProjects.value = res.data } catch {}
  try { const res = await getClientQuotas(); clientQuotas.value = res.data.filter(q => q.clientId === client.id) } catch {}
  try { const res = await getClientSupports(client.id); clientSupports.value = res.data } catch {}
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
  Object.assign(form, { companyName: '', contactPersonName: '', contactPersonEmail: '', contactPersonPhone: '', isActive: true })
}

async function handleToggleStatus() {
  if (!editingId.value) return
  try {
    await updateClientStatus(editingId.value, form.isActive)
    clients.value = (await getClients()).data
  } catch {
    // Revert on failure
    form.isActive = !form.isActive
  }
}

async function handleDelete(id) {
  const confirmed = await confirmDialog.value.open({ title: 'Hapus Client', message: 'Apakah kamu yakin ingin menghapus client ini?' })
  if (!confirmed) return
  try { await deleteClient(id); clients.value = (await getClients()).data } catch { /* API unavailable */ }
}
</script>
