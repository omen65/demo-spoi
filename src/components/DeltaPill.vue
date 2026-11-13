<script setup lang="ts">
import { computed } from 'vue'
import { direction } from '@/composables/useDerived'
import { formatPercent } from '@/composables/useFormat'

/** Perubahan persen berupa teks dengan panah. Arah ditunjukkan juga lewat panah dan teks, bukan warna saja. */
const props = defineProps<{ pct: number | null }>()

const dir = computed(() => direction(props.pct))
const text = computed(() => (props.pct === null ? '' : formatPercent(Math.abs(props.pct))))
</script>

<template>
  <span v-if="dir && dir !== 'tetap'" class="inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums" :class="dir === 'naik' ? 'text-mint-700' : 'text-flag'">
    <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor" aria-hidden="true">
      <path v-if="dir === 'naik'" d="M6 2 10.5 9h-9z" />
      <path v-else d="M6 10 1.5 3h9z" />
    </svg>
    <span class="sr-only">{{ dir === 'naik' ? 'Naik' : 'Turun' }}</span>{{ text }}
  </span>
  <span v-else-if="dir === 'tetap'" class="text-xs font-medium text-ink-600">Tetap</span>
</template>
