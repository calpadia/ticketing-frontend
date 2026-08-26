<template>
  <router-view v-slot="{ Component }">
    <transition name="fade-app" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
