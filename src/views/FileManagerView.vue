<template>
  <div class="file-manager">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="(path, index) in currentPathParts" :key="index">
        <a @click="navigateToPath(index)">{{ path }}</a>
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 操作工具栏 -->
    <div class="toolbar">
      <el-dropdown @command="handleCreateCommand">
        <div class="function-button">
          <AddFile />
          <span>功能</span>
          <DownArrow style="margin-left: auto;" />
        </div>

        <template #dropdown>
          <el-dropdown-menu style="width: 200px;">
            <el-dropdown-item>
              <div class="create-item">
                <GraphFile size="36" color="#00000" />
                <span>知识图谱</span>
              </div>
            </el-dropdown-item>

            <el-dropdown-item>
              <div class="create-item">
                <Folder size="36" />
                <span>文件夹</span>
              </div>
            </el-dropdown-item>

            <el-dropdown-item>
              <div class="create-item">
                <MdFile size="36" color="#00000" />
                <span>文档</span>
              </div>

            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <div class="function-button" @click="showUploadDialog">
        <Upload />
        <span>上传</span>
      </div>

    </div>

    <div class="folder-list">
      <span class="title">文件夹</span>
      <el-row :gutter="15" class="list">
        <el-col :xs="12" :sm="8" :md="8" :lg="6" v-for="(folder, index) in 9" :key="index">
          <div class="folder-item" @click="handleFolderClick('documents')">
            <Folder size="36" />
            <span>文档111111111111111111111</span>
            <FileActionsMenu style="margin-left: auto;" :showCopy="false"
            :showOpen="false"
            @rename="handleRename(row)"
              @delete="handleDelete(row)" @move="handleMove(row)" />
          </div>
        </el-col>
      </el-row>
    </div>



    <span class="title">知识图谱</span>
    <!-- 文件列表 -->
    <el-table :data="filteredFiles" height="450" style="width: 100%;margin-top: 10px;">
      <el-table-column prop="name" label="名称" width="600" show-overflow-tooltip>
        <template #default="{ row }">
          <div class="file-item" @click="handleFileClick(row)">
            <GraphFile color="#00000" style="margin-right: 5px;" />
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="modified" label="创建日期" width="400" />

      <el-table-column label="操作">
        <template #default="{ row }">
          <FileActionsMenu @rename="handleRename(row)" @delete="handleDelete(row)" @move="handleMove(row)"
            @copy="handleCreateCopy(row)" @open="openContainingFolder(row)" />
        </template>

      </el-table-column>
    </el-table>



  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchFiles, createFile, deleteFile, renameFile, moveFile, copyFile } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ipcRenderer } from 'electron'
import path from 'path'

const router = useRouter()

// 状态管理
const currentPath = ref('/')
const files = ref([])
const selectedFile = ref(null)
const uploadVisible = ref(false)
const createVisible = ref(false)
const renameVisible = ref(false)
const moveVisible = ref(false)

// 计算属性
const currentPathParts = computed(() => {
  return currentPath.value.split('/').filter(Boolean)
})

const filteredFiles = computed(() => {
  return files.value.filter(file => file.type === 'graph')
})

// 文件操作功能
const refreshFiles = async () => {
  try {
    files.value = await fetchFiles(currentPath.value)
  } catch (error) {
    ElMessage.error('获取文件列表失败')
  }
}

const navigateToPath = (index) => {
  const newPath = '/' + currentPathParts.value.slice(0, index + 1).join('/')
  currentPath.value = newPath
  refreshFiles()
}

const handleFolderClick = (folderName) => {
  currentPath.value = path.join(currentPath.value, folderName)
  refreshFiles()
}

const handleFileClick = (file) => {
  if (file.type === 'folder') {
    handleFolderClick(file.name)
  } else {
    router.push(`/graph/${file.id}`)
  }
}

const showUploadDialog = () => {
  uploadVisible.value = true
}

const handleCreateCommand = (type) => {
  createVisible.value = true
  selectedFile.value = { type }
}

const handleRename = (file) => {
  selectedFile.value = file
  renameVisible.value = true
}

const handleDelete = async (file) => {
  try {
    await ElMessageBox.confirm(`确定删除 ${file.name}?`, '提示', { type: 'warning' })
    await deleteFile(file.id)
    ElMessage.success('删除成功')
    refreshFiles()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleMove = (file) => {
  selectedFile.value = file
  moveVisible.value = true
}

const handleCreateCopy = async (file) => {
  try {
    await copyFile(file.id)
    ElMessage.success('副本创建成功')
    refreshFiles()
  } catch (error) {
    ElMessage.error('创建副本失败')
  }
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

.toolbar {

  display: flex;
  gap: 20px;
}


.function-button {
  width: 200px;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  color: black;
  border: 1px solid #dcdfe6;
  padding: 15px 15px 15px 20px;
  border-radius: 15px;
}


.oprate-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.2s;
  margin-bottom: 5px;
}

.create-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #606266;
  transition: all 0.2s;
  margin-bottom: 5px;
}



.title {
  font-size: 18px;
  font-weight: 600;
  color: #606266;
}

.folder-list {
  margin-top: 40px;
  margin-bottom: 40px;
  width: 90%;
}

.list {
  margin-top: 15px;
}

.folder-item {
  width: 100%;
  /* 改为100%宽度 */
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
  /* 禁止换行 */
  overflow: hidden;
  /* 隐藏溢出内容 */
  text-overflow: ellipsis;
  /* 显示省略号 */
  flex: 1;
  /* 占据剩余空间 */
}

.function-item {
  font-size: 16px;
}
</style>
