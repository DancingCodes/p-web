<template>
  <div class="app-shell">
    <router-view v-slot="{ Component }">
      <keep-alive :include="cachedPages">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup>
const cachedPages = ['ImagesPage', 'VideosPage', 'UploadPage']
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
}
</style>
