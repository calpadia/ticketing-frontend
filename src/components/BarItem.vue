<template>
  <div class="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
    <span class="text-sm font-bold text-gray-700 opacity-0 transition-opacity duration-700 delay-300" :class="{ 'opacity-100': mounted }">{{ value }}</span>
    <div class="w-full bg-gray-100 rounded-t-lg relative overflow-hidden group-hover:bg-gray-200 transition-colors" style="height: 140px">
      <div :class="['absolute bottom-0 w-full rounded-t-lg transition-all duration-1000 ease-out', color]" :style="{ height: mounted ? targetHeight + '%' : '0%' }"></div>
    </div>
    <span class="text-xs text-gray-500 text-center font-medium">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
const props = defineProps({ label: String, value: Number, max: Number, color: String })
const targetHeight = computed(() => props.max > 0 ? Math.max((props.value / props.max) * 100, 5) : 5)
const mounted = ref(false)
onMounted(() => {
  setTimeout(() => { mounted.value = true }, 50)
})
</script>
