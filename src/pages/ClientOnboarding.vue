<template>
  <div>
    <ConfirmDialog ref="confirmDialog" />
    <div class="mb-6">
      <div class="flex items-center gap-2 text-sm text-gray-500 mb-1">
        <router-link to="/client-management" class="hover:text-blue-600 transition-colors">Client Management</router-link>
        <span class="text-gray-300">/</span>
        <span class="font-medium text-gray-800">Client Onboarding</span>
      </div>
      <h2 class="text-2xl font-bold text-gray-900">Client Onboarding</h2>
      <p class="text-gray-500 text-sm mt-1">Daftarkan client baru dalam {{ steps.length }} langkah</p>
    </div>

    <!-- Stepper -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div class="flex items-center justify-between">
        <div v-for="(s, i) in steps" :key="i" class="flex items-center" :class="i < steps.length - 1 ? 'flex-1' : ''">
          <div class="flex items-center gap-2">
            <div :class="[
              'w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all',
              currentStep > i ? 'bg-blue-600 text-white' :
              currentStep === i ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
              'bg-gray-200 text-gray-500'
            ]">
              <Check v-if="currentStep > i" class="w-4 h-4" />
              <span v-else>{{ i + 1 }}</span>
            </div>
            <div class="hidden lg:block">
              <p :class="['text-xs font-medium', currentStep >= i ? 'text-gray-900' : 'text-gray-400']">{{ s.title }}</p>
            </div>
          </div>
          <div v-if="i < steps.length - 1" :class="['flex-1 h-0.5 mx-3', currentStep > i ? 'bg-blue-600' : 'bg-gray-200']"></div>
        </div>
      </div>
    </div>

    <!-- Step 1: Data Perusahaan -->
    <div v-if="currentStep === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-1">Step 1: Data Perusahaan</h3>
      <p class="text-sm text-gray-500 mb-6">Masukkan informasi perusahaan client</p>
      <form @submit.prevent="handleCreateClient" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan *</label><input v-model="clientForm.companyName" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="PT Example Indonesia" required /></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">Nama Kontak *</label><input v-model="clientForm.contactPersonName" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" required /></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">Email Kontak *</label><input v-model="clientForm.contactPersonEmail" type="email" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="contact@company.com" required /></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">Telepon Kontak *</label><input v-model="clientForm.contactPersonPhone" type="tel" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="08123456789" required /></div>
        </div>
        <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{{ error }}</div>
        <div class="flex justify-end pt-4">
          <button type="submit" :disabled="submitting" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">{{ submitting ? 'Menyimpan...' : 'Simpan & Lanjut' }}</button>
        </div>
      </form>
    </div>

    <!-- Step 2: Buat User -->
    <div v-if="currentStep === 1" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-1">Step 2: Buat Akun User</h3>
      <p class="text-sm text-gray-500 mb-6">Buat akun login untuk client <strong>{{ createdClient?.companyName }}</strong></p>
      <div v-if="createdUsers.length > 0" class="mb-6 space-y-2">
        <p class="text-sm font-medium text-gray-700">User yang akan dibuat:</p>
        <div v-for="(u, i) in createdUsers" :key="i" class="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
          <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">{{ u.name.charAt(0) }}</div>
          <div class="flex-1"><p class="text-sm font-medium">{{ u.name }}</p><p class="text-xs text-gray-500">{{ u.email }}</p></div>
          <button type="button" @click="removeUser(i)" class="text-red-400 hover:text-red-600 text-xs">Hapus</button>
        </div>
      </div>
      <form @submit.prevent="handleAddUser" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium text-gray-700 mb-1">Nama *</label><input v-model="userForm.name" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">Email *</label><input v-model="userForm.email" type="email" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div class="md:col-span-2"><PasswordInput v-model="userForm.password" label="Password" :required="true" placeholder="Min 8 karakter, huruf besar, angka, special char" /></div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password *</label>
            <input v-model="userForm.confirmPassword" type="password" class="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" :class="userForm.confirmPassword && userForm.confirmPassword !== userForm.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'" placeholder="Ulangi password" required />
            <p v-if="userForm.confirmPassword && userForm.confirmPassword !== userForm.password" class="text-xs text-red-600 mt-1">Password tidak cocok</p>
          </div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">Telepon *</label><input v-model="userForm.phone" type="tel" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
        </div>
        <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{{ error }}</div>
        <div class="flex justify-between pt-4">
          <button type="button" @click="currentStep = 0" class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium">Kembali</button>
          <div class="flex gap-3">
            <button type="submit" :disabled="submitting" class="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 font-medium disabled:opacity-50">+ Tambah User</button>
            <button type="button" @click="currentStep = 2" :disabled="createdUsers.length === 0" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">Lanjut</button>
          </div>
        </div>
      </form>
    </div>

    <!-- Step 3: Service & Kuota (Combined) -->
    <div v-if="currentStep === 2" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-1">Step 3: Service & Kuota</h3>
      <p class="text-sm text-gray-500 mb-6">Tentukan layanan dan kuota maintenance untuk <strong>{{ createdClient?.companyName }}</strong></p>
      <form @submit.prevent="currentStep = 3" class="space-y-6">
        <!-- Service selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Jenis Layanan yang Dibeli *</label>
          <div class="flex gap-6">
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" v-model="clientForm.hasPM" class="w-4 h-4 rounded border-gray-300 text-blue-600" /><span class="text-sm">Preventive Maintenance (PM)</span></label>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" v-model="clientForm.hasCM" class="w-4 h-4 rounded border-gray-300 text-blue-600" /><span class="text-sm">Corrective Maintenance (CM)</span></label>
          </div>
        </div>
        <!-- Quota -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label class="block text-sm font-medium text-gray-700 mb-1">Tahun *</label><input v-model.number="quotaForm.year" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div v-if="clientForm.hasPM"><label class="block text-sm font-medium text-gray-700 mb-1">Kuota PM *</label><input v-model.number="quotaForm.pmQuota" type="number" min="0" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
          <div v-if="clientForm.hasCM"><label class="block text-sm font-medium text-gray-700 mb-1">Kuota CM *</label><input v-model.number="quotaForm.cmQuota" type="number" min="0" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
        </div>
        <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{{ error }}</div>
        <div class="flex justify-between pt-4">
          <button type="button" @click="currentStep = 1" class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium">Kembali</button>
          <button type="submit" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium">Lanjut</button>
        </div>
      </form>
    </div>

    <!-- Step 4: Buat Project -->
    <div v-if="currentStep === 3" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-1">Step 4: Buat Project</h3>
      <p class="text-sm text-gray-500 mb-6">Tambahkan project untuk <strong>{{ createdClient?.companyName }}</strong> (opsional)</p>
      <div v-if="createdProjects.length > 0" class="mb-6 space-y-2">
        <div v-for="p in createdProjects" :key="p.id" class="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-2">
          <span class="text-sm font-medium">{{ p.projectName }}</span>
          <span class="text-xs text-gray-500 ml-auto">{{ p.description || '' }}</span>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Nama Project</label><input v-model="projectForm.projectName" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. ECM Implementation" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label><input v-model="projectForm.description" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Opsional" /></div>
      </div>
      <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4">{{ error }}</div>
      <div class="flex justify-between pt-4">
        <button type="button" @click="currentStep = 2" class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium">Kembali</button>
        <div class="flex gap-3">
          <button type="button" @click="handleAddProject" :disabled="!projectForm.projectName" class="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 font-medium disabled:opacity-50">+ Tambah Project</button>
          <button type="button" @click="currentStep = 4" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium">Lanjut</button>
        </div>
      </div>
    </div>

    <!-- Step 5: Assign Support -->
    <div v-if="currentStep === 4" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-1">Step 5: Assign Support Engineer</h3>
      <p class="text-sm text-gray-500 mb-6">Pilih support engineer untuk <strong>{{ createdClient?.companyName }}</strong> (opsional)</p>
      <div class="border border-gray-200 rounded-lg max-h-48 overflow-y-auto mb-4">
        <label v-for="u in supportUsers" :key="u.id" class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
          <input type="checkbox" :value="u.id" v-model="selectedSupportIds" class="w-4 h-4 rounded border-gray-300 text-blue-600" />
          <div class="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-medium">{{ u.name.charAt(0) }}</div>
          <div><p class="text-sm font-medium">{{ u.name }}</p><p class="text-xs text-gray-500">{{ u.email }}</p></div>
        </label>
        <p v-if="supportUsers.length === 0" class="text-center py-4 text-sm text-gray-500">Belum ada user dengan role SUPPORT.</p>
      </div>
      <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4">{{ error }}</div>
      <div class="flex justify-between pt-4">
        <button type="button" @click="currentStep = 3" class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium">Kembali</button>
        <button type="button" @click="currentStep = 5" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium">Review & Selesai</button>
      </div>
    </div>

    <!-- Step 6: Review & Submit -->
    <div v-if="currentStep === 5" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-1">Review & Konfirmasi</h3>
      <p class="text-sm text-gray-500 mb-6">Periksa semua data sebelum menyimpan</p>
      <div class="space-y-4">
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Perusahaan</h4>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><span class="text-gray-500">Nama:</span> <span class="font-medium">{{ clientForm.companyName }}</span></div>
            <div><span class="text-gray-500">Kontak:</span> <span class="font-medium">{{ clientForm.contactPersonName }}</span></div>
            <div><span class="text-gray-500">Email:</span> <span class="font-medium">{{ clientForm.contactPersonEmail }}</span></div>
            <div><span class="text-gray-500">Telepon:</span> <span class="font-medium">{{ clientForm.contactPersonPhone }}</span></div>
            <div><span class="text-gray-500">Layanan:</span> <span class="font-medium">{{ [clientForm.hasPM ? 'PM' : '', clientForm.hasCM ? 'CM' : ''].filter(Boolean).join(', ') }}</span></div>
          </div>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Users ({{ createdUsers.length }})</h4>
          <div v-for="u in createdUsers" :key="u.id" class="text-sm">{{ u.name }} — {{ u.email }}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Kuota ({{ quotaForm.year }})</h4>
          <div class="text-sm">PM: {{ quotaForm.pmQuota || 0 }} | CM: {{ quotaForm.cmQuota || 0 }}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Projects ({{ createdProjects.length }})</h4>
          <div v-if="createdProjects.length === 0" class="text-xs text-gray-400">Tidak ada project</div>
          <div v-for="p in createdProjects" :key="p.id" class="text-sm">{{ p.projectName }}</div>
        </div>
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">Support Engineers ({{ selectedSupportIds.length }})</h4>
          <div v-if="selectedSupportIds.length === 0" class="text-xs text-gray-400">Tidak ada support</div>
          <div v-for="id in selectedSupportIds" :key="id" class="text-sm">{{ supportUsers.find(u => u.id === id)?.name }}</div>
        </div>
      </div>
      <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-4">{{ error }}</div>
      <div class="flex justify-between pt-6">
        <button type="button" @click="currentStep = 4" class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium">Kembali</button>
        <button type="button" @click="confirmAndSubmit" :disabled="submitting" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">{{ submitting ? 'Menyimpan...' : 'Simpan Semua' }}</button>
      </div>
    </div>

    <!-- Step 7: Done -->
    <div v-if="currentStep === 6" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><Check class="w-8 h-8 text-blue-600" /></div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Client Berhasil Didaftarkan!</h3>
      <p class="text-gray-500 mb-6">Semua data telah tersimpan.</p>
      <div class="flex gap-3 justify-center">
        <button @click="resetAll" class="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 font-medium">Daftarkan Client Lain</button>
        <router-link to="/clients" class="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium">Lihat Daftar Client</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { createClient, getClients } from '../api/clients'
import { createUser, getUsers } from '../api/users'
import { createClientQuota } from '../api/quotas'
import { createProject } from '../api/projects'
import { addClientSupports } from '../api/clientSupports'
import { createServiceCatalog } from '../api/serviceCatalog'
import { validatePassword } from '../utils/passwordPolicy'
import { Check } from 'lucide-vue-next'
import PasswordInput from '../components/PasswordInput.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const steps = [
  { title: 'Data Perusahaan' },
  { title: 'Buat User' },
  { title: 'Service & Kuota' },
  { title: 'Project' },
  { title: 'Support' },
  { title: 'Review' },
]

const currentStep = ref(0)
const error = ref('')
const submitting = ref(false)
const createdClient = ref(null)
const createdUsers = ref([])
const createdProjects = ref([])
const supportUsers = ref([])
const selectedSupportIds = ref([])
const confirmDialog = ref(null)

const clientForm = reactive({ companyName: '', contactPersonName: '', contactPersonEmail: '', contactPersonPhone: '', hasPM: true, hasCM: true })
const userForm = reactive({ name: '', email: '', password: '', confirmPassword: '', phone: '' })
const quotaForm = reactive({ year: new Date().getFullYear(), pmQuota: 0, cmQuota: 0 })
const projectForm = reactive({ projectName: '', description: '' })

onMounted(async () => {
  try { const res = await getUsers(); supportUsers.value = res.data.filter(u => u.role === 'SUPPORT') } catch {}
})

async function handleCreateClient() {
  error.value = ''
  submitting.value = true
  try {
    const res = await createClient({ companyName: clientForm.companyName, contactPersonName: clientForm.contactPersonName, contactPersonEmail: clientForm.contactPersonEmail, contactPersonPhone: clientForm.contactPersonPhone })
    createdClient.value = res.data
    currentStep.value = 1
  } catch (err) {
    error.value = err.response?.data?.message || 'Gagal membuat client. Pastikan nama perusahaan belum terdaftar.'
  } finally { submitting.value = false }
}

function handleAddUser() {
  error.value = ''
  if (!userForm.name || !userForm.email || !userForm.password || !userForm.phone) { error.value = 'Semua field harus diisi'; return }
  if (!validatePassword(userForm.password).valid) { error.value = 'Password belum memenuhi ketentuan'; return }
  if (userForm.password !== userForm.confirmPassword) { error.value = 'Password dan konfirmasi tidak cocok'; return }
  // Save to memory only
  createdUsers.value.push({ name: userForm.name, email: userForm.email, password: userForm.password, phone: userForm.phone })
  Object.assign(userForm, { name: '', email: '', password: '', confirmPassword: '', phone: '' })
}

function handleAddProject() {
  error.value = ''
  if (!projectForm.projectName) return
  // Save to memory only
  createdProjects.value.push({ projectName: projectForm.projectName, description: projectForm.description })
  Object.assign(projectForm, { projectName: '', description: '' })
}

function removeUser(index) { createdUsers.value.splice(index, 1) }
function removeProject(index) { createdProjects.value.splice(index, 1) }

async function confirmAndSubmit() {
  const confirmed = await confirmDialog.value.open({
    title: 'Konfirmasi Simpan',
    message: 'Apakah kamu yakin ingin menyimpan semua data client ini? Data yang sudah disimpan tidak bisa dibatalkan.',
    confirmLabel: 'Ya, Simpan',
    confirmColor: 'blue'
  })
  if (!confirmed) return
  handleFinalSubmit()
}

async function handleFinalSubmit() {
  error.value = ''
  submitting.value = true
  try {
    // 1. Create users
    for (const u of createdUsers.value) {
      await createUser({ name: u.name, email: u.email, password: u.password, phone: u.phone, role: 'USER', clientId: createdClient.value.id })
    }
    // 2. Create quota
    await createClientQuota({ clientId: createdClient.value.id, year: quotaForm.year, pmQuota: quotaForm.pmQuota || 0, cmQuota: quotaForm.cmQuota || 0 })
    // 3. Create projects
    for (const p of createdProjects.value) {
      await createProject({ projectName: p.projectName, description: p.description, clientId: createdClient.value.id })
    }
    // 4. Assign supports
    if (selectedSupportIds.value.length > 0) {
      await addClientSupports(createdClient.value.id, selectedSupportIds.value)
    }
    // 5. Create service catalog
    const services = []
    if (clientForm.hasPM) services.push('PM')
    if (clientForm.hasCM) services.push('CM')
    if (services.length > 0) {
      await createServiceCatalog({ clientId: createdClient.value.id, services, notes: '' })
    }
    currentStep.value = 6
  } catch (err) {
    error.value = err.response?.data?.message || 'Gagal menyimpan data. Periksa kembali input Anda.'
  } finally { submitting.value = false }
}

function resetAll() {
  currentStep.value = 0
  createdClient.value = null
  createdUsers.value = []
  createdProjects.value = []
  selectedSupportIds.value = []
  Object.assign(clientForm, { companyName: '', contactPersonName: '', contactPersonEmail: '', contactPersonPhone: '', hasPM: true, hasCM: true })
  Object.assign(userForm, { name: '', email: '', password: '', confirmPassword: '', phone: '' })
  Object.assign(quotaForm, { year: new Date().getFullYear(), pmQuota: 0, cmQuota: 0 })
  Object.assign(projectForm, { projectName: '', description: '' })
  error.value = ''
}
</script>
