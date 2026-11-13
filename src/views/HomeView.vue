<script setup lang="ts">
import { computed, ref } from 'vue'
import BarChart, { type BarItem } from '@/components/BarChart.vue'
import ChartCard from '@/components/ChartCard.vue'
import ChoiceGroup from '@/components/ChoiceGroup.vue'
import DeltaBars, { type DeltaItem } from '@/components/DeltaBars.vue'
import DeltaPill from '@/components/DeltaPill.vue'
import NavIcon from '@/components/NavIcon.vue'
import PageHeader from '@/components/PageHeader.vue'
import KpiStrip, { type KpiItem } from '@/components/KpiStrip.vue'
import type { TableColumn } from '@/components/DataTable.vue'
import TrendChart from '@/components/TrendChart.vue'
import { changePct, direction, productivity } from '@/composables/useDerived'
import { formatNumber, formatPercent } from '@/composables/useFormat'
import { combineSources } from '@/composables/useSources'
import { FIRST_YEAR, LATEST_YEAR, YEARS, getCommodities, getMeta, getProvinceTable, getSeries } from '@/data/api'
import type { Metric } from '@/data/types'
import { findFlag } from '@/content/flags'
import { ui } from '@/content/id'

type HomeMetric = 'luas' | 'produksi' | 'petani'

const t = ui.home
const meta = getMeta()
const main = getCommodities('utama')

const metric = ref<HomeMetric>('luas')
const pickId = ref<string>('beras')

const metricOptions = (Object.keys(t.metricNames) as HomeMetric[]).map((m) => ({ value: m, label: t.metricNames[m] }))
const metricName = computed(() => t.metricNames[metric.value])
const unit = computed(() => t.metricUnits[metric.value])

interface Row {
  id: string
  name: string
  value: number
  pct: number | null
  values: number[]
  flaggedYears: string[]
  source: string
}

// Hanya komoditas yang punya deret untuk metrik terpilih. Semua angka dari JSON; yang dihitung hanya perubahan persen.
const rows = computed<Row[]>(() =>
  main
    .flatMap((c) => {
      const s = getSeries(c, metric.value as Metric)
      if (!s) return []
      return [
        {
          id: c.id,
          name: c.name,
          value: s.values[LATEST_YEAR],
          pct: changePct(s.values[FIRST_YEAR], s.values[LATEST_YEAR]),
          values: YEARS.map((y) => s.values[y]),
          flaggedYears: YEARS.filter((y) => findFlag(c.id, metric.value as Metric, y)),
          source: s.source,
        },
      ]
    })
    .sort((a, b) => b.value - a.value),
)

const picked = computed(() => rows.value.find((r) => r.id === pickId.value) ?? rows.value[0])
const maxValue = computed(() => Math.max(...rows.value.map((r) => r.value), 1))
const isFlagged = (r: Row): boolean => r.flaggedYears.includes(LATEST_YEAR) || r.flaggedYears.includes(FIRST_YEAR)
const allSources = computed(() => combineSources(rows.value.map((r) => r.source)))

const sparkLabel = (r: Row): string =>
  t.sparkAria(metricName.value, r.name, FIRST_YEAR, LATEST_YEAR, formatNumber(r.values[0] ?? 0), formatNumber(r.value))

const kpis = computed<KpiItem[]>(() =>
  rows.value.slice(0, 4).map((r) => ({
    id: r.id,
    title: t.kpiTitle(metricName.value, r.name),
    value: r.value,
    unit: unit.value,
    pct: r.pct,
    since: t.kpiSince(FIRST_YEAR),
    to: `/komoditas/${r.id}`,
    values: r.values,
    sparkLabel: sparkLabel(r),
    flagged: isFlagged(r),
  })),
)

// --- Tren komoditas terpilih ---
const trendTitle = computed(() => {
  const r = picked.value
  if (!r) return ''
  const noun = ui.detail.nouns[metric.value]
  const name = r.name.toLowerCase()
  const dir = direction(r.pct)
  return r.pct !== null && dir !== null
    ? ui.detail.trendTitle(noun, name, dir, formatPercent(r.pct), FIRST_YEAR, LATEST_YEAR)
    : ui.detail.trendTitleNoPct(noun, name, `${formatNumber(r.values[0] ?? 0)} ${unit.value}`, FIRST_YEAR, `${formatNumber(r.value)} ${unit.value}`, LATEST_YEAR)
})
const trendColumns = computed<TableColumn[]>(() => [
  { key: 'year', label: ui.detail.trendColumns.year },
  { key: 'value', label: `${ui.detail.nouns[metric.value]} (${unit.value})`, numeric: true },
])
const trendRows = computed(() => (picked.value ? YEARS.map((y, i) => ({ year: y, value: picked.value!.values[i] ?? null })) : []))

// --- Peringkat ---
const rankColumns = computed<TableColumn[]>(() => [
  { key: 'rank', label: t.ranking.columns.rank, numeric: true },
  { key: 'name', label: t.ranking.columns.name },
  { key: 'value', label: `${t.ranking.columns.value} (${unit.value})`, numeric: true },
  { key: 'change', label: t.ranking.columns.change, numeric: true },
])
const rankRows = computed(() =>
  rows.value.map((r, i) => ({
    rank: i + 1,
    name: isFlagged(r) ? `${r.name} †` : r.name,
    value: r.value,
    change: r.pct === null ? '–' : Number(r.pct.toFixed(1)),
  })),
)

// --- Perubahan antartahun ---
const deltaItems = computed<DeltaItem[]>(() =>
  rows.value
    .flatMap((r) => (r.pct === null ? [] : [{ name: r.name, pct: r.pct, flagged: isFlagged(r) }]))
    .sort((a, b) => b.pct - a.pct),
)
const deltaTitle = computed(() => {
  const list = deltaItems.value
  const top = list[0]
  const bottom = list[list.length - 1]
  if (!top || !bottom) return t.change.titleNone
  const lead = Math.abs(top.pct) >= Math.abs(bottom.pct) ? top : bottom
  return t.change.title(lead.name, lead.pct >= 0 ? 'naik' : 'turun', formatPercent(lead.pct), metricName.value, FIRST_YEAR, LATEST_YEAR)
})
const deltaColumns: TableColumn[] = [
  { key: 'name', label: t.change.columns.name },
  { key: 'pct', label: t.change.columns.pct, numeric: true },
]
const deltaRows = computed(() => deltaItems.value.map((i) => ({ name: i.flagged ? `${i.name} †` : i.name, pct: Number(i.pct.toFixed(1)) })))

// --- Provinsi teratas untuk komoditas terpilih ---
const provinceItems = computed<BarItem[]>(() => {
  const series = picked.value ? getProvinceTable(picked.value.id)?.metrics.produksi : undefined
  if (!series) return []
  return Object.entries(series.values[LATEST_YEAR])
    .flatMap(([name, value]) => (value !== null && value > 0 ? [{ name, value }] : []))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
})
const provinceSource = computed(() => (picked.value ? getProvinceTable(picked.value.id)?.source ?? '' : ''))
const provinceColumns: TableColumn[] = [
  { key: 'province', label: t.provinces.columns.province },
  { key: 'value', label: t.provinces.columns.value, numeric: true },
]
const provinceRows = computed(() => provinceItems.value.map((p) => ({ province: p.name, value: p.value })))

// --- Produktivitas (turunan: produksi dibagi petani) ---
const prodItems = computed<BarItem[]>(() =>
  main
    .flatMap((c) => {
      const p = productivity(getSeries(c, 'produksi')?.values[LATEST_YEAR], getSeries(c, 'petani')?.values[LATEST_YEAR])
      return p === null ? [] : [{ name: c.name, value: Number(p.toFixed(2)), flagged: !!findFlag(c.id, 'produksi', LATEST_YEAR) }]
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 6),
)
const prodSource = computed(() =>
  combineSources(main.flatMap((c) => [getSeries(c, 'produksi')?.source, getSeries(c, 'petani')?.source].flatMap((x) => (x ? [x] : [])))),
)
const prodTitle = computed(() => (prodItems.value.length >= 2 ? t.productivity.title(prodItems.value[0]!.name, prodItems.value[1]!.name) : ''))
const prodColumns: TableColumn[] = [
  { key: 'name', label: t.productivity.columns.name },
  { key: 'value', label: t.productivity.columns.value, numeric: true },
]
const prodRows = computed(() => prodItems.value.map((i) => ({ name: i.name, value: i.value })))
</script>

<template>
  <div class="space-y-6">
    <PageHeader :title="t.title" :lead="t.intro(meta.publisher, meta.dataYears.from, meta.dataYears.to, meta.collection.certifiers, meta.collection.pgs)">
      <ChoiceGroup v-model="metric" :legend="t.controls.metric" name="metrik-beranda" :options="metricOptions" />
    </PageHeader>

    <KpiStrip :items="kpis" />

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div class="lg:col-span-8">
        <ChartCard
          v-if="picked"
          :title="trendTitle"
          :unit="unit"
          :source="picked.source"
          :csv-name="`spoi-2023-${picked.id}-${metric}`"
          :columns="trendColumns"
          :rows="trendRows"
          :show-flag-legend="picked.flaggedYears.length > 0"
        >
          <template #controls>
            <label for="pilih-komoditas" class="sr-only">{{ t.controls.commodity }}</label>
            <select
              id="pilih-komoditas"
              v-model="pickId"
              class="rounded-md border border-paper-300 bg-white px-2 py-1 text-xs font-medium text-ink-900"
            >
              <option v-for="r in rows" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </template>
          <TrendChart
            :years="[...YEARS]"
            :values="picked.values"
            :unit="unit"
            :series-name="ui.detail.nouns[metric]"
            :flagged-years="picked.flaggedYears"
            :description="ui.detail.trendAria(ui.detail.nouns[metric], picked.name.toLowerCase())"
            :height="300"
          />
        </ChartCard>
      </div>

      <div class="lg:col-span-4">
        <ChartCard
          :title="t.ranking.title(metricName, LATEST_YEAR)"
          :unit="unit"
          :source="allSources"
          :csv-name="`spoi-2023-peringkat-${metric}-${LATEST_YEAR}`"
          :columns="rankColumns"
          :rows="rankRows"
          :note="t.ranking.hint"
        >
          <ol class="-mx-1 space-y-0.5">
            <li v-for="(r, i) in rows" :key="r.id">
              <button
                type="button"
                class="block w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-paper-50"
                :class="r.id === picked?.id ? 'bg-paper-100' : ''"
                :aria-pressed="r.id === picked?.id"
                :aria-label="`${t.ranking.aria(r.name)}: ${formatNumber(r.value)} ${unit}`"
                @click="pickId = r.id"
              >
                <span class="flex items-center justify-between gap-2 text-[13px]">
                  <span class="flex min-w-0 items-center gap-2">
                    <span class="w-4 shrink-0 text-right text-xs tabular-nums text-ink-600">{{ i + 1 }}</span>
                    <span class="truncate font-medium text-ink-900">{{ r.name }}</span>
                  </span>
                  <span class="flex shrink-0 items-center gap-2">
                    <span class="tabular-nums text-ink-700">{{ formatNumber(r.value) }}<span v-if="isFlagged(r)" class="ml-0.5 text-flag">†</span></span>
                    <DeltaPill :pct="r.pct" />
                  </span>
                </span>
                <span class="mt-1.5 block h-[3px] rounded-full bg-paper-100" aria-hidden="true">
                  <span class="block h-[3px] rounded-full bg-accent-600" :style="{ width: `${Math.max(1, (r.value / maxValue) * 100)}%` }" />
                </span>
              </button>
            </li>
          </ol>
        </ChartCard>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <ChartCard
        :title="deltaTitle"
        unit="%"
        :source="allSources"
        :csv-name="`spoi-2023-perubahan-${metric}`"
        :columns="deltaColumns"
        :rows="deltaRows"
        :note="t.change.note"
      >
        <DeltaBars :items="deltaItems" :description="deltaTitle" />
      </ChartCard>

      <ChartCard
        :title="provinceItems.length ? t.provinces.title(provinceItems[0]!.name, picked?.name.toLowerCase() ?? '', LATEST_YEAR) : t.provinces.none"
        unit="ton"
        :source="provinceSource || allSources"
        :csv-name="`spoi-2023-${picked?.id ?? 'komoditas'}-provinsi-teratas`"
        :columns="provinceColumns"
        :rows="provinceRows"
        :note="provinceItems.length ? t.provinces.note : undefined"
      >
        <template v-if="provinceItems.length">
          <BarChart :items="provinceItems" unit="ton" :description="t.provinces.title(provinceItems[0]!.name, picked?.name.toLowerCase() ?? '', LATEST_YEAR)" />
          <RouterLink :to="{ path: '/wilayah', query: { komoditas: picked?.id } }" class="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-accent-700 hover:underline">
            {{ t.provinces.link }}<NavIcon name="arrow" class="!h-3.5 !w-3.5" />
          </RouterLink>
        </template>
        <p v-else class="py-6 text-sm text-ink-600">{{ t.provinces.none }}</p>
      </ChartCard>

      <ChartCard
        :title="prodTitle"
        :unit="t.productivity.unit"
        :source="prodSource"
        csv-name="spoi-2023-produktivitas-komoditas"
        :columns="prodColumns"
        :rows="prodRows"
        :note="t.productivity.note"
      >
        <BarChart :items="prodItems" :unit="t.productivity.unit" :description="prodTitle" />
      </ChartCard>
    </div>

    <p class="text-xs text-ink-600">{{ t.scopeNote }}</p>
  </div>
</template>
