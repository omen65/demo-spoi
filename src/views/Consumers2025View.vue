<script setup lang="ts">
import { computed } from 'vue'
import BarChart, { type BarItem } from '@/components/BarChart.vue'
import ChartCard from '@/components/ChartCard.vue'
import PageHeader from '@/components/PageHeader.vue'
import StackedScaleChart, { type ScaleRow } from '@/components/StackedScaleChart.vue'
import type { TableCell, TableColumn } from '@/components/DataTable.vue'
import { formatPercent } from '@/composables/useFormat'
import { getSurvey2025 } from '@/data/api'
import type { SurveyChart2025 } from '@/data/types'
import { ui2025 } from '@/content/id-2025'

const t = ui2025.consumers
const survey = getSurvey2025()

// Urutan alami (ordinal) dipertahankan; sisanya diurutkan dari terbesar.
const NATURAL_ORDER = new Set(['usia', 'pendidikan', 'pendapatan', 'pengeluaran-daring', 'pengeluaran-luring', 'kemudahan-akses'])
const ONLINE_BASE = new Set(['platform-online', 'alasan-daring', 'pengeluaran-daring'])

const pct = (p: number): number => Number((p * 100).toFixed(1))
const lower = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1)

interface Card {
  chart: SurveyChart2025
  title: string
  unit: string
  note: string
  items: BarItem[]
  scaleRows: ScaleRow[]
  columns: TableColumn[]
  rows: Record<string, TableCell>[]
}

function singleItems(chart: SurveyChart2025): BarItem[] {
  const values = chart.values as number[]
  const items = chart.categories.map((name, i) => ({ name, value: pct(values[i] ?? 0) }))
  return NATURAL_ORDER.has(chart.id) ? items : items.sort((a, b) => b.value - a.value)
}

function scaleRowsOf(chart: SurveyChart2025): ScaleRow[] {
  const levels = chart.levels ?? []
  const values = chart.values as Record<string, number[]>
  return chart.categories.map((name, ci) => ({ name, shares: levels.map((l) => values[l]?.[ci] ?? 0) }))
}

function titleFor(chart: SurveyChart2025, items: BarItem[], scale: ScaleRow[]): string {
  const [a, b] = items
  const A = a?.name ?? ''
  const P = a ? formatPercent(a.value) : ''
  const B = b?.name ?? ''
  const Q = b ? formatPercent(b.value) : ''
  const tt = t.titles
  switch (chart.id) {
    case 'domisili': return tt.domisili(A, P, B, Q)
    case 'gender': return tt.gender(A, P, B, Q)
    case 'usia': {
      const top = [...items].sort((x, y) => y.value - x.value)[0]
      return top ? tt.usia(top.name, formatPercent(top.value)) : chart.title
    }
    case 'pekerjaan': return tt.pekerjaan(A, P)
    case 'pendidikan': {
      const top = [...items].sort((x, y) => y.value - x.value)[0]
      return top ? tt.pendidikan(top.name, formatPercent(top.value)) : chart.title
    }
    case 'pendapatan': {
      const top = [...items].sort((x, y) => y.value - x.value)[0]
      return top ? tt.pendapatan(top.name, formatPercent(top.value)) : chart.title
    }
    case 'cara-memperoleh': return tt.caraMemperoleh(A.toLowerCase(), P, B.toLowerCase(), Q)
    case 'platform-online': return tt.platformOnline(A, P, B, Q)
    case 'alasan-daring': return tt.alasanDaring(lower(A), P)
    case 'pengeluaran-daring': {
      const top = [...items].sort((x, y) => y.value - x.value)[0]
      return top ? tt.pengeluaranDaring(top.name, formatPercent(top.value)) : chart.title
    }
    case 'alasan-luring': return tt.alasanLuring(lower(A), P)
    case 'cara-luring': return tt.caraLuring(lower(A), P)
    case 'pengeluaran-luring': {
      const top = [...items].sort((x, y) => y.value - x.value)[0]
      return top ? tt.pengeluaranLuring(top.name, formatPercent(top.value)) : chart.title
    }
    case 'produk-segar': return tt.produkSegar(A, P)
    case 'produk-olahan': return tt.produkOlahan(A, P)
    case 'pentingnya-sertifikasi': {
      const yes = items.find((i) => i.name === 'Penting')
      return yes ? tt.sertifikasi(formatPercent(yes.value)) : chart.title
    }
    case 'jenis-penjaminan': return tt.jenisPenjaminan(A, P, B, Q)
    case 'kemudahan-akses': {
      // dijumlah dari proporsi asli, bukan dari angka yang sudah dibulatkan
      const raw = chart.values as number[]
      const high = chart.categories.reduce((sum, c, i) => (c === '3' || c === '4' ? sum + (raw[i] ?? 0) : sum), 0)
      return tt.kemudahanAkses(formatPercent(high * 100))
    }
    case 'faktor-kepercayaan': {
      const ranked = scale
        .map((r) => ({ name: r.name, pos: (r.shares[2] ?? 0) + (r.shares[3] ?? 0) }))
        .sort((x, y) => y.pos - x.pos)
      const top = ranked[0]
      return top ? tt.faktorKepercayaan(top.name, formatPercent(top.pos * 100)) : chart.title
    }
    case 'faktor-pembelian': {
      const count = scale.filter((r) => (r.shares[2] ?? 0) + (r.shares[3] ?? 0) > 0.95).length
      return tt.faktorPembelian(count, scale.length)
    }
    default: return chart.title
  }
}

function noteFor(chart: SurveyChart2025): string {
  const parts: string[] = []
  if (chart.respondents !== null) parts.push(t.basis(chart.respondents))
  else parts.push(ONLINE_BASE.has(chart.id) ? t.basisOnline : t.basisOffline)
  if (chart.kind === 'multi') parts.push(t.multi)
  if (chart.kind === 'scale') parts.push(t.scaleNote)
  return parts.join(' ')
}

function buildCard(chart: SurveyChart2025): Card {
  const isScale = chart.kind === 'scale'
  const items = isScale ? [] : singleItems(chart)
  const scaleRows = isScale ? scaleRowsOf(chart) : []
  const levels = chart.levels ?? []
  const columns: TableColumn[] = isScale
    ? [{ key: 'name', label: t.columns.category }, ...levels.map((l, i) => ({ key: `l${i}`, label: `${l} (%)`, numeric: true }))]
    : [
        { key: 'name', label: t.columns.category },
        { key: 'value', label: t.columns.value, numeric: true },
      ]
  const rows: Record<string, TableCell>[] = isScale
    ? scaleRows.map((r) => ({ name: r.name, ...Object.fromEntries(r.shares.map((s, i) => [`l${i}`, pct(s)])) }))
    : items.map((i) => ({ name: i.name, value: i.value }))
  return {
    chart,
    title: titleFor(chart, items, scaleRows),
    unit: chart.respondents === null ? t.unitUnknown : t.unit,
    note: noteFor(chart),
    items,
    scaleRows,
    columns,
    rows,
  }
}

const cards = computed(() => new Map(survey.charts.map((c) => [c.id, buildCard(c)])))
const sections = t.sections.map((s) => ({ ...s, cards: s.charts.flatMap((id) => cards.value.get(id) ?? []) }))
</script>

<template>
  <div class="space-y-8">
    <PageHeader :title="t.title" :lead="t.lead(survey.respondents)" />

    <section v-for="s in sections" :key="s.id" :aria-labelledby="`bagian-${s.id}`" class="space-y-3">
      <div>
        <h2 :id="`bagian-${s.id}`" class="font-display text-xl font-bold tracking-tight">{{ s.title }}</h2>
        <p class="text-xs text-ink-600">{{ s.lead }}</p>
      </div>
      <div class="gap-4 lg:columns-2 [&>*]:mb-4 [&>*]:break-inside-avoid">
        <ChartCard
          v-for="c in s.cards"
          :key="c.chart.id"
          :title="c.title"
          :unit="c.unit"
          :source="c.chart.source"
          :csv-name="`spoi-2025-survei-${c.chart.id}`"
          :columns="c.columns"
          :rows="c.rows"
          :note="c.note"
        >
          <StackedScaleChart v-if="c.chart.kind === 'scale'" :rows="c.scaleRows" :levels="c.chart.levels ?? []" :description="t.scaleAria(c.title)" />
          <BarChart v-else :items="c.items" unit="%" :description="t.barAria(c.title)" />
        </ChartCard>
      </div>
    </section>
  </div>
</template>
