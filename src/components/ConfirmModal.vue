<template>
  <div v-if="show" class="fixed inset-0 z-1100 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/30" @click="loading ? null : $emit('cancel')" />
    <div class="relative bg-white rounded-2xl p-6 w-72">
      <p class="text-sm mb-5">{{ message }}</p>
      <div class="flex justify-end gap-3">
        <div
          class="text-sm text-stone-400 px-4 py-1.5 cursor-pointer"
          :class="{ 'pointer-events-none opacity-40': loading }"
          @click="$emit('cancel')"
        >Cancel</div>
        <div
          class="text-sm text-white bg-red-500 rounded-lg px-4 py-1.5 font-500 cursor-pointer flex items-center gap-1.5"
          :class="{ 'pointer-events-none opacity-50': loading }"
          @click="$emit('confirm')"
        >
          <Loader2 v-if="loading" :size="14" class="animate-spin" />
          <span>Confirm</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Loader2 } from '@lucide/vue'
defineProps({ show: Boolean, message: String, loading: Boolean })
defineEmits(['confirm', 'cancel'])
</script>
