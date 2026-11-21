<script setup lang="ts">
import { formatPercent } from '@/composables/useFormat'

export interface ScaleRow {
  name: string
  /** proporsi (0-1) per tingkat, urut dari paling negatif ke paling positif */
  shares: number[]
}

/**
 * Batang bertumpuk 100% untuk skala empat tingkat (negatif ke positif).
 * Tingkat dibedakan oleh pola dan tebal warna, bukan warna saja; persentase tertulis di dalam segmen
 * (angka lengkap ada di tabel).
 */
const props = defineProps<{ rows: ScaleRow[]; levels: string[]; description: string }>()

const LABEL_MIN = 0.09
const label = (share: number): string => (share >= LABEL_MIN ? formatPercent(share * 100) : '')
const width = (share: number): string => `${share * 100}%`
const aria = (r: ScaleRow): string => `${r.name}: ${r.shares.map((s, i) => `${props.levels[i] ?? ''} ${formatPercent(s * 100)}`).join(', ')}`
</script>

<template>
  <div>
    <ul class="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-700" aria-hidden="true">
      <li v-for="(l, i) in levels" :key="l" class="flex items-center gap-1.5">
        <span class="h-2.5 w-4 rounded-sm" :class="`lvl-${i}`" />{{ l }}
      </li>
    </ul>
    <ul class="space-y-3" :aria-label="description">
      <li v-for="r in rows" :key="r.name" :aria-label="aria(r)">
        <p class="mb-1 text-[13px] font-medium leading-tight text-ink-900">{{ r.name }}</p>
        <span class="flex h-6 overflow-hidden rounded" aria-hidden="true">
          <span
            v-for="(s, i) in r.shares"
            :key="i"
            class="flex h-full items-center justify-center text-[11px] font-medium tabular-nums"
            :class="[`lvl-${i}`, i >= 2 ? 'text-white' : 'text-ink-900']"
            :style="{ width: width(s) }"
          >
            {{ label(s) }}
          </span>
        </span>
      </li>
    </ul>
  </div>
</template>

<style>
.lvl-0 {
  background-image: repeating-linear-gradient(135deg, var(--color-ink-600) 0 2px, #d9dcd7 2px 5px);
}
.lvl-1 {
  background-color: var(--color-paper-300);
}
.lvl-2 {
  background-color: var(--color-accent-600);
}
.lvl-3 {
  background-color: var(--color-deep-900);
}
</style>
