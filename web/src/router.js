import { createRouter, createWebHistory } from 'vue-router'

// import Home from '@/views/HomePage.vue'
// import Search from '@/views/SearchPage.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/HomePage.vue')
    },
    {
        path: '/search',
        name: 'Search',
        component: () => import('@/views/SearchPage.vue')
    },
    {
        path: '/games/:gameId',
        name: 'Game',
        component: () => import('@/views/GamePage.vue')
    },
    {
        path: '/library/:username?',
        name: 'Library',
        component: () => import('@/views/LibraryPage.vue')
    },
    {
        path: '/companies/:companyId',
        name: 'Company',
        component: () => import('@/views/CompanyPage.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router