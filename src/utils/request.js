import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'


// 创建axios实例
const service = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    const authStore = useAuthStore()
    config.headers['Content-Type'] = 'application/json'
    if (authStore.token) {
      console.log('token', authStore.token)
      config.headers['Authorization'] = `${authStore.token.trim()}`
    }
    return config
  },
  error => {
     return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data

    // 自定义业务状态码处理
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res.data
  },
  error => {
    // 处理HTTP错误状态码
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 处理token过期
          ElMessage.error('登录已过期，请重新登录')
          const authStore = useAuthStore()
          authStore.logout()
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data.message || '请求失败')
      }
    }
    console.error('请求失败', error.config.url, error.config.headers)

    return Promise.reject(error)
  }
)

export default service
