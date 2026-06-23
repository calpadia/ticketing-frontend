<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden flex flex-col justify-center min-h-[120px] transition-shadow hover:shadow-md">
    <div :class="['absolute left-0 top-4 bottom-4 w-1.5 rounded-r-full', accentColors[color] || 'bg-gray-400']"></div>
    <p class="text-xs text-gray-500 font-bold uppercase tracking-wide ml-3">{{ title }}</p>
    <p class="text-3xl lg:text-4xl font-bold text-gray-900 mt-2 ml-3">{{ value }}</p>
  </div>
</template>

<script setup>
defineProps({ title: String, value: [Number, String], color: String })
const accentColors = {
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  indigo: 'bg-indigo-500',
  green: 'bg-[#10b981]',
  red: 'bg-[#e02424]',
  orange: 'bg-[#f97316]'
}
</script>
