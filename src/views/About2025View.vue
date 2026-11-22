<script setup lang="ts">
import ChartCard from '@/components/ChartCard.vue'
import CoverageBars from '@/components/CoverageBars.vue'
import IndicatorMatrix from '@/components/IndicatorMatrix.vue'
import PageHeader from '@/components/PageHeader.vue'
import type { TableColumn } from '@/components/DataTable.vue'
import { formatPercent } from '@/composables/useFormat'
import { getCoverage2025, getMeta2025 } from '@/data/api'
import { ui2025, type IndicatorStatus } from '@/content/id-2025'

const t = ui2025.about
const m = ui2025.home.matrix
const meta = getMeta2025()
const lembaga = getCoverage2025().lembaga
const s = t.sections

const toc = [s.source, s.method, s.definitions, s.limits, s.matrix, s.notes, s.demo]

// --- Kelengkapan lembaga dan mitra (Tabel 2) ---
const lTotal = lembaga.total.lengkap + lembaga.total.tidakLengkap + lembaga.total.tidakAda
const lPct = formatPercent((lembaga.total.lengkap / lTotal) * 100)
const lTitle = t.limits.coverageTitle(lPct, lembaga.total.lengkap, lTotal)
const lColumns: TableColumn[] = [
  { key: 'name', label: t.limits.coverageColumns.name },
  { key: 'lengkap', label: t.limits.coverageColumns.lengkap, numeric: true },
  { key: 'tidakLengkap', label: t.limits.coverageColumns.tidakLengkap, numeric: true },
  { key: 'tidakAda', label: t.limits.coverageColumns.tidakAda, numeric: true },
]
const lRows = [
  ...lembaga.rows.map((r) => ({ name: r.name, lengkap: r.lengkap, tidakLengkap: r.tidakLengkap, tidakAda: r.tidakAda })),
  { name: 'Total', lengkap: lembaga.total.lengkap, tidakLengkap: lembaga.total.tidakLengkap, tidakAda: lembaga.total.tidakAda },
]

// --- Matriks indikator ---
const mRows = m.rows
const count = (st: IndicatorStatus): number => mRows.filter((r) => r.status === st).length
const mTitle = m.title(count('belum'), count('sebagian'), mRows.length)
const mColumns: TableColumn[] = [
  { key: 'no', label: m.columns.no, numeric: true },
  { key: 'name', label: m.columns.name },
  { key: 'status', label: m.columns.status },
  { key: 'note', label: m.columns.note },
]
const mTable = mRows.map((r) => ({ no: r.no, name: r.name, status: m.status[r.status], note: r.note }))

function goTo(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' })
}
</script>

<template>
  <div class="space-y-5">
    <PageHeader :title="t.title" :lead="t.lead" />

    <div class="grid grid-cols-1 gap-5 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <nav :aria-label="t.toc" class="lg:sticky lg:top-20 lg:self-start">
        <ul class="flex flex-wrap gap-1 lg:flex-col lg:gap-0.5">
          <li v-for="x in toc" :key="x.id">
            <a
              :href="`#${x.id}`"
              class="block rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-ink-600 hover:bg-paper-100 hover:text-ink-900"
              @click.prevent="goTo(x.id)"
            >
              {{ x.title }}
            </a>
          </li>
        </ul>
      </nav>

      <div class="max-w-3xl space-y-3">
        <section :id="s.source.id" :aria-labelledby="`h-${s.source.id}`" class="scroll-mt-20 space-y-2 rounded-lg bg-white p-5">
          <h2 :id="`h-${s.source.id}`" class="text-base font-semibold">{{ s.source.title }}</h2>
          <p class="text-sm leading-relaxed">{{ t.source.lead(meta.title, meta.publisher, meta.dataYears.from, meta.dataYears.to) }}</p>
          <p class="text-sm leading-relaxed text-ink-600">{{ t.source.published(meta.published) }}</p>
        </section>

        <section :id="s.method.id" :aria-labelledby="`h-${s.method.id}`" class="scroll-mt-20 space-y-2 rounded-lg bg-white p-5">
          <h2 :id="`h-${s.method.id}`" class="text-base font-semibold">{{ s.method.title }}</h2>
          <p class="text-sm leading-relaxed">{{ t.method.sources }}</p>
          <p class="text-sm leading-relaxed">{{ t.method.collection }}</p>
          <p class="text-sm leading-relaxed">{{ t.method.processing }}</p>
          <p class="text-sm leading-relaxed">{{ t.method.dashboard }}</p>
        </section>

        <section :id="s.definitions.id" :aria-labelledby="`h-${s.definitions.id}`" class="scroll-mt-20 rounded-lg bg-white p-5">
          <h2 :id="`h-${s.definitions.id}`" class="text-base font-semibold">{{ s.definitions.title }}</h2>
          <dl class="mt-2 divide-y divide-paper-200">
            <div v-for="d in t.definitions.items" :key="d.term" class="grid gap-1 py-2.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
              <dt class="text-sm font-semibold text-ink-900">{{ d.term }}</dt>
              <dd class="text-sm leading-relaxed text-ink-700">{{ d.text }}</dd>
            </div>
          </dl>
        </section>

        <section :id="s.limits.id" :aria-labelledby="`h-${s.limits.id}`" class="scroll-mt-20 space-y-3">
          <div class="rounded-lg bg-white p-5">
            <h2 :id="`h-${s.limits.id}`" class="text-base font-semibold">{{ s.limits.title }}</h2>
            <p class="mt-1 text-sm text-ink-600">{{ t.limits.lead }}</p>
            <ul class="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
              <li v-for="l in t.limits.items" :key="l">{{ l }}</li>
            </ul>
          </div>
          <ChartCard
            :title="lTitle"
            :unit="t.limits.coverageUnit"
            :source="lembaga.source"
            csv-name="spoi-2025-kelengkapan-lembaga-mitra"
            :columns="lColumns"
            :rows="lRows"
            :note="t.limits.coverageNote"
          >
            <CoverageBars :rows="lembaga.rows" :legend="ui2025.home.coverage.legend" :description="t.limits.coverageAria(lPct)" />
          </ChartCard>
        </section>

        <section :id="s.matrix.id" :aria-labelledby="`h-${s.matrix.id}`" class="scroll-mt-20">
          <h2 :id="`h-${s.matrix.id}`" class="sr-only">{{ s.matrix.title }}</h2>
          <ChartCard :title="mTitle" :unit="m.unit" :source="m.source" csv-name="spoi-2025-matriks-indikator" :columns="mColumns" :rows="mTable" :note="m.note">
            <IndicatorMatrix :rows="mRows" :status-labels="m.status" :description="m.aria" />
          </ChartCard>
        </section>

        <section :id="s.notes.id" :aria-labelledby="`h-${s.notes.id}`" class="scroll-mt-20 rounded-lg bg-white p-5">
          <h2 :id="`h-${s.notes.id}`" class="text-base font-semibold">{{ s.notes.title }}</h2>
          <p class="mt-1 text-sm text-ink-600">{{ t.notes.lead }}</p>

          <h3 class="mt-4 text-sm font-semibold">{{ t.notes.breakTitle }}</h3>
          <p class="mt-1 text-[13px] leading-relaxed">{{ t.notes.breakText }}</p>

          <h3 class="mt-4 text-sm font-semibold">{{ t.notes.itemsTitle }}</h3>
          <ul class="mt-1 list-disc space-y-1 pl-5 text-[13px] leading-relaxed">
            <li v-for="n in t.notes.items" :key="n">{{ n }}</li>
          </ul>

        </section>

        <section :id="s.demo.id" :aria-labelledby="`h-${s.demo.id}`" class="scroll-mt-20 space-y-2 rounded-lg bg-white p-5">
          <h2 :id="`h-${s.demo.id}`" class="text-base font-semibold">{{ s.demo.title }}</h2>
          <p class="text-sm leading-relaxed">{{ t.demo.text }}</p>
          <h3 class="pt-2 text-sm font-semibold">{{ t.credit.title }}</h3>
          <p class="text-sm leading-relaxed text-ink-700">{{ t.credit.text }}</p>
        </section>
      </div>
    </div>
  </div>
</template>
