import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as apiLogin, register as apiRegister } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  //const token = ref(localStorage.getItem('token'))
  const token = ref('1')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  const isLoginMode = ref(true)

  const login = async (credentials) => {
    try {
      const res = await apiLogin(credentials)
      token.value = res.token
      userInfo.value = res.user
      localStorage.setItem('token', res.token)
      localStorage.setItem('userInfo', JSON.stringify(res.user))
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const res = await apiRegister({
        phone: userData.phone,
        username: userData.username,
        password: userData.password
      })
      token.value = res.token
      userInfo.value = res.user
      localStorage.setItem('token', res.token)
      localStorage.setItem('userInfo', JSON.stringify(res.user))
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

  return {
    token,
    userInfo,
    isLoginMode,
    login,
    register,
    logout,
    switchMode
  }
})
