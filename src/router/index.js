import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login', name: 'Login', component: () => import('../pages/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../pages/Register.vue') },
  {
    path: '/',
    component: () => import('../components/Layout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('../pages/Dashboard.vue') },
      { path: 'tickets', name: 'Tickets', component: () => import('../pages/Tickets.vue') },
      { path: 'knowledge-base', name: 'KnowledgeBase', component: () => import('../pages/KnowledgeBase.vue') },
      { path: 'clients', name: 'Clients', component: () => import('../pages/Clients.vue'), meta: { roles: ['ADMIN'] } },
      { path: 'users', name: 'Users', component: () => import('../pages/Users.vue'), meta: { roles: ['ADMIN'] } },
      { path: 'quotas', name: 'Quotas', component: () => import('../pages/Quotas.vue'), meta: { roles: ['ADMIN'] } },
      { path: 'service-catalog', name: 'ServiceCatalog', component: () => import('../pages/ServiceCatalog.vue'), meta: { roles: ['ADMIN'] } },
      { path: 'sla-report', name: 'SLAReport', component: () => import('../pages/SLAReport.vue'), meta: { roles: ['ADMIN'] } },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }
  if (to.meta.roles && !to.meta.roles.includes(auth.user?.role)) {
    return '/'
  }
})

export default router
