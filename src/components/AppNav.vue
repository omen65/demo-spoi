<script setup lang="ts">
import NavIcon from '@/components/NavIcon.vue'
import aoiLogo from '@/assets/aoi-logo.png'
import { ui } from '@/content/id'
import { ui2025 } from '@/content/id-2025'
import { getMeta2025 } from '@/data/api'

type IconName = 'home' | 'users' | 'grid' | 'pin' | 'layers' | 'flask' | 'info'
interface Item {
  to: string
  label: string
  short: string
  icon: IconName
  exact?: boolean
}

const meta = getMeta2025()
const n = ui2025.nav
const items: Item[] = [
  { to: '/2025', label: n.home, short: n.home, icon: 'home', exact: true },
  { to: '/2025/komoditas', label: n.commodities, short: n.commodities, icon: 'grid' },
  { to: '/2025/wilayah', label: n.regions, short: n.regions, icon: 'pin' },
  { to: '/2025/konsumen', label: n.consumers, short: n.consumers, icon: 'users' },
  { to: '/2025/ekosistem', label: n.ecosystem, short: n.ecosystem, icon: 'layers' },
  { to: '/2025/riset', label: n.research, short: n.research, icon: 'flask' },
  { to: '/2025/tentang-data', label: n.about, short: n.aboutShort, icon: 'info' },
]
// Tab bawah di HP: enam tujuan; Riset dijangkau dari halaman lain
const tabs = items.filter((i) => i.to !== '/2025/riset')
const context = ui2025.topbar.context(meta.dataYears.from, meta.dataYears.to)
</script>

<template>
  <header class="sticky top-0 z-30 bg-paper-50/90 backdrop-blur">
    <div class="mx-auto flex h-14 max-w-[1280px] items-center gap-4 px-4 sm:px-6 md:gap-8 lg:px-8">
      <RouterLink to="/2025" class="flex shrink-0 items-center gap-2.5">
        <img :src="aoiLogo" :alt="ui2025.logoAlt" width="465" height="275" class="h-10 w-auto mix-blend-multiply" />
        <span class="text-[15px] font-semibold tracking-tight text-ink-900">{{ ui2025.brand }}</span>
      </RouterLink>

      <nav :aria-label="ui.nav.label" class="hidden md:block">
        <ul class="flex items-center gap-0.5">
          <li v-for="item in items" :key="item.to">
            <RouterLink
              :to="item.to"
              class="topnav-link block rounded-md px-2.5 py-1.5 text-[13.5px] font-medium text-ink-600 transition-colors hover:text-ink-900"
              :active-class="item.exact ? '' : 'topnav-active'"
              :exact-active-class="item.exact ? 'topnav-active' : ''"
            >
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="ml-auto flex items-center gap-4">
        <p class="hidden text-xs text-ink-600 xl:block">{{ context }}</p>
      </div>
    </div>
    <div class="h-px bg-paper-200" />
  </header>

  <nav :aria-label="ui.nav.label" class="fixed inset-x-0 bottom-0 z-40 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_0_var(--color-paper-200)] backdrop-blur md:hidden">
    <ul class="grid grid-cols-6">
      <li v-for="item in tabs" :key="item.to">
        <RouterLink
          :to="item.to"
          class="flex h-14 flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium text-ink-600"
          :active-class="item.exact ? '' : 'tab-active'"
          :exact-active-class="item.exact ? 'tab-active' : ''"
        >
          <NavIcon :name="item.icon" class="!h-[18px] !w-[18px]" />{{ item.short }}
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style>
.topnav-active {
  color: var(--color-ink-900);
  background: var(--color-paper-100);
}
.tab-active {
  color: var(--color-deep-900);
  font-weight: 600;
}
</style>
