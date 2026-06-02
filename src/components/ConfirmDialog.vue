<template>
  <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="cancel">
    <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" @click.stop>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
      <p class="text-sm text-gray-600 mb-6">{{ message }}</p>
      <div class="flex gap-3 justify-end">
        <button @click="cancel" class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Batal
        </button>
        <button @click="confirm" :class="['px-4 py-2 rounded-lg text-sm font-medium transition-colors', confirmColor === 'blue' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-red-600 text-white hover:bg-red-700']">
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const title = ref('')
const message = ref('')
const confirmLabel = ref('Hapus')
const confirmColor = ref('red')
let resolvePromise = null

function open(opts = {}) {
  title.value = opts.title || 'Konfirmasi'
  message.value = opts.message || 'Apakah kamu yakin?'
  confirmLabel.value = opts.confirmLabel || 'Hapus'
  confirmColor.value = opts.confirmColor || 'red'
  visible.value = true
  return new Promise((resolve) => { resolvePromise = resolve })
}

function confirm() {
  visible.value = false
  if (resolvePromise) resolvePromise(true)
}

function cancel() {
  visible.value = false
  if (resolvePromise) resolvePromise(false)
}

defineExpose({ open })
</script>
