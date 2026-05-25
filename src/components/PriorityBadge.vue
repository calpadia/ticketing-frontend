<template>
  <span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium border', styles[priority] || 'bg-gray-100']">
    {{ priority }}
  </span>
</template>

<script setup>
defineProps({ priority: String })
const styles = {
  L1: 'bg-red-100 text-red-800 border-red-200',
  L2: 'bg-orange-100 text-orange-800 border-orange-200',
  L3: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  L4: 'bg-gray-100 text-gray-600 border-gray-200',
}
</script>
