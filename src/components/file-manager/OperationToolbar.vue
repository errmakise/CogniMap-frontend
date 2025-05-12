<template>
  <div class="toolbar">
    <el-dropdown @command="$emit('command', $event)">
      <div class="function-button">
        <AddFile />
        <span>新建</span>
        <DownArrow style="margin-left: auto;" />
      </div>

      <template #dropdown>
        <el-dropdown-menu style="width: 200px;">
          <el-dropdown-item command="graph">
            <div class="create-item">
              <GraphFile size="36" color="#00000" />
              <span>知识图谱</span>
            </div>
          </el-dropdown-item>

          <el-dropdown-item command="folder">
            <div class="create-item">
              <Folder size="36" />
              <span>文件夹</span>
            </div>
          </el-dropdown-item>

          <el-dropdown-item command="md">
            <div class="create-item">
              <MdFile size="36" color="#00000" />
              <span>文档</span>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <div class="function-button" @click="$emit('upload-click')">
      <Upload />
      <span>上传</span>
    </div>
  </div>
</template>

<script setup>

</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 20px;
}

.function-button {
  width: 200px;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  color: black;
  border: 1px solid #dcdfe6;
  padding: 15px 15px 15px 20px;
  border-radius: 15px;
}

.create-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #606266;
  transition: all 0.2s;
  margin-bottom: 5px;
}
</style>
