import request from '@/utils/request'

// 认证相关API
export const login = data => request.post('/user/login', data)
export const register = data => request.post('/user/register', data)
export const getUserInfo = () => request.get('/auth/user')
export const logout = () => request.post('/auth/logout')
// 找回密码API
export const requestPasswordReset = (email) => {
  return request.post('/auth/forgot-password', { email })
}

// 图谱相关API
export const fetchGraphList = () => request.get('/graph/list')
export const createGraph = data => request.post('/graph', data)
export const updateGraph = (id, data) => request.put(`/graph/${id}`, data)
export const deleteGraph = id => request.delete(`/graph/${id}`)

// 文件相关API
export const uploadFile = data => {
  const formData = new FormData()
  formData.append('file', data.file)
  return request.post('/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 文件管理API
export const fetchFiles = (path = '') => request.get(`/files?path=${path}`)
export const createFile = (data) => request.post('/files', data)
export const renameFile = (id, newName) => request.put(`/files/${id}/rename`, { newName })
export const deleteFile = (id) => request.delete(`/files/${id}`)
export const moveFile = (id, newPath) => request.put(`/files/${id}/move`, { newPath })
export const exportGraph = (id) => request.get(`/files/${id}/export`, { responseType: 'blob' })
export const createCopy = (id) => request.post(`/files/${id}/copy`)
export const copyFile = (id, newPath) => request.post(`/files/${id}/copy`, { newPath })
