<script setup lang="ts">
import { computed } from 'vue'
import { getProvinceProfile2025, getProvinceRow2025 } from '@/data/api'
import type { YearKey2025 } from '@/data/types'
import { formatNumber, formatPercent } from '@/composables/useFormat'
import { ui2025 } from '@/content/id-2025'

const props = defineProps<{ province: string; year: YearKey2025 }>()
const emit = defineEmits<{ close: [] }>()

const t = ui2025.wilayah.panel
const row = computed(() => getProvinceRow2025(props.province))
const yearKey = computed(() => (props.year === '2023' || props.year === '2024' ? props.year : null))
const producers = computed(() => (yearKey.value ? row.value?.produsen[yearKey.value] : undefined))
const area = computed(() => (yearKey.value ? row.value?.luas[yearKey.value] ?? null : null))
const share = computed(() => (producers.value && producers.value.total ? ((producers.value.perempuan ?? 0) / producers.value.total) * 100 : null))
const cert = computed(() => row.value?.sertifikasi2024)
const showCert = computed(() => props.year === '2024' && !!cert.value && Object.values(cert.value).some((v) => v !== null))
const commodities = computed(() => getProvinceProfile2025(props.province, props.year))

const fmt = (v: number | null | undefined): string => (v === null || v === undefined ? ui2025.wilayah.notReported : formatNumber(v))
</script>

<template>
  <section class="rounded-lg bg-white p-4 md:p-5" aria-live="polite">
    <div class="flex items-start justify-between gap-3">
      <h2 class="text-base font-semibold md:text-lg">{{ t.title(province, year) }}</h2>
      <button
        type="button"
        class="rounded-md border border-paper-300 px-3 py-1.5 text-sm font-medium text-ink-900 hover:bg-paper-100"
        @click="emit('close')"
      >
        {{ t.close }}
      </button>
    </div>

    <dl v-if="yearKey" class="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-paper-200 sm:grid-cols-4">
      <div class="bg-white p-3">
        <dt class="text-xs font-medium text-ink-600">{{ t.area }}</dt>
        <dd class="mt-1 text-lg font-semibold tabular-nums">{{ fmt(area) }}<span v-if="area !== null" class="ml-1 text-xs font-normal text-ink-600">ha</span></dd>
      </div>
      <div class="bg-white p-3">
        <dt class="text-xs font-medium text-ink-600">{{ t.producers }}</dt>
        <dd class="mt-1 text-lg font-semibold tabular-nums">{{ fmt(producers?.total) }}</dd>
        <p v-if="producers?.total" class="mt-0.5 text-xs text-ink-600">{{ t.men }} {{ fmt(producers.lakiLaki ?? 0) }} · {{ t.women }} {{ fmt(producers.perempuan ?? 0) }}</p>
      </div>
      <div class="bg-white p-3">
        <dt class="text-xs font-medium text-ink-600">{{ t.womenShare }}</dt>
        <dd class="mt-1 text-lg font-semibold tabular-nums">{{ share === null ? ui2025.wilayah.notReported : formatPercent(share) }}</dd>
      </div>
      <div v-if="showCert && cert" class="bg-white p-3">
        <dt class="text-xs font-medium text-ink-600">{{ t.certification }}</dt>
        <dd class="mt-1 space-y-0.5 text-xs text-ink-900">
          <p>{{ t.conversion }}: <span class="tabular-nums">{{ fmt(cert.konversi) }}</span></p>
          <p>{{ t.pgs }}: <span class="tabular-nums">{{ fmt(cert.pgs) }}</span></p>
          <p>{{ t.selfDeclare }}: <span class="tabular-nums">{{ fmt(cert.selfDeclare) }}</span></p>
        </dd>
      </div>
    </dl>
    <p v-else class="mt-2 text-sm text-ink-700">{{ t.gender2324 }}</p>
    <p v-if="showCert" class="mt-2 text-xs text-ink-600">{{ t.certNote }}</p>

    <h3 class="mt-4 text-sm font-semibold">{{ t.commodities }}</h3>
    <p class="mt-0.5 text-xs text-ink-600">{{ t.lead }}</p>
    <div v-if="commodities.length" class="relative mt-2 overflow-x-auto rounded-lg">
      <table class="w-full min-w-[22rem] border-collapse text-sm">
        <caption class="sr-only">
          {{ t.title(province, year) }}
        </caption>
        <thead class="bg-paper-100 text-left">
          <tr>
            <th scope="col" class="px-3 py-2 font-semibold">{{ t.columns.commodity }}</th>
            <th scope="col" class="px-3 py-2 text-right font-semibold">{{ t.columns.area }}</th>
            <th scope="col" class="px-3 py-2 text-right font-semibold">{{ t.columns.prod }}</th>
            <th scope="col" class="px-3 py-2 text-right font-semibold">{{ t.columns.producers }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in commodities" :key="r.id" class="border-t border-paper-200">
            <th scope="row" class="px-3 py-2 text-left font-medium">
              <RouterLink :to="`/2025/komoditas/${r.id}`" class="text-accent-700 underline underline-offset-4">{{ r.name }}</RouterLink>
            </th>
            <td class="px-3 py-2 text-right tabular-nums">{{ r.luas === null ? '–' : formatNumber(r.luas) }}</td>
            <td class="px-3 py-2 text-right tabular-nums">{{ r.produksi === null ? '–' : formatNumber(r.produksi) }}</td>
            <td class="px-3 py-2 text-right tabular-nums">{{ r.produsen === null ? '–' : formatNumber(r.produsen) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="mt-2 text-sm text-ink-600">{{ t.noCommodities }}</p>
  </section>
</template>
