<template>
  <div>
    <div class="flex justify-between text-sm mb-1">
      <span class="font-medium text-gray-700">{{ label }}</span>
      <span :class="['font-medium', isOver ? 'text-red-600' : 'text-gray-600']">{{ used }}/{{ total }}</span>
    </div>
    <div :class="['h-2.5 rounded-full', bgColor]">
      <div :class="['h-full rounded-full transition-all', barColor]" :style="{ width: pct + '%' }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ label: String, used: Number, total: Number, color: String })
const pct = computed(() => props.total > 0 ? Math.min((props.used / props.total) * 100, 100) : 0)
const isOver = computed(() => props.used >= props.total)
const barColor = computed(() => isOver.value ? 'bg-red-500' : props.color === 'blue' ? 'bg-blue-500' : 'bg-orange-500')
const bgColor = computed(() => props.color === 'blue' ? 'bg-blue-100' : 'bg-orange-100')
</script>
