<script setup lang="ts">
import { computed } from 'vue'
import { formatPercent } from '@/composables/useFormat'

export interface DeltaItem {
  name: string
  pct: number
  flagged?: boolean
}

/** Batang menyimpang dari nol: kanan = naik, kiri = turun. Arah juga tertulis lewat tanda + atau -. */
const props = defineProps<{ items: DeltaItem[]; description: string }>()

const maxAbs = computed(() => Math.max(...props.items.map((i) => Math.abs(i.pct)), 1))
const w = (pct: number): string => `${Math.max(1.5, (Math.abs(pct) / maxAbs.value) * 50)}%`
</script>

<template>
  <ul class="space-y-1.5" :aria-label="description">
    <li v-for="i in items" :key="i.name" class="grid grid-cols-[6.5rem_1fr_3.75rem] items-center gap-2 text-[13px]">
      <span class="truncate font-medium text-ink-900">{{ i.name }}<span v-if="i.flagged" class="ml-0.5 text-flag">†</span></span>
      <span class="relative h-3.5" aria-hidden="true">
        <span class="absolute inset-y-0 left-1/2 w-px bg-paper-300" />
        <span
          v-if="i.pct >= 0"
          class="absolute inset-y-0.5 left-1/2 rounded-r-sm bg-accent-600"
          :style="{ width: w(i.pct) }"
        />
        <span
          v-else
          class="absolute inset-y-0.5 right-1/2 rounded-l-sm border border-dashed border-flag bg-flag/25"
          :style="{ width: w(i.pct) }"
        />
      </span>
      <span class="text-right font-medium tabular-nums" :class="i.pct >= 0 ? 'text-mint-700' : 'text-flag'">
        {{ i.pct >= 0 ? '+' : '-' }}{{ formatPercent(i.pct) }}
      </span>
    </li>
  </ul>
</template>
