<template>
  <div :class="['hover-click-item', { active: isActive }]" @click="handleClick">
    <slot></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  activeKey: {
    type: String,
    required: true
  },
  itemKey: {
    type: String,
    required: true
  }
});

const emits = defineEmits(['click']);


const isActive = computed(() => props.activeKey === props.itemKey);

const handleClick = () => {
  emits('click', props.itemKey);
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
</style>
