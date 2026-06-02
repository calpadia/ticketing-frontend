<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Mobile overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden" @click="sidebarOpen = false"></div>

    <!-- Sidebar -->
    <Sidebar :mobile-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Mobile header -->
      <header class="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <button @click="sidebarOpen = true" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600">
          <Menu class="w-5 h-5" />
        </button>
        <h1 class="text-sm font-bold">
          <span class="text-gray-800">SYNODIC</span>
          <span class="text-blue-500 ml-1">SUPPORT</span>
        </h1>
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
import Sidebar from './Sidebar.vue'
import { useGlobalChat } from '../composables/useGlobalChat'
import { useToastStore } from '../stores/toast'
import { Menu } from 'lucide-vue-next'

const sidebarOpen = ref(false)
const { connect, disconnect } = useGlobalChat()
const toastStore = useToastStore()
const toasts = computed(() => toastStore.toasts)

onMounted(() => {
  connect()
})

onUnmounted(() => {
  disconnect()
})
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
