<template>
  <div class="function-container">
    <el-tooltip content="导出PNG" placement="top">
      <download size="35" @click="emitClick('download')" />
    </el-tooltip>
    <el-tooltip content="搜索节点" placement="top">
      <Search size="35" @click="emitClick('search')" />
    </el-tooltip>
    <el-tooltip content="添加节点" placement="top">
      <AddRound size="35" @click="emitClick('add')" />
    </el-tooltip>
    <el-tooltip content="删除选中项" placement="top">
      <DeleteRound size="35" @click="emitClick('delete')" :disable="disableDelete" />
    </el-tooltip>
    <el-tooltip content="连接节点" placement="top">
      <Connect size="35" @click="emitClick('connect')" :disable="disableConnect" />
    </el-tooltip>
    <el-tooltip content="取消操作" placement="top">
      <cancle size="35" @click="emitClick('cancel')" :disable="disableCancle"/>
    </el-tooltip>
    <div class="zoom-control">
      <input type="range" :min="min" :max="max" :step="step" :value="modelValue" @input="handleInput">
      <span>缩放: {{ currentZoom }}x</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Number, default: 100 },
  min: { type: Number, default: 10 },
  max: { type: Number, default: 500 },
  step: { type: Number, default: 10 },
  disableDelete: { type: Boolean, default: true }, // 新增禁用删除按钮属性
  disableConnect: { type: Boolean, default: true }, // 新增禁用连接按钮属性
  disableCancle: { type: Boolean, default: true }, // 新增禁用取消按钮属性
});
const emit = defineEmits(['update:modelValue', 'change', 'icon-click']);

const currentZoom = computed(() => (props.modelValue / 100).toFixed(1));

const handleInput = (e) => {
  const value = Number(e.target.value);
  emit('update:modelValue', value);
  emit('change', value / 100);
};

const emitClick = (iconName) => {
  console.log(`点击了 ${iconName} 图标`);
  emit('icon-click', iconName);
};
</script>

<style scoped>
.clickable-icon {
  cursor: pointer;
  transition: transform 0.1s ease;
  margin: 0 8px;
  /* 增加图标间距 */

  &:hover {
    transform: scale(1.2);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.function-container {
  width: 60%;
  /* 调整宽度 */
  background-color: #F6F7F8;
  height: 60px;
  /* 增加高度 */
  border-radius: 30px;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  /* 居中布局 */
  padding: 0 30px;
  gap: 15px;
  /* 使用gap统一间距 */
}

.zoom-control {
  display: flex;
  align-items: center;
  font-size: 14px;
  gap: 10px;
  color: #646464;
  margin-left: auto;
  /* 靠右对齐 */
}
</style>
