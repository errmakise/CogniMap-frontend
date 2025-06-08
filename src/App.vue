<script setup>
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import '@/assets/styles/reset.css'
import '@/assets/styles/variables.css'
import '@/assets/styles/global.css'

import Sidebar from './components/Sidebar.vue'

const route=useRoute()
const authStore = useAuthStore()
</script>

<template>
  <div class="app-container">
    <Sidebar v-if="authStore.token && route.path !== '/auth'" />
    <div class="body" :class="{ 'full-width': !authStore.token }">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background-color: #F0F4F7;
  display: flex;
}

.body {
  border-radius: 20px;
  background-color: #FFFFFF;
  flex-grow: 1;
  margin: 15px 10px 10px 0px;
  transition: all 0.3s;
}

.body.full-width {
  margin: 0;
}
</style>
