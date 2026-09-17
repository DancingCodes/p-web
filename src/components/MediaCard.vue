<template>
  <div class="media-card" @click="$emit('click')">
    <div class="media-cover" :class="{ 'is-video': type === 'video' }">
      <van-image
        v-if="type === 'image'"
        width="100%"
        :src="item.url"
        :alt="displayName"
      />
      <template v-else>
        <van-image
          width="100%"
          height="100%"
          fit="cover"
          :src="item.cover_url"
          :alt="displayName"
        />
        <div class="play-mask">
          <van-icon name="play" size="18" />
        </div>
      </template>

      <div v-if="admin" class="admin-actions">
        <button type="button" class="action-btn" aria-label="编辑" @click.stop="$emit('edit')">
          <van-icon name="edit" size="16" />
        </button>
        <button type="button" class="action-btn" aria-label="删除" @click.stop="$emit('delete')">
          <van-icon name="delete-o" size="16" />
        </button>
      </div>
    </div>

    <div v-if="displayName" class="media-name">{{ displayName }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: Object,
  type: { type: String, default: 'image' },
  admin: Boolean,
})
defineEmits(['click', 'edit', 'delete'])

const displayName = computed(() => {
  const name = props.item?.name
  if (name == null) return ''
  return String(name).trim()
})
</script>

<style scoped>
.media-card {
  break-inside: avoid;
  -webkit-column-break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 12px;
  padding: 8px;
  overflow: hidden;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(31, 36, 33, 0.06);
}

.media-cover {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: #efe8dc;
}

.media-cover.is-video {
  aspect-ratio: 3 / 4;
}

.media-cover :deep(.van-image) {
  display: block;
  width: 100%;
}

.media-cover.is-video :deep(.van-image) {
  height: 100%;
}

.media-cover :deep(img) {
  display: block;
  width: 100%;
}

.play-mask {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  transform: translate(-50%, -50%);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.admin-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  cursor: pointer;
}

.media-name {
  padding: 8px 2px 2px;
  font-size: 13px;
  line-height: 1.4;
  color: #3a3a34;
  word-break: break-all;
}
</style>
