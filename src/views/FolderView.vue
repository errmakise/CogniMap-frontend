<template>
  <div class="folder-view">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="(item, index) in breadcrumb" :key="index">
        <a @click="navigateTo(index)">{{ item.name }}</a>
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 操作工具栏 -->
    <OperationToolbar
      @command="handleCreateCommand"
      @upload-click="showUploadDialog"
    />

    <!-- 混合文件列表 -->
    <MixedFileList
      :items="allItems"
      @item-click="handleItemClick"
      @rename="handleRename"
      @delete="handleDelete"
      @move="handleMove"
      @copy="handleCreateCopy"
      @open="openContainingFolder"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchFiles } from '@/api'
import { ipcRenderer } from 'electron'
import path from 'path'
import { useFileOperations } from '@/composables/useFileOperations'
import { useFileActions } from '@/composables/useFileActions'
import { useVisitHistoryStore } from '@/stores/visitHistory'

const visitHistory = useVisitHistoryStore()

const route = useRoute()
const router = useRouter()

// 状态管理
const currentFolderId = computed(() => route.params.folderId)
const files = ref([])
const folderInfo = ref(null)
const uploadVisible = ref(false)

// 计算属性
const allItems = computed(() => files.value)
const breadcrumb = computed(() => folderInfo.value?.path || [])

// 文件操作功能

const refreshFiles = async () => {
  try {
    const res = await fetchFiles(currentFolderId.value)
    files.value = res.list || []
    folderInfo.value = res.folderInfo
  } catch (error) {
    files.value = []
    console.error('获取文件列表失败', error)
  }
}

const { handleCreateCommand } = useFileOperations(currentFolderId,refreshFiles)
const {
  handleRename,
  handleMove,
  handleDelete,
  handleCreateCopy
} = useFileActions(currentFolderId, refreshFiles)

const handleItemClick = (item) => {
  if (item.isFolder) {
    router.push(`/files/folder/${item.id}`)
  } else if (item.type === 0) {
    visitHistory.addRecord({
      id: item.id,
      name: item.name,
      type: item.type,
    })
    router.push(`/graph/${item.id}`)
  }
}

const navigateTo = (index) => {
  const targetId = breadcrumb.value[index].id
  router.push(`/files/folder/${targetId}`)
}

const showUploadDialog = () => {
  uploadVisible.value = true
}

const openContainingFolder = (file) => {
  ipcRenderer.invoke('open-folder', path.dirname(file.path))
}

onMounted(() => {
  refreshFiles()
})
</script>

<style scoped>
.folder-view {
  padding: 40px;

}

.el-breadcrumb {
  margin-bottom: 20px;
}
</style>
