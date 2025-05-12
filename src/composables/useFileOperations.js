import { createFolder, createNewFile } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

export function useFileOperations(currentFolderId,refreshFiles) {
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
          await createFolder(value, currentFolderId.value)
          ElMessage.success('文件夹创建成功')
          await refreshFiles()
          return true
        } catch (error) {
          ElMessage.error('文件夹创建失败')
          return false
        }
      })
    } else if (type === 'md' || type === 'graph') {
      const fileType = type === 'md' ? 1 : 0
      const fileTypeName = type === 'md' ? '文档' : '知识图谱'

      ElMessageBox.prompt(`请输入${fileTypeName}名称`, `新建${fileTypeName}`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{1,50}$/,
        inputErrorMessage: `${fileTypeName}名称长度应在1-50个字符之间`,
        roundButton: true,
      }).then(async ({ value }) => {
        try {
          await createNewFile(value, fileType, currentFolderId.value)
          console.log(`${fileTypeName}创建成功`)
          ElMessage.success(`${fileTypeName}创建成功`)
          await refreshFiles().catch(e => {
            console.error('刷新文件列表失败:', e)
          })
          return true
        } catch (error) {
          console.error(`${fileTypeName}创建失败:`, error)
          ElMessage.error(`${fileTypeName}创建失败`)
          return false
        }
      })
    }
  }

  return {
    handleCreateCommand
  }
}
