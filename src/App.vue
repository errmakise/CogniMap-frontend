<script setup>
import { RouterView } from 'vue-router'
import '@/assets/styles/reset.css'
import '@/assets/styles/variables.css'
import '@/assets/styles/global.css'

import Sidebar from './components/Sidebar.vue'
</script>

<template>
  <div class="app-container">
    <Sidebar />
    <div class="body">
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
  /* 其他布局样式 */
  background-color: #F0F4F7;
  display: flex;
}

.body {
  border-radius: 20px;
  background-color: #FFFFFF;
  flex-grow: 1;
  margin: 15px 10px 10px 0px;

}
</style>
