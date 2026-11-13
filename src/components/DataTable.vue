<script setup lang="ts">
import { formatNumber } from '@/composables/useFormat'
import { ui } from '@/content/id'

export interface TableColumn {
  key: string
  label: string
  numeric?: boolean
}
export type TableCell = string | number | null

defineProps<{
  caption: string
  columns: TableColumn[]
  rows: Record<string, TableCell>[]
}>()

function show(cell: TableCell | undefined, numeric?: boolean): string {
  if (cell === null || cell === undefined) return ui.chart.noData
  return numeric && typeof cell === 'number' ? formatNumber(cell) : String(cell)
}
</script>

<template>
  <div class="relative max-h-96 overflow-auto">
    <table class="w-full min-w-[20rem] border-collapse text-[13px]">
      <caption class="sr-only">
        {{ caption }}
      </caption>
      <thead class="sticky top-0 bg-white text-left text-ink-600">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            class="px-3 py-2 text-xs font-medium"
            :class="col.numeric ? 'text-right' : ''"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in rows" :key="i" class="border-t border-paper-100 hover:bg-paper-50">
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-3 py-1.5"
            :class="col.numeric ? 'text-right tabular-nums' : ''"
          >
            {{ show(row[col.key], col.numeric) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
