<script setup lang="ts">
import DeltaPill from '@/components/DeltaPill.vue'
import Sparkline from '@/components/Sparkline.vue'
import { formatNumber } from '@/composables/useFormat'

export interface HeadlineItem {
  id: string
  label: string
  name: string
  value: number
  unit: string
  pct: number | null
  since: string
  values: number[]
  sparkLabel: string
  flagged: boolean
  flagTitle: string
}

/** Tiga angka utama dalam satu permukaan, dipisah garis tipis. Patahan data ditandai di sparkline. */
defineProps<{ items: HeadlineItem[]; breakAfterIndex: number; label: string }>()
</script>

<template>
  <ul class="grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-paper-200 sm:grid-cols-3" :aria-label="label">
    <li v-for="k in items" :key="k.id" class="bg-white p-4 md:p-5">
      <p class="text-[13px] font-medium text-ink-600">{{ k.label }}</p>
      <div class="mt-3 flex items-end justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[30px] font-semibold leading-none tracking-tight text-ink-900 tabular-nums md:text-[34px]">
            {{ formatNumber(k.value) }}<span v-if="k.flagged" class="ml-0.5 text-base text-flag" :title="k.flagTitle" :aria-label="k.flagTitle">†</span>
          </p>
          <p class="mt-1.5 text-xs text-ink-600">{{ k.unit }}, <span class="font-medium text-ink-900">{{ k.name }}</span></p>
        </div>
        <Sparkline v-if="k.values.length" :values="k.values" :label="k.sparkLabel" :width="96" :height="36" :break-after-index="breakAfterIndex" class="shrink-0" />
      </div>
      <p class="mt-3 flex items-center gap-1.5 text-xs text-ink-600"><DeltaPill :pct="k.pct" /><span>{{ k.since }}</span></p>
    </li>
  </ul>
</template>
