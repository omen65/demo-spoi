<script setup lang="ts">
import type { IndicatorRow, IndicatorStatus } from '@/content/id-2025'

/** Status ditunjukkan dengan teks dan bentuk (penuh, setengah, kosong), bukan warna saja. */
defineProps<{ rows: IndicatorRow[]; statusLabels: Record<IndicatorStatus, string>; description: string }>()
</script>

<template>
  <ol class="divide-y divide-paper-100" :aria-label="description">
    <li v-for="r in rows" :key="r.no" class="grid grid-cols-[1.75rem_1fr] gap-x-2 gap-y-1 py-2.5 text-[13px] sm:grid-cols-[1.75rem_15rem_8.5rem_1fr] sm:items-baseline">
      <span class="text-xs tabular-nums text-ink-600">{{ r.no }}</span>
      <span class="font-medium text-ink-900">{{ r.name }}</span>
      <span class="col-start-2 inline-flex items-center gap-1.5 font-medium text-ink-900 sm:col-start-auto">
        <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" class="shrink-0">
          <circle cx="6" cy="6" r="4.6" fill="none" stroke="currentColor" stroke-width="1.3" class="text-deep-900" />
          <circle v-if="r.status === 'ada'" cx="6" cy="6" r="3.2" fill="currentColor" class="text-deep-900" />
          <path v-else-if="r.status === 'sebagian'" d="M6 1.4a4.6 4.6 0 0 0 0 9.2z" fill="currentColor" class="text-deep-900" />
        </svg>
        {{ statusLabels[r.status] }}
      </span>
      <span class="col-start-2 leading-relaxed text-ink-600 sm:col-start-auto">{{ r.note }}</span>
    </li>
  </ol>
</template>
