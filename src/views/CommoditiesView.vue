<script setup lang="ts">
import { computed, ref } from 'vue'
import BarChart, { type BarItem } from '@/components/BarChart.vue'
import ChartCard from '@/components/ChartCard.vue'
import ChoiceGroup from '@/components/ChoiceGroup.vue'
import CommodityTable, { type SortKey } from '@/components/CommodityTable.vue'
import PageHeader from '@/components/PageHeader.vue'
import type { TableColumn } from '@/components/DataTable.vue'
import { buildRows, type CommodityRow } from '@/composables/useCommodityRows'
import { combineSources } from '@/composables/useSources'
import { LATEST_YEAR, YEARS, getCommodities, getSeries } from '@/data/api'
import type { Metric, YearKey } from '@/data/types'
import { OTHER_ON_COMMODITY_PAGE } from '@/content/groups'
import { ui } from '@/content/id'

type ChartMetric = 'luas' | 'produksi' | 'petani'

const t = ui.commodities
const year = ref<YearKey>(LATEST_YEAR)
const metric = ref<ChartMetric>('luas')
const sortKey = ref<SortKey>('luas')
function setSort(k: SortKey): void {
  sortKey.value = k
}

const main = getCommodities('utama')
const others = getCommodities('lainnya').filter((c) => OTHER_ON_COMMODITY_PAGE.includes(c.id))

const units: Record<ChartMetric, string> = { luas: 'ha', produksi: 'ton', petani: 'orang' }
const metricNames: Record<ChartMetric, string> = {
  luas: t.metricArea,
  produksi: t.metricProd,
  petani: t.metricFarmers,
}

const yearOptions = YEARS.map((y) => ({ value: y, label: y }))
const metricOptions = (Object.keys(metricNames) as ChartMetric[]).map((m) => ({ value: m, label: metricNames[m] }))

const rows = computed(() => buildRows(main, year.value))

function sortValue(r: CommodityRow, key: SortKey): number | null {
  const v = key === 'change' ? r.change : key === 'productivity' ? r.productivity : r[key]
  return v === undefined ? null : v
}

const sortedRows = computed(() =>
  [...rows.value].sort((a, b) => {
    const x = sortValue(a, sortKey.value)
    const y = sortValue(b, sortKey.value)
    if (x === null && y === null) return 0
    if (x === null) return 1
    if (y === null) return -1
    return y - x
  }),
)

const items = computed<BarItem[]>(() =>
  rows.value
    .flatMap((r) => {
      const v = r[metric.value]
      return v === undefined ? [] : [{ name: r.commodity.name, value: v, flagged: r.flags[metric.value] }]
    })
    .sort((a, b) => b.value - a.value),
)

const chartTitle = computed(() =>
  items.value[0] ? t.chartTitle(items.value[0].name, t.chartPhrase[metric.value], year.value) : t.title,
)

const chartSource = computed(() =>
  combineSources(
    main.flatMap((c) => {
      const s = getSeries(c, metric.value as Metric)
      return s ? [s.source] : []
    }),
  ),
)

const columns: TableColumn[] = [
  { key: 'name', label: t.table.name },
  { key: 'luas', label: t.table.area, numeric: true },
  { key: 'produksi', label: t.table.prod, numeric: true },
  { key: 'petani', label: t.table.farmers, numeric: true },
  { key: 'change', label: t.table.change, numeric: true },
  { key: 'productivity', label: t.table.productivity, numeric: true },
]

const tableRows = computed(() =>
  sortedRows.value.map((r) => ({
    name: Object.values(r.flags).some(Boolean) ? `${r.commodity.name} †` : r.commodity.name,
    luas: r.luas ?? null,
    produksi: r.produksi ?? null,
    petani: r.petani ?? null,
    change: r.change === null ? '–' : Number(r.change.toFixed(1)),
    productivity: r.productivity === null ? '–' : Number(r.productivity.toFixed(2)),
  })),
)

const hasFlag = computed(() => items.value.some((i) => i.flagged))

const otherRows = computed(() => buildRows(others, year.value))
</script>

<template>
  <div class="space-y-5">
    <PageHeader :title="t.title" :lead="t.lead">
      <ChoiceGroup v-model="year" :legend="t.controls.year" name="tahun" :options="yearOptions" />
      <ChoiceGroup v-model="metric" :legend="t.controls.metric" name="metrik" :options="metricOptions" />
    </PageHeader>

    <ChartCard
      :title="chartTitle"
      :unit="units[metric]"
      :source="chartSource"
      :csv-name="`spoi-2023-komoditas-utama-${year}`"
      :columns="columns"
      :rows="tableRows"
      :note="t.chartNote"
      :show-flag-legend="hasFlag"
    >
      <BarChart :items="items" :unit="units[metric]" :description="t.chartAria(metricNames[metric], year)" />
    </ChartCard>

    <section aria-labelledby="rincian" class="space-y-2">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="rincian" class="text-base font-semibold">{{ t.listTitle }}</h2>
        <p class="text-xs text-ink-600">{{ t.productivityNote }}</p>
      </div>
      <CommodityTable :rows="sortedRows" :year="year" :sort-key="sortKey" :caption="t.listTitle" @sort="setSort" />
    </section>

    <section aria-labelledby="lain" class="space-y-2">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="lain" class="text-base font-semibold">{{ t.otherTitle }}</h2>
        <p class="text-xs text-ink-600">{{ t.otherLead }}</p>
      </div>
      <CommodityTable :rows="otherRows" :year="year" :sort-key="null" :caption="t.otherTitle" @sort="setSort" />
    </section>
  </div>
</template>
