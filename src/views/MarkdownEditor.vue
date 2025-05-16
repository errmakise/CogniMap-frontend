<template>
  <div class="editor-container">
    <v-md-editor
      v-model="content"
      height="calc(100vh - 60px)"
      :disabled-menus="[]"
      @upload-image="handleUploadImage"
    />
    <div class="editor-footer">
      <el-button type="primary" @click="saveContent">保存</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import VMdEditor from '@kangc/v-md-editor'
import githubTheme from '@kangc/v-md-editor/lib/theme/github'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import '@kangc/v-md-editor/lib/theme/style/github.css'
import { fetchMdFile, updateMdFile } from '@/api'
import axios from 'axios'

VMdEditor.use(githubTheme)

const route = useRoute()
const fileId = route.params.id
const content = ref('')

const loadFileContent = async () => {
  try {
    const res = await fetchMdFile(fileId)

    if (res) {
      console.log(res)
      const contentRes = await axios.get(res.contentUrl)
      content.value = contentRes.data
      console.log(content.value)
    }
  } catch (error) {
    ElMessage.error('获取文件内容失败')
    console.error(error)
  }
}



// 保存文件内容
const saveContent = async () => {
  try {
    const blob = new Blob([content.value], { type: 'text/markdown' })
    const file = new File([blob], `${fileId}.md`, { type: 'text/markdown' })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('id', fileId)

    await updateMdFile(fileId, formData)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
    console.error(error)
  }
}
// 图片上传处理
const handleUploadImage = async (event, insertImage, files) => {
  // 这里实现图片上传逻辑
  // 上传完成后调用 insertImage(url)
}

onMounted(() => {
  loadFileContent()
})
</script>

<style scoped>
.editor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-footer {
  padding: 10px;
  background: #fff;
  border-top: 1px solid #eee;
  text-align: right;
}
</style>
