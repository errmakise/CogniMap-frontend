<template>
  <div class="folder-view">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="(item, index) in breadcrumb" :key="index">
        <a @click="navigateTo(index)">{{ item.name }}</a>
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 操作工具栏 -->
    <OperationToolbar @command="handleCreateCommand" @upload-click="showUploadDialog" />

    <!-- 混合文件列表 -->
    <MixedFileList :items="allItems" @item-click="handleItemClick" @rename="handleRename" @delete="handleDelete"
      @move="handleMove" @copy="handleCreateCopy" @open="openContainingFolder" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchFiles, getFilePath } from '@/api'
import { ipcRenderer } from 'electron'
import path from 'path'
import { useFileOperations } from '@/composables/useFileOperations'
import { useFileActions } from '@/composables/useFileActions'
import { useVisitHistoryStore } from '@/stores/visitHistory'
import { ElLoading } from 'element-plus'
const visitHistory = useVisitHistoryStore()

const route = useRoute()
const router = useRouter()

// 状态管理
const currentFolderId = computed(() => route.params.folderId)
const files = ref([])
const uploadVisible = ref(false)
const folderPath = ref([])

// 计算属性
const allItems = computed(() => files.value)
const breadcrumb = computed(() => folderPath.value || [])

// 文件操作功能

const refreshFiles = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  try {
    const [filesRes, pathRes] = await Promise.all([
      fetchFiles(currentFolderId.value),
      getFilePath(currentFolderId.value)
    ])
    console.log('文件列表', filesRes)
    console.log('文件路径', pathRes)
    folderPath.value = pathRes
    files.value = filesRes.list || []

  } catch (error) {
    files.value = []
    console.error('获取文件列表失败', error)
  } finally {
    loading.close()
  }
}

const { handleCreateCommand } = useFileOperations(currentFolderId, refreshFiles)
const {
  handleRename,
  handleMove,
  handleDelete,
  handleCreateCopy
} = useFileActions(currentFolderId, refreshFiles)

const handleItemClick = (item) => {
  if (item.isFolder) {
    console.log('点击文件夹', item)
    router.push({
      name: 'folder',
      params: { folderId: item.id },
    }).then(()=>{
      refreshFiles()
    })


  } else if (item.type === 0) {
    visitHistory.addRecord({
      id: item.id,
      name: item.name,
      type: item.type,
    })
    visitHistory.setActiveItem(item.id)
    router.push(`/graph/${item.id}`)
  } else if (item.type === 1) {
    visitHistory.addRecord({
      id: item.id,
      name: item.name,
      type: item.type,
    })
    visitHistory.setActiveItem(item.id)
    router.push(`/md/${item.id}`)
  }
}

const navigateTo = (index) => {
  console.log('navigateTo', index)
  const targetId = folderPath.value[index].id
  if (targetId === currentFolderId.value) return
  if (targetId === 0) {
    router.push({ name: 'files' })
    return
  }
  router.push({
      name: 'folder',
      params: { folderId: targetId },
    }).then(()=>{
      refreshFiles()
    })
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

watch(() => route.params.folderId, (newVal) => {
  if (newVal) {
    refreshFiles()
  }
}, { immediate: true })
</script>

<style scoped>
.folder-view {
  padding: 40px;

}

.el-breadcrumb {
  margin-bottom: 20px;
}
</style>
