import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/poems',
      name: 'poems',
      component: () => import('../views/PoemsView.vue'),
    },
    {
      path: '/poems/:id',
      name: 'poem-detail',
      component: () => import('../views/PoemDetailView.vue'),
    },
    {
      path: '/chengyu',
      name: 'chengyu',
      component: () => import('../views/ChengyuView.vue'),
    },
    {
      path: '/chengyu/:id',
      name: 'chengyu-detail',
      component: () => import('../views/ChengyuDetailView.vue'),
    },
    {
      path: '/mingju',
      name: 'mingju',
      component: () => import('../views/MingjuView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
