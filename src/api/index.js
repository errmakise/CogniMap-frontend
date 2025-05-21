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
export const fetchGraphNodes = (id) => request.get(`/graph/${id}/node`)
export const updateGraphNode = (id, data) => request.put(`/graph/node/${id}`, data)
export const createGraphNode = (id,data) => request.post(`/graph/${id}/node`, data)
export const deleteGraphNode = (id) => request.delete(`/graph/node/${id}`)
export const createGraphLink = (id,data) => request.post(`/graph/${id}/relation`, data)
export const deleteGraphLink = (id) => request.delete(`/graph/relation/${id}`)
export const fetchGraphLinks = (id) => request.get(`/graph/${id}/relation`)
export const fetchNodeDetails= (id) => request.get(`/graph/node/${id}`)

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
export const renameFolder = (id, newName, folderId) =>
  request.put(`/file/folder/${id}`, {
    name: newName,
    folderId,
  })
export const deleteFolder = (id) => request.delete(`/file/folder/${id}`)
export const deleteFile = (id) => request.delete(`/file/file/${id}`)
export const moveFile = (id, folderId, newName) =>
  request.put(`/file/file/${id}`, {
    name: newName,
    folderId,
  })
export const exportGraph = (id) => request.get(`/files/${id}/export`, { responseType: 'blob' })
export const createCopy = (id) => request.post(`/files/${id}/copy`)
export const copyFile = (id, newPath) => request.post(`/files/${id}/copy`, { newPath })

export const getFilePath = (id) => request.get(`/file/path/${id}`)
export const fetchAllGraphs = (pageNo = 1, pageSize = 10) => request.get('/file/graph',{
  params: {
    pageNo,
    pageSize,
  },
})


//问答相关API
export const fetchQuestionsList = () =>
  request.get('/agent')
export const fetchQuestionDetail = (id) => request.get(`/agent/${id}`)
export const renameQuestion = (id, title) =>
  request.put(`/agent/${id}`, { title: title })
export const deleteQuestion = (id) =>
  request.delete(`/question/${id}`)
export const createQuestion = () => request.post('/agent')
export const updateQuestion = (id, question) => request.post(`/agent/${id}`, {question: question})



export const fetchMdFile = (id) => request.get(`/file/file/${id}`)
export const updateMdFile = (id, content,title) => request.post(`/file/file/${id}`,{
  content,
  title,
})
