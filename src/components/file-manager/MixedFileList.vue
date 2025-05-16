<template>
  <div>
    <el-table :data="items" height="850" style="width: 100%;margin-top: 10px;">
      <el-table-column prop="name" label="名称" width="500" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="file-item" @click="$emit('item-click', row)">
            <component
              :is="getFileIcon(row.type)"
              :color="getIconColor(row.type)"
              style="margin-right: 5px;"
              size="30"
            />
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="200">
        <template #default="{ row }">
          {{ row.isFolder ? '文件夹' : getTypeName(row.type) }}
        </template>
      </el-table-column>
      <el-table-column label="更新日期" width="300" prop="createTime">
        <template #default="{ row }">
          {{ formatDate(row.lastTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <FileActionsMenu
            :showCopy="!row.isFolder"
            :showOpen="!row.isFolder"
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
import Folder from '../../components/icons/Folder.vue'
import GraphFile from '../../components/icons/GraphFile.vue'
import MdFile from '../../components/icons/MdFile.vue'

const getFileIcon = (type) => {
  const icons = {
    '-1': Folder,
    0: GraphFile,
    1: MdFile
  }
  return icons[type] || GraphFile
}

const getIconColor = (type) => {
  const colors = {
    '-1': '#000000', // 文件夹蓝色
    0: '#660DFF',    // 图谱黑色
    1: '#388BFF'     // 文档绿色
  }
  return colors[type] || '#000000'
}

defineProps({
  items: Array,
  title: String
})

const getTypeName = (type) => {
  const types = {
    '-1': '文件夹',
    0: '知识图谱',
    1: 'Markdown文档'
  }
  return types[type] || '文件'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}
</script>

<style scoped>
.empty-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: #909399;
  font-size: 14px;
  border: 1px solid #ebeef5;
  border-top: none;
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
