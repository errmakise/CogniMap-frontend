import request from '@/utils/request'

export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/common/image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 认证相关API
export const login = (data) =>
  request.get('/user/login', { params: { phone: data.phone, password: data.password } })
export const register = (data) => request.post('/user/register', data)
export const getUserInfo = () => request.get('/auth/user')
export const logout = () => request.post('/auth/logout')
export const resetPassword = (data) =>
  request.put('/user/password', { phone: data.phone, password: data.password })

export const updateUserInfo = (data) => request.put('/user', data)

// 图谱相关API
export const fetchGraphList = () => request.get('/graph/list')
export const createGraph = (data) => request.post('/graph', data)
export const updateGraph = (id, data) => request.put(`/graph/${id}`, data)
export const deleteGraph = (id) => request.delete(`/graph/${id}`)

// 文件相关API
export const uploadFile = (data) => {
  const formData = new FormData()
  formData.append('file', data.file)
  return request.post('/file/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

// 文件管理API
export const fetchFiles = (folderId = 0, pageNo = 1, pageSize = 10) =>
  request.get(`/file/${folderId}`, {
    params: {
      pageNo,
      pageSize,
    },
  })
export const createFolder = (name, folderId) =>
  request.post('/file/folder', {
    name,
    folderId,
  })
export const createNewFile = (fileName, fileType, folderId) =>
  request.post('/file/file', {
    fileName,
    fileType,
    folderId,
  })
export const renameFile = (id, newName, folderId) =>
  request.put(`/file/file/${id}`, {
    name: newName,
    folderId,
  })

export const deleteFile = (id) => request.delete(`/files/${id}`)
export const moveFile = (id, folderId, newName) =>
  request.put(`/file/file/${id}`, {
    name: newName,
    folderId,
  })
export const exportGraph = (id) => request.get(`/files/${id}/export`, { responseType: 'blob' })
export const createCopy = (id) => request.post(`/files/${id}/copy`)
export const copyFile = (id, newPath) => request.post(`/files/${id}/copy`, { newPath })
