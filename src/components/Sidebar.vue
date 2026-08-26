<template>
  <aside :class="[
    'bg-gray-900 text-white h-screen flex flex-col shrink-0 overflow-hidden z-50',
    'transition-all duration-300 ease-in-out',
    collapsed ? 'w-14' : 'w-56',
    'fixed lg:static',
    mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
  ]">
    <!-- Header -->
    <div class="flex items-center justify-between px-3 py-3 shrink-0">
      <h1 v-if="!collapsed" class="text-sm font-bold whitespace-nowrap overflow-hidden">
        <span class="text-white">SYNODIC</span>
        <span class="text-blue-400 ml-1">SUPPORT</span>
      </h1>
      <div v-if="collapsed" class="w-full flex justify-center">
        <span class="text-blue-400 font-bold text-sm">S</span>
      </div>
      <!-- Toggle collapse (desktop) / close (mobile) -->
      <button
        @click="collapsed ? expand() : collapse()"
        class="hidden lg:flex p-1 rounded hover:bg-gray-800 text-gray-400 shrink-0"
        v-tooltip="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <PanelLeftClose v-if="!collapsed" class="w-4 h-4" />
        <PanelLeftOpen v-else class="w-4 h-4" />
      </button>
      <button @click="$emit('close')" class="lg:hidden p-1 rounded hover:bg-gray-800 text-gray-400">
        <X class="w-4 h-4" />
      </button>
    </div>

    <p v-if="!collapsed" class="text-[10px] text-gray-500 px-3 -mt-2 mb-3 whitespace-nowrap overflow-hidden">
      Internal Ticketing Management
    </p>
    <div v-else class="mb-3"></div>

    <!-- Nav -->
    <nav class="flex flex-col gap-0.5 flex-1 px-2 overflow-hidden">
      <template v-for="item in visibleNavItems" :key="item.to">
        <router-link
          :to="item.to"
          @click="$emit('close')"
          v-tooltip="collapsed ? item.label : ''"
          :class="[
            'flex items-center rounded-xl transition-colors text-[13px] relative group',
            collapsed ? 'justify-center px-2 py-2' : 'gap-2.5 px-2.5 py-2',
            isActive(item.to)
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          ]"
        >
          <component :is="item.icon" class="w-4 h-4 shrink-0" />
          <span v-if="!collapsed" class="font-medium flex-1 whitespace-nowrap overflow-hidden">{{ item.label }}</span>
          <!-- Badges -->
          <span v-if="!collapsed && item.to === '/tickets' && newTicketCount > 0" class="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {{ newTicketCount > 99 ? '99+' : newTicketCount }}
          </span>
          <span v-if="collapsed && item.to === '/tickets' && newTicketCount > 0" class="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </router-link>
      </template>

      <!-- Client Management (ADMIN only) -->
      <div v-if="user?.role === 'ADMIN'">
        <router-link
          to="/client-management"
          @click="!collapsed && (clientMenuOpen = true); $emit('close')"
          v-tooltip="collapsed ? 'Client Management' : ''"
          :class="[
            'flex items-center rounded-xl transition-colors w-full text-[13px] relative group',
            collapsed ? 'justify-center px-2 py-2' : 'gap-2.5 px-2.5 py-2',
            isClientSectionActive
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          ]"
        >
          <Building2 class="w-4 h-4 shrink-0" />
          <span v-if="!collapsed" class="font-medium flex-1 text-left whitespace-nowrap overflow-hidden">Client Management</span>
          <button v-if="!collapsed" @click.prevent.stop="clientMenuOpen = !clientMenuOpen" class="p-1 hover:bg-white/10 rounded-full transition-colors">
            <ChevronDown :class="['w-3.5 h-3.5 transition-transform shrink-0', clientMenuOpen ? 'rotate-180' : '']" />
          </button>
        </router-link>
        <!-- Sub items - only show when expanded -->
        <div v-show="clientMenuOpen && !collapsed" class="ml-3 mt-0.5 flex flex-col gap-0.5 border-l border-gray-700 pl-2.5">
          <router-link
            v-for="sub in clientSubItems"
            :key="sub.to"
            :to="sub.to"
            @click="$emit('close')"
            :class="[
              'flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs transition-colors',
              isActive(sub.to)
                ? 'bg-blue-600/80 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            ]"
          >
            <component :is="sub.icon" class="w-3.5 h-3.5 shrink-0" />
            <span class="whitespace-nowrap overflow-hidden">{{ sub.label }}</span>
          </router-link>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import { LayoutDashboard, Ticket, Building2, ClipboardList, Users, FileBarChart, BookOpen, MessageCircle, UserPlus, ChevronDown, FolderKanban, X, PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next'

const props = defineProps({
  mobileOpen: { type: Boolean, default: false }
})
defineEmits(['close', 'collapse-change'])

const auth = useAuthStore()
const notifications = useNotificationStore()
const route = useRoute()
const router = useRouter()
const user = computed(() => auth.user)
const totalUnread = computed(() => notifications.totalUnread)
const newTicketCount = computed(() => notifications.newTicketCount)

const collapsed = ref(false)
const clientMenuOpen = ref(true)

function collapse() {
  collapsed.value = true
  clientMenuOpen.value = false
}

function expand() {
  collapsed.value = false
}

const allNavItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SUPPORT', 'TECHNICAL_SUPPORT', 'USER'] },
  { to: '/tickets', label: 'Tickets', icon: Ticket, roles: ['ADMIN', 'SUPPORT', 'TECHNICAL_SUPPORT', 'USER'] },
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
  route.path === '/client-management' || clientSubItems.some(sub => route.path === sub.to || route.path.startsWith(sub.to + '/'))
)

function isActive(to) {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(to + '/')
}
</script>
