<template>
  <div class="masonry-card" @click="$emit('click')">
    <div class="image-wrapper">
      <img
        :src="image.url"
        :alt="image.name"
        loading="lazy"
        @load="$emit('image-loaded')"
      />
    </div>
    <div v-if="admin" class="card-footer">
      <div class="delete-btn" @click.stop="$emit('delete')">Del</div>
    </div>
  </div>
</template>

<script setup>
defineProps({ image: Object, admin: Boolean })
defineEmits(['click', 'delete', 'image-loaded'])
</script>

<style lang="scss" scoped>
.masonry-card {
  border-radius: 12px;
  cursor: pointer;
  background: #FBF7EF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  position: relative;
  margin-bottom: 12px;
  border: 0.5px solid rgba(0, 0, 0, 0.04);
  padding: 8px;
  -webkit-tap-highlight-color: transparent;

  .image-wrapper {
    border-radius: 8px;
    overflow: hidden;
  }

  img {
    width: 100%;
    display: block;
  }

  .card-footer {
    position: absolute;
    right: 8px;
    top: 8px;

    .delete-btn {
      font-size: 12px;
      color: white;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 4px;
      padding: 4px 10px;
      cursor: pointer;
      backdrop-filter: blur(4px);
    }
  }
}
</style>
