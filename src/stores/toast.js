import { reactive } from 'vue'

export const toasts = reactive([])

export function showToast(msg, type = 'info') {
  const id = Date.now()
  toasts.push({ id, msg, type })
  setTimeout(() => {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx > -1) toasts.splice(idx, 1)
  }, 2500)
}
