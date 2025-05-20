<template>
  <div >
    <span class="title">知识图谱</span>
    <!-- height="450" -->
    <el-table :data="files"  style="width: 100%;margin-top: 10px;">
      <el-table-column prop="name" label="名称" width="600" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="file-item" @click="$emit('file-click', row)">
            <GraphFile color="#00000" style="margin-right: 5px;" />
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="更新日期" width="400" prop="createTime">
        <template #default="{ row }">
          {{ formatDate(row.lastTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <FileActionsMenu
            @rename="$emit('rename', row)"
            @delete="$emit('delete', row)"
            @move="$emit('move', row)"
            @copy="$emit('copy', row)"
            @open="$emit('open', row)"
          />
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script setup>
defineProps({
  files: Array
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}
</script>

<style scoped>
.empty-placeholder {
  margin-top: 20px;
  border: 1px dashed #dcdfe6;
  border-radius: 15px;
  padding: 40px;
}
.title {
  font-size: 18px;
  font-weight: 600;
  color: #606266;
}

.file-item {
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>
