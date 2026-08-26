<template>
  <div>
    <ConfirmDialog ref="confirmDialog" />
    <div class="flex items-center justify-between mb-6">
      <div><h2 class="text-2xl font-bold text-gray-900">Users</h2><p class="text-gray-500 text-sm mt-1">{{ users.length }} user(s) registered</p></div>
      <button @click="toggleForm()" class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 font-medium transition-all text-sm">
        <component :is="showForm ? X : Plus" class="w-4 h-4" /> <span class="hidden sm:inline">{{ showForm ? 'Cancel' : 'New User' }}</span>
      </button>
    </div>

    <transition name="fade">
      <form v-if="showForm" @submit.prevent="handleSubmit" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
        <div class="mb-6">
          <h3 class="text-xl font-bold text-gray-900">{{ editingId ? 'Edit User' : 'Create New User' }}</h3>
          <p class="text-sm text-gray-500 mt-1">Isi formulir di bawah ini dengan lengkap</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Role *</label>
            <div class="relative">
              <select v-model="form.role" class="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-700 rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer">
                <option value="USER">User</option><option value="SUPPORT">Support</option><option value="TECHNICAL_SUPPORT">Technical Support</option><option value="ADMIN">Admin</option>
              </select>
              <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div><label class="block text-sm font-medium text-gray-700 mb-2">Name *</label><input v-model="form.name" class="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required /></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-2">Email *</label><input v-model="form.email" type="email" class="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" required /></div>
          <div class="md:col-span-2"><PasswordInput v-model="form.password" :label="'Password ' + (editingId ? '' : '')" :required="!editingId" :placeholder="editingId ? 'Kosongkan jika tidak ingin mengubah' : 'Min 8 karakter, huruf besar, angka, special char'" :show-policy="!editingId || form.password.length > 0" /></div>
          <div class="md:col-span-2" v-if="!editingId || form.password">
            <label class="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password *</label>
            <input v-model="form.confirmPassword" type="password" class="w-full bg-gray-50/50 border rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2" :class="form.confirmPassword && form.confirmPassword !== form.password ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'" placeholder="Ulangi password" :required="!editingId || form.password.length > 0" />
            <p v-if="form.confirmPassword && form.confirmPassword !== form.password" class="text-xs text-red-600 mt-1">Password tidak cocok</p>
          </div>
          <div><label class="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon *</label><input v-model="form.phone" type="tel" inputmode="numeric" pattern="[0-9]*" @input="form.phone = form.phone.replace(/\D/g, '')" class="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="08123456789" required /></div>
          <div v-if="form.role === 'USER'" class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Perusahaan *</label>
            <div class="relative">
              <select v-model="form.clientId" class="w-full appearance-none bg-gray-50/50 border border-gray-200 text-gray-700 rounded-xl px-4 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer" required>
                <option value="">-- Pilih perusahaan --</option>
                <option v-for="c in activeClients" :key="c.id" :value="c.id">{{ c.companyName }}</option>
              </select>
              <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        <div class="mt-8 flex justify-end">
          <button type="submit" class="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 font-medium transition-all">{{ editingId ? 'Simpan Perubahan' : 'Buat User' }}</button>
        </div>
      </form>
    </transition>

    <div class="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 mb-6 w-full">
      <div class="relative w-full">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input v-model="search" type="text" placeholder="Search users by name, email, or company..." class="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-11 pr-4 py-2 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <!-- Desktop Table -->
      <div class="hidden md:block overflow-auto max-h-[70vh]">
        <table class="w-full text-sm relative min-w-[700px]">
          <thead class="bg-gray-50/95 backdrop-blur sticky top-0 z-10 shadow-sm">
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
            <tr v-if="loading" v-for="i in 5" :key="'skel'+i" class="animate-pulse">
              <td class="px-6 py-4"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full bg-gray-200"></div><div class="h-4 bg-gray-200 rounded w-24"></div></div></td>
              <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-32"></div></td>
              <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
              <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-20"></div></td>
              <td class="px-6 py-4"><div class="h-5 bg-gray-200 rounded-full w-16"></div></td>
              <td class="px-6 py-4"><div class="flex gap-2"><div class="w-6 h-6 bg-gray-200 rounded"></div><div class="w-6 h-6 bg-gray-200 rounded"></div></div></td>
            </tr>
            <tr v-else-if="filtered.length === 0">
              <td colspan="6" class="text-center py-16">
                <div class="flex flex-col items-center justify-center">
                  <div class="text-gray-300 mb-3"><Users class="w-16 h-16" /></div>
                  <p class="text-gray-500 font-medium">Belum ada data user.</p>
                  <p class="text-gray-400 text-sm mt-1">Klik tombol New User untuk menambahkan user baru.</p>
                </div>
              </td>
            </tr>
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
                <button @click="startEdit(u)" class="p-1.5 rounded-xl hover:bg-blue-50 text-blue-600" v-tooltip="'Edit User'"><Pencil class="w-4 h-4" /></button>
                <button @click="handleDelete(u.id)" class="p-1.5 rounded-xl hover:bg-red-50 text-red-600" v-tooltip="'Hapus User'"><Trash2 class="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>

      <!-- Mobile Cards -->
      <div class="md:hidden flex flex-col divide-y divide-gray-100 overflow-auto max-h-[70vh]">
        <div v-if="loading" v-for="i in 5" :key="'m-skel-'+i" class="p-4 animate-pulse">
          <div class="flex items-center gap-3 mb-3"><div class="w-10 h-10 rounded-full bg-gray-200"></div><div><div class="h-4 bg-gray-200 rounded w-24 mb-1"></div><div class="h-3 bg-gray-200 rounded w-32"></div></div></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div class="flex justify-between"><div class="h-5 bg-gray-200 rounded-full w-16"></div><div class="flex gap-2"><div class="w-6 h-6 bg-gray-200 rounded"></div><div class="w-6 h-6 bg-gray-200 rounded"></div></div></div>
        </div>
        <div v-else-if="filtered.length === 0" class="p-8 text-center">
          <div class="flex flex-col items-center justify-center">
            <div class="text-gray-300 mb-3"><Users class="w-12 h-12" /></div>
            <p class="text-gray-500 font-medium text-sm">Belum ada data user.</p>
          </div>
        </div>
        <div v-for="u in filtered" :key="'m-'+u.id" class="p-4 bg-white hover:bg-gray-50 transition-colors">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">{{ u.name.charAt(0).toUpperCase() }}</div>
              <div>
                <h4 class="font-medium text-gray-900">{{ u.name }}</h4>
                <p class="text-xs text-gray-500">{{ u.email }}</p>
              </div>
            </div>
            <div class="flex gap-1">
              <button @click="startEdit(u)" class="p-1.5 rounded-xl hover:bg-blue-50 text-blue-600"><Pencil class="w-4 h-4" /></button>
              <button @click="handleDelete(u.id)" class="p-1.5 rounded-xl hover:bg-red-50 text-red-600"><Trash2 class="w-4 h-4" /></button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 mb-3">
            <div><p class="text-[10px] text-gray-400 uppercase tracking-wider">Perusahaan</p><p class="text-sm text-gray-700 truncate">{{ getClientName(u.clientId) }}</p></div>
            <div><p class="text-[10px] text-gray-400 uppercase tracking-wider">Telepon</p><p class="text-sm text-gray-700">{{ u.phone || '-' }}</p></div>
          </div>
          <div><span :class="['px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase', u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700']">{{ u.role }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { getUsers, createUser, updateUser, deleteUser } from '../api/users'
import { getClients } from '../api/clients'
import { validatePassword } from '../utils/passwordPolicy'
import { Search, Plus, X, Pencil, Trash2, Users, ChevronDown } from 'lucide-vue-next'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import PasswordInput from '../components/PasswordInput.vue'
import { useToastStore } from '../stores/toast'

const confirmDialog = ref(null)
const toast = useToastStore()

const users = ref([])
const clients = ref([])
const showForm = ref(false)
const loading = ref(true)
const editingId = ref(null)
const form = reactive({ name: '', email: '', password: '', confirmPassword: '', role: 'USER', clientId: '', phone: '' })
const search = ref('')

const activeClients = computed(() => clients.value.filter(c => c.isActive))

const filtered = computed(() => users.value.filter(u =>
  u.name.toLowerCase().includes(search.value.toLowerCase()) ||
  u.email.toLowerCase().includes(search.value.toLowerCase()) ||
  getClientName(u.clientId).toLowerCase().includes(search.value.toLowerCase())
))

onMounted(async () => {
  loading.value = true
  try {
    const [usersRes, clientsRes] = await Promise.all([
      getUsers().catch(() => ({ data: [] })),
      getClients().catch(() => ({ data: [] }))
    ])
    users.value = usersRes.data
    clients.value = clientsRes.data
  } finally {
    loading.value = false
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

function getClientName(clientId) {
  if (!clientId) return '-'
  const client = clients.value.find(c => c.id === clientId)
  return client ? client.companyName : '-'
}

function toggleForm() {
  showForm.value = !showForm.value
  editingId.value = null
  Object.assign(form, { name: '', email: '', password: '', confirmPassword: '', role: 'USER', clientId: '', phone: '' })
}

function startEdit(u) {
  editingId.value = u.id
  Object.assign(form, { name: u.name, email: u.email, password: '', confirmPassword: '', role: u.role, clientId: u.clientId || '', phone: u.phone || '' })
  showForm.value = true
}

async function handleSubmit() {
  // Validate password policy
  if (form.password && !validatePassword(form.password).valid) {
    return
  }
  // Validate confirm password
  if (form.password && form.password !== form.confirmPassword) {
    return
  }

  const actionName = editingId.value ? 'Pembaruan' : 'Pembuatan'
  const actionText = editingId.value ? 'memperbarui' : 'membuat'
  const actionLabel = editingId.value ? 'Ya, Perbarui' : 'Ya, Buat'

  const confirmed = await confirmDialog.value.open({ 
    title: `Konfirmasi ${actionName} User`, 
    message: `Apakah Anda yakin ingin ${actionText} user ini?`,
    confirmLabel: actionLabel,
    confirmColor: 'blue'
  })
  if (!confirmed) return // Kembali ke form jika user klik tidak

  try {
    const payload = { ...form, clientId: form.clientId ? Number(form.clientId) : null }
    if (editingId.value) {
      await updateUser(editingId.value, payload)
      toast.success('User berhasil diupdate')
    } else {
      await createUser(payload)
      toast.success('User berhasil dibuat')
    }
    users.value = (await getUsers()).data
  } catch {
    toast.error('Gagal menyimpan user')
  }
  showForm.value = false; editingId.value = null
  Object.assign(form, { name: '', email: '', password: '', confirmPassword: '', role: 'USER', clientId: '', phone: '' })
}

async function handleDelete(id) {
  const confirmed = await confirmDialog.value.open({ title: 'Hapus User', message: 'Apakah kamu yakin ingin menghapus user ini?' })
  if (!confirmed) return
  try { await deleteUser(id); users.value = (await getUsers()).data } catch { /* API unavailable */ }
}
</script>

