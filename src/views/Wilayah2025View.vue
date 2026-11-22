<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FeatureCollection } from 'geojson'
import ChartCard from '@/components/ChartCard.vue'
import ChoiceGroup from '@/components/ChoiceGroup.vue'
import type { TableColumn } from '@/components/DataTable.vue'
import MapLegend from '@/components/MapLegend.vue'
import PageHeader from '@/components/PageHeader.vue'
import ProvinceMap from '@/components/ProvinceMap.vue'
import ProvincePanel2025 from '@/components/ProvincePanel2025.vue'
import RankingList, { type RankItem } from '@/components/RankingList.vue'
import { classify } from '@/composables/useChoropleth'
import { formatNumber } from '@/composables/useFormat'
import {
  LATEST_YEAR_2025,
  YEARS_2025,
  getCommodities2025,
  getProvinceSource2025,
  getProvinceValues2025,
  getProvinces2025,
  loadProvinceGeo,
} from '@/data/api'
import type { ProvinceMetric2025, YearKey2025 } from '@/data/types'
import { ui2025 } from '@/content/id-2025'

type WilayahMetric = 'luas' | 'produksi' | 'produsen' | 'lakiLaki' | 'perempuan' | 'porsi'

const t = ui2025.wilayah
const route = useRoute()
const router = useRouter()

const ALL = 'semua'
const commodities = getCommodities2025()
const provinces = getProvinces2025()
const commodityOptions = [{ id: ALL, name: t.all }, ...commodities.map((c) => ({ id: c.id, name: c.name }))]
const ids = commodityOptions.map((c) => c.id)

const initial = String(route.query.komoditas ?? '')
const commodityId = ref<string>(ids.includes(initial) ? initial : 'beras')
const metric = ref<WilayahMetric>('produksi')
const year = ref<YearKey2025>(LATEST_YEAR_2025)
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

const isAll = computed(() => commodityId.value === ALL)
// Kosong untuk "Semua komoditas" supaya kalimat judul tetap wajar ("lahan organik terluas")
const commodityName = computed(() => (isAll.value ? '' : (commodityOptions.find((c) => c.id === commodityId.value)?.name.toLowerCase() ?? '')))
const squash = (s: string): string => s.replace(/\s+/g, ' ').trim()

// Metrik dan tahun yang tersedia bergantung pada pilihan komoditas
const availableMetrics = computed<WilayahMetric[]>(() => {
  if (isAll.value) return ['luas', 'produsen', 'lakiLaki', 'perempuan', 'porsi']
  const c = commodities.find((x) => x.id === commodityId.value)
  return (['luas', 'produksi', 'produsen'] as const).filter((m) => c?.metrics[m === 'produsen' ? 'petani' : m])
})
const availableYears = computed<YearKey2025[]>(() => (isAll.value ? ['2023', '2024'] : [...YEARS_2025]))
watch(
  [availableMetrics, availableYears],
  () => {
    if (!availableMetrics.value.includes(metric.value)) metric.value = availableMetrics.value[0] ?? 'luas'
    if (!availableYears.value.includes(year.value)) year.value = LATEST_YEAR_2025
  },
  { immediate: true },
)
const metricOptions = computed(() => availableMetrics.value.map((m) => ({ value: m, label: t.metricLabels[m] })))
const yearOptions = computed(() => availableYears.value.map((y) => ({ value: y, label: y })))

const unit = computed(() => t.metricUnits[metric.value])
const metricName = computed(() => t.metricLabels[metric.value])

const values = computed<Record<string, number | null>>(() => {
  if (!isAll.value) {
    return getProvinceValues2025(commodityId.value, metric.value as ProvinceMetric2025, year.value)
  }
  const y = year.value === '2023' ? '2023' : '2024'
  return Object.fromEntries(
    provinces.provinces.map((p) => {
      const prod = p.produsen[y]
      const share = prod.total && prod.perempuan !== null ? Number(((prod.perempuan / prod.total) * 100).toFixed(1)) : null
      const v =
        metric.value === 'luas'
          ? p.luas[y]
          : metric.value === 'produsen'
            ? prod.total
            : metric.value === 'lakiLaki'
              ? prod.lakiLaki
              : metric.value === 'perempuan'
                ? prod.perempuan
                : share
      return [p.name, v]
    }),
  )
})
const source = computed(() =>
  isAll.value
    ? metric.value === 'luas'
      ? provinces.sources.luas
      : provinces.sources.produsen
    : getProvinceSource2025(commodityId.value, metric.value as ProvinceMetric2025),
)
const classification = computed(() => classify(Object.values(values.value)))
const ranking = computed<RankItem[]>(() =>
  Object.entries(values.value)
    .flatMap(([name, value]) => (value !== null ? [{ name, value }] : []))
    .sort((a, b) => b.value - a.value),
)
const hasNoData = computed(() => Object.values(values.value).some((v) => v === null))

const title = computed(() => {
  const first = ranking.value[0]
  return first
    ? t.mapTitle(first.name, squash(t.metricPhrase[metric.value](commodityName.value)), year.value, ranking.value.length)
    : squash(t.mapTitleEmpty(commodityName.value, metricName.value, year.value))
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
const note = computed(() => [isAll.value ? t.allNote : '', t.note].filter(Boolean).join(' '))

const panelEl = ref<HTMLElement | null>(null)
async function selectProvince(name: string): Promise<void> {
  selected.value = name
  await nextTick()
  panelEl.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

// Sinkron dengan URL (?komoditas=) supaya tautan dari halaman komoditas dan berbagi tautan berfungsi
watch(commodityId, (id) => {
  if (route.query.komoditas !== id) void router.replace({ query: { ...route.query, komoditas: id } })
})
watch(
  () => route.query.komoditas,
  (q) => {
    const id = String(q ?? '')
    if (ids.includes(id) && id !== commodityId.value) commodityId.value = id
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
      <ChoiceGroup v-model="metric" :legend="t.controls.metric" name="metrik-wilayah" :options="metricOptions" />
      <ChoiceGroup v-model="year" :legend="t.controls.year" name="tahun-wilayah" :options="yearOptions" />
    </PageHeader>

    <div class="grid grid-cols-1 gap-3 lg:grid-cols-12">
      <div class="lg:col-span-8">
        <ChartCard
          :title="title"
          :unit="unit"
          :source="source"
          :csv-name="`spoi-2025-${commodityId}-${metric}-provinsi-${year}`"
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
              :description="squash(t.mapAria(commodityName, metricName, year))"
              @select="selectProvince"
            />
            <MapLegend :classes="classification.classes" :unit="unit" :show-zero="false" :show-no-data="hasNoData" />
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
        </div>
      </section>
    </div>

    <div ref="panelEl" class="scroll-mt-20">
      <ProvincePanel2025 v-if="selected" :province="selected" :year="year" @close="selected = null" />
      <p v-else class="rounded-xl border border-dashed border-paper-300 bg-white/60 p-4 text-sm text-ink-600">{{ t.panel.none }}</p>
    </div>
  </div>
</template>
