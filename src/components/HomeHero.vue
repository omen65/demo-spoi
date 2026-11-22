<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import DeltaPill from '@/components/DeltaPill.vue'
import { classify, CLASS_COLORS, ZERO_COLOR } from '@/composables/useChoropleth'
import { useCountUp } from '@/composables/useCountUp'
import { GEO_VIEWBOX, geoToPaths, type ProvincePath } from '@/composables/useGeoPaths'
import { formatNumber, formatPercent } from '@/composables/useFormat'
import { loadProvinceGeo } from '@/data/api'
import { ui2025 } from '@/content/id-2025'

const props = defineProps<{
  title: string
  lead: string
  year: string
  previousYear: string
  area: number
  areaDelta: number | null
  producers: number
  producersDelta: number | null
  men: number
  women: number
  /** Luas per provinsi (null = tidak ada data) untuk mewarnai siluet */
  provinceValues: Record<string, number | null>
}>()

const t = ui2025.home.hero
const areaShown = useCountUp(() => props.area)
const producersShown = useCountUp(() => props.producers)

// Luas punya dua desimal di data; selama berhitung ditampilkan bulat, di akhir persis angka data
const areaText = computed(() => (areaShown.value >= props.area ? formatNumber(props.area) : formatNumber(Math.round(areaShown.value))))
const producersText = computed(() => formatNumber(Math.round(producersShown.value)))

const total = computed(() => props.men + props.women)
const womenPct = computed(() => (total.value ? (props.women / total.value) * 100 : 0))
const menPct = computed(() => 100 - womenPct.value)

const paths = shallowRef<ProvincePath[]>([])
const ready = ref(false)
onMounted(async () => {
  try {
    paths.value = geoToPaths(await loadProvinceGeo())
    requestAnimationFrame(() => (ready.value = true))
  } catch {
    paths.value = []
  }
})

const cls = computed(() => classify(Object.values(props.provinceValues)))
function fill(name: string): string {
  const c = cls.value.classify(props.provinceValues[name])
  return c === 'nodata' || c === 'zero' ? ZERO_COLOR : cls.value.classes[c]?.color ?? ZERO_COLOR
}
const legend = computed(() => [CLASS_COLORS[0], CLASS_COLORS[CLASS_COLORS.length - 1]])
</script>

<template>
  <section class="hero-forest relative overflow-hidden rounded-[1.75rem] text-[#f2f7ee] shadow-[0_24px_48px_-24px_rgb(14_36_24/0.6)]" :aria-label="title">
    <div class="grid gap-6 p-5 md:p-8 lg:grid-cols-12 lg:items-center lg:gap-8 lg:p-10">
      <div class="lg:col-span-5">
        <h1 class="font-display max-w-[16ch] text-[32px] font-bold leading-[1.05] tracking-tight text-white md:text-[44px]">{{ title }}</h1>
        <p class="mt-3 max-w-md text-sm leading-relaxed text-forest-300">{{ lead }}</p>

        <dl class="mt-6 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <dt class="text-[13px] font-medium text-forest-300">{{ t.area }}</dt>
            <dd class="font-display mt-1 text-[44px] font-bold sm:text-[36px] md:text-[44px] lg:text-[52px] leading-none tracking-tight text-gold-500 tabular-nums">{{ areaText }}</dd>
            <dd class="mt-1.5 flex items-center gap-1.5 text-xs text-forest-300">
              <span>ha, {{ year }}</span><DeltaPill :pct="areaDelta" tone="dark" /><span>{{ t.since(previousYear) }}</span>
            </dd>
          </div>
          <div>
            <dt class="text-[13px] font-medium text-forest-300">{{ t.producers }}</dt>
            <dd class="font-display mt-1 text-[44px] font-bold sm:text-[36px] md:text-[44px] lg:text-[52px] leading-none tracking-tight text-white tabular-nums">{{ producersText }}</dd>
            <dd class="mt-1.5 flex items-center gap-1.5 text-xs text-forest-300">
              <span>{{ t.people }}, {{ year }}</span><DeltaPill :pct="producersDelta" tone="dark" /><span>{{ t.since(previousYear) }}</span>
            </dd>
          </div>
        </dl>

        <figure class="mt-6" :aria-label="t.genderAria(formatPercent(menPct), formatPercent(womenPct))">
          <figcaption class="mb-2 text-[13px] font-medium text-forest-300">{{ t.gender }}, {{ year }}</figcaption>
          <div class="flex h-3 overflow-hidden rounded-full bg-forest-800" role="presentation">
            <div class="h-full bg-[#9fb0ff]" :style="{ width: `${menPct}%` }" />
            <div class="h-full w-0.5 bg-forest-900" />
            <div class="h-full bg-gold-500" :style="{ width: `${womenPct}%` }" />
          </div>
          <div class="mt-2 flex justify-between gap-4 text-xs tabular-nums">
            <p><span class="inline-block h-2 w-2 rounded-full bg-[#9fb0ff] align-middle" aria-hidden="true" /> {{ t.men }} <b class="font-semibold text-white">{{ formatPercent(menPct) }}</b> <span class="text-forest-300">({{ formatNumber(men) }})</span></p>
            <p class="text-right"><span class="inline-block h-2 w-2 rounded-full bg-gold-500 align-middle" aria-hidden="true" /> {{ t.women }} <b class="font-semibold text-white">{{ formatPercent(womenPct) }}</b> <span class="text-forest-300">({{ formatNumber(women) }})</span></p>
          </div>
        </figure>
      </div>

      <div class="lg:col-span-7">
        <RouterLink to="/2025/wilayah" class="group block rounded-2xl focus-visible:outline-white" :aria-label="t.mapLink">
          <svg
            :viewBox="`0 0 ${GEO_VIEWBOX.width} ${GEO_VIEWBOX.height}`"
            class="reveal-map block h-auto w-full"
            role="img"
            :aria-label="t.mapAria(year)"
          >
            <g stroke="#0e2418" stroke-width="0.8" stroke-linejoin="round">
              <path v-for="p in paths" :key="p.name" :d="p.d" :fill="fill(p.name)" :opacity="ready ? 1 : 0">
                <title>{{ p.name }}</title>
              </path>
            </g>
          </svg>
          <div class="mt-2 flex items-center justify-between gap-3 text-xs text-forest-300">
            <span class="inline-flex items-center gap-2">
              {{ t.mapLegend }}
              <span class="h-2 w-24 rounded-full" :style="{ background: `linear-gradient(90deg, ${legend[0]}, ${CLASS_COLORS[2]}, ${legend[1]})` }" aria-hidden="true" />
            </span>
            <span class="font-medium text-white underline-offset-4 group-hover:underline">{{ t.mapLink }}</span>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
