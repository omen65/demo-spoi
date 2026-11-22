<script setup lang="ts">
import { computed, ref } from 'vue'
import ChartCard from '@/components/ChartCard.vue'
import ChoiceGroup from '@/components/ChoiceGroup.vue'
import CoverageBars from '@/components/CoverageBars.vue'
import BarChart, { type BarItem } from '@/components/BarChart.vue'
import GroupedBarChart from '@/components/GroupedBarChart.vue'
import DeltaBars, { type DeltaItem } from '@/components/DeltaBars.vue'
import DeltaPill from '@/components/DeltaPill.vue'
import HeadlineCards, { type HeadlineItem } from '@/components/HeadlineCards.vue'
import IndicatorMatrix from '@/components/IndicatorMatrix.vue'
import HomeHero from '@/components/HomeHero.vue'
import type { TableColumn } from '@/components/DataTable.vue'
import TrendChart from '@/components/TrendChart.vue'
import { changePct, direction } from '@/composables/useDerived'
import { formatNumber, formatPercent } from '@/composables/useFormat'
import { combineSources2025 } from '@/composables/useSources'
import {
  BREAK_AFTER_2025,
  LATEST_YEAR_2025,
  PREVIOUS_YEAR_2025,
  TREND_START_2025,
  YEARS_2025,
  getCommodities2025,
  getCoverage2025,
  getMeta2025,
  getNationalSeries2025,
  getProvinces2025,
  getSeries2025,
} from '@/data/api'
import type { YearKey2025 } from '@/data/types'
import { flaggedYearsFor, notesFor } from '@/content/flags-2025'
import { OTHER_PRODUCTS_2025 } from '@/content/groups'
import { ui2025, type IndicatorStatus } from '@/content/id-2025'

type HomeMetric = 'luas' | 'produksi' | 'petani'

const t = ui2025.home
const meta = getMeta2025()
const coverage = getCoverage2025().kabupatenKota
const YEARS = [...YEARS_2025]
const LATEST = LATEST_YEAR_2025
const PREVIOUS = PREVIOUS_YEAR_2025
const TREND_START = TREND_START_2025
const breakIndex = YEARS.indexOf(BREAK_AFTER_2025)
const commodities = getCommodities2025()

const metric = ref<HomeMetric>('produksi')
const pickId = ref<string>('beras')

const metricOptions = (Object.keys(t.metricNames) as HomeMetric[]).map((m) => ({ value: m, label: t.metricNames[m] }))
const metricName = computed(() => t.metricNames[metric.value])
const unit = computed(() => t.metricUnits[metric.value])

interface Row {
  id: string
  name: string
  group: 'tanaman' | 'produkLain'
  value: number | null
  previous: number | null
  pct: number | null
  values: (number | null)[]
  flaggedYears: YearKey2025[]
  notes: string[]
  source: string
}

function rowsFor(m: HomeMetric): Row[] {
  return commodities
    .flatMap((c) => {
      const s = getSeries2025(c, m)
      if (!s) return []
      const value = s.values[LATEST]
      const previous = s.values[TREND_START]
      return [
        {
          id: c.id,
          name: c.name,
          group: OTHER_PRODUCTS_2025.includes(c.id) ? ('produkLain' as const) : ('tanaman' as const),
          value,
          previous,
          pct: value !== null && previous !== null ? changePct(previous, value) : null,
          values: YEARS.map((y) => s.values[y]),
          flaggedYears: flaggedYearsFor(c.id, m, s.values, YEARS),
          notes: notesFor(c.id, m, s.values, YEARS),
          source: s.source,
        },
      ]
    })
    .sort((a, b) => (b.value ?? -1) - (a.value ?? -1))
}

const rows = computed(() => rowsFor(metric.value))
const tanamanRows = computed(() => rows.value.filter((r) => r.group === 'tanaman'))
const produkRows = computed(() => rows.value.filter((r) => r.group === 'produkLain'))
const picked = computed(() => rows.value.find((r) => r.id === pickId.value) ?? rows.value[0])
const maxValue = computed(() => Math.max(...tanamanRows.value.map((r) => r.value ?? 0), 1))
const isFlagged = (r: Row): boolean => r.flaggedYears.includes(LATEST) || r.flaggedYears.includes(TREND_START)

// --- Tiga angka utama: komoditas tanaman terbesar per metrik ---
const headline = computed<HeadlineItem[]>(() =>
  (Object.keys(t.metricNames) as HomeMetric[]).flatMap((m) => {
    const top = rowsFor(m).find((r) => r.group === 'tanaman' && r.value !== null)
    if (!top || top.value === null) return []
    const name = t.metricNames[m]
    const first = top.values[0]
    const spark = top.values.every((v) => v !== null) ? (top.values as number[]) : []
    return [
      {
        id: m,
        label: t.headline.label(name),
        name: top.name,
        value: top.value,
        unit: t.metricUnits[m],
        pct: top.pct,
        since: t.headline.since(TREND_START),
        values: spark,
        sparkLabel: t.headline.sparkAria(name, top.name, YEARS[0] ?? '', LATEST, formatNumber(first ?? 0), formatNumber(top.value)),
        flagged: isFlagged(top),
        flagTitle: ui2025.chart.flagLegend,
      },
    ]
  }),
)

// --- Tren komoditas terpilih ---
const trendTitle = computed(() => {
  const r = picked.value
  if (!r) return ''
  const noun = t.trend.nouns[metric.value]
  const name = r.name.toLowerCase()
  const dir = direction(r.pct)
  if (r.pct !== null && dir !== null) return t.trend.title(noun, name, dir, formatPercent(r.pct), TREND_START, LATEST)
  const lastIdx = r.values.reduce<number>((acc, v, i) => (v !== null ? i : acc), -1)
  const lastValue = lastIdx >= 0 ? r.values[lastIdx] : null
  return lastValue !== null && lastValue !== undefined
    ? t.trend.titleNoPct(noun, name, YEARS[lastIdx] ?? '', `${formatNumber(lastValue)} ${unit.value}`)
    : ''
})
const trendColumns = computed<TableColumn[]>(() => [
  { key: 'year', label: t.trend.columns.year },
  { key: 'value', label: `${t.trend.nouns[metric.value]} (${unit.value})`, numeric: true },
])
const trendRows = computed(() => (picked.value ? YEARS.map((y, i) => ({ year: y, value: picked.value?.values[i] ?? null })) : []))
const trendNote = computed(() => [ui2025.chart.breakNote, ...(picked.value?.notes ?? [])].join(' '))

// --- Peringkat ---
const rankColumns = computed<TableColumn[]>(() => [
  { key: 'rank', label: t.ranking.columns.rank, numeric: true },
  { key: 'group', label: t.ranking.columns.group },
  { key: 'name', label: t.ranking.columns.name },
  { key: 'value', label: `${t.ranking.columns.value} (${unit.value})`, numeric: true },
  { key: 'change', label: t.ranking.columns.change, numeric: true },
])
const rankRows = computed(() =>
  [...tanamanRows.value, ...produkRows.value].map((r, i) => ({
    rank: i + 1,
    group: t.ranking.groups[r.group],
    name: isFlagged(r) ? `${r.name} †` : r.name,
    value: r.value,
    change: r.pct === null ? '–' : Number(r.pct.toFixed(1)),
  })),
)
const rankSources = computed(() => combineSources2025(rows.value.map((r) => r.source)))

// --- Perubahan 2023 ke 2024 (tanaman saja) ---
const deltaItems = computed<DeltaItem[]>(() =>
  tanamanRows.value
    .flatMap((r) => (r.pct === null ? [] : [{ name: r.name, pct: r.pct, flagged: isFlagged(r) }]))
    .sort((a, b) => b.pct - a.pct),
)
const deltaTitle = computed(() => {
  const top = deltaItems.value[0]
  const bottom = deltaItems.value[deltaItems.value.length - 1]
  if (!top || !bottom) return t.change.titleNone
  const lead = Math.abs(top.pct) >= Math.abs(bottom.pct) ? top : bottom
  return t.change.title(lead.name, lead.pct >= 0 ? 'naik' : 'turun', formatPercent(lead.pct), metricName.value, TREND_START, LATEST)
})
const deltaColumns: TableColumn[] = [
  { key: 'name', label: t.change.columns.name },
  { key: 'pct', label: t.change.columns.pct, numeric: true },
]
const deltaRows = computed(() => deltaItems.value.map((i) => ({ name: i.flagged ? `${i.name} †` : i.name, pct: Number(i.pct.toFixed(1)) })))

// --- Kelengkapan data kabupaten/kota ---
const coverageTotal = coverage.total.lengkap + coverage.total.tidakLengkap + coverage.total.tidakAda
const coveragePct = formatPercent((coverage.total.lengkap / coverageTotal) * 100)
const coverageTitle = t.coverage.title(coveragePct, coverage.total.lengkap, coverageTotal)
const coverageColumns: TableColumn[] = [
  { key: 'region', label: t.coverage.columns.region },
  { key: 'lengkap', label: t.coverage.columns.lengkap, numeric: true },
  { key: 'tidakLengkap', label: t.coverage.columns.tidakLengkap, numeric: true },
  { key: 'tidakAda', label: t.coverage.columns.tidakAda, numeric: true },
]
const coverageRows = [
  ...coverage.regions.map((r) => ({ region: r.name, lengkap: r.lengkap, tidakLengkap: r.tidakLengkap, tidakAda: r.tidakAda })),
  { region: 'Total', lengkap: coverage.total.lengkap, tidakLengkap: coverage.total.tidakLengkap, tidakAda: coverage.total.tidakAda },
]

// --- Angka nasional dan gender (Excel AOI, 38 provinsi, 2023-2024) ---
const provinces = getProvinces2025()
const natNow = provinces.national[LATEST as '2024']
const natPrev = provinces.national[PREVIOUS as '2023']
const womenShare = (n: { perempuan: number | null; total: number | null }): number | null =>
  n.perempuan !== null && n.total ? (n.perempuan / n.total) * 100 : null
const shareNow = womenShare(natNow)
const nationalSeries = getNationalSeries2025()
const areaSeries = YEARS.map((y) => nationalSeries.luas[y])
const producersSeries = YEARS.map((y) => nationalSeries.produsen[y])
const provinceArea: Record<string, number | null> = Object.fromEntries(provinces.provinces.map((p) => [p.name, p.luas[LATEST as '2024']]))
const sum = (pick: (r: (typeof provinces.provinces)[number]) => number | null): number =>
  provinces.provinces.reduce((acc, r) => acc + (pick(r) ?? 0), 0)
const certRaw = [
  { name: t.cert.names.selfDeclare, value: sum((r) => r.sertifikasi2024.selfDeclare) },
  { name: t.cert.names.konversi, value: sum((r) => r.sertifikasi2024.konversi) },
  { name: t.cert.names.pgs, value: sum((r) => r.sertifikasi2024.pgs) },
]
const certTotal = certRaw.reduce((acc, r) => acc + r.value, 0)
const certItems: BarItem[] = certRaw.map((r) => ({ name: r.name, value: Number(r.value.toFixed(2)) })).sort((a, b) => b.value - a.value)
const certTitle = certItems[0] && certTotal ? t.cert.title(certItems[0].name, formatPercent((certItems[0].value / certTotal) * 100), LATEST) : ''
const certColumns: TableColumn[] = [
  { key: 'name', label: t.cert.columns.name },
  { key: 'value', label: t.cert.columns.value, numeric: true },
  { key: 'share', label: t.cert.columns.share, numeric: true },
]
const certRows = certItems.map((r) => ({ name: r.name, value: r.value, share: certTotal ? Number(((r.value / certTotal) * 100).toFixed(1)) : null }))
const genderTitle = t.gender.title(shareNow === null ? '' : formatPercent(shareNow), formatNumber(natNow.total ?? 0), LATEST)
const genderCategories = ['2023', '2024']
const genderSeries = [
  { name: t.gender.series.lakiLaki, values: [natPrev.lakiLaki ?? 0, natNow.lakiLaki ?? 0] },
  { name: t.gender.series.perempuan, values: [natPrev.perempuan ?? 0, natNow.perempuan ?? 0] },
]
const genderColumns: TableColumn[] = [
  { key: 'year', label: t.gender.columns.year },
  { key: 'lakiLaki', label: t.gender.columns.lakiLaki, numeric: true },
  { key: 'perempuan', label: t.gender.columns.perempuan, numeric: true },
  { key: 'total', label: t.gender.columns.total, numeric: true },
  { key: 'share', label: t.gender.columns.share, numeric: true },
]
const genderRows = (['2023', '2024'] as const).map((y) => {
  const n = provinces.national[y]
  const sh = womenShare(n)
  return { year: y, lakiLaki: n.lakiLaki, perempuan: n.perempuan, total: n.total, share: sh === null ? '–' : Number(sh.toFixed(1)) }
})

// --- Matriks indikator ---
const matrixRows = t.matrix.rows
const countStatus = (s: IndicatorStatus): number => matrixRows.filter((r) => r.status === s).length
const matrixTitle = t.matrix.title(countStatus('belum'), countStatus('sebagian'), matrixRows.length)
const matrixColumns: TableColumn[] = [
  { key: 'no', label: t.matrix.columns.no, numeric: true },
  { key: 'name', label: t.matrix.columns.name },
  { key: 'status', label: t.matrix.columns.status },
  { key: 'note', label: t.matrix.columns.note },
]
const matrixTable = matrixRows.map((r) => ({ no: r.no, name: r.name, status: t.matrix.status[r.status], note: r.note }))
</script>

<template>
  <div class="space-y-6">
    <HomeHero
      :title="t.title"
      :lead="t.intro(meta.dataYears.from, meta.dataYears.to)"
      :year="LATEST"
      :trend-start="YEARS[0] ?? ''"
      :break-after-index="breakIndex"
      :area="natNow.luas ?? 0"
      :area-series="areaSeries"
      :producers="natNow.total ?? 0"
      :producers-series="producersSeries"
      :men="natNow.lakiLaki ?? 0"
      :women="natNow.perempuan ?? 0"
      :province-values="provinceArea"
    />

    <div class="flex flex-wrap items-end justify-between gap-3">
      <ChoiceGroup v-model="metric" :legend="t.controls.metric" name="metrik-beranda-2025" :options="metricOptions" />
    </div>

    <HeadlineCards :items="headline" :break-after-index="breakIndex" :label="t.headline.aria(LATEST)" />

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div class="lg:col-span-8">
        <ChartCard
          v-if="picked"
          :title="trendTitle"
          :unit="unit"
          :source="picked.source"
          :csv-name="`spoi-2025-${picked.id}-${metric}`"
          :columns="trendColumns"
          :rows="trendRows"
          :note="trendNote"
          :show-flag-legend="picked.flaggedYears.length > 0"
        >
          <template #controls>
            <label for="pilih-komoditas-2025" class="sr-only">{{ t.controls.commodity }}</label>
            <select
              id="pilih-komoditas-2025"
              v-model="pickId"
              class="rounded-md border border-paper-300 bg-white px-2 py-1 text-xs font-medium text-ink-900"
            >
              <option v-for="r in rows" :key="r.id" :value="r.id">{{ r.name }}</option>
            </select>
          </template>
          <TrendChart
            :years="YEARS"
            :values="picked.values"
            :unit="unit"
            :series-name="t.trend.nouns[metric]"
            :flagged-years="picked.flaggedYears"
            :description="t.trend.aria(t.trend.nouns[metric], picked.name.toLowerCase())"
            :height="380"
            :break-after="BREAK_AFTER_2025"
            :break-label="ui2025.chart.breakLabel"
          />
        </ChartCard>
      </div>

      <div class="lg:col-span-4">
        <ChartCard
          :title="t.ranking.title(metricName, LATEST)"
          :unit="unit"
          :source="rankSources"
          :csv-name="`spoi-2025-peringkat-${metric}-${LATEST}`"
          :columns="rankColumns"
          :rows="rankRows"
          :note="`${t.ranking.hint} ${produkRows.length ? t.ranking.groupNote : ''}`"
        >
          <div class="max-h-[26rem] overflow-y-auto pr-1">
          <template v-for="group in ([['tanaman', tanamanRows], ['produkLain', produkRows]] as const)" :key="group[0]">
            <template v-if="group[1].length">
              <h4 class="mb-1 mt-3 text-xs font-medium text-ink-600 first:mt-0">{{ t.ranking.groups[group[0]] }}</h4>
              <ol class="-mx-1 space-y-0.5">
                <li v-for="r in group[1]" :key="r.id">
                  <button
                    type="button"
                    class="block w-full rounded-md px-2 py-1.5 text-left transition-colors hover:bg-paper-50"
                    :class="r.id === picked?.id ? 'bg-paper-100' : ''"
                    :aria-pressed="r.id === picked?.id"
                    :aria-label="`${t.ranking.aria(r.name)}: ${r.value === null ? t.ranking.noValue : `${formatNumber(r.value)} ${unit}`}`"
                    @click="pickId = r.id"
                  >
                    <span class="flex items-center justify-between gap-2 text-[13px]">
                      <span class="truncate font-medium text-ink-900">{{ r.name }}</span>
                      <span class="flex shrink-0 items-center gap-2">
                        <span v-if="r.value !== null" class="tabular-nums text-ink-700">{{ formatNumber(r.value) }}<span v-if="isFlagged(r)" class="ml-0.5 text-flag">†</span></span>
                        <span v-else class="text-xs text-ink-600">{{ t.ranking.noValue }}</span>
                        <DeltaPill :pct="r.pct" />
                      </span>
                    </span>
                    <span v-if="group[0] === 'tanaman' && r.value !== null" class="mt-1.5 block h-[3px] rounded-full bg-paper-100" aria-hidden="true">
                      <span class="block h-[3px] rounded-full bg-accent-600" :style="{ width: `${Math.max(1, (r.value / maxValue) * 100)}%` }" />
                    </span>
                  </button>
                </li>
              </ol>
            </template>
          </template>
          </div>
        </ChartCard>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard
        :title="genderTitle"
        :unit="t.gender.unit"
        :source="provinces.sources.produsen"
        csv-name="spoi-2025-produsen-gender"
        :columns="genderColumns"
        :rows="genderRows"
        :note="t.gender.note"
      >
        <GroupedBarChart :categories="genderCategories" :series="genderSeries" :unit="t.gender.unit" :description="t.gender.aria" />
      </ChartCard>

      <ChartCard
        :title="deltaTitle"
        unit="%"
        :source="rankSources"
        :csv-name="`spoi-2025-perubahan-${metric}`"
        :columns="deltaColumns"
        :rows="deltaRows"
        :note="t.change.note"
      >
        <DeltaBars :items="deltaItems" :description="deltaTitle" />
      </ChartCard>

      <ChartCard
        :title="certTitle"
        unit="ha"
        :source="provinces.sources.sertifikasi2024"
        csv-name="spoi-2025-luas-menurut-sertifikasi-2024"
        :columns="certColumns"
        :rows="certRows"
        :note="t.cert.note"
      >
        <BarChart :items="certItems" unit="ha" :description="t.cert.aria" />
      </ChartCard>

      <ChartCard
        :title="coverageTitle"
        :unit="t.coverage.unit"
        :source="coverage.source"
        csv-name="spoi-2025-kelengkapan-data-kabupaten-kota"
        :columns="coverageColumns"
        :rows="coverageRows"
        :note="t.coverage.note"
      >
        <CoverageBars :rows="coverage.regions" :legend="t.coverage.legend" :description="t.coverage.aria(coveragePct)" />
      </ChartCard>
    </div>

    <ChartCard
      :title="matrixTitle"
      :unit="t.matrix.unit"
      :source="t.matrix.source"
      csv-name="spoi-2025-matriks-indikator"
      :columns="matrixColumns"
      :rows="matrixTable"
      :note="t.matrix.note"
    >
      <IndicatorMatrix :rows="matrixRows" :status-labels="t.matrix.status" :description="t.matrix.aria" />
    </ChartCard>

    <p class="text-xs text-ink-600">{{ t.scopeNote }}</p>
  </div>
</template>
