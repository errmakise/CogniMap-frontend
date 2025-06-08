import { deleteFile,moveFolder, deleteFolder, renameFile, renameFolder, moveFile, copyFile } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useVisitHistoryStore } from '@/stores/visitHistory'


export function useFileActions(currentFolderId, refreshFiles) {
  const visitHistory = useVisitHistoryStore()
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
        const res = await renameFolder(file.id, newName, currentFolderId.value)
        console.log('重命名文件夹成功', res)
      } else {
        const res = await renameFile(file.id, newName, currentFolderId.value)
        visitHistory.updateRecordName(file.id, newName)
        console.log('重命名文件成功', res)

      }
      ElMessage.success('重命名成功')
      refreshFiles()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('重命名失败')
        console.error(error)
      }
    }
  }

  const handleMove = async (file,targetFolderId) => {
    try {
      if (file.isFolder) {
        await moveFolder(file.id, targetFolderId,file.name)
      }else{
        await moveFile(file.id, targetFolderId,file.name)
      }
      ElMessage.success('移动成功')
      refreshFiles()
    } catch (error) {
      if (error !== 'cancel') {
        console.error(error)
        ElMessage.error('移动失败')
      }
    }
  }

  const handleDelete = async (file) => {
    try {
      await ElMessageBox.confirm(`确定删除 ${file.name}?`, '提示', { type: 'warning' })

      if (file.isFolder) {
        console.log('删除文件夹')
        await deleteFolder(file.id)
      } else {
        console.log('删除文件')
        await deleteFile(file.id)
      }
      ElMessage.success('删除成功')
      refreshFiles()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除失败')
        console.error(error) // 打印错误信息以进行调试，也可以根据需要进行其他处理，比如显示错误消息给用户，或者记录错误日志等。
      }
    }
  }

  const handleCreateCopy = async (file) => {
    try {
      const { value: newName } = await ElMessageBox.prompt('请输入新名称', '重命名', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{1,50}$/,
        inputErrorMessage: '名称长度应在1-50个字符之间',
        inputValue: file.name,
      })

      await copyFile(file.id,newName)
      ElMessage.success('副本创建成功')
      refreshFiles()
    } catch (error) {
      if (error!== 'cancel') {
        ElMessage.error('创建副本失败')
        console.error(error)
      }

    }
  }

  return {
    handleRename,
    handleMove,
    handleDelete,
    handleCreateCopy,
  }
}
