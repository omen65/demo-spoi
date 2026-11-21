<script setup lang="ts">
import { computed } from 'vue'
import DeltaPill from '@/components/DeltaPill.vue'
import NavIcon from '@/components/NavIcon.vue'
import Sparkline from '@/components/Sparkline.vue'
import { BREAK_INDEX_2025, type CommodityRow2025 } from '@/composables/useCommodityRows2025'
import { formatNumber } from '@/composables/useFormat'
import { ui2025 } from '@/content/id-2025'

export type SortKey2025 = 'luas' | 'produksi' | 'people' | 'change'

const props = defineProps<{
  rows: CommodityRow2025[]
  sortKey: SortKey2025 | null
  caption: string
  metricName: string
}>()
const emit = defineEmits<{ sort: [key: SortKey2025] }>()
const t = ui2025.commodities

const columns = computed<{ key: SortKey2025; label: string }[]>(() => [
  { key: 'luas', label: t.table.area },
  { key: 'produksi', label: t.table.prod },
  { key: 'people', label: t.table.people },
  { key: 'change', label: t.table.change(props.metricName) },
])

// undefined = tidak ada seri di dokumen; null = sel kosong di dokumen. Keduanya tampil sebagai tanda hubung.
const cell = (v: number | null | undefined): string => (v === undefined || v === null ? '–' : formatNumber(v))
const aria = (k: SortKey2025): 'descending' | 'none' => (props.sortKey === k ? 'descending' : 'none')
const flagged = (r: CommodityRow2025): boolean => Object.values(r.flags).some(Boolean)
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
          <th scope="col" class="px-2.5 py-2.5 text-right text-xs font-medium">{{ t.table.trend(metricName) }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.commodity.id" class="group border-t border-paper-100 hover:bg-paper-50">
          <th scope="row" class="sticky left-0 bg-white px-3 py-2 text-left font-semibold group-hover:bg-paper-50">
            <RouterLink :to="`/2025/komoditas/${r.commodity.id}`" class="text-ink-900 hover:text-accent-700 hover:underline">
              {{ r.commodity.name }}
            </RouterLink>
            <span v-if="flagged(r)" class="ml-1 text-flag" :title="t.flagTitle" :aria-label="t.flagTitle">†</span>
          </th>
          <td class="px-2.5 py-2 text-right tabular-nums">{{ cell(r.luas) }}</td>
          <td class="px-2.5 py-2 text-right tabular-nums">{{ cell(r.produksi) }}</td>
          <td class="px-2.5 py-2 text-right tabular-nums">
            {{ cell(r.petani ?? r.operator) }}<span v-if="r.petani === undefined && r.operator !== undefined" class="ml-1 text-[11px] text-ink-600">{{ t.operatorSuffix }}</span>
          </td>
          <td class="px-3 py-2 text-right">
            <DeltaPill v-if="r.change !== null" :pct="r.change" />
            <span v-else class="text-ink-600">–</span>
          </td>
          <td class="px-3 py-1.5">
            <div class="flex justify-end">
              <Sparkline v-if="r.spark.length" :values="r.spark" :label="t.sparkAria(metricName, r.commodity.name)" :break-after-index="BREAK_INDEX_2025" />
              <span v-else class="text-ink-600">–</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
