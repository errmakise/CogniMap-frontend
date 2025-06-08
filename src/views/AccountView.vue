<template>

  <div class="account-header">
    <h2>设置</h2>
  </div>

  <div class="account-section">
    <div class="section-card">
      <div class="card-line" style="cursor: pointer;" @click="startEditing">
        <img :src="userForm.avatar" class="display-avatar">
        <span>{{ userForm.username }}</span>
        <div class="card-funtion" @click="startEditing">
          <span>编辑资料</span>
          <RightArrow color="#9C9C9C" />
        </div>
      </div>
      <div class="divider"></div>
      <div class="card-line">
        <span>手机号：{{ userForm.phone }}</span>
      </div>
    </div>

    <div class="section-card">
      <div class="card-line" style="cursor: pointer;" @click="openBlogSetting">
        <span>设置</span>
        <div class="card-funtion">
          <RightArrow color="#9C9C9C" />
        </div>
      </div>
    </div>

    <div class="section-card" style="cursor: pointer;" @click="handleLogout">
      <span style="display: block; text-align: center;color:#FF0000;
      ">退出登录</span>
    </div>
  </div>

  <el-dialog v-model="isEditing" class="edit-dialog" width="550px" :before-close="cancelEditing" align-center
    :show-close="false">
    <el-form :model="userForm" :rules="rules" ref="editForm">
      <div style="display: flex; justify-content: center; margin-bottom: 30px;">
        <el-upload class="avatar-uploader" :http-request="handleUpload" :show-file-list="false"
          :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" :disabled="!isEditing">
          <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar">
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </div>


      <el-form-item prop="username">
        <el-input v-model="userForm.username" :disabled="!isEditing" />

      </el-form-item>



    </el-form>
    <template #footer>
      <el-button @click="cancelEditing" round color="#DBDBDB">取消</el-button>
      <el-button type="primary" @click="submitForm" round color="#000000">保存</el-button>
    </template>
  </el-dialog>

  <!-- 博客监控设置对话框 -->
  <el-dialog v-model="isBlogSettingOpen" class="setting-dialog" width="550px" :before-close="cancelEditing" align-center
    :show-close="false">
    <div class="setting-content">
      <div class="setting-item">
        <span>浏览博客时默认开启监控</span>
        <el-checkbox v-model="settings.blogMonitoring" />
      </div>


      <div class="setting-item">
        <span>自动在节点描述中关联博客超链接</span>
        <el-checkbox v-model="settings.autoLinkBlog" />
      </div>


      <div class="setting-item">
        <div>创建节点的默认图谱</div>
        <el-radio-group v-model="settings.defaultGraph" text-color="#000000" fill="#E3E3E3">
          <el-radio-button label="none">无</el-radio-button>
          <el-radio-button label="recent">最近打开的</el-radio-button>
        </el-radio-group>
      </div>
    </div>



    <template #footer>
      <el-button @click="closeBlogSetting" round color="#DBDBDB">取消</el-button>
      <el-button type="primary" @click="saveBlogSetting" round color="#000000">保存</el-button>
    </template>
  </el-dialog>

</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { uploadImage, updateUserInfo } from '@/api'
const authStore = useAuthStore()
const isBlogSettingOpen = ref(false)
const settings = ref({
  blogMonitoring: false, // 默认值为 false
  autoLinkBlog: false, // 默认值为 false
  defaultGraph: localStorage.getItem('defaultGraph') || 'recent'
})

const saveBlogSetting = async () => {
  try {
    await authStore.updateUserSettings(settings.value.autoLinkBlog == true ? 1 : 0, settings.value.blogMonitoring == true ? 1 : 0)
    localStorage.setItem('defaultGraph', settings.value.defaultGraph)
    isBlogSettingOpen.value = false
    console.log('保存博客设置', settings.value)
    ElMessage.success('设置已保存')
  } catch (error) {
    ElMessage.error('保存失败')
  }

}
const openBlogSetting = () => {
  console.log('打开博客设置')
  isBlogSettingOpen.value = true;
}
const closeBlogSetting = () => {
  console.log('关闭博客设置')
  isBlogSettingOpen.value = false;
}

const handleUpload = async (file) => {
  try {
    const res = await uploadImage(file)
    userForm.value.avatar = res.data.url
    ElMessage.success('上传成功')
  } catch (error) {
    ElMessage.error('上传失败')
  }
}


const router = useRouter()
const isEditing = ref(false)
const originalData = ref({})

// 用户表单数据
const userForm = ref({
  username: '',
  phone: '',
  avatar: ''
})

// 表单验证规则
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }]
}

// 加载用户信息
onMounted(() => {
  loadUserInfo()
})

const loadUserInfo = () => {
  if (authStore.userInfo) {
    userForm.value = {
      username: authStore.userInfo.username,
      phone: authStore.userInfo.phone,
      avatar: authStore.userInfo.avatar || ''
    }
    originalData.value = { ...userForm.value }
    settings.value.blogMonitoring = authStore.userInfo.settings.autoMonitor == 1? true : false;
    settings.value.autoLinkBlog = authStore.userInfo.settings.autoNode == 1? true : false;
    console.log('加载用户信息', authStore.userInfo)
    console.log('加载用户信息set', settings.value)
  }
}

// 开始编辑
const startEditing = () => {
  console.log('开始编辑')
  isEditing.value = true
}

// 取消编辑
const cancelEditing = () => {
  console.log('取消编辑')
  userForm.value = { ...originalData.value }
  isEditing.value = false
}


// 提交表单
const submitForm = async () => {
  try {
    // 调用更新用户信息的API
    const res = await updateUserInfo({
      username: userForm.value.username,
      avatar: userForm.value.avatar
    })
    console.log('更新用户信息的API', res)

    // 更新本地存储
    authStore.userInfo = {
      ...authStore.userInfo,
      ...userForm.value
    }
    localStorage.setItem('userInfo', JSON.stringify(authStore.userInfo))

    ElMessage.success('信息更新成功')
    isEditing.value = false
  } catch (error) {
    ElMessage.error(error.message || '更新失败')
  }
}

// 头像上传成功处理
const handleAvatarSuccess = (res) => {
  if (res && res.url) {
    userForm.value.avatar = res.url
    ElMessage.success('头像上传成功')
  }
}

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isJPG = ['image/jpeg', 'image/png'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像图片必须是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 退出登录
const handleLogout = () => {
  authStore.logout()
  router.push('/auth')
  ElMessage.success('已退出登录')
}
</script>


<style scoped>
.setting-content {
  padding: 20px 15px;
}

.setting-item {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #000000;

  font-size: 16px;
}

.section-card {
  width: 75%;
  background-color: rgb(237, 237, 237);
  border-radius: 10px;
  padding: 12px 20px;
  font-size: 16px;
}

.account-section {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 30px;
}

.card-funtion {
  color: #525252;
  margin-left: auto;
  display: flex;
  align-items: center;
}

.account-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.account-header {
  margin-top: 30px;
  margin-left: 40px;
  margin-bottom: 30px;
}

.divider {
  height: 3px;
  background-color: #E0E0E0;
  margin: 15px 0;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
  border-radius: 10px;


}


.card-line {
  display: flex;
  align-items: center;
  padding: 0px 5px;
}

.display-avatar {
  width: 60px;
  border-radius: 10px;
  margin-right: 15px;
}
</style>

<style>
.edit-dialog {
  border-radius: 20px;
  padding: 15px 30px;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
}
</style>
