<template>
  <div class="max-w-4xl mx-auto py-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Profil Saya</h1>
      <p class="text-sm text-gray-500 mt-1">Informasi detail mengenai akun Anda saat ini.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Avatar Card -->
      <div class="md:col-span-1">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center transition-all hover:shadow-md">
          <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-3xl mb-4 shadow-inner ring-4 ring-white">
            {{ user?.name?.charAt(0)?.toUpperCase() || 'U' }}
          </div>
          <h2 class="text-lg font-bold text-gray-900">{{ user?.name || 'User Name' }}</h2>
          <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {{ user?.role || 'ROLE' }}
          </span>
        </div>
      </div>

      <!-- Info Card -->
      <div class="md:col-span-2">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
          <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 class="font-bold text-gray-900 flex items-center gap-2">
              <UserIcon class="w-4 h-4 text-gray-400" />
              Informasi Pribadi
            </h3>
          </div>
          <div class="p-6 space-y-6">
            
            <!-- Name -->
            <div class="flex items-start gap-4">
              <div class="mt-1 p-2 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 shadow-sm">
                <UserIcon class="w-5 h-5" />
              </div>
              <div class="flex-1">
                <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Lengkap</label>
                <div class="text-sm font-medium text-gray-900">{{ user?.name || '-' }}</div>
              </div>
            </div>

            <hr class="border-gray-100" />

            <!-- Email -->
            <div class="flex items-start gap-4">
              <div class="mt-1 p-2 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 shadow-sm">
                <Mail class="w-5 h-5" />
              </div>
              <div class="flex-1">
                <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Alamat Email</label>
                <div class="text-sm font-medium text-gray-900">{{ user?.email || '-' }}</div>
              </div>
            </div>

            <hr class="border-gray-100" />

            <!-- Role -->
            <div class="flex items-start gap-4">
              <div class="mt-1 p-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-500 shadow-sm">
                <Shield class="w-5 h-5" />
              </div>
              <div class="flex-1">
                <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Hak Akses (Role)</label>
                <div class="text-sm font-medium text-gray-900">{{ user?.role || '-' }}</div>
              </div>
            </div>

            <hr class="border-gray-100" />

            <!-- Phone -->
            <div class="flex items-start gap-4">
              <div class="mt-1 p-2 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 shadow-sm">
                <Phone class="w-5 h-5" />
              </div>
              <div class="flex-1">
                <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nomor Telepon</label>
                <div class="text-sm font-medium text-gray-900">{{ user?.phone || '-' }}</div>
              </div>
            </div>

            <template v-if="user?.clientName">
              <hr class="border-gray-100" />

              <!-- Client -->
              <div class="flex items-start gap-4">
                <div class="mt-1 p-2 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 shadow-sm">
                  <Building2 class="w-5 h-5" />
                </div>
                <div class="flex-1">
                  <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Perusahaan (Klien)</label>
                  <div class="text-sm font-medium text-gray-900">{{ user.clientName }}</div>
                </div>
              </div>
            </template>

          </div>
          
          <!-- Footer / Notice -->
          <div class="px-6 py-4 bg-yellow-50 border-t border-yellow-100 flex items-start gap-3">
            <Info class="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <p class="text-xs text-yellow-700 leading-relaxed">
              Saat ini data profil bersifat <strong>read-only</strong>. Jika Anda membutuhkan perubahan pada Nama, Email, atau Role, silakan hubungi <strong>Administrator</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { User as UserIcon, Mail, Shield, Info, Phone, Building2 } from 'lucide-vue-next'

const auth = useAuthStore()
const user = computed(() => auth.user)
</script>
