<template>
  <el-dialog :modelValue="visible" @update:modelValue="$emit('update:modelValue', $event)" :title="title" width="40%"
    top="20vh">
    <el-tree :data="filteredFileTreeData" :props="{ label: 'label', children: 'children',disabled: data => !props.fileTypes.includes(data.type) }" :filter-node-method="filterFileNode"
      node-key="id" :show-checkbox="props.multiple" check-strictly :default-expand-all="true" @node-click="handleNodeClick"
      ref="fileTreeRef" :highlight-current="true" >
      <template #default="{ node }">
        <!-- Element UI的tree组件会将原始数据放在 data 属性中 -->
        <span>

          <el-icon>
            <Folder v-if="node.data.isFolder" />
            <Document v-else-if="node.data.type === 1" />
            <GraphFile v-else-if="node.data.type === 0" />
          </el-icon>

          <span style="margin-left: 6px">{{ node.data.name }}</span>
        </span>

      </template>
    </el-tree>
    <template #footer>
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Folder, Document } from '@element-plus/icons-vue'

const props = defineProps({
  visible: Boolean,
  title: {
    type: String,
    default: '选择文件'
  },
  fileTreeData: Array,
  fileTypes: {
    type: Array,
    default: () => [0, 1,-1] // 0=图谱, 1=md文件
  },
  multiple: {  // 多选控制
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'confirm'])

const fileTreeRef = ref(null)

// 过滤后的文件树数据
const filteredFileTreeData = computed(() => {
  console.log('tree', props.fileTreeData)
  if (!props.fileTreeData) return []

  const filter = (nodes) => {
    return nodes.filter(node => {
      if (node.type === -1) {
        node.children = filter(node.children || [])
        if(props.fileTypes.includes(-1)){
          return true
        }

        return node.children.length > 0 || props.fileTypes.length === 0

      }
      //console.log('node', node)
      return props.fileTypes.includes(node.type)
    })
  }

  return filter([...props.fileTreeData])
})

// const filterFileNode = (value, data) => {
//   if (!value) return true
//   return data.label.includes(value)
// }
const selectedNodes = ref([])

const handleNodeClick = (nodeData) => {
  if (props.multiple) {
    // 多选模式
    const index = selectedNodes.value.findIndex(n => n.id === nodeData.id)
    if (index >= 0) {
      selectedNodes.value.splice(index, 1)
    } else {
      selectedNodes.value.push(nodeData)
    }
  } else {
    // 单选模式
    selectedNodes.value = [nodeData]
  }
}


const cancel = () => {
  emit('update:modelValue', false)
}

const confirm = () => {
  if (selectedNodes.value.length === 0) {
    ElMessage.warning('请至少选择一个文件')
    return
  }
  emit('confirm', [...selectedNodes.value])
  emit('update:modelValue', false)
}
</script>
