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
      <el-dropdown>
        <div class="function-button">
          <AddFile />
          <span>功能</span>
          <DownArrow style="margin-left: auto;" />
        </div>

        <template #dropdown>
          <el-dropdown-menu style="width: 200px;">
            <el-dropdown-item>
              <GraphFile size="36" color="#00000" />
              <span>知识图谱</span>
            </el-dropdown-item>

            <el-dropdown-item>
              <Folder size="36" />
              <span>文件夹</span>
            </el-dropdown-item>

            <el-dropdown-item>
              <MdFile size="36" color="#00000" />
              <span>文档</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <div class="function-button">
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
            <Ellipsis style="margin-left: auto;" />
          </div>
        </el-col>
      </el-row>
    </div>



    <span class="title">知识图谱</span>
    <!-- 文件列表 -->
    <el-table :data="filteredFiles"
    height="450" style="width: 98%;margin-top: 10px;">
      <el-table-column prop="name" label="名称"  width="600"
      show-overflow-tooltip>
        <template #default="{ row }">
          <div class="file-item" @click="handleFileClick(row)">
            <GraphFile color="#00000" style="margin-right: 5px;" />
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="modified" label="创建日期" width="400"/>

      <el-table-column label="操作" >
        <template #default="{ row }">
          <el-dropdown>
            <Ellipsis />
            <template #dropdown>

              <el-dropdown-menu>
                <el-dropdown-item @click="handleRename(row)">重命名</el-dropdown-item>
                <el-dropdown-item @click="handleDelete(row)">删除</el-dropdown-item>
                <el-dropdown-item @click="handleMove(row)">移动</el-dropdown-item>
                <el-dropdown-item @click="handleCreateCopy(row)">创建副本</el-dropdown-item>
                <el-dropdown-item @click="handleExport(row)" v-if="row.type === 'graph'">导出PDF</el-dropdown-item>
                <el-dropdown-item @click="openContainingFolder(row)">打开所在文件夹</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>

      </el-table-column>
    </el-table>

    <!-- 各种对话框 -->
    <FileUploadDialog v-model="uploadVisible" @success="refreshFiles" />
    <FileCreateDialog v-model="createVisible" @success="refreshFiles" />
    <FileRenameDialog v-model="renameVisible" :file="selectedFile" @success="refreshFiles" />
    <FileMoveDialog v-model="moveVisible" :file="selectedFile" @success="refreshFiles" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchFiles, exportGraph, createCopy } from '@/api'
import { ipcRenderer } from 'electron'
import path from 'path'


const mockFiles = [
  {
    id: '1',
    name: '示例图谱',
    type: 'graph',
    size: '1.2MB',
    modified: '2023-05-15',
    path: '/documents/示例图谱.graph'
  },
  {
    id: '2',
    name: '开发文档',
    type: 'md',
    size: '256KB',
    modified: '2023-05-10',
    path: '/documents/开发文档.md'
  },
  {
    id: '3',
    name: '图片资源',
    type: 'folder',
    size: '4.5MB',
    modified: '2023-05-01',
    path: '/documents/图片资源'
  },
  {
    id: '4',
    name: '项目计划',
    type: 'md',
    size: '128KB',
    modified: '2023-04-28',
    path: '/documents/项目计划.md'
  }
]

// 文件类型图标映射
const fileIcons = {
  md: 'MdFile',
  graph: 'GraphFile',
  folder: 'Folder'
}

const currentPath = ref('')
const files = ref([])
const searchQuery = ref('')
const selectedFile = ref(null)

// 获取文件图标组件
const getFileIcon = (type) => fileIcons[type] || 'File'

// 处理文件点击
const handleFileClick = (file) => {
  if (file.type === 'folder') {
    navigateToFolder(file.name)
  } else {
    openFile(file)
  }
}

// 导出为PDF
const handleExport = async (file) => {
  try {
    const blob = await exportGraph(file.id)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${file.name}.pdf`
    link.click()
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 打开所在文件夹
const openContainingFolder = (file) => {
  ipcRenderer.invoke('open-folder', path.dirname(file.path))
}

// 创建副本
const handleCreateCopy = async (file) => {
  try {
    await createCopy(file.id)
    ElMessage.success('副本创建成功')
    refreshFiles()
  } catch (error) {
    ElMessage.error('创建副本失败')
  }
}

// 初始化时加载测试数据
onMounted(() => {
  // fetchFiles(currentPath.value).then(data => {
  //     files.value = data
  //   })

  files.value = mockFiles
})

// 过滤文件列表
const filteredFiles = computed(() => {
  return files.value.filter(file =>
    file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
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




:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  color: #606266;
  transition: all 0.2s;
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
</style>
