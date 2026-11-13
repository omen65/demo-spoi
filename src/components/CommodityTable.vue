<script setup lang="ts">
import { computed } from 'vue'
import DeltaPill from '@/components/DeltaPill.vue'
import NavIcon from '@/components/NavIcon.vue'
import Sparkline from '@/components/Sparkline.vue'
import type { CommodityRow } from '@/composables/useCommodityRows'
import { formatNumber } from '@/composables/useFormat'
import { FIRST_YEAR, LATEST_YEAR, YEARS, getSeries } from '@/data/api'
import { ui } from '@/content/id'

export type SortKey = 'luas' | 'produksi' | 'petani' | 'change' | 'productivity'

const props = defineProps<{ rows: CommodityRow[]; year: string; sortKey: SortKey | null; caption: string }>()
const emit = defineEmits<{ sort: [key: SortKey] }>()
const t = ui.commodities

const columns: { key: SortKey; label: string }[] = [
  { key: 'luas', label: t.table.area },
  { key: 'produksi', label: t.table.prod },
  { key: 'petani', label: t.table.farmers },
  { key: 'change', label: t.table.change },
  { key: 'productivity', label: t.table.productivity },
]

const view = computed(() =>
  props.rows.map((r) => {
    const s = getSeries(r.commodity, 'luas')
    const values = s ? YEARS.map((y) => s.values[y]) : []
    return {
      r,
      values,
      label: s
        ? ui.home.sparkAria(t.metricArea, r.commodity.name, FIRST_YEAR, LATEST_YEAR, formatNumber(values[0] ?? 0), formatNumber(values[values.length - 1] ?? 0))
        : '',
      flagged: Object.values(r.flags).some(Boolean),
    }
  }),
)

// undefined = tidak ada di buku untuk komoditas ini; null = dihitung tetapi tidak terdefinisi
const cell = (v: number | null | undefined, digits?: number): string =>
  v === undefined || v === null ? '–' : formatNumber(digits === undefined ? v : Number(v.toFixed(digits)))
const aria = (k: SortKey): 'descending' | 'none' => (props.sortKey === k ? 'descending' : 'none')
</script>

<template>
  <div class="relative overflow-x-auto rounded-lg bg-white p-2 md:p-3">
    <table class="w-full min-w-[46rem] border-collapse text-[13px]">
      <caption class="sr-only">{{ caption }}</caption>
      <thead class="text-ink-600">
        <tr>
          <th scope="col" class="sticky left-0 z-10 bg-white px-3 py-2.5 text-left text-xs font-medium">{{ t.table.name }}</th>
          <th v-for="c in columns" :key="c.key" scope="col" class="px-2.5 py-2.5 text-right text-xs font-medium" :aria-sort="aria(c.key)">
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded px-1 py-0.5 hover:text-ink-900"
              :class="sortKey === c.key ? 'text-ink-900' : ''"
              @click="emit('sort', c.key)"
            >
              {{ c.label }}<NavIcon v-if="sortKey === c.key" name="down" class="!h-3 !w-3 text-accent-700" />
            </button>
          </th>
          <th scope="col" class="px-2.5 py-2.5 text-right text-xs font-medium">{{ t.table.trend }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="v in view" :key="v.r.commodity.id" class="group border-t border-paper-100 hover:bg-paper-50">
          <th scope="row" class="sticky left-0 bg-white px-3 py-2 text-left font-semibold group-hover:bg-paper-50">
            <RouterLink :to="`/komoditas/${v.r.commodity.id}`" class="text-ink-900 hover:text-accent-700 hover:underline">
              {{ v.r.commodity.name }}
            </RouterLink>
            <span v-if="v.flagged" class="ml-1 text-flag" :title="t.flagTitle" :aria-label="t.flagTitle">†</span>
          </th>
          <td class="px-2.5 py-2 text-right tabular-nums">{{ cell(v.r.luas) }}</td>
          <td class="px-2.5 py-2 text-right tabular-nums">{{ cell(v.r.produksi) }}</td>
          <td class="px-2.5 py-2 text-right tabular-nums">{{ cell(v.r.petani ?? v.r.operator) }}<span v-if="v.r.petani === undefined && v.r.operator !== undefined" class="ml-1 text-[11px] text-ink-600">{{ t.metricOperators.toLowerCase() }}</span></td>
          <td class="px-3 py-2 text-right">
            <DeltaPill v-if="v.r.change !== null" :pct="v.r.change" />
            <span v-else class="text-ink-600">–</span>
          </td>
          <td class="px-2.5 py-2 text-right tabular-nums">{{ cell(v.r.productivity, 2) }}</td>
          <td class="px-3 py-1.5">
            <div class="flex justify-end">
              <Sparkline v-if="v.values.length" :values="v.values" :label="v.label" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
