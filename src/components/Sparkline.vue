<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ values: number[]; label: string; width?: number; height?: number; breakAfterIndex?: number }>(), {
  width: 72,
  height: 28,
})

const PAD = 3

const points = computed(() => {
  const vals = props.values
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const span = max - min || 1
  const step = vals.length > 1 ? (props.width - PAD * 2) / (vals.length - 1) : 0
  return vals.map((v, i) => ({
    x: PAD + i * step,
    y: props.height - PAD - ((v - min) / span) * (props.height - PAD * 2),
  }))
})

const path = computed(() => points.value.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '))
const last = computed(() => points.value[points.value.length - 1])
const breakX = computed(() => {
  const i = props.breakAfterIndex
  const a = i === undefined ? undefined : points.value[i]
  const b = i === undefined ? undefined : points.value[i + 1]
  return a && b ? (a.x + b.x) / 2 : null
})
</script>

<template>
  <svg :viewBox="`0 0 ${width} ${height}`" :width="width" :height="height" role="img" :aria-label="label" class="block overflow-visible">
    <polygon v-if="last" :points="`${points[0]?.x ?? 0},${height} ${path} ${last.x},${height}`" fill="var(--color-accent-600)" fill-opacity="0.08" />
    <line v-if="breakX !== null" :x1="breakX" :x2="breakX" y1="0" :y2="height" stroke="var(--color-ink-600)" stroke-width="1" stroke-dasharray="2 2" opacity="0.6" />
    <polyline :points="path" fill="none" stroke="var(--color-accent-600)" stroke-width="1.75" stroke-linejoin="round" stroke-linecap="round" />
    <circle v-if="last" :cx="last.x" :cy="last.y" r="2.5" fill="var(--color-accent-600)" />
  </svg>
</template>
