<template>

  <div class="auth-container">
    <BackGround class="background" />
    <div class="auth-box">
      <div class="auth-header">
        <h2>{{ isLoginMode ? '登录' : '注册' }}</h2>
      </div>

      <el-form :model="form" :rules="rules" ref="authForm" size="large">
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="手机号" prefix-icon="User" />
        </el-form-item>
        <el-form-item v-if="!isLoginMode" prop="username">
          <el-input v-model="form.username" placeholder="用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" />
        </el-form-item>


        <el-form-item v-if="!isLoginMode" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" prefix-icon="Lock" />
        </el-form-item>

        <el-button type="primary" color="#000000" round @click="submitForm" class="auth-btn">
          {{ isLoginMode ? '登录' : '注册' }}
        </el-button>
      </el-form>

      <div class="auth-footer">
        <div class="switch-mode">
          {{ isLoginMode ? '没有账号？' : '已有账号？' }}
          <span @click="switchAuthMode">{{ isLoginMode ? '立即注册' : '立即登录' }}</span>
        </div>
        <div class="forgot-password" v-if="isLoginMode">
          <span @click="showForgotPasswordDialog">忘记密码？</span>
        </div>
      </div>
    </div>

    <!-- 找回密码对话框 -->
    <el-dialog v-model="forgotPasswordVisible" title="修改密码" align-center width="400px" class="forgot-password-dialog">
      <el-form :model="forgotForm" :rules="forgotRules" ref="forgotFormRef">
        <el-form-item prop="phone" label="手机号">
          <el-input v-model="forgotForm.phone" placeholder="请输入注册手机号" />
        </el-form-item>
        <el-form-item prop="newPassword" label="新密码">
          <el-input v-model="forgotForm.newPassword" type="password" placeholder="请输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="forgotPasswordVisible = false" round>取消</el-button>
        <el-button type="primary" @click="submitForgotPassword" round color="#000000">确认修改</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ElLoading } from 'element-plus'
const authStore = useAuthStore()
const router = useRouter()
const isLoginMode = computed(() => authStore.isLoginMode)

onMounted(() => {
  console.log('isLoginMode', isLoginMode.value)
})

const form = ref({
  phone: '',
  username: '',
  password: '',
  confirmPassword: ''
})

const validatePass = (rule, value, callback) => {
  if (value !== form.value.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ]
}

const submitForm = async () => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  try {
    // 先校验表单
    await authForm.value.validate()

    if (isLoginMode.value) {
      await authStore.login({
        phone: form.value.phone,
        password: form.value.password
      })
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      await authStore.register({
        phone: form.value.phone,
        username: form.value.username,
        password: form.value.password
      })
      ElMessage.success('注册成功')
      authStore.isLoginMode = true
      form.value = { phone: '', username: '', password: '', confirmPassword: '' } // 重置表单时包含用户名
    }
  } catch (error) {
    // if(error.message){
    //   ElMessage.error(error.message)
    // }
  }finally{
    loading.close()
  }
}

const switchAuthMode = () => {
  authStore.switchMode()
  form.value = { phone: '', username: '', password: '', confirmPassword: '' } // 重置表单时包含用户名
}

const forgotPasswordVisible = ref(false)

const forgotFormRef = ref(null)
const authForm = ref(null)

const forgotForm = ref({
  phone: '',
  newPassword: ''
})

const forgotRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    //{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: ['blur', 'change'] }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    //{ min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}
const showForgotPasswordDialog = () => {
  forgotPasswordVisible.value = true
}

const submitForgotPassword = async () => {
  try {
    //forgotFormRef ：是通过 ref() 创建的模板引用，
    // 指向忘记密码表单的 el-form 组件实例
    // 会检查表单中所有配置了 rules 的表单项
    // 如果有任何验证失败，Promise会reject并包含错误信息
    await forgotFormRef.value.validate()
    // 调用修改密码API
    await authStore.resetPassword({
      phone: forgotForm.value.phone,
      password: forgotForm.value.newPassword
    })
    ElMessage.success('密码修改成功')
    forgotPasswordVisible.value = false
    forgotForm.value = { phone: '', newPassword: '' }
  } catch (error) {
    ElMessage.error(error.message || '修改失败')
  }
}
</script>

<style scoped>
:deep(.forgot-password-dialog) {
  border-radius: 15px;
  padding: 20px;
  padding-top: 30px;
}


.el-form-item {
  margin-top: 30px;
}

.auth-footer {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

.forgot-password {
  margin-top: 15px;
  text-align: center;
}

.forgot-password span {
  color: #666;
  cursor: pointer;
  text-decoration: underline;
}

.forgot-password span:hover {
  color: #409eff;
}

.background {
  position: absolute;
  bottom: 0;
  left: 0;
}

.auth-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  overflow: hidden;
}

.auth-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-btn {
  width: 100%;
  margin-top: 10px;
}

.switch-mode {
  margin-top: 20px;
  text-align: center;
  color: #666;
}

.switch-mode span {
  color: #409eff;
  cursor: pointer;
}
</style>
