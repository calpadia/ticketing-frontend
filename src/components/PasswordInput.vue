<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">{{ label }} {{ required ? '*' : '' }}</label>
    <div class="relative">
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :type="showPassword ? 'text' : 'password'"
        class="w-full bg-gray-50/50 border border-gray-200 text-gray-900 rounded-xl px-4 pr-11 py-3 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        :placeholder="placeholder"
        :required="required"
      />
      <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        <EyeOff v-if="showPassword" class="w-4 h-4" />
        <Eye v-else class="w-4 h-4" />
      </button>
    </div>
    <!-- Policy indicators -->
    <div v-if="modelValue && showPolicy" class="mt-2 space-y-1">
      <div v-for="rule in validation.rules" :key="rule.label" class="flex items-center gap-2">
        <div :class="['w-3.5 h-3.5 rounded-full flex items-center justify-center', rule.test ? 'bg-green-500' : 'bg-gray-300']">
          <svg v-if="rule.test" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <span :class="['text-xs', rule.test ? 'text-green-700' : 'text-gray-500']">{{ rule.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import { validatePassword } from '../utils/passwordPolicy'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'Password' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  showPolicy: { type: Boolean, default: true },
})

defineEmits(['update:modelValue'])

const showPassword = ref(false)
const validation = computed(() => validatePassword(props.modelValue))
</script>
