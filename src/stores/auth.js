import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  login as apiLogin,
  register as apiRegister,
  resetPassword as apiResetPassword,
  getUserSettings,
  updateUserSettings as apiUpdateUserSettings,
} from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  //const token = ref('1')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const isLoginMode = ref(true)

  const login = async (credentials) => {
    try {
      const res = await apiLogin({
        phone: credentials.phone,
        password: credentials.password,
      })
      token.value = res.token

      localStorage.setItem('token', res.token)
      const res2 = await getUserSettings()
      console.log('获取用户设置', res2)
      userInfo.value = {
        phone: credentials.phone,
        userId: res.userId,
        username: res.username,
        avatar: res.avatar,
        settings: {
          autoNode: res2.autoNode,
          autoMonitor: res2.autoMonitor,
        },
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      console.log('登录成功', res)
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const res = await apiRegister({
        phone: userData.phone,
        username: userData.username,
        password: userData.password,
      })
      console.log('注册成功')
      // 注册成功后自动登录
      // await login({
      //   phone: userData.phone,
      //   password: userData.password,
      // })
      return res
    } catch (error) {
      throw error
    }
  }

  const resetPassword = async (data) => {
    console.log('重置密码', data)
    try {
      const res = await apiResetPassword({
        phone: data.phone,
        password: data.password,
      })
      console.log('重置密码成功', res)
      return res
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  const switchMode = () => {
    isLoginMode.value = !isLoginMode.value
  }

  const updateUserSettings = async (autoNode, autoMonitor) => {
    try {
      const res = await apiUpdateUserSettings(autoNode, autoMonitor)
      userInfo.value.settings = {
        autoNode: autoNode,
        autoMonitor: autoMonitor,
      }
      console.log('更新用户设置成功', res)
      return res
    } catch (error) {
      throw error
    }
  }

  return {
    token,
    userInfo,
    isLoginMode,
    login,
    register,
    logout,
    switchMode,
    resetPassword,
    updateUserSettings,
  }
})
