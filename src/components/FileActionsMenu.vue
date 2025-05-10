<template>
  <el-dropdown>
    <Ellipsis />
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="emit('rename')">
          <div class="oprate-item">
            <Edit size="25" color="#00000" />
            <span>重命名</span>
          </div>
        </el-dropdown-item>
        <el-dropdown-item @click="emit('delete')">
          <div class="oprate-item">
            <Delete size="25" color="#00000" />
            <span>删除</span>
          </div>
        </el-dropdown-item>
        <el-dropdown-item @click="emit('move')">
          <div class="oprate-item">
            <Remove size="25" color="#00000" />
            <span>移动</span>
          </div>
        </el-dropdown-item>
        <el-dropdown-item v-if="showCopy" @click="emit('copy')">
          <div class="oprate-item">
            <Copy size="25" color="#00000" />
            <span>创建副本</span>
          </div>
        </el-dropdown-item>
        <el-dropdown-item v-if="showOpen" @click="emit('open')">
          <div class="oprate-item">
            <OpenFolder size="25" color="#00000" />
            <span>打开所在文件夹</span>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup>
defineProps({
  showCopy: { type: Boolean, default: true },
  showOpen: { type: Boolean, default: true }
})

const emit = defineEmits(['rename', 'delete', 'move', 'copy', 'open'])
</script>

<style scoped>
.oprate-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
