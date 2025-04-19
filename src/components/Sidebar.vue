<template>
  <div class="bar-container">
    <div class="function-list">

      <div :class="['function-item', { active: activeItem === 'account' }]" @click="clickFunction('account')">
        <Account />
        <div class="function-name">账号</div>
      </div>

      <div :class="['function-item', { active: activeItem === 'qa' }]" @click="clickFunction('qa')">
        <QA />

        <div class="function-name">问答</div>
      </div>

      <div :class="['function-item', { active: activeItem === 'graph' }]" @click="clickFunction('graph')">
        <Graph />
        <div class="function-name">图谱</div>
      </div>
    </div>

    <div class="files-list">

      <div class="line"></div>
      <Fork />
      <div class="files"></div>
    </div>
  </div>
</template>

<script setup>
const activeItem = ref('account');
const clickFunction = (itemName) => {
  activeItem.value = itemName;
  switch (itemName) {
    case 'account':
      console.log('点击 账号')
      break;

    case 'qa':
      console.log('点击 问答')
      break;
    case 'graph':
      console.log('点击 图谱')
      break;
    default:
      console.log('点击 未知')
      break;
  }
}



</script>

<style scoped>
.line {
  height: 1px;
  background-color: #9C9C9C;
  width: 140px;
}

.function-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  gap: 10px;
  position: relative;
  border-radius: 15px;
  overflow: hidden;
}

.function-list {
  display: flex;
  flex-direction: column;
  gap: 10px
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

.function-item.active .function-name {
  font-weight: 600;
}

.function-item:hover::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fafafa;

}

.function-item.active::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
}

.function-item>* {
  position: relative;
}
</style>
