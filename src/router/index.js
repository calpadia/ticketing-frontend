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
      { path: 'tickets/:id', name: 'TicketDetail', component: () => import('../pages/TicketDetail.vue') },
      { path: 'knowledge-base', name: 'KnowledgeBase', component: () => import('../pages/KnowledgeBase.vue') },
      { path: 'clients', name: 'Clients', component: () => import('../pages/Clients.vue'), meta: { roles: ['ADMIN'] } },
      { path: 'clients/:id', name: 'ClientDetail', component: () => import('../pages/ClientDetail.vue'), meta: { roles: ['ADMIN'] } },
      { path: 'client-onboarding', name: 'ClientOnboarding', component: () => import('../pages/ClientOnboarding.vue'), meta: { roles: ['ADMIN'] } },
      { path: 'client-supports', name: 'ClientSupports', component: () => import('../pages/ClientSupports.vue'), meta: { roles: ['ADMIN'] } },
      { path: 'projects', name: 'Projects', component: () => import('../pages/Projects.vue'), meta: { roles: ['ADMIN'] } },
      { path: 'users', name: 'Users', component: () => import('../pages/Users.vue'), meta: { roles: ['ADMIN'] } },
      { path: 'service-catalog', name: 'ServiceCatalog', component: () => import('../pages/ServiceCatalog.vue'), meta: { roles: ['ADMIN'] } },
      // Redirect old /quotas route to the merged page
      { path: 'quotas', redirect: '/service-catalog' },
      { path: 'sla-report', name: 'SLAReport', component: () => import('../pages/SLAReport.vue'), meta: { roles: ['ADMIN'] } },
      { path: 'client-management', name: 'ClientManagement', component: () => import('../pages/ClientManagement.vue'), meta: { roles: ['ADMIN'] } },
      { path: 'profile', name: 'Profile', component: () => import('../pages/Profile.vue') },
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
