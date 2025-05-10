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
          <span>新建</span>
          <DownArrow style="margin-left: auto;" />
        </div>

        <template #dropdown>
          <el-dropdown-menu style="width: 200px;">
            <el-dropdown-item command="graph">
              <div class="create-item">
                <GraphFile size="36" color="#00000" />
                <span>知识图谱</span>
              </div>
            </el-dropdown-item>

            <el-dropdown-item command="folder">
              <div class="create-item">
                <Folder size="36" />
                <span>文件夹</span>
              </div>
            </el-dropdown-item>

            <el-dropdown-item command="md">
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
        <el-col :xs="12" :sm="8" :md="8" :lg="6" v-for="folder in folderList" :key="folder.id">
          <div class="folder-item" @click="handleFolderClick(folder)">
            <Folder size="36" />
            <span>{{ folder.name }}</span>
            <FileActionsMenu style="margin-left: auto;" :showCopy="false" :showOpen="false"
              @rename="handleRename(folder)" @delete="handleDelete(folder)" @move="handleMove(folder)" />
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

      <el-table-column label="创建日期" width="400" prop="createTime">
        <template #default="{ row }">
          {{ formatDate(row.lastTime) }}
        </template>
      </el-table-column>

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
import { fetchFiles, createFolder, deleteFile, renameFile, moveFile, copyFile, createNewFile } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ipcRenderer } from 'electron'
import path from 'path'

const router = useRouter()

const folderList = computed(() => {
  return files.value.filter(file => file.isFolder === 1)
})


const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString() // 可以根据需要调整格式
}

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
  return files.value.filter(file => file.type === 0)
})

// 文件操作功能
const currentFolderId = ref(0) // 使用folderId代替path
const pagination = ref({
  pageNo: 1,
  pageSize: 10
})

// 修改refreshFiles方法
const refreshFiles = async () => {
  try {
    const res = await fetchFiles(
      currentFolderId.value,
      pagination.value.pageNo,
      pagination.value.pageSize
    )
    files.value = res.list || []
  } catch (error) {
    files.value = []
    ElMessage.error('获取文件列表失败')
  }
  console.log('获取文件列表', files.value)
}

// 修改文件夹点击处理
const handleFolderClick = (folder) => {
  currentFolderId.value = folder.id
  refreshFiles()
}

const navigateToPath = (index) => {
  const newPath = '/' + currentPathParts.value.slice(0, index + 1).join('/')
  currentPath.value = newPath
  refreshFiles()
}

const handleFileClick = (file) => {
  if (file.isFolder) {
    handleFolderClick(file)
  } else if (file.type === 0) { // 知识图谱
    router.push(`/graph/${file.id}`)
  }
  // 其他类型文件处理...
}

const showUploadDialog = () => {
  uploadVisible.value = true
}

const handleCreateCommand = (type) => {
  if (type === 'folder') {
    ElMessageBox.prompt('请输入文件夹名称', '新建文件夹', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^.{1,50}$/,
      inputErrorMessage: '文件夹名称长度应在1-50个字符之间',
      roundButton: true,
    }).then(async ({ value }) => {
      try {
        const res = await createFolder(value, currentFolderId.value)
        ElMessage.success('文件夹创建成功')
        refreshFiles()
      } catch (error) {
        ElMessage.error('文件夹创建失败')
      }
    }).catch(() => {
      console.log('取消创建文件夹')
    })
  } else if (type === 'md' || type === 'graph') {
    const fileType = type === 'md' ? 1 : 0 // 1表示文档，0表示图谱
    const fileTypeName = type === 'md' ? '文档' : '知识图谱'

    ElMessageBox.prompt(`请输入${fileTypeName}名称`, `新建${fileTypeName}`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^.{1,50}$/,
      inputErrorMessage: `${fileTypeName}名称长度应在1-50个字符之间`,
      roundButton: true,
    }).then(async ({ value }) => {
      try {
        const res = await createNewFile(value, fileType, currentFolderId.value)
        ElMessage.success(`${fileTypeName}创建成功`)
        refreshFiles()
      } catch (error) {
        ElMessage.error(`${fileTypeName}创建失败`)
      }
    }).catch(() => {
      console.log(`取消创建${fileTypeName}`)
    })
  }
}

const handleRename = async (file) => {
  try {

    const { value: newName } = await ElMessageBox.prompt(
      '请输入新名称',
      '重命名',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{1,50}$/,
        inputErrorMessage: '名称长度应在1-50个字符之间',
        inputValue: file.name
      }
    )
    if (file.isFolder) {
      console.log('重命名文件夹')
    } else {
      console.log('重命名文件')
      //await renameFile(file.id, newName, file.folderId)//待定，当前还没实现“获取所有图谱文件”这个api
      await renameFile(file.id, newName, currentFolderId.value)

    }

    ElMessage.success('重命名成功')
    refreshFiles()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重命名失败')
    }
  }
}

const handleMove = async (file) => {
  try {
    const { value: targetFolderId } = await ElMessageBox.prompt(
      '请输入目标文件夹ID',
      '移动文件',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^\d+$/,
        inputErrorMessage: '请输入有效的文件夹ID'
      }
    )

    await moveFile(file.id, targetFolderId, file.name)
    ElMessage.success('移动成功')
    refreshFiles()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('移动失败')
    }
  }
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
