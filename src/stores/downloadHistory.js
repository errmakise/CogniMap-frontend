import path from 'path'

export const useDownloadHistoryStore = defineStore('downloadHistory', () => {
  const history = ref([
  ])
  const addRecord = (record) => {
    if (!record.path) {
      console.error('添加记录必须包含path属性')
      return
    }

    history.value.unshift({
      name: path.basename(record.path),
      path: record.path, // 使用传入的完整路径
      dir: path.dirname(record.path),
      fileId: Date.now().toString(),
      time: new Date().toLocaleString(),
    })
  }

  const clearHistory = () => {
    history.value = []
  }
  return { history, addRecord, clearHistory }
})
