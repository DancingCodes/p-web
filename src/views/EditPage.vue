<template>
  <div class="edit-page">
    <van-nav-bar title="编辑" left-arrow fixed placeholder safe-area-inset-top @click-left="goBack" />

    <van-loading v-if="loading" class="page-loading" vertical>加载中...</van-loading>

    <van-form v-else @submit="onSubmit">
      <van-cell-group inset>
        <van-field v-model="name" label="名称" placeholder="选填" maxlength="50" :disabled="saving" />

        <van-field is-link readonly required label="分类" :model-value="categoryText" placeholder="请选择分类"
          :disabled="saving" @click="showCategoryPicker = true" />
      </van-cell-group>

      <van-cell-group inset class="upload-group">
        <div class="uploader-section">
          <div class="uploader-label">
            {{ mediaType === 'video' ? '替换视频（可选）' : '替换图片（可选）' }}
          </div>
          <div v-if="previewUrl && !file" class="current-preview">
            <van-image v-if="mediaType === 'image'" width="120" height="120" fit="cover" :src="previewUrl" />
            <video v-else class="current-video" :src="previewUrl" muted />
          </div>
          <van-uploader v-model="fileList" :max-count="1" :accept="mediaType === 'video' ? 'video/*' : 'image/*'"
            :preview-size="120" :deletable="!saving" :disabled="saving" :after-read="afterRead" @delete="onDelete" />
        </div>

        <div v-if="mediaType === 'video'" class="uploader-section">
          <div class="uploader-label">替换封面（可选）</div>
          <div v-if="coverPreviewUrl && !cover" class="current-preview">
            <van-image width="120" height="120" fit="cover" :src="coverPreviewUrl" />
          </div>
          <van-uploader v-model="coverList" :max-count="1" accept="image/*" :preview-size="120" :deletable="!saving"
            :disabled="saving" :after-read="afterCoverRead" @delete="onCoverDelete" />
        </div>
      </van-cell-group>

      <div class="submit-wrap">
        <van-button round block type="primary" native-type="submit" :loading="saving" loading-text="保存中...">
          保存
        </van-button>
      </div>
    </van-form>

    <van-action-sheet v-model:show="showCategoryPicker" :actions="categoryActions" cancel-text="取消"
      close-on-click-action @select="onCategorySelect" />
  </div>
</template>

<script setup>
defineOptions({ name: 'EditPage' })

import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'
import {
  getImageDetail,
  getVideoDetail,
  updateImage,
  updateVideo,
} from '../api/index.js'
import { IMAGE_CATEGORIES, VIDEO_CATEGORIES } from '../constants/categories.js'
import { bumpListVersion, getAdminKey } from '../stores/admin.js'

const router = useRouter()
const route = useRoute()
const adminKey = getAdminKey()

const mediaType = computed(() => (route.query.type === 'video' ? 'video' : 'image'))
const id = computed(() => String(route.query.id || ''))

const loading = ref(true)
const saving = ref(false)
const name = ref('')
const category = ref('')
const previewUrl = ref('')
const coverPreviewUrl = ref('')
const file = ref(null)
const fileList = ref([])
const cover = ref(null)
const coverList = ref([])
const showCategoryPicker = ref(false)

const categoryOptions = computed(() => {
  const list = mediaType.value === 'video' ? VIDEO_CATEGORIES : IMAGE_CATEGORIES
  return list.filter((item) => item.value !== 'all')
})

const categoryActions = computed(() =>
  categoryOptions.value.map((item) => ({
    name: item.name,
    value: item.value,
    color: item.value === category.value ? '#C8853F' : undefined,
  })),
)

const categoryText = computed(
  () => categoryOptions.value.find((item) => item.value === category.value)?.name || '',
)

onMounted(async () => {
  if (!adminKey || !id.value) {
    router.replace({ name: 'images' })
    return
  }
  try {
    const res =
      mediaType.value === 'video'
        ? await getVideoDetail(id.value)
        : await getImageDetail(id.value)
    const data = res.data.data
    name.value = data.name || ''
    category.value = data.category || ''
    previewUrl.value = data.url || ''
    coverPreviewUrl.value = data.cover_url || ''
  } catch {
    router.back()
  } finally {
    loading.value = false
  }
})

function goBack() {
  if (saving.value) return
  router.back()
}

function afterRead(item) {
  file.value = item.file
}

function onDelete() {
  file.value = null
  fileList.value = []
}

function afterCoverRead(item) {
  cover.value = item.file
}

function onCoverDelete() {
  cover.value = null
  coverList.value = []
}

function onCategorySelect(action) {
  category.value = action.value
}

async function onSubmit() {
  if (!category.value) {
    showFailToast('请选择分类')
    return
  }

  saving.value = true
  try {
    const payload = {
      name: name.value.trim(),
      category: category.value,
      file: file.value,
      cover: cover.value,
    }
    if (mediaType.value === 'video') {
      await updateVideo(id.value, payload, adminKey)
    } else {
      await updateImage(id.value, payload, adminKey)
    }
    showSuccessToast('保存成功')
    bumpListVersion()
    router.replace({ name: mediaType.value === 'video' ? 'videos' : 'images' })
  } catch {
    // toast handled by api interceptor
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.edit-page {
  min-height: 100vh;
  background: #f6f1e8;
  max-width: 1200px;
  margin: 0 auto;
}

.page-loading {
  padding-top: 80px;
}

.upload-group {
  margin-top: 12px;
}

.uploader-section {
  padding: 16px;
}

.uploader-label {
  margin-bottom: 10px;
  font-size: 14px;
  color: #646566;
}

.current-preview {
  margin-bottom: 12px;
}

.current-video {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  background: #111;
}

.submit-wrap {
  margin: 24px 16px;
}
</style>
