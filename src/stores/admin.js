import { ref } from 'vue'

export const listVersion = ref(0)

export function bumpListVersion() {
  listVersion.value += 1
}

export const isAdmin = ref(Boolean(localStorage.getItem('adminKey')))

export function getAdminKey() {
  return localStorage.getItem('adminKey') || ''
}

export function setAdminKey(key) {
  localStorage.setItem('adminKey', key)
  isAdmin.value = true
}

export function clearAdminKey() {
  localStorage.removeItem('adminKey')
  isAdmin.value = false
}
