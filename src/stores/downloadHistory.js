import path from 'path'

export const useDownloadHistoryStore = defineStore('downloadHistory', () => {
  const history = ref([
    {
      name: '知识图谱_2023-05-15 14-30-22.png',
      url: 'data:image/png;base64,...',
      time: '2023/5/15 14:30:22',
    },
    {
      name: '知识图谱_2023-05-14 09-15-47.png',
      url: 'data:image/png;base64,...',
      time: '2023/5/14 09:15:47',
    },
    {
      name: '知识图谱_2023-05-10 16-45-33.png',
      url: 'data:image/png;base64,...',
      time: '2023/5/10 16:45:33',
    },
    {
      name: '知识图谱_2023-05-15 14-30-22.png',
      url: 'data:image/png;base64,...',
      time: '2023/5/15 14:30:22',
    },
    {
      name: '知识图谱_2023-05-14 09-15-47.png',
      url: 'data:image/png;base64,...',
      time: '2023/5/14 09:15:47',
    },
    {
      name: '知识图谱_2023-05-10 16-45-33.png',
      url: 'data:image/png;base64,...',
      time: '2023/5/10 16:45:33',
    },
    {
      name: '知识图谱_2023-05-15 14-30-22.png',
      url: 'data:image/png;base64,...',
      time: '2023/5/15 14:30:22',
    },
    {
      name: '知识图谱_2023-05-14 09-15-47.png',
      url: 'data:image/png;base64,...',
      time: '2023/5/14 09:15:47',
    },
    {
      name: '知识图谱_2023-05-10 16-45-33.png',
      url: 'data:image/png;base64,...',
      time: '2023/5/10 16:45:33',
    },
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
