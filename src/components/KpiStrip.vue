<script setup lang="ts">
import DeltaPill from '@/components/DeltaPill.vue'
import Sparkline from '@/components/Sparkline.vue'
import { formatNumber } from '@/composables/useFormat'
import { ui } from '@/content/id'

export interface KpiItem {
  id: string
  title: string
  value: number
  unit: string
  pct: number | null
  since: string
  to: string
  values: number[]
  sparkLabel: string
  flagged: boolean
}

/** Satu permukaan dengan sel dipisah garis tipis. Sel pertama (nilai terbesar) diberi bobot lebih. */
defineProps<{ items: KpiItem[] }>()
</script>

<template>
  <ul class="grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-paper-200 md:grid-cols-5">
    <li v-for="(k, i) in items" :key="k.id" :class="i === 0 ? 'col-span-3 md:col-span-2' : 'col-span-1'" class="bg-white">
      <RouterLink :to="k.to" class="block h-full transition-colors hover:bg-paper-50" :class="i === 0 ? 'p-4 md:p-6' : 'p-3 md:p-5'">
        <p class="text-[13px] font-medium text-ink-600" :class="i === 0 ? '' : 'min-h-[2.4em] leading-tight'">{{ k.title }}</p>
        <div :class="i === 0 ? 'mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-3' : 'mt-2'">
          <div class="min-w-0">
            <p
              class="font-semibold leading-none tracking-tight text-ink-900 tabular-nums"
              :class="i === 0 ? 'text-[34px] md:text-[44px]' : 'text-[17px] sm:text-[22px] md:text-[26px]'"
            >
              {{ formatNumber(k.value) }}<span v-if="k.flagged" class="ml-0.5 text-base text-flag" :title="ui.commodities.flagTitle" :aria-label="ui.commodities.flagTitle">†</span>
            </p>
            <p class="mt-1.5 text-xs text-ink-600">{{ k.unit }}</p>
          </div>
          <Sparkline v-if="i === 0 && k.values.length" :values="k.values" :label="k.sparkLabel" :width="168" :height="52" class="shrink-0" />
        </div>
        <p class="mt-3 flex flex-wrap items-center gap-x-1.5 text-xs text-ink-600">
          <DeltaPill :pct="k.pct" /><span :class="i === 0 ? '' : 'hidden sm:inline'">{{ k.since }}</span>
        </p>
        <Sparkline v-if="i !== 0 && k.values.length" :values="k.values" :label="k.sparkLabel" :width="72" :height="24" class="mt-3 hidden md:block" />
      </RouterLink>
    </li>
  </ul>
</template>
