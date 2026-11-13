import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ComingSoonView from '@/views/ComingSoonView.vue'
import CommoditiesView from '@/views/CommoditiesView.vue'
import CommodityDetailView from '@/views/CommodityDetailView.vue'
import MoreView from '@/views/MoreView.vue'
import ResearchView from '@/views/ResearchView.vue'
import AboutView from '@/views/AboutView.vue'
import WilayahView from '@/views/WilayahView.vue'

// Hash history: hasil build bisa di-host di mana saja tanpa konfigurasi server.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/komoditas', name: 'commodities', component: CommoditiesView },
    { path: '/komoditas/:id', name: 'commodity', component: CommodityDetailView },
    { path: '/wilayah', name: 'regions', component: WilayahView },
    { path: '/pasar-lainnya', name: 'more', component: MoreView },
    { path: '/riset', name: 'research', component: ResearchView },
    { path: '/tentang-data', name: 'about', component: AboutView },
    { path: '/:pathMatch(.*)*', component: ComingSoonView },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
