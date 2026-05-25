<template>
  <aside class="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
    <div class="flex items-center gap-2 mb-8 px-2">
      <Ticket class="w-6 h-6 text-blue-400" />
      <h1 class="text-xl font-bold">ITSM Ticketing</h1>
    </div>
    <nav class="flex flex-col gap-1 flex-1">
      <router-link
        v-for="item in visibleNavItems"
        :key="item.to"
        :to="item.to"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
          $route.path === item.to || (item.to !== '/' && $route.path.startsWith(item.to))
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        ]"
      >
        <component :is="item.icon" class="w-5 h-5" />
        <span class="font-medium flex-1">{{ item.label }}</span>
        <span v-if="item.to === '/chat' && totalUnread > 0" class="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {{ totalUnread > 99 ? '99+' : totalUnread }}
        </span>
      </router-link>
    </nav>

    <div class="border-t border-gray-700 pt-4 mt-4">
      <div class="px-3 mb-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
            {{ user?.name?.charAt(0)?.toUpperCase() || 'U' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ user?.name }}</p>
            <p class="text-xs text-gray-400 truncate">{{ user?.email }}</p>
          </div>
        </div>
        <span class="inline-block mt-2 px-2 py-0.5 rounded text-xs bg-blue-600/20 text-blue-300 border border-blue-600/30">
          {{ user?.role }}
        </span>
      </div>
      <button
        @click="handleLogout"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-red-600/20 hover:text-red-300 transition-colors w-full"
      >
        <LogOut class="w-5 h-5" />
        <span class="font-medium">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import { LayoutDashboard, Ticket, Building2, ClipboardList, Users, FileBarChart, LogOut, BookOpen, MessageCircle, UserPlus } from 'lucide-vue-next'

const auth = useAuthStore()
const notifications = useNotificationStore()
const router = useRouter()
const user = computed(() => auth.user)
const totalUnread = computed(() => notifications.totalUnread)

const allNavItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'USER'] },
  { to: '/tickets', label: 'Tickets', icon: Ticket, roles: ['ADMIN', 'USER'] },
  { to: '/chat', label: 'Chat', icon: MessageCircle, roles: ['ADMIN', 'USER'] },
  { to: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen, roles: ['ADMIN', 'USER'] },
  { to: '/clients', label: 'Clients', icon: Building2, roles: ['ADMIN'] },
  { to: '/client-onboarding', label: 'Client Onboarding', icon: UserPlus, roles: ['ADMIN'] },
  { to: '/quotas', label: 'Quotas', icon: ClipboardList, roles: ['ADMIN'] },
  { to: '/service-catalog', label: 'Service Catalog', icon: BookOpen, roles: ['ADMIN'] },
  { to: '/users', label: 'Users', icon: Users, roles: ['ADMIN'] },
  { to: '/sla-report', label: 'SLA Report', icon: FileBarChart, roles: ['ADMIN'] },
]

const visibleNavItems = computed(() =>
  allNavItems.filter(item => item.roles.includes(user.value?.role))
)

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>
