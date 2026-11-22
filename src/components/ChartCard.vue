<script setup lang="ts">
import { ref } from 'vue'
import DataTable, { type TableCell, type TableColumn } from '@/components/DataTable.vue'
import { downloadCsv } from '@/composables/useCsv'
import { ui } from '@/content/id'

const props = defineProps<{
  /** Judul = temuan (dihitung dari data) */
  title: string
  unit: string
  source: string
  csvName: string
  columns: TableColumn[]
  rows: Record<string, TableCell>[]
  note?: string
  showFlagLegend?: boolean
}>()

const asTable = ref(false)

function exportCsv(): void {
  downloadCsv(
    props.csvName,
    props.columns.map((c) => c.label),
    props.rows.map((r) => props.columns.map((c) => r[c.key] ?? '')),
  )
}
</script>

<template>
  <figure class="flex h-full flex-col surface p-4 md:p-5">
    <figcaption class="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
      <div class="min-w-0 flex-1 basis-44">
        <h3 class="text-sm font-semibold leading-snug text-ink-900">{{ title }}</h3>
        <p class="mt-0.5 text-xs text-ink-600">{{ ui.chart.unitPrefix }} {{ unit }}</p>
      </div>
      <div class="flex items-center gap-2">
        <slot name="controls" />
        <div class="inline-flex rounded-md bg-paper-100 p-0.5" role="group" aria-label="Tampilan data">
          <button
            type="button"
            class="rounded px-2 py-0.5 text-xs font-medium transition-colors"
            :class="!asTable ? 'bg-white text-ink-900' : 'text-ink-600 hover:text-ink-900'"
            :aria-pressed="!asTable"
            :aria-label="ui.chart.showChartFull"
            @click="asTable = false"
          >
            {{ ui.chart.showChart }}
          </button>
          <button
            type="button"
            class="rounded px-2 py-0.5 text-xs font-medium transition-colors"
            :class="asTable ? 'bg-white text-ink-900' : 'text-ink-600 hover:text-ink-900'"
            :aria-pressed="asTable"
            :aria-label="ui.chart.showTable"
            @click="asTable = true"
          >
            {{ ui.chart.tableShort }}
          </button>
        </div>
        <button v-if="asTable" type="button" class="text-xs font-medium text-accent-700 underline underline-offset-4 hover:text-deep-900" @click="exportCsv">
          {{ ui.chart.downloadCsv }}
        </button>
      </div>
    </figcaption>

    <div class="mt-4 flex-1">
      <DataTable v-if="asTable" :caption="title" :columns="columns" :rows="rows" />
      <slot v-else />
    </div>

    <p v-if="showFlagLegend && !asTable" class="mt-2 text-xs text-flag">{{ ui.chart.flagLegend }}</p>
    <p v-if="note" class="mt-2 text-xs leading-relaxed text-ink-600">{{ note }}</p>
    <p class="mt-4 text-[11px] leading-snug text-ink-600">{{ ui.chart.sourcePrefix }} {{ source }}</p>
  </figure>
</template>
