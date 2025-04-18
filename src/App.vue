<script setup>
import { RouterView } from 'vue-router'
import '@/assets/styles/reset.css'
import '@/assets/styles/variables.css'
import '@/assets/styles/global.css'

</script>

<template>
  <div class="app-container">
    <RouterView />
  </div>

</template>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  /* 其他布局样式 */
  background-color: #F0F4F7;
}

.body {
  padding: 0;
}
</style>
