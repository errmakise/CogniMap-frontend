<template>
  <div :class="['hover-click-item', { active: isActive }]" @click="handleClickItem" @mouseenter="isHovered = true"
    @mouseleave="isHovered = false">
    <slot></slot>
    <!-- 当启用省略号且鼠标悬停或该项激活时渲染 Fork 组件 -->
    <div class="fork-icon" @click.stop="handleClickFork" v-if="props.isFile && (isHovered || isActive)">
      <Fork color="black" />
    </div>

  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';


const props = defineProps({
  activeKey: {
    type: String,
    required: true
  },
  itemKey: {
    type: String,
    required: true
  },
  isFile: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['clickItem', 'clickFork']);
const isHovered = ref(false);

const isActive = computed(() => props.activeKey === props.itemKey);

const handleClickItem = () => {
  emits('clickItem', props.itemKey);
};

const handleClickFork = () => {
  emits('clickFork', props.itemKey);
};
</script>

<style scoped>
.hover-click-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  gap: 10px;
  position: relative;
  border-radius: 15px;
  overflow: hidden;
}

.hover-click-item::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
}

.hover-click-item:hover::before {
  background-color: #fafafa;
}

.hover-click-item.active::before {
  background-color: #ffffff;
}

.hover-click-item>* {
  position: relative;
}

.fork-icon {
  margin-left: auto;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 给图标添加左边距 */
  /* 可以根据需要添加更多样式，如动画、颜色等 */
}

.fork-icon:hover {
  content: "";
  background-color: rgb(228, 230, 235);
  padding: 1px;
  border-radius: 5px;
}
</style>
