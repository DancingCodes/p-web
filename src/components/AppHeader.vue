<template>
  <van-nav-bar fixed placeholder safe-area-inset-top>
    <template #left>
      <div class="header-left">
        <img class="header-logo" src="/logo.png" alt="logo" />
        <button v-if="admin" type="button" class="admin-badge" @click="showAdminMenu = true">
          管理员
        </button>
      </div>
    </template>

    <template #title>
      <div class="type-switch">
        <button
          type="button"
          class="type-switch-item"
          :class="{ active: type === 'image' }"
          @click="switchType('image')"
        >
          图片
        </button>
        <button
          type="button"
          class="type-switch-item"
          :class="{ active: type === 'video' }"
          @click="switchType('video')"
        >
          视频
        </button>
      </div>
    </template>

    <template #right>
      <div class="header-right">
        <button
          v-if="admin"
          type="button"
          class="header-btn header-btn-add"
          aria-label="上传"
          @click="$emit('upload')"
        >
          <van-icon name="plus" size="14" />
        </button>
        <button type="button" class="header-btn header-btn-filter" @click="showFilter = true">
          <span class="filter-label">{{ currentLabel }}</span>
          <van-icon name="arrow-down" size="11" />
        </button>
      </div>
    </template>
  </van-nav-bar>

  <van-action-sheet
    v-model:show="showFilter"
    :actions="filterActions"
    cancel-text="取消"
    close-on-click-action
    @select="onSelect"
  />

  <van-action-sheet
    v-model:show="showAdminMenu"
    :actions="adminActions"
    cancel-text="取消"
    close-on-click-action
    @select="onAdminSelect"
  />
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  IMAGE_CATEGORIES,
  VIDEO_CATEGORIES,
  categoryLabel,
} from '../constants/categories.js'

const props = defineProps({
  admin: { type: Boolean, default: false },
  type: { type: String, default: 'image' },
  category: { type: String, default: 'all' },
})

const emit = defineEmits(['filter', 'upload', 'exit-admin'])
const router = useRouter()

const showFilter = ref(false)
const showAdminMenu = ref(false)
const currentCategory = ref(props.category)

watch(
  () => props.category,
  (value) => {
    currentCategory.value = value
  },
)

const categories = computed(() =>
  props.type === 'video' ? VIDEO_CATEGORIES : IMAGE_CATEGORIES,
)

const filterActions = computed(() =>
  categories.value.map((item) => {
    const selected = item.value === currentCategory.value
    return {
      name: item.name,
      value: item.value,
      color: selected ? '#C8853F' : undefined,
    }
  }),
)

const adminActions = [
  { name: '退出管理', value: 'exit', color: '#ee0a24' },
]

const currentLabel = computed(() => categoryLabel(props.type, currentCategory.value))

function switchType(nextType) {
  if (nextType === props.type) return
  router.replace({ name: nextType === 'video' ? 'videos' : 'images' })
}

function onSelect(action) {
  currentCategory.value = action.value
  emit('filter', action.value)
}

function onAdminSelect(action) {
  if (action.value === 'exit') emit('exit-admin')
}
</script>

<style scoped>
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-logo {
  display: block;
  height: 28px;
  width: auto;
}

.admin-badge {
  border: none;
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 11px;
  line-height: 1.4;
  color: #c8853f;
  background: rgba(200, 133, 63, 0.12);
  cursor: pointer;
}

.type-switch {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  border-radius: 999px;
  background: #f3eee6;
}

.type-switch-item {
  border: none;
  min-width: 52px;
  height: 26px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 13px;
  line-height: 1;
  color: #8a8a80;
  background: transparent;
  cursor: pointer;
}

.type-switch-item.active {
  color: #1f2421;
  background: #fff;
  box-shadow: 0 1px 2px rgba(31, 36, 33, 0.08);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.header-btn:active {
  opacity: 0.72;
}

.header-btn-add {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  color: #fff;
  background: #1f2421;
}

.header-btn-filter {
  max-width: 108px;
  height: 26px;
  gap: 3px;
  padding: 0 8px;
  border-radius: 999px;
  color: #5f5a52;
  background: #f3eee6;
}

.filter-label {
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  line-height: 1;
}
</style>
