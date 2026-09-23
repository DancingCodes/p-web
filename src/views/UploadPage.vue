<template>
  <div class="upload-page">
    <van-nav-bar
      title="上传"
      left-arrow
      fixed
      placeholder
      safe-area-inset-top
      @click-left="goBack"
    />

    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="name"
          label="名称"
          placeholder="选填"
          maxlength="50"
          :disabled="uploading"
        />

        <van-field label="类型" required>
          <template #input>
            <van-radio-group
              v-model="mediaType"
              direction="horizontal"
              :disabled="uploading"
            >
              <van-radio name="image">图片</van-radio>
              <van-radio name="video">视频</van-radio>
            </van-radio-group>
          </template>
        </van-field>

        <van-field
          is-link
          readonly
          required
          label="分类"
          :model-value="categoryText"
          placeholder="请选择分类"
          :disabled="uploading"
          @click="showCategoryPicker = true"
        />
      </van-cell-group>

      <van-cell-group inset class="upload-group">
        <div class="uploader-section">
          <div class="uploader-label">{{ mediaType === 'video' ? '视频文件' : '图片文件' }}</div>
          <van-uploader
            v-model="fileList"
            :max-count="1"
            :accept="mediaType === 'video' ? 'video/*' : 'image/*'"
            :preview-size="120"
            :deletable="!uploading"
            :disabled="uploading"
            :after-read="afterRead"
            @delete="onDelete"
          />
        </div>

        <div v-if="mediaType === 'video'" class="uploader-section">
          <div class="uploader-label">视频封面</div>
          <van-uploader
            v-model="coverList"
            :max-count="1"
            accept="image/*"
            :preview-size="120"
            :deletable="!uploading"
            :disabled="uploading"
            :after-read="afterCoverRead"
            @delete="onCoverDelete"
          />
        </div>
      </van-cell-group>

      <div class="submit-wrap">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          :loading="uploading"
          loading-text="上传中..."
        >
          上传
        </van-button>
      </div>
    </van-form>

    <van-action-sheet
      v-model:show="showCategoryPicker"
      :actions="categoryActions"
      cancel-text="取消"
      close-on-click-action
      @select="onCategorySelect"
    />
  </div>
</template>

<script setup>
defineOptions({ name: 'UploadPage' })
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'
import { uploadImage, uploadVideo } from '../api/index.js'
import { IMAGE_CATEGORIES, VIDEO_CATEGORIES } from '../constants/categories.js'
import { bumpListVersion, getAdminKey } from '../stores/admin.js'

const router = useRouter()
const route = useRoute()
const adminKey = getAdminKey()

const name = ref('')
const mediaType = ref(route.query.type === 'video' ? 'video' : 'image')
const category = ref('')
const file = ref(null)
const fileList = ref([])
const cover = ref(null)
const coverList = ref([])
const uploading = ref(false)
const showCategoryPicker = ref(false)

const categoryOptions = computed(() => {
  const list = mediaType.value === 'video' ? VIDEO_CATEGORIES : IMAGE_CATEGORIES
  return list.filter((item) => item.value !== 'all')
})

const categoryActions = computed(() =>
  categoryOptions.value.map((item) => ({ name: item.name, value: item.value })),
)

const categoryText = computed(
  () => categoryOptions.value.find((item) => item.value === category.value)?.name || '',
)

watch(mediaType, () => {
  category.value = ''
  file.value = null
  fileList.value = []
  cover.value = null
  coverList.value = []
})

function targetRouteName() {
  return mediaType.value === 'video' ? 'videos' : 'images'
}

function goBack() {
  if (uploading.value) return
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
  if (!adminKey) {
    showFailToast('无上传权限')
    router.replace({ name: 'images' })
    return
  }
  if (!category.value) {
    showFailToast('请选择分类')
    return
  }
  if (!file.value || uploading.value) {
    showFailToast(mediaType.value === 'video' ? '请选择视频' : '请选择图片')
    return
  }
  if (mediaType.value === 'video' && !cover.value) {
    showFailToast('请上传视频封面')
    return
  }

  uploading.value = true
  try {
    const payload = {
      name: name.value.trim(),
      category: category.value,
    }
    if (mediaType.value === 'video') {
      await uploadVideo(file.value, cover.value, payload, adminKey)
    } else {
      await uploadImage(file.value, payload, adminKey)
    }
    showSuccessToast('上传成功')
    bumpListVersion()
    router.replace({ name: targetRouteName() })
  } catch {
    // toast handled by api interceptor
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.upload-page {
  min-height: 100vh;
  background: #f6f1e8;
  max-width: 1200px;
  margin: 0 auto;
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

.submit-wrap {
  margin: 24px 16px;
}
</style>
