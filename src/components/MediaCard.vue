<template>
  <div class="media-card" @click="$emit('click')">
    <div class="media-cover">
      <van-image
        v-if="type === 'image'"
        width="100%"
        :src="item.url"
        :alt="displayName"
      />
      <template v-else>
        <van-image
          width="100%"
          fit="cover"
          :src="item.cover_url"
          :alt="displayName"
        />
        <div class="play-mask">
          <van-icon name="play" size="18" />
        </div>
      </template>

      <button
        v-if="admin"
        type="button"
        class="delete-btn"
        aria-label="删除"
        @click.stop="$emit('delete')"
      >
        <van-icon name="delete-o" size="16" />
      </button>
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
defineEmits(['click', 'delete'])

const displayName = computed(() => {
  const name = props.item?.name
  if (name == null) return ''
  return String(name).trim()
})
</script>

<style scoped>
.media-card {
  break-inside: avoid;
  margin-bottom: 12px;
  overflow: hidden;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(31, 36, 33, 0.04);
}

.media-cover {
  position: relative;
  overflow: hidden;
  background: #efe8dc;
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

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
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
  padding: 10px 12px 12px;
  font-size: 13px;
  line-height: 1.4;
  color: #3a3a34;
  word-break: break-all;
}
</style>
