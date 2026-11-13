<script setup lang="ts">
import { computed } from 'vue'
import ChartCard from '@/components/ChartCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import type { TableColumn } from '@/components/DataTable.vue'
import TrendChart from '@/components/TrendChart.vue'
import { changePct, direction } from '@/composables/useDerived'
import { formatNumber, formatPercent } from '@/composables/useFormat'
import { FIRST_YEAR, LATEST_YEAR, YEARS, getCommodity, getPgsSystems } from '@/data/api'
import type { Metric } from '@/data/types'
import { findFlag } from '@/content/flags'
import { ui } from '@/content/id'

const t = ui.more
const td = ui.detail

interface SeriesSpec {
  commodity: string
  metric: Metric
}

const MARKET: SeriesSpec[] = [
  { commodity: 'pasar', metric: 'operator' },
  { commodity: 'pasar', metric: 'produksi' },
  { commodity: 'olahan', metric: 'operator' },
  { commodity: 'olahan', metric: 'produksi' },
]
const OTHER: SeriesSpec[] = [
  { commodity: 'madu', metric: 'produksi' },
  { commodity: 'sarang-lebah', metric: 'produksi' },
  { commodity: 'ternak', metric: 'operator' },
  { commodity: 'ternak', metric: 'produksi' },
  { commodity: 'pupuk', metric: 'operator' },
  { commodity: 'pupuk', metric: 'produksi' },
  { commodity: 'jamur', metric: 'operator' },
]

function build(specs: SeriesSpec[]) {
  return specs.flatMap((spec) => {
    const c = getCommodity(spec.commodity)
    const s = c?.metrics[spec.metric]
    if (!c || !s) return []
    const noun = td.nouns[spec.metric]
    const subject = t.subjects[c.id] ?? c.name.toLowerCase()
    const first = s.values[FIRST_YEAR]
    const last = s.values[LATEST_YEAR]
    const pct = changePct(first, last)
    const dir = direction(pct)
    const title =
      pct !== null && dir !== null
        ? td.trendTitle(noun, subject, dir, formatPercent(pct), FIRST_YEAR, LATEST_YEAR)
        : td.trendTitleNoPct(noun, subject, `${formatNumber(first)} ${s.unit}`, FIRST_YEAR, `${formatNumber(last)} ${s.unit}`, LATEST_YEAR)
    const flaggedYears = YEARS.filter((y) => findFlag(c.id, spec.metric, y))
    const notes = [...new Set(flaggedYears.map((y) => findFlag(c.id, spec.metric, y)?.note ?? ''))].filter(Boolean)
    return [
      {
        key: `${c.id}-${spec.metric}`,
        csv: `spoi-2023-${c.id}-${spec.metric}`,
        title,
        unit: s.unit,
        source: s.source,
        values: YEARS.map((y) => s.values[y]),
        years: [...YEARS],
        flaggedYears,
        note: notes.length ? `† ${notes.join(' ')}` : undefined,
        columns: [
          { key: 'year', label: td.trendColumns.year },
          { key: 'value', label: `${noun} (${s.unit})`, numeric: true },
        ] as TableColumn[],
        rows: YEARS.map((y) => ({ year: y, value: s.values[y] })),
        aria: td.trendAria(noun, subject),
        noun,
      },
    ]
  })
}

const market = computed(() => build(MARKET))
const other = computed(() => build(OTHER))
const systems = getPgsSystems()

function goTo(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="space-y-6">
    <PageHeader :title="t.title" :lead="t.lead">
      <nav class="flex flex-wrap gap-0.5 rounded-lg bg-paper-100 p-0.5" aria-label="Bagian halaman">
        <a
          v-for="s in [t.sections.market, t.sections.other, t.sections.pgs]"
          :key="s.id"
          :href="`#${s.id}`"
          class="rounded-md px-2.5 py-1 text-[13px] font-medium text-ink-600 hover:bg-white hover:text-ink-900"
          @click.prevent="goTo(s.id)"
        >
          {{ s.title }}
        </a>
      </nav>
    </PageHeader>

    <section :aria-labelledby="t.sections.market.id" class="scroll-mt-4">
      <h2 :id="t.sections.market.id" class="text-base font-semibold">{{ t.sections.market.title }}</h2>
      <p class="mt-0.5 text-xs text-ink-600">{{ t.sections.market.lead }}</p>
      <div class="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ChartCard
          v-for="c in market"
          :key="c.key"
          :title="c.title"
          :unit="c.unit"
          :source="c.source"
          :csv-name="c.csv"
          :columns="c.columns"
          :rows="c.rows"
          :note="c.note"
          :show-flag-legend="c.flaggedYears.length > 0"
        >
          <TrendChart :years="c.years" :values="c.values" :unit="c.unit" :series-name="c.noun" :flagged-years="c.flaggedYears" :description="c.aria" />
        </ChartCard>
      </div>
    </section>

    <section :aria-labelledby="t.sections.other.id" class="scroll-mt-4">
      <h2 :id="t.sections.other.id" class="text-base font-semibold">{{ t.sections.other.title }}</h2>
      <p class="mt-0.5 text-xs text-ink-600">{{ t.sections.other.lead }}</p>
      <div class="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        <ChartCard
          v-for="c in other"
          :key="c.key"
          :title="c.title"
          :unit="c.unit"
          :source="c.source"
          :csv-name="c.csv"
          :columns="c.columns"
          :rows="c.rows"
          :note="c.note"
          :show-flag-legend="c.flaggedYears.length > 0"
        >
          <TrendChart :years="c.years" :values="c.values" :unit="c.unit" :series-name="c.noun" :flagged-years="c.flaggedYears" :description="c.aria" />
        </ChartCard>
      </div>
    </section>

    <section :aria-labelledby="t.sections.pgs.id" class="scroll-mt-4">
      <h2 :id="t.sections.pgs.id" class="text-base font-semibold">{{ t.sections.pgs.title }}</h2>
      <p class="mt-0.5 text-xs text-ink-600">{{ t.sections.pgs.lead }}</p>
      <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <article v-for="s in systems" :key="s.id" class="rounded-lg bg-white p-4 md:p-5">
          <h3 class="text-[15px] font-semibold">{{ s.name }}</h3>
          <dl class="mt-3 grid grid-cols-2 gap-3">
            <div v-for="f in s.figures" :key="f.key">
              <dt class="text-xs font-semibold text-ink-600">{{ f.label }}</dt>
              <dd class="text-2xl font-semibold tracking-tight tabular-nums text-ink-900">
                {{ formatNumber(f.value) }}
                <span class="block text-sm font-medium text-ink-600">{{ f.unit }}</span>
              </dd>
            </div>
          </dl>
          <p class="mt-3 text-xs text-ink-600">{{ ui.chart.sourcePrefix }} {{ s.source }}</p>
        </article>
      </div>
      <p class="mt-3 text-sm text-ink-700">{{ t.pgsNote }}</p>
    </section>

    <nav class="flex flex-wrap gap-3 border-t border-paper-200 pt-6" :aria-label="t.otherLinks">
      <RouterLink to="/komoditas" class="rounded-md border border-paper-300 px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-paper-100">{{ t.toCommodities }}</RouterLink>
      <RouterLink to="/riset" class="rounded-md border border-paper-300 px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-paper-100">{{ t.toResearch }}</RouterLink>
    </nav>
  </div>
</template>
