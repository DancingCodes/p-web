<template>
  <div class="fixed inset-0 bg-black/95 overflow-y-auto z-900" @click.self="$emit('close')">
    <div
      class="fixed top-4 right-4 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer z-10"
      @click="$emit('close')"
    >
      <X :size="28" />
    </div>
    <div class="min-h-screen flex items-center justify-center" @click.self="$emit('close')">
      <img :src="current.url" :alt="current.name" class="w-full h-auto block" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { X } from '@lucide/vue'

defineProps({ current: Object })
defineEmits(['close'])

onMounted(() => document.body.style.overflow = 'hidden')
onUnmounted(() => document.body.style.overflow = '')
</script>
