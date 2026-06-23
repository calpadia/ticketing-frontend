<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Mobile overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden" @click="sidebarOpen = false"></div>

    <!-- Sidebar -->
    <Sidebar :mobile-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top Header -->
      <header class="bg-white border-b border-gray-200 shrink-0 px-4 py-3 lg:px-6 flex items-center justify-between shadow-sm z-10">
        <div class="flex items-center gap-4 flex-1">
          <button @click="sidebarOpen = true" class="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
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
              @focus="initSearchData"
              @keyup.enter="handleGlobalSearch"
              type="text" 
              placeholder="Cari Tiket, Klien, atau User..." 
              class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
            />

            <!-- Omnibar Popup -->
            <div v-if="showSearchPopup && globalSearchQuery.length > 0" class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-[70vh] flex flex-col">
              <div class="overflow-y-auto p-2">
                
                <!-- Tickets Section -->
                <div v-if="filteredTickets.length > 0" class="mb-2">
                  <h3 class="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1.5">Tickets</h3>
                  <ul>
                    <li v-for="t in filteredTickets.slice(0, 5)" :key="t.id">
                      <a @click.prevent="goTo(`/tickets/${t.id}`)" href="#" class="flex flex-col px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer group">
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
                      <a @click.prevent="goTo(`/clients/${c.id}`)" href="#" class="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer group">
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
                      <a @click.prevent="goTo(`/users`)" href="#" class="flex flex-col px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer group">
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
        
        <!-- Mobile Search Toggle or Other Header Actions can go here -->
      </header>

      <main class="flex-1 p-4 lg:p-6 overflow-y-auto bg-gray-100">
        <router-view />
      </main>
    </div>

    <!-- Global Toast Notifications -->
    <div class="fixed top-4 right-4 z-[100] space-y-2">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg max-w-sm',
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import { useGlobalChat } from '../composables/useGlobalChat'
import { useToastStore } from '../stores/toast'
import { useAuthStore } from '../stores/auth'
import { Menu, Search, Building2 } from 'lucide-vue-next'
import { getTickets } from '../api/tickets'
import { getClients } from '../api/clients'
import { getUsers } from '../api/users'

const router = useRouter()
const auth = useAuthStore()

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

const sidebarOpen = ref(false)
const { connect, disconnect } = useGlobalChat()
const toastStore = useToastStore()
const toasts = computed(() => toastStore.toasts)

onMounted(() => {
  connect()
  document.addEventListener('click', handleClickOutside)
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
