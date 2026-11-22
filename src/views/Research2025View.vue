<script setup lang="ts">
import { computed } from 'vue'
import ChartCard from '@/components/ChartCard.vue'
import type { TableColumn } from '@/components/DataTable.vue'
import DeltaPill from '@/components/DeltaPill.vue'
import GroupedBarChart from '@/components/GroupedBarChart.vue'
import PageHeader from '@/components/PageHeader.vue'
import { changePct } from '@/composables/useDerived'
import { formatNumber } from '@/composables/useFormat'
import { getResearch2025 } from '@/data/api'
import { ui2025 } from '@/content/id-2025'

const t = ui2025.research
const r = getResearch2025()
const snaps = r.snapshots
const first = snaps[0] ?? ''
const prev = snaps[snaps.length - 2] ?? ''
const last = snaps[snaps.length - 1] ?? ''

// Urut dari topik terbanyak pada potret terakhir
const sorted = computed(() => [...r.rows].sort((a, b) => (b.values[last] ?? 0) - (a.values[last] ?? 0)))

const firstTotal = r.totalSummed[first] ?? 0
const lastTotal = r.totalSummed[last] ?? 0
const title = t.chartTitle(lastTotal >= firstTotal ? 'naik' : 'turun', firstTotal, first, lastTotal, last)

const series = computed(() => snaps.map((y) => ({ name: y, values: sorted.value.map((row) => row.values[y] ?? 0) })))
const categories = computed(() => sorted.value.map((row) => row.topic))

const columns: TableColumn[] = [{ key: 'topic', label: t.columns.topic }, ...snaps.map((y) => ({ key: y, label: y, numeric: true }))]
const rows = computed(() => [
  ...sorted.value.map((row) => ({ topic: row.topic, ...Object.fromEntries(snaps.map((y) => [y, row.values[y] ?? null])) })),
  { topic: t.columns.total, ...Object.fromEntries(snaps.map((y) => [y, r.totalSummed[y] ?? null])) },
])

const totals = snaps.map((y) => ({ year: y, total: r.totalSummed[y] ?? 0 }))
// Hanya potret terakhir dibandingkan dengan potret sebelumnya (jarak setahun)
const lastPct = changePct(r.totalSummed[prev] ?? 0, lastTotal)
const garuda = snaps.map((y) => ({ year: y, value: r.garudaTotalApprox[y] ?? null }))
</script>

<template>
  <div class="space-y-5">
    <PageHeader :title="t.title" :lead="t.lead" />

    <div class="grid grid-cols-1 gap-3 lg:grid-cols-12">
      <div class="lg:col-span-8">
        <ChartCard
          :title="title"
          :unit="r.unit"
          :source="r.source"
          csv-name="spoi-2025-riset-topik"
          :columns="columns"
          :rows="rows"
          :note="r.note"
          :show-flag-legend="false"
        >
          <GroupedBarChart :categories="categories" :series="series" :unit="r.unit" :description="t.aria" />
        </ChartCard>
      </div>

      <div class="space-y-3 lg:col-span-4">
        <section class="surface p-4" aria-labelledby="total-riset">
          <h2 id="total-riset" class="font-display text-lg font-bold tracking-tight">{{ t.totalsTitle }}</h2>
          <dl class="mt-3 divide-y divide-paper-200">
            <div v-for="x in totals" :key="x.year" class="flex items-center justify-between gap-3 py-2.5">
              <dt class="text-[13px] text-ink-600">{{ x.year }}</dt>
              <dd class="flex items-center gap-2">
                <span v-if="x.year === last && lastPct !== null" class="flex items-center gap-1 text-xs text-ink-600">
                  <DeltaPill :pct="lastPct" />{{ t.sinceLabel(prev) }}
                </span>
                <span class="text-xl font-semibold tabular-nums text-ink-900">
                  {{ formatNumber(x.total) }}
                </span>
              </dd>
            </div>
          </dl>
          <p class="mt-1 text-xs text-ink-600">{{ t.totalsNote }}</p>
        </section>

        <aside class="surface p-4" aria-labelledby="cara-baca-2025">
          <h2 id="cara-baca-2025" class="font-display text-lg font-bold tracking-tight">{{ t.noteTitle }}</h2>
          <ul class="mt-2 list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-ink-700">
            <li>{{ t.noteSnapshots }}</li>
          </ul>
        </aside>

        <section class="surface p-4" aria-labelledby="garuda">
          <h2 id="garuda" class="font-display text-lg font-bold tracking-tight">{{ t.garudaTitle }}</h2>
          <dl class="mt-2 divide-y divide-paper-100 text-[13px]">
            <div v-for="g in garuda" :key="g.year" class="flex justify-between py-1.5">
              <dt class="text-ink-600">{{ g.year }}</dt>
              <dd class="tabular-nums text-ink-900">{{ g.value === null ? ui2025.commodities.noValue : `±${formatNumber(g.value)}` }}</dd>
            </div>
          </dl>
          <p class="mt-2 text-xs text-ink-600">{{ t.garudaNote }}</p>
        </section>
      </div>
    </div>
  </div>
</template>
