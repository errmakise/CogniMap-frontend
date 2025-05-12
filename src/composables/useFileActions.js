import { deleteFile, renameFile, moveFile, copyFile } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'

export function useFileActions(currentFolderId, refreshFiles) {
  const handleRename = async (file) => {
    try {
      const { value: newName } = await ElMessageBox.prompt('请输入新名称', '重命名', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{1,50}$/,
        inputErrorMessage: '名称长度应在1-50个字符之间',
        inputValue: file.name,
      })

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
          inputErrorMessage: '请输入有效的文件夹ID',
        },
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

  return {
    handleRename,
    handleMove,
    handleDelete,
    handleCreateCopy,
  }
}
