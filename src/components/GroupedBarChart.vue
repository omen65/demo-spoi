<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart as EBarChart } from 'echarts/charts'
import { AriaComponent, GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'
import { formatNumber } from '@/composables/useFormat'
import { themeColor } from '@/composables/useChartTheme'

use([EBarChart, GridComponent, TooltipComponent, LegendComponent, AriaComponent, CanvasRenderer])

export interface GroupSeries {
  name: string
  values: number[]
}

const props = defineProps<{
  /** Kategori (sumbu vertikal), urutan sama dengan `values` tiap seri */
  categories: string[]
  series: GroupSeries[]
  unit: string
  description: string
}>()

const option = computed<EChartsOption>(() => {
  const ink = themeColor('--color-ink-900', '#1b211e')
  const muted = themeColor('--color-ink-600', '#4f5f5b')
  const line = themeColor('--color-paper-200', '#dbe2de')
  // Tiga seri dibedakan oleh luminans warna DAN pola isi, bukan warna saja
  const fills = ['#cfe8dc', themeColor('--color-accent-600', '#2a9d78'), themeColor('--color-deep-900', '#16402f')]
  const decals = [
    undefined,
    { symbol: 'rect', color: 'rgba(22,64,47,0.5)', dashArrayX: [1, 0], dashArrayY: [2, 3], symbolSize: 1, rotation: Math.PI / 4 },
    { symbol: 'circle', color: 'rgba(251,246,234,0.7)', dashArrayX: [1, 0], dashArrayY: [2, 4], symbolSize: 0.6 },
  ]
  return {
    aria: { enabled: true, label: { description: props.description } },
    animationDuration: 400,
    legend: { top: 0, left: 0, itemWidth: 14, itemHeight: 8, itemGap: 18, textStyle: { color: muted, fontSize: 12 } },
    grid: { left: 4, right: 44, top: 32, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(27,33,30,0.05)' } },
      backgroundColor: '#ffffff',
      borderWidth: 0,
      padding: [8, 12],
      textStyle: { color: ink, fontSize: 12.5 },
      extraCssText: 'border-radius:8px;box-shadow:0 6px 20px -6px rgba(27,33,30,.28);',
      formatter: (params: unknown) => {
        const list = params as { axisValueLabel: string; marker: string; seriesName: string; value: number }[]
        const head = list[0]?.axisValueLabel ?? ''
        return `<strong>${head}</strong>` + list.map((p) => `<br/>${p.marker} ${p.seriesName}: ${formatNumber(p.value)} ${props.unit}`).join('')
      },
    },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category',
      inverse: true,
      data: props.categories,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: line } },
      axisLabel: { color: ink, fontSize: 12.5, fontWeight: 500, width: 130, overflow: 'break', interval: 0 },
    },
    series: props.series.map((s, i) => ({
      type: 'bar' as const,
      name: s.name,
      data: s.values,
      barMaxWidth: 9,
      barGap: '12%',
      itemStyle: { color: fills[i % fills.length], borderRadius: 4, decal: decals[i % decals.length] },
      label: { show: true, position: 'right' as const, color: muted, fontSize: 11, formatter: (p: { value: unknown }) => formatNumber(Number(p.value)) },
    })),
  }
})

const height = computed(() => `${props.categories.length * (props.series.length * 15 + 26) + 44}px`)
</script>

<template>
  <VChart :option="option" autoresize :style="{ height, width: '100%' }" />
</template>
