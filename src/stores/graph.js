import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGraphStore = defineStore('graph', () => {
  const nodes = ref([
    { id: '1', name: '示例1', description: '这是一个示例节点' },
    { id: '2', name: '示例2', description: '这是一个示例节点' },
  ])

  const links = ref([{ source: '1', target: '2' }])
  const selectedNode = ref(null)

  return { nodes, links, selectedNode }
})
