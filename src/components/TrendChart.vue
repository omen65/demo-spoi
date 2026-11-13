<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { AriaComponent, GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'
import { formatCompact, formatNumber } from '@/composables/useFormat'
import { themeColor } from '@/composables/useChartTheme'

use([LineChart, GridComponent, TooltipComponent, AriaComponent, CanvasRenderer])

const props = defineProps<{
  years: string[]
  values: number[]
  unit: string
  seriesName: string
  /** Tahun yang diberi penanda † (angka perlu konfirmasi AOI) */
  flaggedYears?: string[]
  description: string
  height?: number
}>()

const option = computed<EChartsOption>(() => {
  const ink = themeColor('--color-ink-900', '#1b211e')
  const muted = themeColor('--color-ink-600', '#6a716c')
  const grid = themeColor('--color-paper-100', '#efede8')
  const line = themeColor('--color-accent-600', '#2a9d78')
  const flagColor = themeColor('--color-flag', '#b4382b')
  const flagged = new Set(props.flaggedYears ?? [])
  const max = Math.max(...props.values, 0)
  return {
    aria: { enabled: true, label: { description: props.description } },
    animationDuration: 400,
    grid: { left: 4, right: 20, top: 28, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: muted, type: 'dashed', opacity: 0.5 } },
      backgroundColor: '#ffffff',
      borderWidth: 0,
      padding: [8, 12],
      textStyle: { color: ink, fontSize: 12.5 },
      extraCssText: 'border-radius:8px;box-shadow:0 6px 20px -6px rgba(27,33,30,.28);',
      formatter: (params: unknown) => {
        const p = (params as { name: string; value: number }[])[0]
        if (!p) return ''
        const mark = flagged.has(p.name) ? ' †' : ''
        return `<div style="color:${muted};font-size:11.5px">${p.name}</div><div style="margin-top:2px"><strong style="font-size:14px">${formatNumber(p.value)}</strong> <span style="color:${muted}">${props.unit}${mark}</span></div>`
      },
    },
    xAxis: {
      type: 'category',
      data: props.years,
      boundaryGap: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: muted, fontSize: 12, margin: 12 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: max > 0 ? undefined : 1,
      splitNumber: 3,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: muted, fontSize: 11, formatter: (v: number) => formatCompact(v) },
      splitLine: { lineStyle: { color: grid } },
    },
    series: [
      {
        type: 'line',
        name: props.seriesName,
        data: props.values.map((v, i) => {
          const year = props.years[i] ?? ''
          const isFlag = flagged.has(year)
          return {
            value: v,
            // titik biasa = lingkaran; titik berpenanda = segitiga berwarna merah (bentuk berbeda)
            symbol: isFlag ? 'triangle' : 'circle',
            symbolSize: isFlag ? 11 : 7,
            itemStyle: { color: isFlag ? flagColor : '#ffffff', borderColor: isFlag ? flagColor : line, borderWidth: 2 },
            label: { formatter: () => `${formatNumber(v)}${isFlag ? ' †' : ''}` },
          }
        }),
        lineStyle: { color: line, width: 2, cap: 'round', join: 'round' },
        areaStyle: { color: line, opacity: 0.07 },
        label: { show: true, position: 'top', color: ink, fontSize: 11, fontWeight: 500, distance: 8 },
        emphasis: { focus: 'none', scale: 1.3 },
      },
    ],
  }
})
</script>

<template>
  <VChart :option="option" autoresize :style="{ height: `${height ?? 230}px`, width: '100%' }" />
</template>
