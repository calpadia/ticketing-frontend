<template>
  <div>
    <ConfirmDialog ref="confirmDialog" />
    <div class="flex items-center justify-between mb-6">
      <div><h2 class="text-2xl font-bold text-gray-900">Users</h2><p class="text-gray-500 text-sm mt-1">{{ users.length }} user(s) registered</p></div>
      <button @click="toggleForm()" class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium">
        <component :is="showForm ? X : Plus" class="w-4 h-4" /> {{ showForm ? 'Cancel' : 'New User' }}
      </button>
    </div>

    <form v-if="showForm" @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <h3 class="text-lg font-semibold mb-4">{{ editingId ? 'Edit User' : 'Create New User' }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Name *</label><input v-model="form.name" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Email *</label><input v-model="form.email" type="email" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Password {{ editingId ? '' : '*' }}</label><input v-model="form.password" type="password" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" :required="!editingId" :placeholder="editingId ? 'Leave blank to keep' : ''" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Role *</label><select v-model="form.role" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="USER">User</option><option value="ADMIN">Admin</option></select></div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Perusahaan *</label>
          <select v-model="form.clientId" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            <option value="">-- Pilih perusahaan --</option>
            <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
          </select>
        </div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon *</label><input v-model="form.phone" type="tel" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="08123456789" required /></div>
      </div>
      <button type="submit" class="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium">{{ editingId ? 'Update' : 'Create' }}</button>
    </form>

    <div class="relative mb-4"><Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" /><input v-model="search" type="text" placeholder="Search users..." class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50">
          <tr class="text-left text-gray-600">
            <th class="px-6 py-3 font-medium">Name</th>
            <th class="px-6 py-3 font-medium">Email</th>
            <th class="px-6 py-3 font-medium">Perusahaan</th>
            <th class="px-6 py-3 font-medium">Telepon</th>
            <th class="px-6 py-3 font-medium">Role</th>
            <th class="px-6 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="filtered.length === 0"><td colspan="6" class="text-center py-8 text-gray-500">No users found.</td></tr>
          <tr v-for="u in filtered" :key="u.id" class="hover:bg-gray-50">
            <td class="px-6 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm">{{ u.name.charAt(0).toUpperCase() }}</div>
                <span class="font-medium text-gray-900">{{ u.name }}</span>
              </div>
            </td>
            <td class="px-6 py-3 text-gray-600">{{ u.email }}</td>
            <td class="px-6 py-3 text-gray-600">{{ getClientName(u.clientId) }}</td>
            <td class="px-6 py-3 text-gray-600">{{ u.phone || '-' }}</td>
            <td class="px-6 py-3"><span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium', u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700']">{{ u.role }}</span></td>
            <td class="px-6 py-3">
              <div class="flex gap-2">
                <button @click="startEdit(u)" class="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil class="w-4 h-4" /></button>
                <button @click="handleDelete(u.id)" class="p-1.5 rounded-lg hover:bg-red-50 text-red-600"><Trash2 class="w-4 h-4" /></button>
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
import { getUsers, createUser, updateUser, deleteUser } from '../api/users'
import { getClients } from '../api/clients'
import { Search, Plus, X, Pencil, Trash2 } from 'lucide-vue-next'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const confirmDialog = ref(null)

const users = ref([])
const clients = ref([])
const showForm = ref(false)
const editingId = ref(null)
const form = reactive({ name: '', email: '', password: '', role: 'USER', clientId: '', phone: '' })
const search = ref('')

const filtered = computed(() => users.value.filter(u =>
  u.name.toLowerCase().includes(search.value.toLowerCase()) ||
  u.email.toLowerCase().includes(search.value.toLowerCase()) ||
  getClientName(u.clientId).toLowerCase().includes(search.value.toLowerCase())
))

onMounted(async () => {
  try { users.value = (await getUsers()).data } catch { users.value = [] }
  try { clients.value = (await getClients()).data } catch { clients.value = [] }
})

function getClientName(clientId) {
  if (!clientId) return '-'
  const client = clients.value.find(c => c.id === clientId)
  return client ? client.companyName : '-'
}

function toggleForm() {
  showForm.value = !showForm.value
  editingId.value = null
  Object.assign(form, { name: '', email: '', password: '', role: 'USER', clientId: '', phone: '' })
}

function startEdit(u) {
  editingId.value = u.id
  Object.assign(form, { name: u.name, email: u.email, password: '', role: u.role, clientId: u.clientId || '', phone: u.phone || '' })
  showForm.value = true
}

async function handleSubmit() {
  try {
    const payload = { ...form, clientId: form.clientId ? Number(form.clientId) : null }
    if (editingId.value) await updateUser(editingId.value, payload)
    else await createUser(payload)
    users.value = (await getUsers()).data
  } catch {
    // API unavailable
  }
  showForm.value = false; editingId.value = null
  Object.assign(form, { name: '', email: '', password: '', role: 'USER', clientId: '', phone: '' })
}

async function handleDelete(id) {
  const confirmed = await confirmDialog.value.open({ title: 'Hapus User', message: 'Apakah kamu yakin ingin menghapus user ini?' })
  if (!confirmed) return
  try { await deleteUser(id); users.value = (await getUsers()).data } catch { /* API unavailable */ }
}
</script>
