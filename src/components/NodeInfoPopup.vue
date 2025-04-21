<template>

  <div class="popup-content" v-if="isVisible">
    <div class="line">
      <h3>{{ nodeInfo.name }}</h3>
      <Edit />
    </div>

    <div class="line">
      <div class="node-time">
        创建于： {{ nodeInfo.createTime }}
      </div>
      <div class="node-time">
        修改于： {{ nodeInfo.updateTime }}
      </div>
    </div>

    <div class="line main-font">{{ nodeInfo.description }}</div>

    <div class="file-list">
      <div class="file-item" @click="clickFile()" v-for="(file, index) in nodeInfo.files" :key="file.fileId">
        <span class="main-font file-name">{{ file.name }}</span>
        <RightArrow />
      </div>
    </div>

  </div>

</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  nodeInfo: {
    type: Object,
    required: true,
    default: () => ({
      name: '节点名',
      createTime: '2025.1.1',
      updateTime: '2025.1.1',
      description: '描述内容',
      files: [
        { name: '文件名1', fileId: '1' },
        { name: '文件名2', fileId: '2' }
      ]
    })
  },
  position: {
    type: Array,
    required: true
  }
});

const emits = defineEmits(['close']);

const isVisible = ref(true);

const closePopup = () => {
  emits('close');
};
</script>

<style scoped>
.popup-content {
  position: fixed;
  left: 0;
  top: 0;
  width: 350px;
  background-color: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);

}

.line {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 10px;
}

.node-time {
  font-size: 12px;
  color: #595959;
}

.main-font {
  font-size: 14px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-list {
  width: 100%;
  border: #C4C4C4 1px solid;
  border-radius: 10px;
  padding: 5px 5px 5px 15px;
  margin-top: 20px;
}

.file-name {
  color: #505050
}
</style>
