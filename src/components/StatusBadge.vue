<template>
  <span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium border', styles[status] || 'bg-gray-100']">
    {{ status?.replace('_', ' ') }}
  </span>
</template>

<script setup>
defineProps({ status: String })
const styles = {
  OPEN: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 border-blue-200',
  RESOLVED: 'bg-green-100 text-green-800 border-green-200',
  CLOSED: 'bg-gray-100 text-gray-600 border-gray-200',
}
</script>
