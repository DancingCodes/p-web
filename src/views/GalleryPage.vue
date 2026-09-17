<template>
  <div class="gallery-page">
    <div v-if="images.length === 0 && !loading" class="empty-state">No images yet</div>

    <div ref="grid" class="masonry-grid">
      <ImageCard
        v-for="img in images"
        :key="img.id"
        :image="img"
        :admin="isAdmin"
        class="masonry-item"
        @click="viewerImage = img"
        @delete="handleDelete(img)"
        @image-loaded="onImageLoaded"
      />
    </div>

    <div v-if="loading" class="loading-state">Loading...</div>

    <div v-if="isAdmin" class="add-button" @click="showUpload = true">
      <Plus :size="24" stroke-width="1.5" />
    </div>

    <div v-if="!isAdmin" class="admin-trigger" @click="showKeyInput = true"></div>

    <UploadModal
      v-if="showUpload"
      :admin-key="adminKey"
      @close="showUpload = false"
      @uploaded="img => { images.unshift(img); showUpload = false; nextTick(() => { if (masonry) { masonry.reloadItems(); masonry.layout(); } }) }"
    />

    <ImageViewer
      v-if="viewerImage"
      :current="viewerImage"
      @close="viewerImage = null"
    />

    <div v-if="showKeyInput" class="key-modal-overlay" @click.self="showKeyInput = false">
      <div class="key-modal">
        <div class="key-modal-title">Admin Key</div>
        <div class="key-modal-subtitle">Enter admin key to continue</div>
        <input
          v-model="keyInput"
          type="password"
          placeholder="Key"
          class="key-modal-input"
          @keyup.enter="verifyKey"
        />
        <div class="key-modal-actions">
          <div class="key-modal-cancel" @click="showKeyInput = false">Cancel</div>
          <div class="key-modal-ok" @click="verifyKey">OK</div>
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
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Plus } from '@lucide/vue'
import Masonry from 'masonry-layout'
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

const grid = ref(null)
let masonry = null

onMounted(() => {
  if (localStorage.getItem('adminKey')) {
    adminKey.value = localStorage.getItem('adminKey')
    isAdmin.value = true
  }
  initMasonry()
  loadMore()
  window.addEventListener('scroll', onScroll)
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  if (masonry) masonry.destroy()
})

function onScroll() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement
  if (scrollTop + clientHeight >= scrollHeight - 200 && hasMore.value && !loading.value) {
    loadMore()
  }
}

function onResize() {
  if (masonry) {
    masonry.destroy()
  }
  initMasonry()
}

function initMasonry() {
  nextTick(() => {
    if (!grid.value) return
    masonry = new Masonry(grid.value, {
      itemSelector: '.masonry-item',
      columnWidth: (window.innerWidth - 36) / 2,
      gutter: 12,
      fitWidth: true,
      transitionDuration: 0,
    })
  })
}

function onImageLoaded() {
  if (masonry) {
    masonry.layout()
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
    await nextTick()
    if (masonry) {
      masonry.reloadItems()
      masonry.layout()
    }
  } finally {
    loading.value = false
  }
}

function toggleAdmin() {
  isAdmin.value = false
  adminKey.value = ''
  localStorage.removeItem('adminKey')
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
  await nextTick()
  if (masonry) {
    masonry.reloadItems()
    masonry.layout()
  }
}
</script>

<style lang="scss" scoped>
.gallery-page {
  padding: 12px;
  min-height: 100vh;
  background: #F6F1E8;

  .empty-state {
    color: #d6d3d1;
    font-size: 14px;
    padding: 128px 0;
    text-align: center;
  }

  .masonry-grid {
    position: relative;
    margin: 0 auto;

    .masonry-item {
      width: calc((100vw - 36px) / 2);
      box-sizing: border-box;
    }
  }

  .loading-state {
    color: #d6d3d1;
    font-size: 14px;
    padding: 32px 0;
    text-align: center;
  }

  .add-button {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: #292524;
    color: white;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 100;
  }

  .admin-trigger {
    position: fixed;
    left: 0;
    top: 0;
    width: 60px;
    height: 60px;
    z-index: 100;
    cursor: pointer;
  }

  .key-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;

    .key-modal {
      background: white;
      border-radius: 16px;
      padding: 32px;
      width: 288px;

      .key-modal-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .key-modal-subtitle {
        font-size: 14px;
        color: #a8a29e;
        margin-bottom: 20px;
      }

      .key-modal-input {
        width: 100%;
        padding: 8px 12px;
        border-radius: 8px;
        background: #fafaf9;
        font-size: 14px;
        border: 1px solid #e7e5e4;
        box-sizing: border-box;
      }

      .key-modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 20px;

        .key-modal-cancel {
          font-size: 14px;
          color: #a8a29e;
          padding: 6px 16px;
          cursor: pointer;
        }

        .key-modal-ok {
          font-size: 14px;
          color: white;
          background: #292524;
          border-radius: 8px;
          padding: 6px 20px;
          font-weight: 500;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
