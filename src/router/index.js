import { createRouter, createWebHistory } from 'vue-router'
import ImagesPage from '../views/ImagesPage.vue'
import VideosPage from '../views/VideosPage.vue'
import UploadPage from '../views/UploadPage.vue'
import EditPage from '../views/EditPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/images' },
    { path: '/images', name: 'images', component: ImagesPage },
    { path: '/videos', name: 'videos', component: VideosPage },
    {
      path: '/upload',
      name: 'upload',
      component: UploadPage,
      meta: { requiresAdmin: true },
    },
    {
      path: '/edit',
      name: 'edit',
      component: EditPage,
      meta: { requiresAdmin: true },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  if (!to.meta.requiresAdmin) return true
  if (localStorage.getItem('adminKey')) return true
  return { name: 'images' }
})

export default router
