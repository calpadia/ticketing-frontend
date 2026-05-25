<template>
  <div class="flex h-screen bg-gray-100">
    <Sidebar />
    <main class="flex-1 p-6 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import Sidebar from './Sidebar.vue'
import { useGlobalChat } from '../composables/useGlobalChat'

const { connect, disconnect } = useGlobalChat()

onMounted(() => {
  connect()
})

onUnmounted(() => {
  disconnect()
})
</script>
