<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Client Onboarding</h2>
      <p class="text-gray-500 text-sm mt-1">Daftarkan client baru dalam 3 langkah</p>
    </div>

    <!-- Stepper -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div class="flex items-center justify-between">
        <div v-for="(s, i) in steps" :key="i" class="flex items-center" :class="i < steps.length - 1 ? 'flex-1' : ''">
          <div class="flex items-center gap-3">
            <div :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all',
              currentStep > i ? 'bg-blue-600 text-white' :
              currentStep === i ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
              'bg-gray-200 text-gray-500'
            ]">
              <Check v-if="currentStep > i" class="w-5 h-5" />
              <span v-else>{{ i + 1 }}</span>
            </div>
            <div class="hidden sm:block">
              <p :class="['text-sm font-medium', currentStep >= i ? 'text-gray-900' : 'text-gray-400']">{{ s.title }}</p>
              <p class="text-xs text-gray-400">{{ s.subtitle }}</p>
            </div>
          </div>
          <div v-if="i < steps.length - 1" :class="['flex-1 h-0.5 mx-4', currentStep > i ? 'bg-blue-600' : 'bg-gray-200']"></div>
        </div>
      </div>
    </div>

    <!-- Step 1: Create Client -->
    <div v-if="currentStep === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-1">Step 1: Data Perusahaan</h3>
      <p class="text-sm text-gray-500 mb-6">Masukkan informasi perusahaan client</p>

      <form @submit.prevent="handleCreateClient" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan *</label>
            <input v-model="clientForm.companyName" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="PT Example Indonesia" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Kontak *</label>
            <input v-model="clientForm.contactPersonName" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email Kontak *</label>
            <input v-model="clientForm.contactPersonEmail" type="email" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="contact@company.com" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Telepon Kontak *</label>
            <input v-model="clientForm.contactPersonPhone" type="tel" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="08123456789" required />
          </div>
        </div>
        <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{{ error }}</div>
        <div class="flex justify-end pt-4">
          <button type="submit" :disabled="submitting" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 transition-colors">
            {{ submitting ? 'Menyimpan...' : 'Simpan & Lanjut' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Step 2: Create User -->
    <div v-if="currentStep === 1" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-1">Step 2: Buat Akun User</h3>
      <p class="text-sm text-gray-500 mb-2">Buat akun login untuk client <strong>{{ createdClient?.companyName }}</strong></p>
      <p class="text-xs text-gray-400 mb-6">User ini akan digunakan oleh client untuk login dan membuat ticket</p>

      <!-- Created users list -->
      <div v-if="createdUsers.length > 0" class="mb-6">
        <p class="text-sm font-medium text-gray-700 mb-2">User yang sudah dibuat:</p>
        <div class="space-y-2">
          <div v-for="u in createdUsers" :key="u.id" class="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
            <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">{{ u.name.charAt(0).toUpperCase() }}</div>
            <div>
              <p class="text-sm font-medium text-gray-900">{{ u.name }}</p>
              <p class="text-xs text-gray-500">{{ u.email }}</p>
            </div>
            <Check class="w-4 h-4 text-blue-600 ml-auto" />
          </div>
        </div>
      </div>

      <form @submit.prevent="handleCreateUser" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
            <input v-model="userForm.name" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama lengkap" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input v-model="userForm.email" type="email" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="user@company.com" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input v-model="userForm.password" type="password" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Min 6 karakter" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Telepon *</label>
            <input v-model="userForm.phone" type="tel" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="08123456789" required />
          </div>
        </div>
        <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{{ error }}</div>
        <div class="flex justify-between pt-4">
          <button type="button" @click="handleCreateUser" class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium transition-colors">
            + Tambah User Lain
          </button>
          <button type="button" @click="goToStep(2)" :disabled="createdUsers.length === 0" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 transition-colors">
            Lanjut ke Kuota
          </button>
        </div>
      </form>
    </div>

    <!-- Step 3: Set Quota -->
    <div v-if="currentStep === 2" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-1">Step 3: Atur Kuota</h3>
      <p class="text-sm text-gray-500 mb-6">Tentukan kuota maintenance untuk <strong>{{ createdClient?.companyName }}</strong></p>

      <form @submit.prevent="handleCreateQuota" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tahun *</label>
            <input v-model.number="quotaForm.year" type="number" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kuota PM *</label>
            <input v-model.number="quotaForm.pmQuota" type="number" min="0" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Kuota CM *</label>
            <input v-model.number="quotaForm.cmQuota" type="number" min="0" class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
        </div>
        <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{{ error }}</div>
        <div class="flex justify-between pt-4">
          <button type="button" @click="goToStep(1)" class="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium transition-colors">
            Kembali
          </button>
          <button type="submit" :disabled="submitting" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 transition-colors">
            {{ submitting ? 'Menyimpan...' : 'Simpan & Selesai' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Step 4: Done -->
    <div v-if="currentStep === 3" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check class="w-8 h-8 text-blue-600" />
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Client Berhasil Didaftarkan!</h3>
      <p class="text-gray-500 mb-6">Semua data telah tersimpan. Client sudah siap menggunakan sistem.</p>

      <div class="bg-gray-50 rounded-lg p-5 text-left max-w-md mx-auto mb-6">
        <h4 class="font-semibold text-gray-900 mb-3">Ringkasan:</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between"><span class="text-gray-500">Perusahaan</span><span class="font-medium">{{ createdClient?.companyName }}</span></div>
          <div class="flex justify-between"><span class="text-gray-500">User dibuat</span><span class="font-medium">{{ createdUsers.length }} akun</span></div>
          <div class="flex justify-between"><span class="text-gray-500">Kuota PM</span><span class="font-medium">{{ quotaForm.pmQuota }} tiket</span></div>
          <div class="flex justify-between"><span class="text-gray-500">Kuota CM</span><span class="font-medium">{{ quotaForm.cmQuota }} tiket</span></div>
          <div class="flex justify-between"><span class="text-gray-500">Tahun</span><span class="font-medium">{{ quotaForm.year }}</span></div>
        </div>
      </div>

      <div class="flex gap-3 justify-center">
        <button @click="resetAll" class="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 font-medium transition-colors">
          Daftarkan Client Lain
        </button>
        <router-link to="/clients" class="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors">
          Lihat Daftar Client
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { createClient } from '../api/clients'
import { createUser } from '../api/users'
import { createClientQuota } from '../api/quotas'
import { Check } from 'lucide-vue-next'

const steps = [
  { title: 'Data Perusahaan', subtitle: 'Info client' },
  { title: 'Buat User', subtitle: 'Akun login' },
  { title: 'Atur Kuota', subtitle: 'PM & CM' },
]

const currentStep = ref(0)
const error = ref('')
const submitting = ref(false)
const createdClient = ref(null)
const createdUsers = ref([])

const clientForm = reactive({ companyName: '', contactPersonName: '', contactPersonEmail: '', contactPersonPhone: '' })
const userForm = reactive({ name: '', email: '', password: '', phone: '' })
const quotaForm = reactive({ year: new Date().getFullYear(), pmQuota: 0, cmQuota: 0 })

function goToStep(step) {
  error.value = ''
  currentStep.value = step
}

async function handleCreateClient() {
  error.value = ''
  submitting.value = true
  try {
    const res = await createClient(clientForm)
    createdClient.value = res.data
    currentStep.value = 1
  } catch (err) {
    error.value = err.response?.data?.message || 'Gagal membuat client. Pastikan semua field terisi.'
  } finally {
    submitting.value = false
  }
}

async function handleCreateUser() {
  if (!userForm.name || !userForm.email || !userForm.password || !userForm.phone) {
    error.value = 'Semua field harus diisi'
    return
  }
  error.value = ''
  submitting.value = true
  try {
    const payload = {
      name: userForm.name,
      email: userForm.email,
      password: userForm.password,
      phone: userForm.phone,
      role: 'USER',
      clientId: createdClient.value.id,
    }
    const res = await createUser(payload)
    createdUsers.value.push(res.data)
    // Reset user form for next user
    Object.assign(userForm, { name: '', email: '', password: '', phone: '' })
  } catch (err) {
    error.value = err.response?.data?.message || 'Gagal membuat user. Pastikan email belum terdaftar.'
  } finally {
    submitting.value = false
  }
}

async function handleCreateQuota() {
  error.value = ''
  submitting.value = true
  try {
    await createClientQuota({
      clientId: createdClient.value.id,
      year: quotaForm.year,
      pmQuota: quotaForm.pmQuota,
      cmQuota: quotaForm.cmQuota,
    })
    currentStep.value = 3
  } catch (err) {
    error.value = err.response?.data?.message || 'Gagal menyimpan kuota.'
  } finally {
    submitting.value = false
  }
}

function resetAll() {
  currentStep.value = 0
  createdClient.value = null
  createdUsers.value = []
  Object.assign(clientForm, { companyName: '', contactPersonName: '', contactPersonEmail: '', contactPersonPhone: '' })
  Object.assign(userForm, { name: '', email: '', password: '', phone: '' })
  Object.assign(quotaForm, { year: new Date().getFullYear(), pmQuota: 0, cmQuota: 0 })
  error.value = ''
}
</script>
