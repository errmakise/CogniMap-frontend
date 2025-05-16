<template>
  <div class="qa-container">
    <!-- 左侧历史对话栏 -->
    <div class="history-sidebar">
      <div class="create-button" @click="startNewConversation">
        <QA2 />
        新建对话
      </div>

      <div v-for="(conv, index) in conversations" :key="index" class="conversation-item"
        :class="{ 'active-conversation': currentConversationIndex === index }" @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = -1">
        <div class="conv-content" @click="selectConversation(index)">
          {{ conv.title || '新对话' }}
        </div>
        <el-dropdown>
          <div class="more-actions" v-if="hoveredIndex === index || currentConversationIndex === index">
            <el-icon>
              <MoreFilled />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="renameConversation(index)">
                <div class="oprate-item">
                  <Edit />
                  <span>重命名</span>
                </div>
              </el-dropdown-item>
              <el-dropdown-item @click="deleteConversation(index)">
                <div class="oprate-item">
                  <Delete />
                  <span>删除</span>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 主问答区域 -->
    <div class="qa-main">
      <el-scrollbar class="messages-container">

        <div v-for="(msg, idx) in currentConversation.messages" :key="idx" class="message" :class="msg.role">
          <div v-if="!msg.recommendation" class="message-content">{{ msg.content }}</div>

          <div v-else class="dialog-container">
            <div class="left-panel">
              <el-table :data="currentKnowledgeList(msg)" style="width: 100%" height="100%" border
                allow-drag-last-column="false" :header-cell-style="{ background: '#f5f7fa', color: '#606266' }">
                <el-table-column prop="point" label="知识点" width="100" align="center" />
                <el-table-column prop="reason" label="推荐理由" align="center" width="380" />
                <el-table-column label="" align="center" width="50">
                  <template #default="scope">
                    <AddInQa @click="addKnowledge(scope.row)" />
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="right-panel">
              <!-- 切换按钮组 -->
              <div class="switch-buttons">
                <div class="custom-vertical-btn" :class="{ 'active-btn': activeTab === 'prerequisiteKnowledge' }"
                  @click="switchTab('prerequisiteKnowledge')">
                  <span>前</span>
                  <span>置</span>
                </div>
                <div class="custom-vertical-btn" :class="{ 'active-btn': activeTab === 'postrequisiteKnowledge' }"
                  @click="switchTab('postrequisiteKnowledge')">
                  <span>拓</span>
                  <span>展</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>

        <!-- 输入区域 -->
        <div class="input-area">
          <input v-model="userInput" class="input-field" placeholder="输入您的问题..." @keyup.enter="submitQuestion">
          </input>
          <el-button type="primary" @click="submitQuestion">发送</el-button>
        </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { MoreFilled } from '@element-plus/icons-vue'
import {
  fetchQuestionsList, fetchQuestionDetail, renameQuestion
  , deleteQuestion, createQuestion, updateQuestion,
} from '@/api'

const conversations = ref([
])

const currentConversationIndex = ref(-1)
const hoveredIndex = ref(-1)
const userInput = ref('')



const currentConversation = computed(() => {
  if (currentConversationIndex.value >= 0) {
    return conversations.value[currentConversationIndex.value]
  }
  return {
    title: `新对话 ${conversations.value.length + 1}`,
    messages: [{ role: 'assistant', content: '您好，请问有什么可以帮助您的？' }]
  }
})



const getQuestionDetail = async (id) => {
  try {
    const response = await fetchQuestionDetail(id)
    console.log("获取问题详情", response)
    return response
  } catch (error) {
    console.error('获取问题详情失败', error)
    throw error
  }
}

const selectConversation = async (index) => {
  currentConversationIndex.value = index


  console.log("当前对话", conversations.value[index])
  if (conversations.value[index].id) {
    const content = await getQuestionDetail(conversations.value[index].id)
    conversations.value[index] = {
      ...conversations.value[index],
      messages: content
    }
  }
}




const startNewConversation = () => {
  console.log("开始新对话")
  // 设置为当前对话
  currentConversationIndex.value = -1
  userInput.value = ''
}

const renameConversation = (index) => {
  ElMessage.prompt('请输入新对话名称', '重命名对话', {
    inputValue: conversations.value[index].title
  }).then(({ value }) => {
    conversations.value[index].title = value
  })
}

const deleteConversation = (index) => {
  if (conversations.value.length <= 1) {
    ElMessage.warning('至少保留一个对话')
    return
  }
  conversations.value.splice(index, 1)
  if (currentConversationIndex.value >= index) {
    currentConversationIndex.value = Math.max(0, currentConversationIndex.value - 1)
  }
}

// 创建新对话
const createNewConversation = async () => {
  try {
    const response = await createQuestion();
    console.log("创建新对话", response)
    const tempConversation = ref({
      ...response,
      messages: []
    })

    conversations.value.push(tempConversation.value)
    currentConversationIndex.value = conversations.value.length - 1

  } catch (error) {
    console.error('创建新对话失败', error)
  }

}

// 提交问题
const submitQuestion = async () => {
  if (!userInput.value.trim()) return

  if (currentConversationIndex.value < 0) {
    await createNewConversation()
  }
  const question = userInput.value
  userInput.value = ''

  console.log("当前对话", currentConversation.value, "question", question)


  // 添加用户问题
  currentConversation.value.messages.push({
    role: 'user',
    content: question
  })




  try {
    const response = await updateQuestion(currentConversation.value.id, question)
    console.log("回复内容", response)
    // 添加助手回复
    currentConversation.value.messages.push({
      role: 'assistant',
      content: '',
      recommendation: {
        ...response,
      }
    })
  } catch (error) {
    console.error('获取回答失败', error)
  }

}

const createKnowledgeNode = async (knowledge) => {
  try {
    await createGraphNode({
      name: knowledge.topic,
      description: knowledge.reason,
      graphId: 'current' // 实际使用时替换为当前图谱ID
    })
    ElMessage.success('知识节点创建成功')
  } catch (error) {
    ElMessage.error('创建节点失败')
    console.error(error)
  }
}

const getQuestionHistory = async () => {
  try {
    const response = await fetchQuestionsList()
    conversations.value = response.map(question => ({
      ...question,
    }))

    console.log("获取历史问题", response)
  } catch (error) {
    console.error('获取历史问题失败', error)
  }
}

onMounted(async () => {
  await getQuestionHistory()
  startNewConversation()
})

const activeTab = ref('prerequisiteKnowledge')

const currentKnowledgeList = (msg) => {
  if (!msg.recommendation) return []
  return msg.recommendation[activeTab.value] || []
}

const switchTab = (tab) => {
  activeTab.value = tab
}
</script>

<style scoped>
.custom-vertical-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 0 10px 10px 0px;
  padding: 10px 10px;
  margin-bottom: 2px;
  font-size: 14px;
  cursor: pointer;
  background-color: transparent;
  color: #606266;
  transition: all 0.3s;
  background-color: #F2F2F2;
}

.custom-vertical-btn:hover {
  background-color: #d8e7ff;
}

.custom-vertical-btn.active-btn {
  background-color: #409eff;
  color: white;
}

.custom-vertical-btn span {
  line-height: 1;
  margin: 2px 0;
}

.dialog-container {
  display: flex;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", Arial, sans-serif;
}



.right-panel {
  position: relative;
  box-sizing: border-box;
}

.switch-buttons {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 20px;
}




.create-button {
  border: 1px solid #afafaf;
  border-radius: 15px;
  width: 100%;
  padding: 18px 15px;
  align-items: center;
  display: flex;
  justify-content: center;
  gap: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 2vh;
}


.create-button:hover {
  background-color: #fafafa;
}

.qa-container {
  display: flex;
  height: 100vh;
}

.history-sidebar {
  width: 200px;
  padding: 20px;
  border-right: 1px solid #eaeaea;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  background-color: #FAFAFA;
}

.conversation-item:hover {
  background-color: #eeeeee;
}

.conversation-item.active-conversation {
  background-color: #e0e0e0;
  font-weight: 500;
}

.conv-content {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-actions {
  padding: 0 5px;
  color: #999;
}

.qa-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
}

.message {
  margin-bottom: 15px;
  padding: 10px 15px;
  border-radius: 8px;
  max-width: 60%;
  width: fit-content;
}

.message.user {
  margin-left: auto;
  background-color: #e3f2fd;
}

.message.assistant {
  margin-right: auto;
}

.input-area {

  margin: 30px 5vw;
  padding: 15px 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #F5F5F5;
  border-radius: 15px;
  margin-top: auto;
}

.input-field {
  width: 80%;
  background-color: #F5F5F5;
  border: 0;
  height: 100%;
}

.intent-selector {
  margin: 15px 0;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
}

.knowledge-section {
  margin-top: 20px;
}

.knowledge-item {
  padding: 15px;
  margin-bottom: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.oprate-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
