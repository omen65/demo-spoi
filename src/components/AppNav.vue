<script setup lang="ts">
import { computed } from 'vue'
import NavIcon from '@/components/NavIcon.vue'
import aoiLogo from '@/assets/aoi-logo.png'
import { ui } from '@/content/id'
import { ui2025 } from '@/content/id-2025'
import { useEdition } from '@/composables/useEdition'
import { getMeta, getMeta2025 } from '@/data/api'

type IconName = 'home' | 'users' | 'grid' | 'pin' | 'layers' | 'flask' | 'info'
interface Item {
  to: string
  label: string
  short: string
  icon: IconName
  exact?: boolean
}

const { edition, home } = useEdition()
const meta = getMeta()
const meta2025 = getMeta2025()

const items2023: Item[] = [
  { to: '/2023', label: ui.nav.home, short: ui.nav.home, icon: 'home', exact: true },
  { to: '/komoditas', label: ui.nav.commodities, short: ui.nav.commodities, icon: 'grid' },
  { to: '/wilayah', label: ui.nav.regions, short: ui.nav.regions, icon: 'pin' },
  { to: '/pasar-lainnya', label: ui.nav.moreShort, short: ui.nav.more, icon: 'layers' },
  { to: '/riset', label: ui.nav.research, short: ui.nav.research, icon: 'flask' },
  { to: '/tentang-data', label: ui.nav.aboutFull, short: ui.nav.about, icon: 'info' },
]

const n = ui2025.nav
const items2025: Item[] = [
  { to: '/2025', label: n.home, short: n.home, icon: 'home', exact: true },
  { to: '/2025/komoditas', label: n.commodities, short: n.commodities, icon: 'grid' },
  { to: '/2025/konsumen', label: n.consumers, short: n.consumers, icon: 'users' },
  { to: '/2025/ekosistem', label: n.ecosystem, short: n.ecosystem, icon: 'layers' },
  { to: '/2025/riset', label: n.research, short: n.research, icon: 'flask' },
  { to: '/2025/tentang-data', label: n.about, short: n.aboutShort, icon: 'info' },
]

const items = computed(() => (edition.value === '2025' ? items2025 : items2023))
const research = computed(() => (edition.value === '2025' ? '/2025/riset' : '/riset'))
// Tab bawah di HP: lima tujuan; Riset dijangkau dari halaman lain
const tabs = computed(() => items.value.filter((i) => i.to !== research.value))
const brand = computed(() => (edition.value === '2025' ? ui2025.brand : ui.brand))
const badge = computed(() => (edition.value === '2025' ? ui2025.badge : ui.demoBadge))
const context = computed(() =>
  edition.value === '2025'
    ? `${ui2025.topbar.context(meta2025.dataYears.from, meta2025.dataYears.to)} / ${ui2025.topbar.status}`
    : `${ui.topbar.context(meta.dataYears.from, meta.dataYears.to)} / ${ui.topbar.published(meta.published)}`,
)
</script>

<template>
  <header class="sticky top-0 z-30 bg-paper-50/90 backdrop-blur">
    <div class="mx-auto flex h-14 max-w-[1280px] items-center gap-4 px-4 sm:px-6 md:gap-8 lg:px-8">
      <RouterLink :to="home" class="flex shrink-0 items-center gap-2.5">
        <img :src="aoiLogo" :alt="ui2025.logoAlt" width="465" height="275" class="h-10 w-auto mix-blend-multiply" />
        <span class="text-[15px] font-semibold tracking-tight text-ink-900">{{ brand }}</span>
        <span class="hidden text-xs font-medium text-ink-600 sm:inline">{{ badge }}</span>
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
        <div class="inline-flex rounded-md bg-paper-100 p-0.5" role="group" :aria-label="ui2025.edition.aria">
          <RouterLink
            to="/2023"
            class="whitespace-nowrap rounded px-2.5 py-1 text-[13px] font-medium"
            :class="edition === '2023' ? 'bg-white text-ink-900' : 'text-ink-600 hover:text-ink-900'"
            :aria-current="edition === '2023' ? 'true' : undefined"
          >
            <span class="sm:hidden">{{ ui2025.edition.e2023Short }}</span><span class="hidden sm:inline">{{ ui2025.edition.e2023 }}</span>
          </RouterLink>
          <RouterLink
            to="/2025"
            class="whitespace-nowrap rounded px-2.5 py-1 text-[13px] font-medium"
            :class="edition === '2025' ? 'bg-white text-ink-900' : 'text-ink-600 hover:text-ink-900'"
            :aria-current="edition === '2025' ? 'true' : undefined"
          >
            <span class="sm:hidden">{{ ui2025.edition.e2025Short }}</span><span class="hidden sm:inline">{{ ui2025.edition.e2025 }}</span>
          </RouterLink>
        </div>
      </div>
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
