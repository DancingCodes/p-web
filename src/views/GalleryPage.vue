<template>
  <div class="p-3">
    <div class="text-lg font-600 cursor-pointer pb-2" @click="toggleAdmin">Gallery</div>

    <div v-if="images.length === 0 && !loading" class="text-stone-300 text-sm py-32 text-center">No images yet</div>

    <div class="[column-width:260px] [column-gap:10px] max-sm:[column-width:160px] max-sm:[column-gap:6px]">
      <ImageCard
        v-for="img in images"
        :key="img.id"
        :image="img"
        :admin="isAdmin"
        @click="viewerImage = img"
        @delete="handleDelete(img)"
      />
    </div>

    <div v-if="loading" class="text-stone-300 text-sm py-8 text-center">Loading...</div>

    <div
      v-if="isAdmin"
      class="fixed right-5 bottom-5 w-13 h-13 rounded-2xl bg-stone-800 text-white shadow-lg flex items-center justify-center cursor-pointer z-100"
      @click="showUpload = true"
    >
      <Plus :size="24" stroke-width="1.5" />
    </div>

    <UploadModal
      v-if="showUpload"
      :admin-key="adminKey"
      @close="showUpload = false"
      @uploaded="img => { images.unshift(img); showUpload = false }"
    />

    <ImageViewer
      v-if="viewerImage"
      :current="viewerImage"
      @close="viewerImage = null"
    />

    <div v-if="showKeyInput" class="fixed inset-0 z-1000 bg-black/30 flex items-center justify-center" @click.self="showKeyInput = false">
      <div class="bg-white rounded-2xl p-8 w-72">
        <div class="text-lg font-600 mb-1">Admin Key</div>
        <div class="text-sm text-stone-400 mb-5">Enter admin key to continue</div>
        <input
          v-model="keyInput"
          type="password"
          placeholder="Key"
          class="w-full px-3 py-2 rounded-lg bg-stone-50 text-sm border border-stone-200 box-border"
          @keyup.enter="verifyKey"
        />
        <div class="flex justify-end gap-3 mt-5">
          <div class="text-sm text-stone-400 px-4 py-1.5 cursor-pointer" @click="showKeyInput = false">Cancel</div>
          <div class="text-sm text-white bg-stone-800 rounded-lg px-5 py-1.5 font-500 cursor-pointer" @click="verifyKey">OK</div>
        </div>
      </div>
    </div>

    <ConfirmModal
      :show="showConfirm"
      :message="confirmMsg"
      :loading="confirming"
      @confirm="onConfirmDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Plus } from '@lucide/vue'
import { getImageList, deleteImage, verifyAdmin } from '../api/index.js'
import ImageCard from '../components/ImageCard.vue'
import ImageViewer from '../components/ImageViewer.vue'
import UploadModal from '../components/UploadModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const images = ref([])
const loading = ref(false)
const pageNo = ref(1)
const total = ref(0)
const hasMore = ref(true)

const isAdmin = ref(false)
const adminKey = ref('')
const showKeyInput = ref(false)
const keyInput = ref('')
const showUpload = ref(false)
const viewerImage = ref(null)
const showConfirm = ref(false)
const confirmMsg = ref('')
const confirming = ref(false)
let pendingDelete = null

onMounted(() => {
  if (localStorage.getItem('adminKey')) {
    adminKey.value = localStorage.getItem('adminKey')
    isAdmin.value = true
  }
  loadMore()
  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))

function onScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement
  if (scrollTop + clientHeight >= scrollHeight - 200 && hasMore.value && !loading.value) {
    loadMore()
  }
}

async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const res = await getImageList(pageNo.value)
    const { list, total: t } = res.data.data
    images.value.push(...list)
    total.value = t
    pageNo.value++
    hasMore.value = images.value.length < total.value
  } finally {
    loading.value = false
  }
}

function toggleAdmin() {
  if (isAdmin.value) {
    isAdmin.value = false
    adminKey.value = ''
    localStorage.removeItem('adminKey')
  } else {
    showKeyInput.value = true
  }
}

async function verifyKey() {
  await verifyAdmin(keyInput.value)
  adminKey.value = keyInput.value
  isAdmin.value = true
  localStorage.setItem('adminKey', keyInput.value)
  keyInput.value = ''
  showKeyInput.value = false
}

function handleDelete(img) {
  pendingDelete = img
  confirmMsg.value = `Delete ${img.name}?`
  showConfirm.value = true
}

async function onConfirmDelete() {
  confirming.value = true
  await deleteImage(pendingDelete.id, adminKey.value)
  images.value = images.value.filter(i => i.id !== pendingDelete.id)
  confirming.value = false
  showConfirm.value = false
  pendingDelete = null
}
</script>
