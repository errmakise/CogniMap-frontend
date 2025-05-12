<template>
  <div>
    <FolderList
      :folders="folders"
      @folder-click="$emit('folder-click', $event)"
      @rename="$emit('rename', $event)"
      @delete="$emit('delete', $event)"
      @move="$emit('move', $event)"
    />

    <FileTable
      :files="files"
      @file-click="$emit('file-click', $event)"
      @rename="$emit('rename', $event)"
      @delete="$emit('delete', $event)"
      @move="$emit('move', $event)"
      @copy="$emit('copy', $event)"
      @open="$emit('open', $event)"
    />
  </div>
</template>

<script setup>

import FileTable from './FileTable.vue'


defineProps({
  files: Array,
  folders: Array
})

defineEmits([
  'folder-click',
  'file-click',
  'rename',
  'delete',
  'move',
  'copy',
  'open'
])
</script>
