<script setup lang="ts">
import { computed } from 'vue'
import { getProvinceProfile } from '@/data/api'
import type { YearKey } from '@/data/types'
import { formatNumber } from '@/composables/useFormat'
import { ui } from '@/content/id'

const props = defineProps<{ province: string; year: YearKey }>()
const emit = defineEmits<{ close: [] }>()

const t = ui.regions
const rows = computed(() => getProvinceProfile(props.province, props.year))

function cell(v: number | null | undefined): string {
  if (v === undefined) return t.panelNotApplicable
  if (v === null) return t.tooltipNoData
  return formatNumber(v)
}
</script>

<template>
  <section class="rounded-lg bg-white p-4 md:p-5" aria-live="polite">
    <div class="flex items-start justify-between gap-3">
      <h2 class="text-base font-semibold md:text-lg">{{ t.panelTitle(province, year) }}</h2>
      <button
        type="button"
        class="rounded-md border border-paper-300 px-3 py-1.5 text-sm font-medium text-ink-900 hover:bg-paper-100"
        @click="emit('close')"
      >
        {{ t.panelClose }}
      </button>
    </div>
    <p class="mt-1 text-sm text-ink-700">{{ t.panelLead }}</p>
    <div class="relative mt-3 overflow-x-auto rounded-lg">
      <table class="w-full min-w-[22rem] border-collapse text-sm">
        <caption class="sr-only">
          {{ t.panelTitle(province, year) }}
        </caption>
        <thead class="bg-paper-100 text-left">
          <tr>
            <th scope="col" class="px-3 py-2 font-semibold">{{ t.panelColumns.commodity }}</th>
            <th scope="col" class="px-3 py-2 text-right font-semibold">{{ t.panelColumns.area }}</th>
            <th scope="col" class="px-3 py-2 text-right font-semibold">{{ t.panelColumns.prod }}</th>
            <th scope="col" class="px-3 py-2 text-right font-semibold">{{ t.panelColumns.farmers }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id" class="border-t border-paper-200">
            <th scope="row" class="px-3 py-2 text-left font-medium">
              <RouterLink :to="`/komoditas/${r.id}`" class="text-accent-700 underline underline-offset-4">{{ r.name }}</RouterLink>
            </th>
            <td class="px-3 py-2 text-right tabular-nums">{{ cell(r.luas) }}</td>
            <td class="px-3 py-2 text-right tabular-nums">{{ cell(r.produksi) }}</td>
            <td class="px-3 py-2 text-right tabular-nums">{{ cell(r.produsen) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
