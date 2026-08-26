<template>
  <div class="min-h-screen flex">
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-700 to-purple-900 text-white flex-col justify-center items-center p-12">
      <Ticket class="w-16 h-16 mb-6 opacity-90" />
      <h1 class="text-4xl font-bold mb-4">Join ITSM</h1>
      <p class="text-lg text-indigo-200 text-center max-w-md">Bergabung untuk mengelola tiket layanan IT dengan lebih efisien.</p>
    </div>
    <div class="flex-1 flex items-center justify-center p-8 bg-gray-50">
      <div class="w-full max-w-md">
        <h2 class="text-2xl font-bold text-gray-900 text-center mb-2">Create Account</h2>
        <p class="text-gray-500 text-center mb-8">Fill in your details to get started</p>
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{{ error }}</div>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input v-model="form.name" type="text" class="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Your full name" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="form.email" type="email" class="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="you@example.com" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input v-model="form.password" type="password" class="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Create a password" required />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select v-model="form.role" class="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input v-model="form.phone" type="tel" inputmode="numeric" pattern="[0-9]*" @input="form.phone = form.phone.replace(/\D/g, '')" class="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="08123456789" />
          </div>
          <button type="submit" :disabled="loading" class="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition-all hover:shadow-md hover:shadow-blue-600/20 disabled:opacity-50 font-medium">
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>
        <p class="text-center text-sm text-gray-500 mt-6">Already have an account? <router-link to="/login" class="text-blue-600 hover:underline font-medium">Sign In</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { register } from '../api/auth'
import { Ticket, ChevronDown } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const form = reactive({ name: '', email: '', password: '', role: 'USER', phone: '', clientId: '' })
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const res = await register(form)
    auth.loginUser(res.data)
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>
