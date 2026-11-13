<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FeatureCollection } from 'geojson'
import ChartCard from '@/components/ChartCard.vue'
import ChoiceGroup from '@/components/ChoiceGroup.vue'
import type { TableColumn } from '@/components/DataTable.vue'
import MapLegend from '@/components/MapLegend.vue'
import ProvinceMap from '@/components/ProvinceMap.vue'
import PageHeader from '@/components/PageHeader.vue'
import ProvincePanel from '@/components/ProvincePanel.vue'
import RankingList, { type RankItem } from '@/components/RankingList.vue'
import { classify } from '@/composables/useChoropleth'
import { formatNumber } from '@/composables/useFormat'
import {
  LATEST_YEAR,
  YEARS,
  getCommodity,
  getProvinceTable,
  getProvinceTableIds,
  loadProvinceGeo,
} from '@/data/api'
import type { ProvinceMetric, YearKey } from '@/data/types'
import { PROVINCE_NOTES } from '@/content/flags'
import { ui } from '@/content/id'

const t = ui.regions
const route = useRoute()
const router = useRouter()

const tableIds = getProvinceTableIds()
const commodityOptions = tableIds.map((id) => ({ id, name: getCommodity(id)?.name ?? id }))

const initial = String(route.query.komoditas ?? '')
const commodityId = ref<string>(tableIds.includes(initial) ? initial : (tableIds[0] ?? 'beras'))
const metric = ref<ProvinceMetric>('luas')
const year = ref<YearKey>(LATEST_YEAR)
const selected = ref<string | null>(null)

const geo = shallowRef<FeatureCollection | null>(null)
const geoError = ref(false)
onMounted(async () => {
  try {
    geo.value = await loadProvinceGeo()
  } catch {
    geoError.value = true
  }
})

const table = computed(() => getProvinceTable(commodityId.value))
const commodityName = computed(() => getCommodity(commodityId.value)?.name.toLowerCase() ?? '')

const availableMetrics = computed(() => (['luas', 'produksi', 'produsen'] as ProvinceMetric[]).filter((m) => table.value?.metrics[m]))
// Jaga agar metrik terpilih selalu tersedia untuk komoditas yang dipilih
watch(
  availableMetrics,
  (list) => {
    if (!list.includes(metric.value)) metric.value = list[0] ?? 'produksi'
  },
  { immediate: true },
)

const metricOptions = computed(() => availableMetrics.value.map((m) => ({ value: m, label: t.metricLabels[m] })))
const yearOptions = YEARS.map((y) => ({ value: y, label: y }))

const unit = computed(() => t.metricUnits[metric.value])
const values = computed<Record<string, number | null>>(() => table.value?.metrics[metric.value]?.values[year.value] ?? {})
const classification = computed(() => classify(Object.values(values.value)))

const ranking = computed<RankItem[]>(() =>
  Object.entries(values.value)
    .flatMap(([name, value]) => (value !== null && value > 0 ? [{ name, value }] : []))
    .sort((a, b) => b.value - a.value),
)

const hasZero = computed(() => Object.values(values.value).some((v) => v === 0))
const hasNoData = computed(() => Object.values(values.value).some((v) => v === null))

const metricName = computed(() => t.metricLabels[metric.value])

const title = computed(() => {
  const first = ranking.value[0]
  return first
    ? t.mapTitle(first.name, t.metricPhrase[metric.value](commodityName.value), year.value)
    : t.mapTitleEmpty(commodityName.value, metricName.value, year.value)
})

const columns: TableColumn[] = [
  { key: 'province', label: t.tableColumns.province },
  { key: 'value', label: t.tableColumns.value, numeric: true },
]
const tableRows = computed(() =>
  Object.entries(values.value)
    .map(([province, value]) => ({ province, value }))
    .sort((a, b) => (b.value ?? -1) - (a.value ?? -1)),
)

const note = computed(() => {
  const n = PROVINCE_NOTES[commodityId.value]
  const only = availableMetrics.value.length === 1 ? t.onlyProduction : ''
  return [n ? `† ${n.note}` : '', only].filter(Boolean).join(' ') || undefined
})

const panelEl = ref<HTMLElement | null>(null)
async function selectProvince(name: string): Promise<void> {
  selected.value = name
  await nextTick()
  panelEl.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

// Sinkron dengan URL (?komoditas=) supaya tautan dari halaman detail dan berbagi tautan berfungsi
watch(commodityId, (id) => {
  if (route.query.komoditas !== id) void router.replace({ query: { ...route.query, komoditas: id } })
})
watch(
  () => route.query.komoditas,
  (q) => {
    const id = String(q ?? '')
    if (tableIds.includes(id) && id !== commodityId.value) commodityId.value = id
  },
)
</script>

<template>
  <div class="space-y-5">
    <PageHeader :title="t.title" :lead="t.lead">
      <div>
        <label for="komoditas" class="mb-1 block text-xs font-medium text-ink-600">{{ t.controls.commodity }}</label>
        <select
          id="komoditas"
          v-model="commodityId"
          class="rounded-lg border border-paper-300 bg-white px-2.5 py-1.5 text-[13px] font-medium text-ink-900"
        >
          <option v-for="c in commodityOptions" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <ChoiceGroup v-if="metricOptions.length > 1" v-model="metric" :legend="t.controls.metric" name="metrik-wilayah" :options="metricOptions" />
      <ChoiceGroup v-model="year" :legend="t.controls.year" name="tahun-wilayah" :options="yearOptions" />
    </PageHeader>

    <div class="grid grid-cols-1 gap-3 lg:grid-cols-12">
      <div class="lg:col-span-8">
        <ChartCard
          :title="title"
          :unit="unit"
          :source="table?.source ?? ''"
          :csv-name="`spoi-2023-${commodityId}-${metric}-provinsi-${year}`"
          :columns="columns"
          :rows="tableRows"
          :note="note"
        >
          <p v-if="geoError" class="rounded-lg bg-paper-50 p-4 text-sm text-ink-700">{{ t.notFoundGeo }}</p>
          <p v-else-if="!geo" class="flex h-[260px] items-center justify-center rounded-lg bg-paper-100 text-ink-600 md:h-[400px] xl:h-[460px]">
            {{ t.loading }}
          </p>
          <div v-else class="space-y-3 pb-1">
            <ProvinceMap
              :geo="geo"
              :values="values"
              :classification="classification"
              :unit="unit"
              :selected="selected"
              :description="t.mapAria(commodityName, metricName, year)"
              @select="selectProvince"
            />
            <MapLegend :classes="classification.classes" :unit="unit" :show-zero="hasZero" :show-no-data="hasNoData" />
          </div>
        </ChartCard>
      </div>

      <section class="flex flex-col rounded-lg bg-white lg:col-span-4" aria-labelledby="peringkat">
        <div class="px-4 pt-4 md:px-5">
          <h2 id="peringkat" class="text-[15px] font-semibold">{{ t.rankingTitle(year) }}</h2>
          <p class="mt-0.5 text-xs text-ink-600">{{ t.rankingLead }} ({{ formatNumber(ranking.length) }} provinsi)</p>
        </div>
        <div class="mt-2 max-h-[380px] flex-1 overflow-y-auto px-2 pb-3 lg:max-h-[440px]">
          <RankingList v-if="ranking.length" :items="ranking" :unit="unit" :selected="selected" @select="selectProvince" />
          <p v-else class="px-3 py-4 text-sm text-ink-600">{{ t.rankingEmpty }}</p>
        </div>
      </section>
    </div>

    <div ref="panelEl" class="scroll-mt-20">
      <ProvincePanel v-if="selected" :province="selected" :year="year" @close="selected = null" />
      <p v-else class="rounded-xl border border-dashed border-paper-300 bg-white/60 p-4 text-sm text-ink-600">{{ t.panelNone }}</p>
    </div>
  </div>
</template>
