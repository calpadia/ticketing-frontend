<template>
  <div :class="['rounded-xl border p-5', colors[color]]">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium opacity-80">{{ title }}</p>
        <p class="text-3xl font-bold mt-1">{{ value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ title: String, value: [Number, String], color: String })
const colors = {
  blue: 'bg-blue-50 border-blue-100 text-blue-700',
  yellow: 'bg-yellow-50 border-yellow-100 text-yellow-700',
  indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700',
  green: 'bg-green-50 border-green-100 text-green-700',
  red: 'bg-red-50 border-red-100 text-red-700',
}
</script>
