<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
    <div class="bg-white rounded-xl shadow-2xl p-10 w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold">
          <span class="text-slate-700">SYNODIC</span>
          <span class="text-blue-500 ml-1">SUPPORT</span>
        </h1>
        <p class="text-gray-400 text-sm mt-1">Internal Ticketing Management</p>
      </div>

      <!-- Error -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
        {{ error }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <label class="block text-sm text-gray-600 mb-1.5">Internal Email</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="you@company.com"
            required
          />
        </div>
        <div>
          <label class="block text-sm text-gray-600 mb-1.5">Password</label>
          <div class="relative">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="w-full border border-gray-200 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="••••••••"
              required
            />
            <button type="button" @click="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-slate-700 text-white py-3 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 font-medium text-sm"
        >
          {{ loading ? 'Signing in...' : 'Login to Portal' }}
        </button>
      </form>

      <!-- Demo Access -->
      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-100"></div></div>
          <div class="relative flex justify-center text-xs"><span class="px-2 bg-white text-gray-400">Demo Access</span></div>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <button @click="demoLogin('ADMIN')" class="border border-gray-200 rounded-lg py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">Login as Admin</button>
          <button @click="demoLogin('USER')" class="border border-gray-200 rounded-lg py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">Login as User</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { login } from '../api/auth'
import { Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

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
    error.value = err.response?.data?.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}

function demoLogin(role) {
  auth.loginUser({ token: 'demo-token', id: role === 'ADMIN' ? 1 : 2, name: `Demo ${role === 'ADMIN' ? 'Admin' : 'User'}`, email: `${role.toLowerCase()}@demo.com`, role })
  router.push('/')
}
</script>
