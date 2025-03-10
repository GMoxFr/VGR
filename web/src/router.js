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
    },
    {
        path: '/genres/:genreId',
        name: 'Genre',
        component: () => import('@/views/GenrePage.vue')
    },
    {
        path: '/platforms/:platformId',
        name: 'Platform',
        component: () => import('@/views/PlatformPage.vue')
    },
    {
        path: '/series/:serieId',
        name: 'Serie',
        component: () => import('@/views/SeriePage.vue')
    },
    {
        path: '/franchises/:franchiseId',
        name: 'Franchise',
        component: () => import('@/views/FranchisePage.vue')
    },
    {
        path: '/gameengines/:gameEngineId',
        name: 'GameEngine',
        component: () => import('@/views/GameEnginePage.vue')
    },
    {
        path: '/ratings/:ratingId',
        name: 'Rating',
        component: () => import('@/views/RatingPage.vue')
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router