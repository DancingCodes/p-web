import axios from 'axios'
import { showToast } from '../stores/toast.js'

const api = axios.create({ baseURL: '/api' })

api.interceptors.response.use(
  (res) => {
    if (res.data.code === 500) {
      showToast(res.data.msg || 'Request failed', 'error')
      return Promise.reject(new Error(res.data.msg))
    }
    return res
  },
  (err) => {
    showToast('Network error', 'error')
    return Promise.reject(err)
  },
)

export function getImageList(pageNo = 1, pageSize = 20) {
  return api.get('/image/list', { params: { pageNo, pageSize } })
}

export function uploadImage(file, adminKey) {
  const form = new FormData()
  form.append('file', file)
  return api.post('/image/upload', form, {
    headers: { 'X-Admin-Key': adminKey },
  })
}

export function deleteImage(id, adminKey) {
  return api.delete('/image/delete', {
    params: { id },
    headers: { 'X-Admin-Key': adminKey },
  })
}

export function verifyAdmin(adminKey) {
  return api.post('/admin/verify', null, {
    headers: { 'X-Admin-Key': adminKey },
  })
}
