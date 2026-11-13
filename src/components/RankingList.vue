<script setup lang="ts">
import { computed } from 'vue'
import { formatNumber } from '@/composables/useFormat'
import { ui } from '@/content/id'

export interface RankItem {
  name: string
  value: number
}

const props = defineProps<{ items: RankItem[]; unit: string; selected: string | null }>()
const emit = defineEmits<{ select: [name: string] }>()

const max = computed(() => Math.max(...props.items.map((i) => i.value), 1))
</script>

<template>
  <ol class="space-y-1.5">
    <li v-for="(item, i) in items" :key="item.name">
      <button
        type="button"
        class="group block w-full rounded-md px-2.5 py-2 text-left transition-colors"
        :class="
          selected === item.name
            ? 'bg-paper-100'
            : 'hover:bg-paper-50'
        "
        :aria-pressed="selected === item.name"
        :aria-label="`${ui.regions.rankingSelect(item.name)}: ${formatNumber(item.value)} ${unit}`"
        @click="emit('select', item.name)"
      >
        <span class="flex items-baseline justify-between gap-3">
          <span class="font-semibold text-ink-900">
            <span class="mr-2 inline-block w-5 text-right text-sm font-medium tabular-nums text-ink-600">{{ i + 1 }}</span
            >{{ item.name }}
          </span>
          <span class="whitespace-nowrap text-sm tabular-nums text-ink-700">{{ formatNumber(item.value) }} {{ unit }}</span>
        </span>
        <span class="mt-1.5 block h-1.5 rounded-full bg-paper-100" aria-hidden="true">
          <span
            class="block h-1.5 rounded-full bg-accent-600"
            :style="{ width: `${Math.max(1.5, (item.value / max) * 100)}%` }"
          />
        </span>
      </button>
    </li>
  </ol>
</template>
