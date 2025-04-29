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
  const addRecord = (filePath) => {
    // 确保filePath是字符串
    if (typeof filePath !== 'string') {
      console.error('文件路径必须是字符串:', filePath)
      return
    }
    history.value.unshift({
      name: path.basename(filePath),
      path: filePath,
      dir: path.dirname(filePath),
      fileId: Date.now().toString(), // 添加唯一ID
      time: new Date().toLocaleString(),
    })
  }

  const clearHistory = () => {
    history.value = []
  }
  return { history, addRecord, clearHistory }
})
