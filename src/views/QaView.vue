<template>
  <div class="qa-container">
    <!-- 左侧历史对话栏 -->
    <div class="history-sidebar">
      <div class="create-button" @click="startNewConversation">
        <QA2 />
        新建对话
      </div>

      <div v-for="(conv, index) in conversations" :key="index" class="conversation-item"
      :class="{ 'active-conversation': currentConversationIndex === index }"
      @mouseenter="hoveredIndex = index" @mouseleave="hoveredIndex = -1">
        <div class="conv-content" @click="selectConversation(index)">
          {{ conv.title || '新对话' }}
        </div>
        <el-dropdown>
          <div class="more-actions" v-if="hoveredIndex === index||currentConversationIndex === index">
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
      <div class="messages-container">
        <div v-for="(msg, idx) in (tempConversation || currentConversation).messages" :key="idx" class="message"
          :class="msg.role">
          <div class="message-content">{{ msg.content }}</div>
        </div>
      </div>



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
  {
    title: '初始对话',
    messages: [
      { role: 'assistant', content: '您好，请问有什么可以帮助您的？' }
    ]
  }
])

const currentConversationIndex = ref(0)
const hoveredIndex = ref(-1)
const userInput = ref('')
const showIntentSelector = ref(false)

const currentConversation = computed(() => conversations.value[currentConversationIndex.value])


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
    conversations.value[index]={
      ...conversations.value[index],
      messages: content.map(msg => ({
        role: msg.role,
        content: msg.content,
        recomemdation: {
        ...msg.recomemdation,
        }
      }))
    }
  }
}

const tempConversation = ref(null) // 临
const startNewConversation = () => {
  tempConversation.value = {
    title: `新对话 ${conversations.value.length + 1}`,
    id: null,
    userId: null,
    createTime: null,
    updateTime: null,
    messages: []
  }
  // 设置为当前对话
  currentConversation.value = tempConversation.value
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
    tempConversation.value = {
      ...response,
      messages: []
    }

    conversations.value.push(tempConversation.value)
    currentConversationIndex.value = conversations.value.length - 1
    tempConversation.value = null
  } catch (error) {
    console.error('创建新对话失败', error)
  }

}

// 提交问题
const submitQuestion = async () => {
  if (!userInput.value.trim()) return

  if (tempConversation.value) {
    await createNewConversation()
  }
  const question = userInput.value
  userInput.value = ''

  console.log("当前对话", currentConversation.value,"question",question)


  // 添加用户问题
  currentConversation.value.messages.push({
    role: 'user',
    content: question
  })




  try {
    const response = await updateQuestion(currentConversation.value.id, question)
    currentConversation.value.messages.push({
      role: 'assistant',
      content: response.answer
    })
    console.log("回复内容", response)
    // 添加助手回复
    currentConversation.value.messages.push({
      role: 'assistant',
      content: response.answer,
      recomemdation: {
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
  if (conversations.value.length > 0) {
    await selectConversation(0);
  }
})
</script>

<style scoped>
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
}

.message.user {
  margin-left: auto;
  background-color: #e3f2fd;
}

.message.assistant {
  margin-right: auto;
  background-color: #f1f1f1;
}

.input-area {
  margin: 30px 5vw;
  padding: 15px 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #F5F5F5;
  border-radius: 15px;

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
