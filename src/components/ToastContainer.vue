<template>
  <div class="fixed top-16 left-50% -translate-x-1/2 z-9999 flex flex-col items-center gap-2 pointer-events-none">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="px-4 py-2 rounded-xl text-sm text-white font-500 shadow-lg"
      :class="{
        'bg-emerald-500': t.type === 'success',
        'bg-red-500': t.type === 'error',
        'bg-stone-700': t.type === 'info',
      }"
    >{{ t.msg }}</div>
  </div>
</template>

<script setup>
import { toasts } from '../stores/toast.js'
</script>
