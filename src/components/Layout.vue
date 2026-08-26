<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Mobile overlay -->
    <transition name="fade">
      <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden" @click="sidebarOpen = false"></div>
    </transition>

    <!-- Sidebar -->
    <Sidebar :mobile-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Header -->
      <header class="bg-white border-b border-gray-200 shrink-0 px-4 py-3 lg:px-6 flex items-center justify-between shadow-sm z-30">
        <div class="flex items-center gap-4 flex-1">
          <button @click="sidebarOpen = true" class="lg:hidden p-1.5 rounded-xl hover:bg-gray-100 text-gray-600">
            <Menu class="w-5 h-5" />
          </button>
          <h1 class="text-sm font-bold lg:hidden">
            <span class="text-gray-800">SYNODIC</span>
            <span class="text-blue-500 ml-1">SUPPORT</span>
          </h1>
          
          <!-- Global Search -->
          <div class="hidden lg:flex items-center max-w-md w-full relative" ref="searchContainer">
            <Search class="w-4 h-4 text-gray-400 absolute left-3.5" />
            <input 
              v-model="globalSearchQuery" 
              @focus="initSearchData(); closeSearchHint()"
              @keyup.enter="handleGlobalSearch"
              type="text" 
              placeholder="Cari Tiket, Klien, atau User..." 
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
            />

            <!-- Search Coachmark -->
            <transition enter-active-class="transition ease-out duration-500" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-300" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
              <div v-if="showSearchHint" class="absolute top-full left-4 mt-3 bg-blue-600 text-white text-[11px] font-medium px-3 py-2 rounded-xl shadow-xl z-50 whitespace-nowrap animate-bounce-slight pointer-events-none">
                <div class="absolute -top-1.5 left-4 w-3 h-3 bg-blue-600 transform rotate-45 rounded-sm"></div>
                Cari nomor tiket, klien, atau staf dengan cepat di sini!
              </div>
            </transition>

            <!-- Omnibar Popup -->
            <div v-if="showSearchPopup && globalSearchQuery.length > 0" class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-[70vh] flex flex-col">
              <div class="overflow-y-auto p-2">
                
                <!-- Tickets Section -->
                <div v-if="filteredTickets.length > 0" class="mb-2">
                  <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1.5">Tickets</h3>
                  <ul>
                    <li v-for="t in filteredTickets.slice(0, 5)" :key="t.id">
                      <a @click.prevent="goTo(`/tickets/${t.id}`)" href="#" class="flex flex-col px-3 py-2 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer group">
                        <div class="flex items-center justify-between">
                          <span class="font-medium text-sm text-gray-900 group-hover:text-blue-700">{{ t.ticketNumber }}</span>
                          <span class="text-[10px] px-1.5 py-0.5 rounded font-bold bg-gray-100 text-gray-600">{{ statusLabel(t.status) }}</span>
                        </div>
                        <span class="text-xs text-gray-500 truncate mt-0.5">{{ t.title }}</span>
                      </a>
                    </li>
                  </ul>
                </div>

                <!-- Clients Section -->
                <div v-if="auth.isAdmin && filteredClients.length > 0" class="mb-2">
                  <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1.5">Clients</h3>
                  <ul>
                    <li v-for="c in filteredClients.slice(0, 3)" :key="c.id">
                      <a @click.prevent="goTo(`/clients/${c.id}`)" href="#" class="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer group">
                        <div class="w-6 h-6 rounded bg-gray-100 flex items-center justify-center shrink-0"><Building2 class="w-3.5 h-3.5 text-gray-500" /></div>
                        <span class="font-medium text-sm text-gray-900 group-hover:text-blue-700 truncate">{{ c.companyName }}</span>
                      </a>
                    </li>
                  </ul>
                </div>
                
                <!-- Users Section -->
                <div v-if="auth.isAdmin && filteredUsers.length > 0" class="mb-2">
                  <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1.5">Users</h3>
                  <ul>
                    <li v-for="u in filteredUsers.slice(0, 3)" :key="u.id">
                      <a @click.prevent="goTo(`/users`)" href="#" class="flex flex-col px-3 py-2 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer group">
                        <span class="font-medium text-sm text-gray-900 group-hover:text-blue-700">{{ u.name }}</span>
                        <span class="text-xs text-gray-500">{{ u.email }} <span v-if="u.clientName">• {{ u.clientName }}</span></span>
                      </a>
                    </li>
                  </ul>
                </div>

                <!-- Empty State -->
                <div v-if="filteredTickets.length === 0 && (!auth.isAdmin || (filteredClients.length === 0 && filteredUsers.length === 0))" class="py-8 text-center text-gray-500 text-sm">
                  Tidak ada hasil untuk "{{ globalSearchQuery }}"
                </div>

              </div>
              <div class="bg-gray-50 p-2 border-t border-gray-100 text-xs text-gray-400 text-center">
                Tekan <kbd class="px-1.5 py-0.5 bg-white border border-gray-200 rounded shadow-sm text-gray-600 font-sans">Enter</kbd> untuk cari di halaman Tiket
              </div>
            </div>
          </div>
        </div>
        
        <!-- Header Actions (Right Side) -->
        <div class="flex items-center gap-3 lg:gap-4 ml-auto pl-4">
          <!-- Notification Bell -->
          <div class="relative">
            <button @click="notifDropdownOpen = !notifDropdownOpen; closeNotifHint()" class="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none">
              <Bell class="w-5 h-5" />
              <span v-if="totalNotifs > 0" class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            
            <!-- Notification Hint / Coachmark -->
            <transition enter-active-class="transition ease-out duration-500" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-300" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-2">
              <div v-if="showNotifHint" class="absolute top-full right-0 mt-3 bg-blue-600 text-white text-[11px] font-medium px-3 py-2 rounded-xl shadow-xl z-50 whitespace-nowrap animate-bounce-slight">
                <div class="absolute -top-1.5 right-3 w-3 h-3 bg-blue-600 transform rotate-45 rounded-sm"></div>
                Anda memiliki notifikasi
              </div>
            </transition>

            <!-- Notifications Dropdown -->
            <div v-if="notifDropdownOpen" class="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <div class="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                <span class="text-sm font-bold text-gray-900">Notifikasi</span>
                <span v-if="totalNotifs > 0" class="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{{ totalNotifs }} Baru</span>
              </div>
              <div class="p-2 flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
                <template v-if="totalNotifs === 0">
                  <div class="py-6 text-center text-gray-400 text-sm">
                    Tidak ada notifikasi baru
                  </div>
                </template>
                <template v-else>
                  <button v-if="notifications.newTicketCount > 0" @click="goTo('/tickets'); notifDropdownOpen = false" class="w-full text-left flex items-start gap-3 p-2.5 hover:bg-blue-50 rounded-xl transition-colors">
                    <div class="mt-0.5 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                      <Ticket class="w-4 h-4" />
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">Tiket Baru Masuk</p>
                      <p class="text-xs text-gray-500">Ada {{ notifications.newTicketCount }} tiket baru.</p>
                    </div>
                  </button>

                  <template v-if="notifications.unreadDetails && notifications.unreadDetails.length > 0">
                    <button v-for="notif in notifications.unreadDetails" :key="notif.ticketId" @click="goTo(`/tickets/${notif.ticketId}`); notifDropdownOpen = false" class="w-full text-left flex items-start gap-3 p-2.5 hover:bg-green-50 rounded-xl transition-colors border-t border-gray-50 first:border-0">
                      <div class="mt-0.5 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 text-green-600">
                        <MessageCircle class="w-4 h-4" />
                      </div>
                      <div class="flex-1 overflow-hidden">
                        <div class="flex justify-between items-center mb-0.5">
                          <p class="text-sm font-bold text-gray-900 truncate">{{ notif.ticketNumber }}</p>
                          <span class="text-[10px] text-gray-400 shrink-0 whitespace-nowrap ml-2">{{ formatTime(notif.createdAt) }}</span>
                        </div>
                        <p class="text-[11px] font-semibold text-green-700 truncate mb-0.5">{{ notif.senderName }}</p>
                        <p class="text-xs text-gray-500 truncate">{{ notif.messagePreview }}</p>
                      </div>
                    </button>
                  </template>
                  <template v-else-if="notifications.totalUnread > 0">
                    <button @click="goTo('/tickets'); notifDropdownOpen = false" class="w-full text-left flex items-start gap-3 p-2.5 hover:bg-green-50 rounded-xl transition-colors">
                      <div class="mt-0.5 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 text-green-600">
                        <MessageCircle class="w-4 h-4" />
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900">Pesan Baru Masuk</p>
                        <p class="text-xs text-gray-500">Ada {{ notifications.totalUnread }} pesan belum terbaca.</p>
                      </div>
                    </button>
                  </template>
                </template>
              </div>
            </div>
          </div>

          <!-- Divider -->
          <div class="hidden lg:block w-px h-6 bg-gray-200"></div>

          <!-- User Profile Dropdown -->
          <div class="relative">
            <button @click="profileDropdownOpen = !profileDropdownOpen" class="flex items-center gap-2 hover:bg-gray-50 rounded-xl p-1 pr-2 transition-colors">
              <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                {{ auth.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'U' }}
              </div>
              <div class="hidden lg:flex flex-col items-start">
                <span class="text-sm font-medium text-gray-700 leading-none">{{ auth.user?.name || 'User' }}</span>
                <span class="text-[10px] text-gray-500 font-medium uppercase mt-1">{{ auth.user?.role || 'Role' }}</span>
              </div>
              <ChevronDown class="w-4 h-4 text-gray-400 hidden lg:block" />
            </button>

            <!-- Dropdown Menu -->
            <div v-if="profileDropdownOpen" class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <div class="p-3 border-b border-gray-50 lg:hidden">
                <span class="block text-sm font-medium text-gray-900">{{ auth.user?.name || 'User' }}</span>
                <span class="block text-xs text-gray-500">{{ auth.user?.email || 'email@example.com' }}</span>
              </div>
              <div class="p-1">
                <button @click="goTo('/profile')" class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                  <User class="w-4 h-4 text-gray-400" />
                  Profil Saya
                </button>
              </div>
              <div class="p-1 border-t border-gray-50">
                <button @click="logout" class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                  <LogOut class="w-4 h-4 text-red-400" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 p-4 lg:p-6 overflow-y-auto bg-gray-100">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="$route.fullPath" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- Global Toast Notifications -->
    <div class="fixed top-4 right-4 z-[100] space-y-2">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg max-w-sm backdrop-blur-sm bg-opacity-95',
            toast.type === 'error' ? 'bg-red-600 text-white' :
            toast.type === 'warning' ? 'bg-yellow-500 text-white' :
            toast.type === 'success' ? 'bg-green-600 text-white' :
            'bg-gray-800 text-white'
          ]"
        >
          <p class="text-sm flex-1">{{ toast.message }}</p>
          <button @click="toastStore.remove(toast.id)" class="text-white/70 hover:text-white shrink-0 text-lg leading-none">&times;</button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import { useGlobalChat } from '../composables/useGlobalChat'
import { useToastStore } from '../stores/toast'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'
import { Menu, Search, Building2, Bell, ChevronDown, User, Settings, LogOut, Ticket, MessageCircle } from 'lucide-vue-next'
import { getTickets } from '../api/tickets'
import { getClients } from '../api/clients'
import { getUsers } from '../api/users'

const router = useRouter()
const auth = useAuthStore()
const notifications = useNotificationStore()

const profileDropdownOpen = ref(false)
const notifDropdownOpen = ref(false)
const totalNotifs = computed(() => notifications.newTicketCount + notifications.totalUnread)

const showNotifHint = ref(false)
let hintTimeout = null

watch(totalNotifs, (newVal) => {
  if (newVal > 0 && !sessionStorage.getItem('notifHintShown')) {
    showNotifHint.value = true
    sessionStorage.setItem('notifHintShown', 'true')
    hintTimeout = setTimeout(() => {
      showNotifHint.value = false
    }, 7000)
  }
}, { immediate: true })

function closeNotifHint() {
  showNotifHint.value = false
  if (hintTimeout) clearTimeout(hintTimeout)
}

const globalSearchQuery = ref('')
const showSearchPopup = ref(false)
const searchContainer = ref(null)
const searchDataLoaded = ref(false)

const searchTickets = ref([])
const searchClients = ref([])
const searchUsers = ref([])

function statusLabel(status) {
  const map = { OPEN: 'Open', IN_PROGRESS: 'Diproses', RESOLVED: 'Resolved', CLOSED: 'Selesai' }
  return map[status] || status
}

function formatTime(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const now = new Date()
  const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  if (isToday) {
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

async function initSearchData() {
  showSearchPopup.value = true
  if (searchDataLoaded.value) return
  
  try {
    searchTickets.value = (await getTickets()).data
    if (auth.isAdmin) {
      searchClients.value = (await getClients()).data
      searchUsers.value = (await getUsers()).data
    }
    searchDataLoaded.value = true
  } catch (e) {
    console.error('Failed to load search data', e)
  }
}

const filteredTickets = computed(() => {
  const q = globalSearchQuery.value.toLowerCase()
  if (!q) return []
  return searchTickets.value.filter(t => 
    t.ticketNumber?.toLowerCase().includes(q) || 
    t.title?.toLowerCase().includes(q)
  )
})

const filteredClients = computed(() => {
  const q = globalSearchQuery.value.toLowerCase()
  if (!q) return []
  return searchClients.value.filter(c => 
    c.companyName?.toLowerCase().includes(q) || 
    c.companyCode?.toLowerCase().includes(q)
  )
})

const filteredUsers = computed(() => {
  const q = globalSearchQuery.value.toLowerCase()
  if (!q) return []
  return searchUsers.value.filter(u => 
    u.name?.toLowerCase().includes(q) || 
    u.email?.toLowerCase().includes(q) ||
    u.clientName?.toLowerCase().includes(q)
  )
})

function goTo(path) {
  showSearchPopup.value = false
  globalSearchQuery.value = ''
  router.push(path)
}

function handleGlobalSearch() {
  if (globalSearchQuery.value.trim()) {
    showSearchPopup.value = false
    router.push({ path: '/tickets', query: { search: globalSearchQuery.value.trim() } })
  }
}

function logout() {
  auth.logout()
  router.push('/login')
}

const sidebarOpen = ref(false)
const { connect, disconnect } = useGlobalChat()
const toastStore = useToastStore()
const toasts = computed(() => toastStore.toasts)

const showSearchHint = ref(false)
let searchHintTimeout = null

function closeSearchHint() {
  showSearchHint.value = false
  if (searchHintTimeout) clearTimeout(searchHintTimeout)
}

onMounted(() => {
  connect()
  document.addEventListener('click', handleClickOutside)
  
  if (!sessionStorage.getItem('searchHintShown')) {
    setTimeout(() => {
      showSearchHint.value = true
      sessionStorage.setItem('searchHintShown', 'true')
      searchHintTimeout = setTimeout(() => {
        showSearchHint.value = false
      }, 10000)
    }, 1000)
  }
})

onUnmounted(() => {
  disconnect()
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(e) {
  if (searchContainer.value && !searchContainer.value.contains(e.target)) {
    showSearchPopup.value = false
  }
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>

