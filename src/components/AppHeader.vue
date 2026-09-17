<template>
  <van-nav-bar fixed placeholder safe-area-inset-top>
    <template #left>
      <div class="header-left">
        <img class="header-logo" src="/logo.png" alt="logo" />
        <button
          v-if="admin"
          type="button"
          class="admin-badge"
          @click="showAdminMenu = true"
        >
          管理中
        </button>
      </div>
    </template>
    <template #right>
      <div class="header-right">
        <van-icon
          v-if="admin"
          name="plus"
          size="20"
          class="upload-icon"
          @click="$emit('upload')"
        />
        <div class="filter-trigger" @click="showFilter = true">
          <span class="current-category">{{ currentLabel }}</span>
          <van-icon name="filter-o" size="18" />
        </div>
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
  padding: 2px 8px;
  font-size: 11px;
  line-height: 1.4;
  color: #c8853f;
  background: rgba(200, 133, 63, 0.12);
  cursor: pointer;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  color: #1f2421;
}

.filter-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
}

.current-category {
  max-width: 88px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #8a8a80;
  font-size: 14px;
}
</style>
