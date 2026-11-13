<script setup lang="ts">
import { computed } from 'vue'
import ChartCard from '@/components/ChartCard.vue'
import type { TableColumn } from '@/components/DataTable.vue'
import DeltaPill from '@/components/DeltaPill.vue'
import PageHeader from '@/components/PageHeader.vue'
import GroupedBarChart from '@/components/GroupedBarChart.vue'
import { changePct } from '@/composables/useDerived'
import { formatNumber } from '@/composables/useFormat'
import { getResearch } from '@/data/api'
import { ui } from '@/content/id'

const t = ui.research
const r = getResearch()
const [y1, y2, y3] = r.snapshots as [string, string, string]

const sorted = computed(() => [...r.rows].sort((a, b) => (b.values[y3] ?? 0) - (a.values[y3] ?? 0)))

const title = computed(() =>
  t.chartTitle(
    (sorted.value[0]?.topic ?? '').toLowerCase(),
    r.totalArticles[y1] ?? 0,
    r.totalArticles[y2] ?? 0,
    r.totalArticles[y3] ?? 0,
    y1,
    y2,
    y3,
  ),
)

const series = computed(() => r.snapshots.map((y) => ({ name: t.snapshotLabel(y), values: sorted.value.map((row) => row.values[y] ?? 0) })))
const categories = computed(() => sorted.value.map((row) => row.topic))

const columns: TableColumn[] = [
  { key: 'topic', label: t.columns.topic },
  ...r.snapshots.map((y) => ({ key: y, label: t.snapshotLabel(y), numeric: true })),
]
const rows = computed(() => [
  ...sorted.value.map((row) => ({ topic: row.topic, ...Object.fromEntries(r.snapshots.map((y) => [y, row.values[y] ?? null])) })),
  { topic: t.columns.total, ...Object.fromEntries(r.snapshots.map((y) => [y, r.totalArticles[y] ?? null])) },
])

// Total per potret dan perubahan antarpotret (dihitung dari Tabel 1)
const totals = computed(() =>
  r.snapshots.map((y, i) => {
    const prev = r.snapshots[i - 1]
    return {
      year: y,
      total: r.totalArticles[y] ?? 0,
      pct: prev ? changePct(r.totalArticles[prev] ?? 0, r.totalArticles[y] ?? 0) : null,
    }
  }),
)
</script>

<template>
  <div class="space-y-5">
    <PageHeader :title="t.title" :lead="t.lead" />

    <div class="grid grid-cols-1 gap-3 lg:grid-cols-12">
      <div class="lg:col-span-8">
        <ChartCard :title="title" :unit="r.unit" :source="r.source" csv-name="spoi-2023-riset-topik" :columns="columns" :rows="rows">
          <GroupedBarChart :categories="categories" :series="series" :unit="r.unit" :description="t.aria" />
        </ChartCard>
      </div>

      <div class="space-y-3 lg:col-span-4">
        <section class="rounded-lg bg-white p-4" aria-labelledby="total-riset">
          <h2 id="total-riset" class="text-[15px] font-semibold">{{ t.totalsTitle }}</h2>
          <dl class="mt-3 divide-y divide-paper-200">
            <div v-for="x in totals" :key="x.year" class="flex items-center justify-between gap-3 py-2.5">
              <dt class="text-[13px] text-ink-600">{{ t.snapshotLabel(x.year) }}</dt>
              <dd class="flex items-center gap-2">
                <DeltaPill v-if="x.pct !== null" :pct="x.pct" />
                <span class="text-xl font-semibold tabular-nums text-ink-900">{{ formatNumber(x.total) }}</span>
              </dd>
            </div>
          </dl>
          <p class="mt-1 text-xs text-ink-600">{{ t.totalsNote }}</p>
        </section>

        <aside class="rounded-lg bg-white p-4" aria-labelledby="cara-baca">
          <h2 id="cara-baca" class="text-[15px] font-semibold">{{ t.noteTitle }}</h2>
          <ul class="mt-2 list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed text-ink-700">
            <li>{{ t.noteSnapshots }}</li>
            <li>{{ t.noteMethod }}</li>
            <li>{{ t.noteGaruda }}</li>
          </ul>
        </aside>
      </div>
    </div>
  </div>
</template>
