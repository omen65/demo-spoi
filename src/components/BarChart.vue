<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart as EBarChart } from 'echarts/charts'
import { AriaComponent, GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'
import { formatNumber } from '@/composables/useFormat'
import { themeColor } from '@/composables/useChartTheme'

use([EBarChart, GridComponent, TooltipComponent, AriaComponent, CanvasRenderer])

export interface BarItem {
  name: string
  value: number
  flagged?: boolean
}

const props = defineProps<{
  items: BarItem[]
  unit: string
  description: string
}>()

const FLAG_MARK = ' †'

const option = computed<EChartsOption>(() => {
  const ink = themeColor('--color-ink-900', '#1b211e')
  const muted = themeColor('--color-ink-600', '#4f5f5b')
  const line = themeColor('--color-paper-200', '#dbe2de')
  const track = themeColor('--color-paper-100', '#e9eeeb')
  const fill = themeColor('--color-accent-600', '#2a9d78')
  const edge = themeColor('--color-deep-900', '#16402f')
  return {
    aria: { enabled: true, label: { description: props.description } },
    animationDuration: 400,
    grid: { left: 4, right: 12, top: 4, bottom: 4, containLabel: true },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#ffffff',
      borderWidth: 0,
      padding: [8, 12],
      textStyle: { color: ink, fontSize: 12.5 },
      extraCssText: 'border-radius:8px;box-shadow:0 6px 20px -6px rgba(27,33,30,.28);',
      formatter: (params: unknown) => {
        const p = params as { name: string; value: number }
        return `<strong>${p.name.replace(FLAG_MARK, '')}</strong><br/>${formatNumber(p.value)} ${props.unit}`
      },
    },
    xAxis: { type: 'value', show: false },
    yAxis: {
      type: 'category',
      inverse: true,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: line } },
      axisLabel: {
        interval: 0,
        formatter: (_: string, index: number) => {
          const it = props.items[index]
          return it ? `{n|${it.flagged ? it.name + FLAG_MARK : it.name}}\n{v|${formatNumber(it.value)} ${props.unit}}` : ''
        },
        rich: {
          n: { color: ink, fontSize: 12.5, fontWeight: 500, lineHeight: 17, align: 'right' },
          v: { color: muted, fontSize: 11.5, lineHeight: 15, align: 'right' },
        },
      },
      data: props.items.map((i) => (i.flagged ? i.name + FLAG_MARK : i.name)),
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 10,
        showBackground: true,
        backgroundStyle: { color: track, borderRadius: 5, opacity: 0.8 },
        data: props.items.map((i) => ({
          name: i.flagged ? i.name + FLAG_MARK : i.name,
          value: i.value,
          itemStyle: i.flagged
            ? {
                color: fill,
                borderColor: edge,
                borderRadius: 5,
                borderWidth: 1.5,
                borderType: 'dashed',
                decal: { symbol: 'rect', color: 'rgba(255,255,255,0.55)', dashArrayX: [1, 0], dashArrayY: [2, 3], symbolSize: 1 },
              }
            : { color: fill, borderRadius: 5 },
        })),
      },
    ],
  }
})

const height = computed(() => `${props.items.length * 40 + 12}px`)
</script>

<template>
  <VChart :option="option" autoresize :style="{ height, width: '100%' }" />
</template>
