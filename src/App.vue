<template>
  <div class="app-shell">
    <router-view v-slot="{ Component }">
      <keep-alive :include="cachedPages">
        <component :is="Component" />
      </keep-alive>
    </router-view>

    <van-tabbar
      v-if="showTabbar"
      route
      safe-area-inset-bottom
      active-color="#1F2421"
      inactive-color="#9A958C"
    >
      <van-tabbar-item replace to="/images">
        <span>图片</span>
        <template #icon="props">
          <svg class="tab-icon" :class="{ active: props.active }" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.7" />
            <circle cx="9" cy="10" r="1.6" fill="currentColor" />
            <path d="M4.8 16.2 9.2 12l3.1 2.6 2.4-2.1 4.5 3.7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </template>
      </van-tabbar-item>

      <van-tabbar-item replace to="/videos">
        <span>视频</span>
        <template #icon="props">
          <svg class="tab-icon" :class="{ active: props.active }" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3.5" y="6" width="13" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.7" />
            <path d="M16.5 10.2 20.5 8.4v7.2l-4-1.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const cachedPages = ['ImagesPage', 'VideosPage', 'UploadPage']
const route = useRoute()
const showTabbar = computed(() => Boolean(route.meta.tab))
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.tab-icon {
  width: 22px;
  height: 22px;
  display: block;
  color: inherit;
}

.tab-icon.active {
  color: #1f2421;
}
</style>
