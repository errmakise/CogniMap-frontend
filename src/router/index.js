import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/graph',
      //path:'/',
      name: 'graph-edit',
      component: () => import('../views/GraphEdit.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue'),
    },
    {
      //path: '/files',
      path: '/',
      name: 'files',
      component: () => import('../views/FileHomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/files/folder/:folderId',
      name: 'folder',
      component: () => import('../views/FolderView.vue'),
      meta: { requiresAuth: true },
      props: true, // 启用路由参数自动注入
    },
    {
      path: '/account',
      name: 'account',
      component: () => import('../views/AccountView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  console.log('token', authStore.token)
  // 当前逻辑会导致无限重定向到/auth
  if (!authStore.token && to.path !== '/auth') {
    next('/auth')
  } else if (authStore.token && to.path === '/auth') {
    next('/') // 已登录时访问登录页则重定向到首页
  } else {
    next()
  }
})

export default router
