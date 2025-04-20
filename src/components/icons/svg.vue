<template>
  <svg xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 45 45" :fill="color">
    <path :d="pathData" :fill-rule="fillRule" />
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [String, Number], default: 45 },
  color: { type: String, default: '#09244B' },
  fillRule: { type: String, default: 'evenodd' },
  pathData: {
    type: String,
    default: ''
  }
})
</script>
