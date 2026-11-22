<script setup lang="ts">
import { ZERO_COLOR, type ColorClass } from '@/composables/useChoropleth'
import { formatNumber } from '@/composables/useFormat'
import { ui } from '@/content/id'

defineProps<{ classes: ColorClass[]; unit: string; showZero: boolean; showNoData: boolean }>()

const t = ui.regions
</script>

<template>
  <div class="text-sm" :aria-label="t.legendTitle" role="group">
    <p class="mb-2 text-sm font-semibold text-ink-700">{{ t.legendTitle }} ({{ unit }})</p>
    <ul class="grid grid-cols-2 gap-x-4 gap-y-2 sm:flex sm:flex-wrap">
      <li v-for="(c, i) in classes" :key="i" class="flex items-center gap-2">
        <span class="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-inset ring-ink-900/15" :style="{ background: c.color }" aria-hidden="true" />
        <span class="tabular-nums text-ink-700">
          {{ c.min === c.max ? formatNumber(c.min) : `${formatNumber(c.min)} – ${formatNumber(c.max)}` }}
        </span>
      </li>
      <li v-if="showZero" class="flex items-center gap-2">
        <span class="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-inset ring-ink-900/25" :style="{ background: ZERO_COLOR }" aria-hidden="true" />
        <span class="text-ink-700">{{ t.legendZero }}</span>
      </li>
      <li v-if="showNoData" class="flex items-center gap-2">
        <span
          class="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-inset ring-ink-900/25"
          style="background: repeating-linear-gradient(45deg, #fff 0 2px, #bcc4be 2px 4px)"
          aria-hidden="true"
        />
        <span class="text-ink-700">{{ t.legendNoData }}</span>
      </li>
    </ul>
    <p v-if="showNoData && t.legendNoDataNote" class="mt-2 text-xs text-ink-600">{{ t.legendNoDataNote }}</p>
  </div>
</template>
