import axios from 'axios'
import { showFailToast } from 'vant'

const api = axios.create({ baseURL: '/api' })

api.interceptors.response.use(
  (res) => {
    if (res.data.code === 500) {
      showFailToast(res.data.msg || 'Request failed')
      return Promise.reject(new Error(res.data.msg))
    }
    return res
  },
  (err) => {
    showFailToast('Network error')
    return Promise.reject(err)
  },
)

export function getImageList(pageNo = 1, pageSize = 20, category = 'all') {
  return api.get('/image/list', { params: { pageNo, pageSize, category } })
}

export function getVideoList(pageNo = 1, pageSize = 20, category = 'all') {
  return api.get('/video/list', { params: { pageNo, pageSize, category } })
}

export function getImageDetail(id) {
  return api.get('/image/detail', { params: { id } })
}

export function getVideoDetail(id) {
  return api.get('/video/detail', { params: { id } })
}

export function uploadImage(file, { name, category }, adminKey) {
  const form = new FormData()
  form.append('file', file)
  form.append('name', name || '')
  form.append('category', category)
  return api.post('/image/upload', form, {
    headers: { 'X-Admin-Key': adminKey },
  })
}

export function uploadVideo(file, cover, { name, category }, adminKey) {
  const form = new FormData()
  form.append('file', file)
  form.append('cover', cover)
  form.append('name', name || '')
  form.append('category', category)
  return api.post('/video/upload', form, {
    headers: { 'X-Admin-Key': adminKey },
  })
}

export function updateImage(id, { name, category, file }, adminKey) {
  const form = new FormData()
  form.append('id', id)
  form.append('name', name || '')
  form.append('category', category)
  if (file) form.append('file', file)
  return api.post('/image/update', form, {
    headers: { 'X-Admin-Key': adminKey },
  })
}

export function updateVideo(id, { name, category, file, cover }, adminKey) {
  const form = new FormData()
  form.append('id', id)
  form.append('name', name || '')
  form.append('category', category)
  if (file) form.append('file', file)
  if (cover) form.append('cover', cover)
  return api.post('/video/update', form, {
    headers: { 'X-Admin-Key': adminKey },
  })
}

export function deleteImage(id, adminKey) {
  return api.delete('/image/delete', {
    params: { id },
    headers: { 'X-Admin-Key': adminKey },
  })
}

export function deleteVideo(id, adminKey) {
  return api.delete('/video/delete', {
    params: { id },
    headers: { 'X-Admin-Key': adminKey },
  })
}

export function verifyAdmin(adminKey) {
  return api.post('/admin/verify', null, {
    headers: { 'X-Admin-Key': adminKey },
  })
}
