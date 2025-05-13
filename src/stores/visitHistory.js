import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useVisitHistoryStore = defineStore('visitHistory', () => {
  const history = ref([])

  const addRecord = (record) => {
    // 去重处理
    const exists = history.value.some(item =>
      item.id === record.id && item.type === record.type
    )

    if (!exists) {
      history.value.unshift({
        id: record.id,
        name: record.name,
        //1  md，-1 文件夹，0 图谱
        type: record.type,
        time: new Date().toLocaleString()
      })

      // 限制历史记录数量
      if (history.value.length > 10) {
        history.value.pop()
      }
    }
  }

  return { history, addRecord }
})
