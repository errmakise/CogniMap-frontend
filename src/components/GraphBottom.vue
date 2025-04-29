<template>
  <div class="function-container">
    <download size="35" @click="emitClick('download')" class="clickable-icon"/>
    <Search size="35" @click="emitClick('search')" class="clickable-icon"/>
    <AddRound size="35" @click="emitClick('add')" class="clickable-icon"/>
    <DeleteRound size="35" @click="emitClick('delete')" class="clickable-icon"/>
    <Connect size="35" @click="emitClick('connect')" class="clickable-icon" />
    <cancle size="35" @click="emitClick('cancel')" class="clickable-icon"/>
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
  step: { type: Number, default: 10 }
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
  transition: transform 0.3s ease;
}
.function-container {
  width: 52%;
  background-color: #F6F7F8;
  height: 50px;
  border-radius: 30px;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.2);

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30px 30px;
}

.zoom-control {
  display: flex;
  align-items: center;
  font-size: 14px;
  gap: 5px;
  color: #646464;
}
</style>
