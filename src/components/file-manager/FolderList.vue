<template>
  <div class="folder-list" >
    <span class="title">文件夹</span>
    <el-row :gutter="15" class="list">
      <el-col v-for="folder in folders" :key="folder.id" :xs="12" :sm="8" :md="8" :lg="6">
        <div class="folder-item" @click="$emit('folder-click', folder)">
          <Folder size="36" />
          <span>{{ folder.name }}</span>
          <FileActionsMenu
            style="margin-left: auto;"
            :showCopy="false"
            :showOpen="false"
            @rename="$emit('rename', folder)"
            @delete="$emit('delete', folder)"
            @move="$emit('move', folder)"
          />
        </div>
      </el-col>
    </el-row>
    <div v-if="!folders.length" class="empty-placeholder">
      <el-empty description="暂无文件夹" :image-size="100"/>
    </div>
  </div>
</template>

<script setup>
defineProps({
  folders: Array
})
</script>

<style scoped>
.empty-placeholder {
  margin-top: 20px;
  border: 1px dashed #dcdfe6;
  border-radius: 15px;
  padding: 40px;


}
.folder-list {
  margin-top: 40px;
  margin-bottom: 40px;
  width: 90%;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #606266;
}

.list {
  margin-top: 15px;
}

.folder-item {
  width: 100%;
  display: flex;
  align-items: center;
  cursor: pointer;
  border: 1px solid #dcdfe6;
  padding: 15px;
  border-radius: 15px;
  margin-bottom: 15px;
}

.folder-item:hover {
  border-color: #c0c4cc;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.folder-item span {
  margin-left: 16px;
  font-size: 18px;
  color: black;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
</style>
