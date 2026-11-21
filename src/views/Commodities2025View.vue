<script setup lang="ts">
import { computed, ref } from 'vue'
import BarChart, { type BarItem } from '@/components/BarChart.vue'
import ChartCard from '@/components/ChartCard.vue'
import ChoiceGroup from '@/components/ChoiceGroup.vue'
import CommodityTable2025, { type SortKey2025 } from '@/components/CommodityTable2025.vue'
import PageHeader from '@/components/PageHeader.vue'
import type { TableColumn } from '@/components/DataTable.vue'
import { buildRows2025, type CommodityRow2025, type RowMetric } from '@/composables/useCommodityRows2025'
import { combineSources2025 } from '@/composables/useSources'
import { LATEST_YEAR_2025, YEARS_2025, getCommodities2025, getSeries2025 } from '@/data/api'
import type { YearKey2025 } from '@/data/types'
import { ui2025 } from '@/content/id-2025'

const t = ui2025.commodities
const commodities = getCommodities2025()

const year = ref<YearKey2025>(LATEST_YEAR_2025)
const metric = ref<RowMetric>('luas')
const sortKey = ref<SortKey2025>('luas')
function setSort(k: SortKey2025): void {
  sortKey.value = k
}
// Urutan awal mengikuti metrik yang dipilih untuk grafik
function onMetric(m: RowMetric): void {
  metric.value = m
  sortKey.value = m === 'petani' ? 'people' : m
}

const yearOptions = YEARS_2025.map((y) => ({ value: y, label: y }))
const metricOptions = (Object.keys(t.metricNames) as RowMetric[]).map((m) => ({ value: m, label: t.metricNames[m] }))
const metricName = computed(() => t.metricNames[metric.value])
const unit = computed(() => t.units[metric.value])

const rows = computed(() => buildRows2025(commodities, year.value, metric.value))
const tanaman = computed(() => rows.value.filter((r) => r.group === 'tanaman'))
const produkLain = computed(() => rows.value.filter((r) => r.group === 'produkLain'))

function sortValue(r: CommodityRow2025, key: SortKey2025): number | null {
  const v = key === 'people' ? (r.petani ?? r.operator) : key === 'change' ? r.change : r[key]
  return v === undefined ? null : v
}
function sorted(list: CommodityRow2025[]): CommodityRow2025[] {
  return [...list].sort((a, b) => {
    const x = sortValue(a, sortKey.value)
    const y = sortValue(b, sortKey.value)
    if (x === null && y === null) return 0
    if (x === null) return 1
    if (y === null) return -1
    return y - x
  })
}
const sortedTanaman = computed(() => sorted(tanaman.value))
const sortedProduk = computed(() => sorted(produkLain.value))

const items = computed<BarItem[]>(() =>
  tanaman.value
    .flatMap((r) => {
      const v = r[metric.value]
      return v === undefined || v === null ? [] : [{ name: r.commodity.name, value: v, flagged: r.flags[metric.value] }]
    })
    .sort((a, b) => b.value - a.value),
)
const hasFlag = computed(() => items.value.some((i) => i.flagged))
const chartTitle = computed(() => {
  const first = items.value[0]
  return first ? t.chartTitle(first.name, t.chartPhrase[metric.value], year.value) : t.title
})
const chartSource = computed(() =>
  combineSources2025(
    commodities.flatMap((c) => {
      const s = getSeries2025(c, metric.value)
      return s ? [s.source] : []
    }),
  ),
)

const columns = computed<TableColumn[]>(() => [
  { key: 'name', label: t.table.name },
  { key: 'luas', label: t.table.area, numeric: true },
  { key: 'produksi', label: t.table.prod, numeric: true },
  { key: 'petani', label: t.table.people, numeric: true },
  { key: 'operator', label: t.operatorSuffix, numeric: true },
  { key: 'change', label: t.table.change(metricName.value), numeric: true },
])
const tableRows = computed(() =>
  [...sortedTanaman.value, ...sortedProduk.value].map((r) => ({
    name: Object.values(r.flags).some(Boolean) ? `${r.commodity.name} †` : r.commodity.name,
    luas: r.luas ?? null,
    produksi: r.produksi ?? null,
    petani: r.petani ?? null,
    operator: r.operator ?? null,
    change: r.change === null ? '–' : Number(r.change.toFixed(1)),
  })),
)
</script>

<template>
  <div class="space-y-5">
    <PageHeader :title="t.title" :lead="t.lead(commodities.length)">
      <ChoiceGroup v-model="year" :legend="t.controls.year" name="tahun-2025" :options="yearOptions" />
      <ChoiceGroup :model-value="metric" :legend="t.controls.metric" name="metrik-2025" :options="metricOptions" @update:model-value="onMetric" />
    </PageHeader>
    <p class="-mt-2 text-xs text-ink-600">{{ t.periodNote }}</p>

    <ChartCard
      :title="chartTitle"
      :unit="unit"
      :source="chartSource"
      :csv-name="`spoi-2025-komoditas-${year}`"
      :columns="columns"
      :rows="tableRows"
      :note="t.chartNote"
      :show-flag-legend="hasFlag"
    >
      <BarChart v-if="items.length" :items="items" :unit="unit" :description="t.chartAria(metricName, year)" />
      <p v-else class="py-6 text-sm text-ink-600">{{ t.noValue }}</p>
    </ChartCard>

    <section aria-labelledby="tanaman" class="space-y-2">
      <h2 id="tanaman" class="text-base font-semibold">{{ t.listTitle }}</h2>
      <CommodityTable2025 :rows="sortedTanaman" :sort-key="sortKey" :caption="t.listTitle" :metric-name="metricName" @sort="setSort" />
    </section>

    <section aria-labelledby="produk-lain" class="space-y-2">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="produk-lain" class="text-base font-semibold">{{ t.otherTitle }}</h2>
        <p class="text-xs text-ink-600">{{ t.otherLead }}</p>
      </div>
      <CommodityTable2025 :rows="sortedProduk" :sort-key="null" :caption="t.otherTitle" :metric-name="metricName" @sort="setSort" />
    </section>
  </div>
</template>
