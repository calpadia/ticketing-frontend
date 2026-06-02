import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])
  let nextId = 0

  function show(message, type = 'info', duration = 5000) {
    const id = nextId++
    toasts.value.push({ id, message, type })
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
  }

  function remove(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function error(message) { show(message, 'error') }
  function warning(message) { show(message, 'warning') }
  function success(message) { show(message, 'success') }
  function info(message) { show(message, 'info') }

  return { toasts, show, remove, error, warning, success, info }
})
