<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { FeatureCollection } from 'geojson'
import { ZERO_COLOR, type Classification } from '@/composables/useChoropleth'
import { formatNumber } from '@/composables/useFormat'
import { GEO_TO_SPOI } from '@/data/provinceMap'
import { ui } from '@/content/id'

const props = defineProps<{
  geo: FeatureCollection
  /** Nama provinsi SPOI -> nilai (null = tidak ada data) */
  values: Record<string, number | null | undefined>
  classification: Classification
  unit: string
  selected: string | null
  description: string
}>()

const emit = defineEmits<{ select: [province: string] }>()

const el = ref<HTMLDivElement | null>(null)
let map: L.Map | null = null
let layer: L.GeoJSON | null = null
let observer: ResizeObserver | null = null

function fit(): void {
  if (!map || !layer) return
  map.invalidateSize(false)
  map.fitBounds(layer.getBounds(), { padding: [6, 6], animate: false })
}

const HATCH_ID = 'spoi-nodata-hatch'
const NODATA_FILL = `url(#${HATCH_ID})`

function spoiName(feature: GeoJSON.Feature | undefined): string | undefined {
  const raw = feature?.properties?.PROVINSI as string | undefined
  return raw ? GEO_TO_SPOI[raw] : undefined
}

function styleFor(feature: GeoJSON.Feature | undefined): L.PathOptions {
  const name = spoiName(feature)
  const cls = props.classification.classify(name ? props.values[name] : null)
  const fill =
    cls === 'nodata' ? NODATA_FILL : cls === 'zero' ? ZERO_COLOR : props.classification.classes[cls]?.color ?? ZERO_COLOR
  const isSel = !!name && name === props.selected
  return {
    fillColor: fill,
    fillOpacity: 1,
    color: isSel ? '#ffffff' : '#0e2418',
    weight: isSel ? 2.5 : 0.8,
    lineJoin: 'round',
  }
}

function tooltipFor(feature: GeoJSON.Feature | undefined): string {
  const name = spoiName(feature) ?? ''
  const v = props.values[name]
  const val = v === null || v === undefined ? ui.regions.tooltipNoData : `${formatNumber(v)} ${props.unit}`
  return `<strong>${name}</strong><br/>${val}`
}

function addHatchPattern(): void {
  const svg = map?.getPane('overlayPane')?.querySelector('svg')
  if (!svg || svg.querySelector(`#${HATCH_ID}`)) return
  const ns = 'http://www.w3.org/2000/svg'
  const defs = document.createElementNS(ns, 'defs')
  const pattern = document.createElementNS(ns, 'pattern')
  pattern.setAttribute('id', HATCH_ID)
  pattern.setAttribute('patternUnits', 'userSpaceOnUse')
  pattern.setAttribute('width', '6')
  pattern.setAttribute('height', '6')
  pattern.setAttribute('patternTransform', 'rotate(45)')
  const bg = document.createElementNS(ns, 'rect')
  bg.setAttribute('width', '6')
  bg.setAttribute('height', '6')
  bg.setAttribute('fill', '#163527')
  const line = document.createElementNS(ns, 'rect')
  line.setAttribute('width', '2')
  line.setAttribute('height', '6')
  line.setAttribute('fill', '#2f6148')
  pattern.append(bg, line)
  defs.append(pattern)
  svg.prepend(defs)
}

onMounted(() => {
  if (!el.value) return
  map = L.map(el.value, {
    zoomSnap: 0.25,
    scrollWheelZoom: false,
    attributionControl: false,
    renderer: L.svg(),
    minZoom: 3,
    maxZoom: 8, // tanpa peta dasar, batas zoom harus eksplisit supaya fitBounds punya hasil hingga
  })
  L.control.attribution({ prefix: false }).addAttribution(ui.regions.attribution).addTo(map)

  layer = L.geoJSON(props.geo, {
    style: styleFor,
    onEachFeature: (feature, l) => {
      l.bindTooltip(() => tooltipFor(feature), { sticky: true })
      l.on('mouseover', () => {
        const name = spoiName(feature)
        if (name && name === props.selected) return
        ;(l as L.Path).setStyle({ color: '#ffffff', weight: 2 })
        ;(l as L.Path).bringToFront()
      })
      l.on('mouseout', () => layer?.resetStyle(l as L.Path))
      l.on('click', () => {
        const name = spoiName(feature)
        if (name) emit('select', name)
      })
    },
  }).addTo(map)
  fit()
  addHatchPattern()
  // Pola arsir perlu ada sebelum style diterapkan ulang
  layer.setStyle(styleFor)
  // Ukuran wadah berubah (putar layar, ubah lebar jendela): pas-kan ulang agar seluruh Indonesia tetap terlihat
  observer = new ResizeObserver(() => fit())
  observer.observe(el.value)
})

watch(
  () => [props.values, props.classification, props.selected],
  () => layer?.setStyle(styleFor),
)

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  map?.remove()
  map = null
  layer = null
})
</script>

<template>
  <div
    ref="el"
    role="img"
    :aria-label="description"
    class="province-map h-[260px] w-full overflow-hidden rounded-md md:h-[400px] xl:h-[460px]"
  />
</template>

<style>
.province-map.leaflet-container {
  background: var(--color-forest-900);
  font-family: inherit;
}
.province-map .leaflet-tooltip {
  color: var(--color-ink-900);
  border: 0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.4;
  box-shadow: 0 6px 20px -6px rgba(27, 33, 30, 0.3);
}
.province-map .leaflet-tooltip-top::before {
  display: none;
}
.province-map .leaflet-bar {
  border: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px -2px rgba(27, 33, 30, 0.25);
}
.province-map .leaflet-bar a {
  width: 36px;
  height: 36px;
  line-height: 36px;
  color: var(--color-ink-900);
  border-bottom-color: var(--color-paper-200);
}
.province-map .leaflet-control-attribution {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px 0 0 0;
  color: var(--color-ink-600);
}
.province-map path.leaflet-interactive {
  transition: stroke-width 120ms;
  cursor: pointer;
}
</style>
