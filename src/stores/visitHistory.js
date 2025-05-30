import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useVisitHistoryStore = defineStore('visitHistory', () => {
  const history = ref([])
  const activeItem = ref('graph')

  const setActiveItem = (item) => {
    activeItem.value = item
  }
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
    }else{
      console.log('历史已存在')
      history.value=[{
        id: record.id,
        name: record.name,
        //1  md，-1 文件夹，0 图谱
        type: record.type,
        time: new Date().toLocaleString()
      },
      ...history.value.filter(item => item.id !== record.id)]
    }
  }
  const removeRecord = (id) => {
    history.value = history.value.filter(item => item.id !== id);
  };

  const clearAll = () => {
    history.value = [];
  };

  const updateRecordName = (id, newName) => {
    const record = history.value.find(item => item.id === id)
    if (record) {
      record.name = newName
    }
  }

  const getRecentGraphVisited = () => {
    const graphRecord = history.value.find(item => item.type === 0)
    return graphRecord ? graphRecord.id : null
  }
  return { history,activeItem,getRecentGraphVisited, updateRecordName, addRecord,removeRecord, clearAll, setActiveItem }
})
