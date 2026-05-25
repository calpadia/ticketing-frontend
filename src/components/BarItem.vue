<template>
  <div class="flex-1 flex flex-col items-center gap-2">
    <span class="text-sm font-bold text-gray-700">{{ value }}</span>
    <div class="w-full bg-gray-100 rounded-t-lg relative" style="height: 140px">
      <div :class="['absolute bottom-0 w-full rounded-t-lg transition-all duration-500', color]" :style="{ height: height + '%' }"></div>
    </div>
    <span class="text-xs text-gray-500 text-center">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ label: String, value: Number, max: Number, color: String })
const height = computed(() => props.max > 0 ? Math.max((props.value / props.max) * 100, 5) : 5)
</script>
