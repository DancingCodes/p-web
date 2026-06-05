<template>
  <div
    class="rounded-xl overflow-hidden cursor-pointer bg-white mb-2.5 shadow-sm break-inside-avoid relative"
    @click="$emit('click')"
  >
    <img :src="image.url" :alt="image.name" loading="lazy" class="w-full block" />
    <div class="absolute inset-x-0 bottom-0 px-3 py-2 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent">
      <span class="text-xs text-white truncate">{{ image.name }}</span>
      <div
        v-if="admin"
        class="text-xs text-white bg-white/20 rounded px-2 py-0.5 cursor-pointer shrink-0 ml-2"
        @click.stop="$emit('delete')"
      >Del</div>
    </div>
  </div>
</template>

<script setup>
defineProps({ image: Object, admin: Boolean })
defineEmits(['click', 'delete'])
</script>
