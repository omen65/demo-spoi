<script setup lang="ts">
import { formatNumber } from '@/composables/useFormat'

export interface CoverageBarRow {
  name: string
  lengkap: number
  tidakLengkap: number
  tidakAda: number
}

/**
 * Batang bertumpuk tiga segmen per wilayah. Segmen dibedakan oleh warna dan pola, dan jumlahnya tertulis di kanan.
 */
const props = defineProps<{
  rows: CoverageBarRow[]
  legend: { lengkap: string; tidakLengkap: string; tidakAda: string }
  description: string
}>()

const total = (r: CoverageBarRow): number => r.lengkap + r.tidakLengkap + r.tidakAda
const pct = (n: number, r: CoverageBarRow): string => `${(n / Math.max(total(r), 1)) * 100}%`
// Semua batang memakai skala yang sama (wilayah terbesar = 100%) agar panjangnya bisa dibandingkan.
const maxTotal = Math.max(...props.rows.map(total), 1)
const scale = (r: CoverageBarRow): string => `${(total(r) / maxTotal) * 100}%`
</script>

<template>
  <div>
    <ul class="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-700" aria-hidden="true">
      <li class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-deep-900" />{{ legend.lengkap }}</li>
      <li class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-accent-600" />{{ legend.tidakLengkap }}</li>
      <li class="flex items-center gap-1.5"><span class="cov-none h-2.5 w-2.5 rounded-sm border border-paper-300" />{{ legend.tidakAda }}</li>
    </ul>
    <ul class="space-y-2" :aria-label="description">
      <li v-for="r in rows" :key="r.name" class="grid grid-cols-[6.5rem_1fr] items-center gap-x-3 text-[13px] sm:grid-cols-[8.5rem_1fr_5.5rem]">
        <span class="font-medium leading-tight text-ink-900">{{ r.name }}</span>
        <span class="flex h-3.5" :style="{ width: scale(r) }" aria-hidden="true">
          <span class="h-full bg-deep-900" :style="{ width: pct(r.lengkap, r) }" />
          <span class="h-full bg-accent-600" :style="{ width: pct(r.tidakLengkap, r) }" />
          <span class="cov-none h-full border border-paper-300" :style="{ width: pct(r.tidakAda, r) }" />
        </span>
        <span class="col-span-2 text-right text-xs tabular-nums text-ink-600 sm:col-span-1">
          {{ formatNumber(r.lengkap) }} / {{ formatNumber(r.tidakLengkap) }} / {{ formatNumber(r.tidakAda) }}
        </span>
      </li>
    </ul>
  </div>
</template>

<style>
.cov-none {
  background-image: repeating-linear-gradient(135deg, var(--color-paper-200) 0 2px, #ffffff 2px 5px);
}
</style>
