<template>
  <aside :class="[
    'bg-gray-900 text-white h-screen p-3 flex flex-col shrink-0 overflow-hidden transition-transform duration-300 z-50',
    'w-56',
    'fixed lg:static',
    mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
  ]">
    <div class="flex items-center justify-between mb-5 px-2">
      <h1 class="text-sm font-bold">
        <span class="text-white">SYNODIC</span>
        <span class="text-blue-400 ml-1">SUPPORT</span>
      </h1>
      <button @click="$emit('close')" class="lg:hidden p-1 rounded hover:bg-gray-800 text-gray-400">
        <X class="w-4 h-4" />
      </button>
    </div>
    <p class="text-[10px] text-gray-500 px-2 -mt-4 mb-4">Internal Ticketing Management</p>

    <nav class="flex flex-col gap-0.5 flex-1">
      <!-- Regular nav items -->
      <template v-for="item in visibleNavItems" :key="item.to">
        <router-link
          :to="item.to"
          @click="$emit('close')"
          :class="[
            'flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-[13px]',
            isActive(item.to)
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          ]"
        >
          <component :is="item.icon" class="w-4 h-4" />
          <span class="font-medium flex-1">{{ item.label }}</span>
          <span v-if="item.to === '/chat' && totalUnread > 0" class="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {{ totalUnread > 99 ? '99+' : totalUnread }}
          </span>
          <span v-if="item.to === '/tickets' && newTicketCount > 0" class="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {{ newTicketCount > 99 ? '99+' : newTicketCount }}
          </span>
        </router-link>
      </template>

      <!-- Client Management dropdown (ADMIN only) -->
      <div v-if="user?.role === 'ADMIN'">
        <button
          @click="clientMenuOpen = !clientMenuOpen"
          :class="[
            'flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors w-full text-[13px]',
            isClientSectionActive
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          ]"
        >
          <Building2 class="w-4 h-4" />
          <span class="font-medium flex-1 text-left">Client Management</span>
          <ChevronDown :class="['w-3.5 h-3.5 transition-transform', clientMenuOpen ? 'rotate-180' : '']" />
        </button>
        <div v-show="clientMenuOpen" class="ml-3 mt-0.5 flex flex-col gap-0.5 border-l border-gray-700 pl-2.5">
          <router-link
            v-for="sub in clientSubItems"
            :key="sub.to"
            :to="sub.to"
            @click="$emit('close')"
            :class="[
              'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors',
              isActive(sub.to)
                ? 'bg-blue-600/80 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            ]"
          >
            <component :is="sub.icon" class="w-3.5 h-3.5" />
            <span>{{ sub.label }}</span>
          </router-link>
        </div>
      </div>
    </nav>

    <div class="border-t border-gray-700 pt-3 mt-3">
      <div class="px-2.5 mb-2">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-xs">
            {{ user?.name?.charAt(0)?.toUpperCase() || 'U' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium truncate">{{ user?.name }}</p>
            <p class="text-[10px] text-gray-400 truncate">{{ user?.email }}</p>
          </div>
        </div>
        <span class="inline-block mt-1.5 px-1.5 py-0.5 rounded text-[10px] bg-blue-600/20 text-blue-300 border border-blue-600/30">
          {{ user?.role }}
        </span>
      </div>
      <button
        @click="handleLogout"
        class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-300 hover:bg-red-600/20 hover:text-red-300 transition-colors w-full text-[13px]"
      >
        <LogOut class="w-4 h-4" />
        <span class="font-medium">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import { LayoutDashboard, Ticket, Building2, ClipboardList, Users, FileBarChart, LogOut, BookOpen, MessageCircle, UserPlus, ChevronDown, FolderKanban, X } from 'lucide-vue-next'

defineProps({
  mobileOpen: { type: Boolean, default: false }
})
defineEmits(['close'])

const auth = useAuthStore()
const notifications = useNotificationStore()
const route = useRoute()
const router = useRouter()
const user = computed(() => auth.user)
const totalUnread = computed(() => notifications.totalUnread)
const newTicketCount = computed(() => notifications.newTicketCount)

const clientMenuOpen = ref(true)

const allNavItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SUPPORT', 'TECHNICAL_SUPPORT', 'USER'] },
  { to: '/tickets', label: 'Tickets', icon: Ticket, roles: ['ADMIN', 'SUPPORT', 'TECHNICAL_SUPPORT', 'USER'] },
  { to: '/chat', label: 'Chat', icon: MessageCircle, roles: ['ADMIN', 'SUPPORT', 'TECHNICAL_SUPPORT', 'USER'] },
  { to: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen, roles: ['ADMIN', 'SUPPORT', 'TECHNICAL_SUPPORT', 'USER'] },
  { to: '/users', label: 'Users', icon: Users, roles: ['ADMIN'] },
  { to: '/sla-report', label: 'SLA Report', icon: FileBarChart, roles: ['ADMIN'] },
]

const clientSubItems = [
  { to: '/clients', label: 'Clients', icon: Building2 },
  { to: '/client-onboarding', label: 'Client Onboarding', icon: UserPlus },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/service-catalog', label: 'Service & Quota', icon: ClipboardList },
]

const visibleNavItems = computed(() =>
  allNavItems.filter(item => item.roles.includes(user.value?.role))
)

const isClientSectionActive = computed(() =>
  clientSubItems.some(sub => route.path === sub.to || route.path.startsWith(sub.to + '/'))
)

function isActive(to) {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(to + '/')
}

function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>
