<script setup lang="ts">
import NavIcon from '@/components/NavIcon.vue'
import { ui } from '@/content/id'
import { getMeta } from '@/data/api'

type IconName = 'home' | 'grid' | 'pin' | 'layers' | 'flask' | 'info'
interface Item {
  to: string
  label: string
  short: string
  icon: IconName
  exact?: boolean
}

const meta = getMeta()

const items: Item[] = [
  { to: '/', label: ui.nav.home, short: ui.nav.home, icon: 'home', exact: true },
  { to: '/komoditas', label: ui.nav.commodities, short: ui.nav.commodities, icon: 'grid' },
  { to: '/wilayah', label: ui.nav.regions, short: ui.nav.regions, icon: 'pin' },
  { to: '/pasar-lainnya', label: ui.nav.moreShort, short: ui.nav.more, icon: 'layers' },
  { to: '/riset', label: ui.nav.research, short: ui.nav.research, icon: 'flask' },
  { to: '/tentang-data', label: ui.nav.aboutFull, short: ui.nav.about, icon: 'info' },
]
// Tab bawah di HP: lima tujuan; Riset dijangkau dari halaman Lainnya
const tabs = items.filter((i) => i.to !== '/riset')
</script>

<template>
  <header class="sticky top-0 z-30 bg-paper-50/90 backdrop-blur">
    <div class="mx-auto flex h-14 max-w-[1280px] items-center gap-8 px-4 sm:px-6 lg:px-8">
      <RouterLink to="/" class="flex shrink-0 items-center gap-2.5">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <rect x="3" y="13" width="4.5" height="8" rx="1.2" fill="#2a9d78" />
          <rect x="9.75" y="8" width="4.5" height="13" rx="1.2" fill="#1b5b44" />
          <rect x="16.5" y="3" width="4.5" height="18" rx="1.2" fill="#16402f" />
        </svg>
        <span class="text-[15px] font-semibold tracking-tight text-ink-900">{{ ui.brand }}</span>
        <span class="text-xs font-medium text-ink-600">{{ ui.demoBadge }}</span>
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

      <p class="ml-auto hidden text-xs text-ink-600 xl:block">
        {{ ui.topbar.context(meta.dataYears.from, meta.dataYears.to) }}<span class="mx-2 text-paper-300" aria-hidden="true">/</span>{{ ui.topbar.published(meta.published) }}
      </p>
    </div>
    <div class="h-px bg-paper-200" />
  </header>

  <nav :aria-label="ui.nav.label" class="fixed inset-x-0 bottom-0 z-40 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_0_var(--color-paper-200)] backdrop-blur md:hidden">
    <ul class="grid grid-cols-5">
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
