<template>
  <el-dialog :modelValue="visible" @update:modelValue="$emit('update:modelValue', $event)" :title="title" width="40%"
    top="20vh">
    <el-tree :data="filteredFileTreeData" :props="{ label: 'label', children: 'children',disabled: data => !props.fileTypes.includes(data.type) }" :filter-node-method="filterFileNode"
      node-key="id" show-checkbox check-strictly :default-expand-all="true" @check-change="handleFileCheckChange"
      ref="fileTreeRef" >
      <template #default="{ node }">
        <!-- Element UI的tree组件会将原始数据放在 data 属性中 -->
        <span>

          <el-icon>
            <Folder v-if="node.data.isFolder" />
            <Document v-else-if="node.data.type === 1" />
            <GraphFile v-else-if="node.data.type === 0" />
          </el-icon>

          <span style="margin-left: 6px">{{ node.label }}</span>
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
        //return node.children.length > 0 || props.fileTypes.length === 0
        return true
      }
      console.log('node', node)
      return props.fileTypes.includes(node.type)
    })
  }

  return filter([...props.fileTreeData])
})

// const filterFileNode = (value, data) => {
//   if (!value) return true
//   return data.label.includes(value)
// }

const handleFileCheckChange = () => {
  // 处理选中变化
}

const cancel = () => {
  emit('update:modelValue', false)
}

const confirm = () => {
  console.log('fileTreeData', props.fileTreeData)
  const checkedNodes = fileTreeRef.value.getCheckedNodes()
  emit('confirm', checkedNodes)
  emit('update:modelValue', false)
}
</script>
