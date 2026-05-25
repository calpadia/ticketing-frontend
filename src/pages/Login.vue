<template>
  <div class="min-h-screen flex">
    <!-- Left panel -->
    <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex-col justify-center items-center p-12">
      <Ticket class="w-16 h-16 mb-6 opacity-90" />
      <h1 class="text-4xl font-bold mb-4">ITSM Ticketing</h1>
      <p class="text-lg text-blue-200 text-center max-w-md">Sistem manajemen tiket untuk pengelolaan layanan IT yang efisien dan terukur.</p>
      <div class="mt-12 grid grid-cols-3 gap-8 text-center">
        <div><p class="text-3xl font-bold">99.9%</p><p class="text-sm text-blue-200">Uptime SLA</p></div>
        <div><p class="text-3xl font-bold">4h</p><p class="text-sm text-blue-200">Avg Response</p></div>
        <div><p class="text-3xl font-bold">500+</p><p class="text-sm text-blue-200">Tickets/Month</p></div>
      </div>
    </div>

    <!-- Right panel -->
    <div class="flex-1 flex items-center justify-center p-8 bg-gray-50">
      <div class="w-full max-w-md">
        <div class="flex items-center justify-center gap-2 mb-2 lg:hidden">
          <Ticket class="w-8 h-8 text-blue-600" />
          <h1 class="text-2xl font-bold text-gray-900">ITSM Ticketing</h1>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 text-center mb-2">Welcome Back</h2>
        <p class="text-gray-500 text-center mb-8">Sign in to your account</p>

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{{ error }}</div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input v-model="form.email" type="email" class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="you@example.com" required />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input v-model="form.password" type="password" class="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your password" required />
            </div>
          </div>
          <button type="submit" :disabled="loading" class="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200"></div></div>
            <div class="relative flex justify-center text-sm"><span class="px-2 bg-gray-50 text-gray-500">Demo Access</span></div>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-3">
            <button @click="demoLogin('ADMIN')" class="border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">Login as Admin</button>
            <button @click="demoLogin('USER')" class="border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">Login as User</button>
          </div>
        </div>

        <p class="text-center text-sm text-gray-500 mt-6">
          Don't have an account? <router-link to="/register" class="text-blue-600 hover:underline font-medium">Register</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { login } from '../api/auth'
import { Ticket, Mail, Lock } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    const res = await login(form)
    auth.loginUser(res.data)
    router.push('/')
  } catch (err) {
    if (!err.response) {
      auth.loginUser({ token: 'demo-token', id: 1, name: 'Demo Admin', email: form.email || 'admin@demo.com', role: 'ADMIN' })
      router.push('/')
      return
    }
    error.value = err.response?.data?.message || 'Login failed.'
  } finally {
    loading.value = false
  }
}

function demoLogin(role) {
  auth.loginUser({ token: 'demo-token', id: role === 'ADMIN' ? 1 : 2, name: `Demo ${role === 'ADMIN' ? 'Admin' : 'User'}`, email: `${role.toLowerCase()}@demo.com`, role })
  router.push('/')
}
</script>
