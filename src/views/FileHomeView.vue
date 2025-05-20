<template>
  <div class="file-manager">

    <!-- 操作工具栏 -->
    <OperationToolbar @command="handleCreateCommand" @upload-click="showUploadDialog" />


    <FileList :files="filteredFiles" :folders="folderList" @file-click="handleFileClick"
      @folder-click="handleFolderClick" @rename="handleRename" @delete="handleDelete" @move="handleMove"
      @copy="handleCreateCopy" @open="openContainingFolder" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchFiles } from '@/api'
import { ElMessage, ElMessageBox,ElLoading } from 'element-plus'
import { ipcRenderer } from 'electron'
import path from 'path'
import { useFileOperations } from '@/composables/useFileOperations'
import { useFileActions } from '@/composables/useFileActions'
import { useVisitHistoryStore } from '@/stores/visitHistory'


// 状态管理
const files = ref([])
const uploadVisible = ref(false)
const currentFolderId = ref(0)
const router = useRouter()
const visitHistory = useVisitHistoryStore()

const pagination = ref({
  pageNo: 1,
  pageSize: 10
})


// 计算属性
const folderList = computed(() => {
  return files.value.filter(file => file.isFolder === 1)
})
const filteredFiles = computed(() => {
  return files.value.filter(file => file.type === 0)
})

const refreshFiles = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  try {
    const res = await fetchFiles(
      currentFolderId.value,
      pagination.value.pageNo,
      pagination.value.pageSize
    )
    files.value = res.list || []
    console.log('获取文件列表', files.value)
  } catch (error) {
    files.value = []
    ElMessage.error('获取文件列表失败')
  }finally {
    loading.close()
  }

}

// 文件操作功能
const {
  handleRename,
  handleMove,
  handleDelete,
  handleCreateCopy
} = useFileActions(currentFolderId, refreshFiles)


const { handleCreateCommand } = useFileOperations(currentFolderId,refreshFiles)





// 修改文件夹点击处理
const handleFolderClick = (folder) => {
  console.log('点击文件夹', folder)
  router.push(`/files/folder/${folder.id}`)
}


// 修改文件点击处理
const handleFileClick = (file) => {
  console.log('点击文件', file)
  if (file.isFolder) {
    handleFolderClick(file)
  } else if (file.type === 0) { // 知识图谱
    visitHistory.addRecord({
      id: file.id,
      name: file.name,
      type: file.type,
    })
    visitHistory.setActiveItem(file.id)
    router.push(`/graph/${file.id}`)
  }else if (file.type === 1) { // md
    visitHistory.addRecord({
      id: file.id,
      name: file.name,
      type: file.type,
    })
    visitHistory.setActiveItem(file.id)
    router.push(`/md/${file.id}`)
  }
  // 其他类型文件处理...
}

const showUploadDialog = () => {
  uploadVisible.value = true
}


const openContainingFolder = (file) => {
  ipcRenderer.invoke('open-folder', path.dirname(file.path))
}

// 初始化
onMounted(() => {
  refreshFiles()
})
</script>

<style scoped>
.file-manager {
  padding: 40px;
}

.file-item {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.file-icon {
  margin-right: 8px;
}













.function-item {
  font-size: 16px;
}
</style>
