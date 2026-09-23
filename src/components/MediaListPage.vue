<template>
  <div class="media-page">
    <AppHeader :admin="isAdmin" :type="mediaType" :category="category" @filter="onFilterChange" @upload="goUpload"
      @exit-admin="exitAdmin" />

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list v-model:loading="loading" :finished="!hasMore" :finished-text="items.length ? '没有更多了' : ''"
        @load="loadMore">
        <van-empty v-if="!items.length && !loading && !refreshing" :description="emptyText" />

        <masonry-wall v-else :items="items" :column-width="columnWidth" :gap="gap" class="masonry-grid">
          <template #default="{ item }">
            <MediaCard :item="item" :type="mediaType" :admin="isAdmin" @click="openPreview(item)" @edit="goEdit(item)"
              @delete="handleDelete(item)" />
          </template>
        </masonry-wall>
      </van-list>
    </van-pull-refresh>

    <div v-if="!isAdmin" class="admin-trigger" @click="showAdminKey = true" />

    <van-dialog v-model:show="showAdminKey" title="Admin Key" show-cancel-button :before-close="beforeAdminClose">
      <div class="admin-dialog-body">
        <van-field v-model="keyInput" type="password" placeholder="Key" clearable :disabled="verifying" />
      </div>
    </van-dialog>

    <van-popup v-if="mediaType === 'video'" v-model:show="showVideoPlayer" closeable round position="center"
      :style="{ width: '92%', background: '#000' }">
      <video v-if="currentVideo" class="video-player" :src="currentVideo.url" controls autoplay playsinline />
    </van-popup>

    <div v-if="mediaType === 'image' && previewImage" ref="previewRef" class="image-preview"
      @touchstart.passive="onPreviewTouchStart" @touchend.passive="onPreviewTouchEnd">
      <div class="image-preview-bar">
        <span class="image-preview-index">{{ previewIndex + 1 }} / {{ items.length }}</span>
        <button type="button" class="image-preview-close" aria-label="关闭" @click="closePreview">
          <van-icon name="cross" size="16" />
        </button>
      </div>
      <div class="image-preview-body" @click="closePreview">
        <img :src="previewImage.url" :alt="previewImage.name || ''" @click.stop />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onActivated, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  showConfirmDialog,
  showFailToast,
  showSuccessToast,
} from 'vant'
import { MasonryWall } from '@yeger/vue-masonry-wall'
import {
  getImageList,
  getVideoList,
  deleteImage,
  deleteVideo,
  verifyAdmin,
} from '../api/index.js'
import { clearAdminKey, getAdminKey, isAdmin, listVersion, setAdminKey } from '../stores/admin.js'
import AppHeader from './AppHeader.vue'
import MediaCard from './MediaCard.vue'

const props = defineProps({
  mediaType: {
    type: String,
    required: true,
    validator: (value) => ['image', 'video'].includes(value),
  },
})

const router = useRouter()
const emptyText = computed(() => (props.mediaType === 'video' ? '暂无视频' : '暂无图片'))

function goUpload() {
  router.push({
    name: 'upload',
    query: { type: props.mediaType },
  })
}

function goEdit(item) {
  router.push({
    name: 'edit',
    query: { type: props.mediaType, id: item.id },
  })
}

function exitAdmin() {
  clearAdminKey()
  adminKey.value = ''
  showSuccessToast('已退出管理')
}

const items = ref([])
const loading = ref(false)
const refreshing = ref(false)
const fetching = ref(false)
const pageNo = ref(1)
const hasMore = ref(true)
const category = ref('all')
const seenListVersion = ref(listVersion.value)

const adminKey = ref(getAdminKey())
const showAdminKey = ref(false)
const keyInput = ref('')
const verifying = ref(false)
const showVideoPlayer = ref(false)

// Masonry配置
const columnWidth = ref(window.innerWidth >= 768 ? 280 : 120)
const gap = ref(16)
const currentVideo = ref(null)
const previewIndex = ref(-1)
const previewRef = ref(null)
const touchStartX = ref(0)
const touchStartY = ref(0)

const previewImage = computed(() =>
  previewIndex.value >= 0 ? items.value[previewIndex.value] || null : null,
)

watch(previewImage, (value) => {
  document.body.style.overflow = value ? 'hidden' : ''
})

watch(listVersion, (version) => {
  seenListVersion.value = version
  resetAndReload()
})

onActivated(() => {
  if (seenListVersion.value !== listVersion.value) {
    seenListVersion.value = listVersion.value
    resetAndReload()
  }
})

function onFilterChange(nextCategory) {
  category.value = nextCategory
  resetAndReload()
}

async function resetAndReload() {
  pageNo.value = 1
  hasMore.value = true
  items.value = []
  fetching.value = false
  loading.value = true
  await loadMore()
}

async function loadMore() {
  if (fetching.value) return
  if (!hasMore.value) {
    loading.value = false
    return
  }

  fetching.value = true
  const requestedPage = pageNo.value

  try {
    const res =
      props.mediaType === 'video'
        ? await getVideoList(requestedPage, 20, category.value)
        : await getImageList(requestedPage, 20, category.value)
    const { list, total } = res.data.data
    const rows = Array.isArray(list) ? list : []

    if (requestedPage === 1) {
      items.value = rows
    } else {
      const existed = new Set(items.value.map((item) => item.id))
      items.value.push(...rows.filter((item) => !existed.has(item.id)))
    }

    pageNo.value = requestedPage + 1
    hasMore.value = items.value.length < total
  } catch {
    hasMore.value = false
  } finally {
    fetching.value = false
    loading.value = false
  }
}

async function onRefresh() {
  pageNo.value = 1
  hasMore.value = true
  items.value = []
  fetching.value = false
  try {
    await loadMore()
  } finally {
    refreshing.value = false
  }
}

function openPreview(item) {
  if (props.mediaType === 'video') {
    currentVideo.value = item
    showVideoPlayer.value = true
    return
  }
  const index = items.value.findIndex((row) => row.id === item.id)
  previewIndex.value = index >= 0 ? index : 0
  nextTick(() => {
    if (previewRef.value) previewRef.value.scrollTop = 0
  })
}

function closePreview() {
  previewIndex.value = -1
}

async function resetPreviewScroll() {
  await nextTick()
  if (previewRef.value) previewRef.value.scrollTop = 0
}

function showPrev() {
  if (previewIndex.value <= 0) return
  previewIndex.value -= 1
  resetPreviewScroll()
}

function showNext() {
  if (previewIndex.value >= items.value.length - 1) return
  previewIndex.value += 1
  resetPreviewScroll()
}

function onPreviewTouchStart(event) {
  const touch = event.changedTouches?.[0]
  if (!touch) return
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
}

function onPreviewTouchEnd(event) {
  const touch = event.changedTouches?.[0]
  if (!touch) return
  const deltaX = touch.clientX - touchStartX.value
  const deltaY = touch.clientY - touchStartY.value
  if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY)) return
  if (deltaX < 0) showNext()
  else showPrev()
}

async function beforeAdminClose(action) {
  if (action !== 'confirm') {
    keyInput.value = ''
    return true
  }
  if (!keyInput.value.trim()) {
    showFailToast('Please enter key')
    return false
  }
  verifying.value = true
  try {
    await verifyAdmin(keyInput.value.trim())
    adminKey.value = keyInput.value.trim()
    setAdminKey(adminKey.value)
    keyInput.value = ''
    showSuccessToast('Admin unlocked')
    return true
  } catch {
    return false
  } finally {
    verifying.value = false
  }
}

function handleDelete(item) {
  const label = item.name && String(item.name).trim() ? item.name : '该内容'
  showConfirmDialog({
    title: '确认删除',
    message: `删除 ${label}?`,
    confirmButtonText: '确认',
    confirmButtonColor: '#ee0a24',
    cancelButtonText: '取消',
  })
    .then(async () => {
      if (props.mediaType === 'video') {
        await deleteVideo(item.id, adminKey.value)
      } else {
        await deleteImage(item.id, adminKey.value)
      }
      items.value = items.value.filter((row) => row.id !== item.id)
      if (previewIndex.value >= items.value.length) {
        previewIndex.value = items.value.length - 1
      }
      showSuccessToast('已删除')
    })
    .catch(() => { })
}
</script>

<style scoped>
.media-page {
  min-height: 100vh;
  background: #f6f1e8;
  padding: 12px 12px 24px;
  box-sizing: border-box;
  margin: 0 auto;
  max-width: 1200px;
}

@media (min-width: 768px) {
  .media-page {
    padding: 16px 16px 32px;
  }
}

.admin-trigger {
  position: fixed;
  left: 0;
  top: 0;
  width: 60px;
  height: 60px;
  z-index: 100;
}

.admin-dialog-body {
  padding: 8px 16px 16px;
}

.video-player {
  display: block;
  width: 100%;
  max-height: 70vh;
  background: #000;
}

.image-preview {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: #0b0b0b;
  overflow-y: auto;
}

.image-preview-bar {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0));
}

.image-preview-index {
  font-size: 13px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.88);
  letter-spacing: 0.02em;
}

.image-preview-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  cursor: pointer;
}

.image-preview-body {
  min-height: calc(100vh - 56px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.image-preview-body img {
  display: block;
  width: 100%;
  height: auto;
}

@media (min-width: 768px) {
  .image-preview-body img {
    width: 50%;
  }
}
</style>
