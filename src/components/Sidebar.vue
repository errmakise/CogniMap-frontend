<template>
  <div class="bar-container">
    <div class="function-list">
      <HoverClickItem
        :activeKey="activeItem"
        itemKey="account"
        @click="clickFunction"
      >
        <Account />
        <div class="function-name">账号</div>
      </HoverClickItem>

      <HoverClickItem
        :activeKey="activeItem"
        itemKey="qa"
        @click="clickFunction"
      >
        <QA />
        <div class="function-name">问答</div>
      </HoverClickItem>

      <HoverClickItem
        :activeKey="activeItem"
        itemKey="graph"
        @click="clickFunction"
      >
        <Graph />
        <div class="function-name">图谱</div>
      </HoverClickItem>
    </div>

    <div class="connector-line">
      <div class="line"></div>
      <Fork @click="clickListFork()" />
    </div>

    <div class="files-list">
      <div class="files">
        <HoverClickItem
          v-for="(file, index) in historyFiles"
          :key="index"
          :activeKey="activeFile"
          :itemKey="file"
          @click="openFile"
        >
          {{ file }}
        </HoverClickItem>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import HoverClickItem from './HoverClickItem.vue';

const historyFiles = ref([
  'example1.txt',
  'example2.json',
  'example3.csv'
]);

const openFile = (fileId) => {
  console.log('打开文件:id:', fileId);
};

const activeItem = ref('account');
const activeFile = ref('');

const clickListFork = () => {
  console.log('点击 fork');
};

const clickFunction = (itemName) => {
  activeItem.value = itemName;
  switch (itemName) {
    case 'account':
      console.log('点击 账号');
      break;
    case 'qa':
      console.log('点击 问答');
      break;
    case 'graph':
      console.log('点击 图谱');
      break;
    default:
      console.log('点击 未知');
      break;
  }
};
</script>

<style scoped>
.connector-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.line {
  height: 1px;
  background-color: #9C9C9C;
  width: 90%;
}

.function-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bar-container {
  background-color: transparent;
  width: 200px;
  height: 100%;
  padding: 10px 15px 5px 15px;
}

.function-name {
  font-size: 20px;
  font-weight: 500;
}

.hover-click-item.active .function-name {
  font-weight: 600;
}
</style>
