<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import BarChart, { type BarItem } from '@/components/BarChart.vue'
import ChartCard from '@/components/ChartCard.vue'
import type { TableColumn } from '@/components/DataTable.vue'
import TrendChart from '@/components/TrendChart.vue'
import { changePct, direction, productivity } from '@/composables/useDerived'
import { formatNumber, formatPercent } from '@/composables/useFormat'
import {
  FIRST_YEAR,
  LATEST_YEAR,
  YEARS,
  getCommodities,
  getCommodity,
  getProvinceTable,
  getSeries,
} from '@/data/api'
import type { Metric } from '@/data/types'
import { FLAGS, PROVINCE_NOTES, findFlag } from '@/content/flags'
import { OTHER_ON_COMMODITY_PAGE } from '@/content/groups'
import { metricLabel, ui } from '@/content/id'

const t = ui.detail
const tc = ui.commodities
const route = useRoute()

const commodity = computed(() => getCommodity(String(route.params.id)))

const METRICS: Metric[] = ['luas', 'produksi', 'petani', 'operator']
const present = computed(() =>
  commodity.value ? METRICS.flatMap((m) => (getSeries(commodity.value!, m) ? [m] : [])) : [],
)

const unitLabel = (unit: string): string => unit

// --- Ringkasan tahun terakhir ---
const summary = computed(() => {
  const c = commodity.value
  if (!c) return []
  const out = present.value.map((m) => {
    const s = getSeries(c, m)!
    const flag = findFlag(c.id, m, LATEST_YEAR)
    return { key: m, label: metricLabel[m], value: s.values[LATEST_YEAR], unit: unitLabel(s.unit), flagged: !!flag }
  })
  const prod = productivity(getSeries(c, 'produksi')?.values[LATEST_YEAR], getSeries(c, 'petani')?.values[LATEST_YEAR])
  if (prod !== null) {
    out.push({
      key: 'productivity' as Metric,
      label: tc.productivity,
      value: Number(prod.toFixed(2)),
      unit: tc.productivityUnit,
      flagged: false,
    })
  }
  return out
})

// --- Grafik tren per metrik ---
const trends = computed(() => {
  const c = commodity.value
  if (!c) return []
  return present.value.map((m) => {
    const s = getSeries(c, m)!
    const noun = t.nouns[m]
    const name = c.name.toLowerCase()
    const first = s.values[FIRST_YEAR]
    const last = s.values[LATEST_YEAR]
    const pct = changePct(first, last)
    const dir = direction(pct)
    const title =
      pct !== null && dir !== null
        ? t.trendTitle(noun, name, dir, formatPercent(pct), FIRST_YEAR, LATEST_YEAR)
        : t.trendTitleNoPct(noun, name, `${formatNumber(first)} ${s.unit}`, FIRST_YEAR, `${formatNumber(last)} ${s.unit}`, LATEST_YEAR)
    const flaggedYears = YEARS.filter((y) => findFlag(c.id, m, y))
    return {
      metric: m,
      title,
      unit: s.unit,
      source: s.source,
      years: [...YEARS],
      values: YEARS.map((y) => s.values[y]),
      flaggedYears,
      columns: [
        { key: 'year', label: t.trendColumns.year },
        { key: 'value', label: `${noun} (${s.unit})`, numeric: true },
      ] as TableColumn[],
      rows: YEARS.map((y) => ({ year: y, value: s.values[y] })),
      aria: t.trendAria(noun, name),
      noun,
    }
  })
})

// --- Catatan data (angka berpenanda) ---
const notes = computed(() => {
  const c = commodity.value
  if (!c) return []
  return FLAGS.filter((f) => f.commodity === c.id).map((f) => ({
    key: `${f.issue}-${f.metric}`,
    title: `${t.nouns[f.metric]}, ${t.notesYears(f.years.join(', '))}`,
    note: f.note,
  }))
})

const provinceNote = computed(() => (commodity.value ? PROVINCE_NOTES[commodity.value.id] : undefined))

// --- Provinsi teratas (produksi) ---
const TOP_N = 5
const topProvinces = computed<BarItem[]>(() => {
  const c = commodity.value
  if (!c) return []
  const series = getProvinceTable(c.id)?.metrics.produksi
  if (!series) return []
  return Object.entries(series.values[LATEST_YEAR])
    .flatMap(([name, value]) => (value !== null && value > 0 ? [{ name, value }] : []))
    .sort((a, b) => b.value - a.value)
    .slice(0, TOP_N)
})

const provinceSource = computed(() => (commodity.value ? getProvinceTable(commodity.value.id)?.source ?? '' : ''))

const provinceTitle = computed(() => {
  const c = commodity.value
  const first = topProvinces.value[0]
  if (!c || !first) return ''
  const name = c.name.toLowerCase()
  return topProvinces.value.length === 1
    ? t.provincesTitleOne(first.name, name, LATEST_YEAR)
    : t.provincesTitleMany(first.name, name, LATEST_YEAR)
})

const provinceColumns: TableColumn[] = [
  { key: 'province', label: t.provincesColumns.province },
  { key: 'value', label: t.provincesColumns.value, numeric: true },
]
const provinceRows = computed(() => topProvinces.value.map((p) => ({ province: p.name, value: p.value })))

// --- Navigasi sebelum/berikutnya ---
const pageList = getCommodities().filter((c) => c.group === 'utama' || OTHER_ON_COMMODITY_PAGE.includes(c.id))
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
    <RouterLink to="/komoditas" class="mt-4 inline-block font-semibold text-accent-700 underline underline-offset-4">
      {{ t.back }}
    </RouterLink>
  </div>

  <div v-else class="space-y-6">
    <PageHeader :title="commodity.name" :lead="t.lead(LATEST_YEAR, FIRST_YEAR)" :back="{ to: '/komoditas', label: ui.topbar.back }">
      <RouterLink
        :to="{ path: '/wilayah', query: { komoditas: commodity.id } }"
        v-if="topProvinces.length"
        class="rounded-md bg-deep-900 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-accent-700"
      >
        {{ t.wilayahLink }}
      </RouterLink>
    </PageHeader>

    <section :aria-label="t.summary(LATEST_YEAR)">
      <dl class="grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-paper-200 md:grid-cols-4">
        <div v-for="s in summary" :key="s.key" class="bg-white p-4 md:p-5">
          <dt class="text-[13px] font-medium text-ink-600">{{ s.label }}</dt>
          <dd class="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-ink-900">
            {{ formatNumber(s.value) }}
            <span v-if="s.flagged" class="text-flag" :title="tc.flagTitle" :aria-label="tc.flagTitle">†</span>
            <span class="block text-xs font-medium text-ink-600">{{ s.unit }}</span>
          </dd>
        </div>
      </dl>
      <p v-if="summary.some((s) => s.key === ('productivity' as Metric))" class="mt-2 text-sm text-ink-600">
        {{ tc.productivityNote }}
      </p>
    </section>

    <aside v-if="notes.length" class="rounded-lg bg-flag/5 p-4" aria-labelledby="catatan">
      <h2 id="catatan" class="text-lg">† {{ t.notesTitle }}</h2>
      <p class="mt-1 text-sm text-ink-700">{{ t.notesLead }}</p>
      <ul class="mt-3 space-y-2 text-sm text-ink-900">
        <li v-for="n in notes" :key="n.key">
          <span class="font-semibold">{{ n.title }}.</span> {{ n.note }}
        </li>
      </ul>
    </aside>

    <section class="grid grid-cols-1 gap-3 lg:grid-cols-3">
      <ChartCard
        v-for="tr in trends"
        :key="tr.metric"
        :title="tr.title"
        :unit="tr.unit"
        :source="tr.source"
        :csv-name="`spoi-2023-${commodity.id}-${tr.metric}`"
        :columns="tr.columns"
        :rows="tr.rows"
        :show-flag-legend="tr.flaggedYears.length > 0"
      >
        <TrendChart
          :years="tr.years"
          :values="tr.values"
          :unit="tr.unit"
          :series-name="tr.noun"
          :flagged-years="tr.flaggedYears"
          :description="tr.aria"
        />
      </ChartCard>
    </section>

    <section v-if="topProvinces.length">
      <ChartCard
        :title="provinceTitle"
        unit="ton"
        :source="provinceSource"
        :csv-name="`spoi-2023-${commodity.id}-provinsi-produksi-${LATEST_YEAR}`"
        :columns="provinceColumns"
        :rows="provinceRows"
        :note="provinceNote ? `† ${provinceNote.note}` : t.provincesNote(TOP_N)"
      >
        <BarChart
          :items="topProvinces"
          unit="ton"
          :description="t.provincesAria(commodity.name.toLowerCase(), LATEST_YEAR)"
        />
      </ChartCard>
      <p class="mt-3">
        <RouterLink
          :to="{ path: '/wilayah', query: { komoditas: commodity.id } }"
          class="font-semibold text-accent-700 underline underline-offset-4"
        >
          {{ t.wilayahLink }}
        </RouterLink>
      </p>
    </section>

    <nav class="flex flex-wrap items-center justify-between gap-3 pt-2" aria-label="Komoditas lain">
      <RouterLink
        v-if="neighbours.prev"
        :to="`/komoditas/${neighbours.prev.id}`"
        class="text-sm font-medium text-ink-700 hover:text-ink-900 hover:underline"
      >
        ← {{ t.prev }}: {{ neighbours.prev.name }}
      </RouterLink>
      <span v-else />
      <RouterLink
        v-if="neighbours.next"
        :to="`/komoditas/${neighbours.next.id}`"
        class="text-sm font-medium text-ink-700 hover:text-ink-900 hover:underline"
      >
        {{ t.next }}: {{ neighbours.next.name }} →
      </RouterLink>
    </nav>
  </div>
</template>
