<template>
  <div class="fixed inset-0 z-950 bg-black/30 flex items-center justify-center" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl p-6 w-400px max-w-90vw">
      <div class="text-lg font-600 mb-5">Upload</div>

      <div
        class="border-2 border-dashed border-stone-200 rounded-xl h-48 flex items-center justify-center cursor-pointer overflow-hidden"
        :class="{ 'border-stone-400 bg-stone-50': dragging }"
        @dragover.prevent="dragging = true"
        @dragleave="dragging = false"
        @drop.prevent="onDrop"
        @click="$refs.input.click()"
      >
        <div v-if="!preview" class="flex flex-col items-center gap-3 text-stone-300">
          <Upload :size="36" stroke-width="1.5" />
          <span class="text-sm">Click or drag image</span>
        </div>
        <img v-else :src="preview" class="w-full h-full object-contain" />
      </div>

      <input ref="input" type="file" accept="image/*" hidden @change="onFileChange" />

      <div class="flex justify-end gap-3 mt-5">
        <div class="text-sm text-stone-400 px-4 py-1.5 cursor-pointer" :class="{ 'pointer-events-none opacity-40': uploading }" @click="$emit('close')">Cancel</div>
        <div
          class="text-sm text-white bg-stone-800 rounded-lg px-6 py-1.5 font-500 cursor-pointer"
          :class="{ 'pointer-events-none opacity-40': !file || uploading }"
          @click="upload"
        >{{ uploading ? 'Uploading...' : 'Upload' }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Upload } from '@lucide/vue'
import { uploadImage } from '../api/index.js'

const props = defineProps({ adminKey: String })
const emit = defineEmits(['close', 'uploaded'])

const file = ref(null)
const preview = ref('')
const dragging = ref(false)
const uploading = ref(false)

function onFileChange(e) { setFile(e.target.files[0]) }
function onDrop(e) { dragging.value = false; setFile(e.dataTransfer.files[0]) }

function setFile(f) {
  if (!f || !f.type.startsWith('image/')) return
  file.value = f
  preview.value = URL.createObjectURL(f)
}

async function upload() {
  if (!file.value) return
  uploading.value = true
  try {
    const res = await uploadImage(file.value, props.adminKey)
    emit('uploaded', res.data.data)
  } catch {
    uploading.value = false
  }
}
</script>
