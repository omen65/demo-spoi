<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import BarChart, { type BarItem } from '@/components/BarChart.vue'
import ChartCard from '@/components/ChartCard.vue'
import ChoiceGroup from '@/components/ChoiceGroup.vue'
import DeltaPill from '@/components/DeltaPill.vue'
import PageHeader from '@/components/PageHeader.vue'
import type { TableColumn } from '@/components/DataTable.vue'
import TrendChart from '@/components/TrendChart.vue'
import { changePct, direction } from '@/composables/useDerived'
import { formatNumber, formatPercent } from '@/composables/useFormat'
import {
  BREAK_AFTER_2025,
  LATEST_YEAR_2025,
  PREVIOUS_YEAR_2025,
  YEARS_2025,
  getCommodities2025,
  getCommodity2025,
  getCommodityNote2025,
  getProvinceSource2025,
  getProvinceValues2025,
  getSeries2025,
} from '@/data/api'
import type { Metric, ProvinceMetric2025, YearKey2025 } from '@/data/types'
import { flaggedYearsFor, notesFor } from '@/content/flags-2025'
import { ui2025 } from '@/content/id-2025'

const t = ui2025.detail
const home = ui2025.home
const route = useRoute()
const YEARS = [...YEARS_2025]
const LATEST = LATEST_YEAR_2025
const PREVIOUS = PREVIOUS_YEAR_2025

const commodity = computed(() => getCommodity2025(String(route.params.id)))

const METRICS: Metric[] = ['luas', 'produksi', 'petani', 'operator']
const present = computed(() => (commodity.value ? METRICS.filter((m) => getSeries2025(commodity.value!, m)) : []))

// --- Ringkasan tahun terakhir ---
const summary = computed(() => {
  const c = commodity.value
  if (!c) return []
  return present.value.map((m) => {
    const s = getSeries2025(c, m)!
    const value = s.values[LATEST]
    const previous = s.values[PREVIOUS]
    return {
      key: m,
      label: t.summaryNames[m],
      value,
      unit: t.units[m],
      pct: value !== null && previous !== null ? changePct(previous, value) : null,
      flagged: flaggedYearsFor(c.id, m, s.values, YEARS).includes(LATEST),
    }
  })
})

const COLS: Record<number, string> = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' }
const summaryCols = computed(() => COLS[Math.min(Math.max(summary.value.length, 1), 4)])

// --- Tren per metrik ---
const trends = computed(() => {
  const c = commodity.value
  if (!c) return []
  return present.value.map((m) => {
    const s = getSeries2025(c, m)!
    const noun = home.trend.nouns[m]
    const name = c.name.toLowerCase()
    const a = s.values[PREVIOUS]
    const b = s.values[LATEST]
    const pct = a !== null && b !== null ? changePct(a, b) : null
    const dir = direction(pct)
    const lastIdx = YEARS.reduce<number>((acc, y, i) => (s.values[y] !== null ? i : acc), -1)
    const lastYear = YEARS[lastIdx] ?? ''
    const lastValue = lastIdx >= 0 ? s.values[lastYear as (typeof YEARS)[number]] : null
    const title =
      pct !== null && dir !== null
        ? home.trend.title(noun, name, dir, formatPercent(pct), PREVIOUS, LATEST)
        : lastValue !== null
          ? home.trend.titleNoPct(noun, name, lastYear, `${formatNumber(lastValue)} ${s.unit}`)
          : noun
    return {
      metric: m,
      title,
      unit: s.unit,
      source: s.source,
      values: YEARS.map((y) => s.values[y]),
      flaggedYears: flaggedYearsFor(c.id, m, s.values, YEARS),
      columns: [
        { key: 'year', label: t.trendColumns.year },
        { key: 'value', label: `${noun} (${s.unit})`, numeric: true },
      ] as TableColumn[],
      rows: YEARS.map((y) => ({ year: y, value: s.values[y] })),
      aria: home.trend.aria(noun, name),
      noun,
    }
  })
})

// --- Catatan data (†) per metrik ---
const notes = computed(() => {
  const c = commodity.value
  if (!c) return []
  return present.value.flatMap((m) => {
    const s = getSeries2025(c, m)!
    const list = notesFor(c.id, m, s.values, YEARS)
    return list.map((note, i) => ({ key: `${m}-${i}`, title: t.notesLabel(t.summaryNames[m]), note }))
  })
})
// Catatan komoditas (mis. Minyak Atsiri = Jeruk di edisi sebelumnya) tampil sekali, bukan per metrik
const commodityNote = computed(() => (commodity.value ? getCommodityNote2025(commodity.value.id) : undefined))

// --- Sebaran provinsi (nilai dari Excel AOI; peta lengkap ada di halaman Wilayah) ---
const provYear = ref<YearKey2025>(LATEST)
const provYearOptions = (['2023', '2024'] as const).map((y) => ({ value: y, label: y }))
const provMetric = computed<ProvinceMetric2025>(() => (getSeries2025(commodity.value!, 'luas') ? 'luas' : 'produksi'))
const provItems = computed<BarItem[]>(() => {
  const c = commodity.value
  if (!c) return []
  return Object.entries(getProvinceValues2025(c.id, provMetric.value, provYear.value))
    .flatMap(([name, value]) => (value !== null ? [{ name, value }] : []))
    .sort((a, b) => b.value - a.value)
})
const provUnit = computed(() => t.provinces.units[provMetric.value])
const provTitle = computed(() => {
  const c = commodity.value
  const first = provItems.value[0]
  if (!c) return ''
  return first
    ? t.provinces.title(first.name, c.name.toLowerCase(), t.provinces.phrase[provMetric.value], provYear.value, provItems.value.length)
    : t.provinces.none(c.name.toLowerCase(), provYear.value)
})
const provColumns: TableColumn[] = [
  { key: 'name', label: t.provinces.columns.name },
  { key: 'value', label: t.provinces.columns.value, numeric: true },
]

// --- Navigasi sebelum/berikutnya ---
const pageList = getCommodities2025()
const neighbours = computed(() => {
  const i = pageList.findIndex((c) => c.id === commodity.value?.id)
  return {
    prev: i > 0 ? pageList[i - 1] : undefined,
    next: i >= 0 && i < pageList.length - 1 ? pageList[i + 1] : undefined,
  }
})
</script>

<template>
  <div v-if="!commodity" class="py-10 text-center">
    <h1 class="text-3xl">{{ t.notFoundTitle }}</h1>
    <RouterLink to="/2025/komoditas" class="mt-4 inline-block font-semibold text-accent-700 underline underline-offset-4">
      {{ t.back }}
    </RouterLink>
  </div>

  <div v-else class="space-y-6">
    <PageHeader :title="commodity.name" :lead="t.lead(LATEST)" :back="{ to: '/2025/komoditas', label: t.back }" />

    <section :aria-label="t.summary(LATEST)">
      <dl class="grid grid-cols-1 divide-y divide-paper-100 overflow-hidden rounded-lg bg-white sm:divide-x sm:divide-y-0" :class="summaryCols">
        <div v-for="s in summary" :key="s.key" class="p-4 md:p-5">
          <dt class="text-[13px] font-medium text-ink-600">{{ s.label }}</dt>
          <dd class="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-ink-900">
            <template v-if="s.value !== null">
              {{ formatNumber(s.value) }}
              <span v-if="s.flagged" class="text-flag" :title="ui2025.chart.flagLegend" :aria-label="ui2025.chart.flagLegend">†</span>
              <span class="block text-xs font-medium text-ink-600">{{ s.unit }}</span>
            </template>
            <span v-else class="text-base font-medium text-ink-600">{{ ui2025.commodities.noValue }}</span>
          </dd>
          <p v-if="s.pct !== null" class="mt-2 flex items-center gap-1.5 text-xs text-ink-600">
            <DeltaPill :pct="s.pct" /><span>{{ t.since(PREVIOUS) }}</span>
          </p>
        </div>
      </dl>
    </section>

    <aside v-if="commodityNote" class="rounded-lg bg-paper-100 p-4 text-sm text-ink-900">
      <span class="font-semibold">{{ t.noteTitle }}.</span> {{ commodityNote }}
    </aside>

    <aside v-if="notes.length" class="rounded-lg bg-flag/5 p-4" aria-labelledby="catatan">
      <h2 id="catatan" class="text-lg">† {{ t.notesTitle }}</h2>
      <p class="mt-1 text-sm text-ink-700">{{ t.notesLead }}</p>
      <ul class="mt-3 space-y-2 text-sm text-ink-900">
        <li v-for="n in notes" :key="n.key"><span class="font-semibold">{{ n.title }}.</span> {{ n.note }}</li>
      </ul>
    </aside>

    <section class="space-y-2">
      <div class="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <ChartCard
          v-for="tr in trends"
          :key="tr.metric"
          :title="tr.title"
          :unit="tr.unit"
          :source="tr.source"
          :csv-name="`spoi-2025-${commodity.id}-${tr.metric}`"
          :columns="tr.columns"
          :rows="tr.rows"
          :show-flag-legend="tr.flaggedYears.length > 0"
        >
          <TrendChart
            :years="YEARS"
            :values="tr.values"
            :unit="tr.unit"
            :series-name="tr.noun"
            :flagged-years="tr.flaggedYears"
            :description="tr.aria"
            :break-after="BREAK_AFTER_2025"
            :break-label="ui2025.chart.breakLabel"
            compact-labels
          />
        </ChartCard>
      </div>
      <p class="text-xs text-ink-600">{{ ui2025.chart.breakNote }}</p>
    </section>

    <section aria-labelledby="provinsi">
      <ChartCard
        :title="provTitle"
        :unit="provUnit"
        :source="getProvinceSource2025(commodity.id, provMetric)"
        :csv-name="`spoi-2025-${commodity.id}-${provMetric}-provinsi-${provYear}`"
        :columns="provColumns"
        :rows="provItems.map((p) => ({ name: p.name, value: p.value }))"
        :note="t.provinces.note"
      >
        <template #controls>
          <ChoiceGroup v-model="provYear" :legend="t.provinces.year" name="tahun-provinsi" :options="provYearOptions" />
        </template>
        <BarChart v-if="provItems.length" :items="provItems.slice(0, 10)" :unit="provUnit" :description="provTitle" />
        <p v-else class="py-6 text-sm text-ink-600">{{ t.provinces.empty }}</p>
        <RouterLink
          :to="{ path: '/2025/wilayah', query: { komoditas: commodity.id } }"
          class="mt-3 inline-block text-sm font-semibold text-accent-700 underline underline-offset-4"
        >
          {{ t.provinces.mapLink }}
        </RouterLink>
      </ChartCard>
    </section>

    <nav class="flex flex-wrap items-center justify-between gap-3 pt-2" aria-label="Komoditas lain">
      <RouterLink v-if="neighbours.prev" :to="`/2025/komoditas/${neighbours.prev.id}`" class="text-sm font-medium text-ink-700 hover:text-ink-900 hover:underline">
        ← {{ t.prev }}: {{ neighbours.prev.name }}
      </RouterLink>
      <span v-else />
      <RouterLink v-if="neighbours.next" :to="`/2025/komoditas/${neighbours.next.id}`" class="text-sm font-medium text-ink-700 hover:text-ink-900 hover:underline">
        {{ t.next }}: {{ neighbours.next.name }} →
      </RouterLink>
    </nav>
  </div>
</template>
