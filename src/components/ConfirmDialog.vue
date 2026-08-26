<template>
  <transition name="modal">
    <div v-if="visible" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity" @click="cancel">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" @click.stop>
        <div class="p-6 sm:p-8">
          <div class="flex gap-4">
            <!-- Icon based on color type -->
            <div :class="[
              'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
              confirmColor === 'blue' ? 'bg-blue-100' : 'bg-red-100'
            ]">
              <component :is="confirmColor === 'blue' ? HelpCircle : AlertTriangle" 
                         :class="['w-6 h-6', confirmColor === 'blue' ? 'text-blue-600' : 'text-red-600']" />
            </div>
            
            <div class="mt-1">
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ title }}</h3>
              <p class="text-sm text-gray-600 leading-relaxed">{{ message }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-gray-50/50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
          <button @click="cancel" class="px-5 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
            Batal
          </button>
          <button @click="confirm" :class="[
            'px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2', 
            confirmColor === 'blue' ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20' : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-md hover:shadow-red-600/20'
          ]">
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'
import { AlertTriangle, HelpCircle } from 'lucide-vue-next'

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

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active > div {
  animation: modal-pop 0.3s ease-out;
}
@keyframes modal-pop {
  0% { opacity: 0; transform: scale(0.95) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
</style>

