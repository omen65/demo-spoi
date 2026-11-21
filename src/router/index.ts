import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ComingSoonView from '@/views/ComingSoonView.vue'
import CommoditiesView from '@/views/CommoditiesView.vue'
import CommodityDetailView from '@/views/CommodityDetailView.vue'
import MoreView from '@/views/MoreView.vue'
import ResearchView from '@/views/ResearchView.vue'
import AboutView from '@/views/AboutView.vue'
import WilayahView from '@/views/WilayahView.vue'
import Home2025View from '@/views/Home2025View.vue'
import Commodities2025View from '@/views/Commodities2025View.vue'
import Commodity2025DetailView from '@/views/Commodity2025DetailView.vue'
import Consumers2025View from '@/views/Consumers2025View.vue'
import Ecosystem2025View from '@/views/Ecosystem2025View.vue'
import Research2025View from '@/views/Research2025View.vue'
import About2025View from '@/views/About2025View.vue'

// Hash history: hasil build bisa di-host di mana saja tanpa konfigurasi server.
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // Edisi 2025 adalah halaman utama; 2023 menjadi arsip di /2023.
    { path: '/', redirect: '/2025' },
    { path: '/2023', name: 'home', component: HomeView },
    { path: '/komoditas', name: 'commodities', component: CommoditiesView },
    { path: '/komoditas/:id', name: 'commodity', component: CommodityDetailView },
    { path: '/wilayah', name: 'regions', component: WilayahView },
    { path: '/pasar-lainnya', name: 'more', component: MoreView },
    { path: '/riset', name: 'research', component: ResearchView },
    { path: '/tentang-data', name: 'about', component: AboutView },
    { path: '/2025', name: 'home2025', component: Home2025View },
    { path: '/2025/komoditas', name: 'commodities2025', component: Commodities2025View },
    { path: '/2025/komoditas/:id', name: 'commodity2025', component: Commodity2025DetailView },
    { path: '/2025/konsumen', name: 'consumers2025', component: Consumers2025View },
    { path: '/2025/ekosistem', name: 'ecosystem2025', component: Ecosystem2025View },
    { path: '/2025/riset', name: 'research2025', component: Research2025View },
    { path: '/2025/tentang-data', name: 'about2025', component: About2025View },
    { path: '/:pathMatch(.*)*', component: ComingSoonView },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
