<script setup lang="ts">
import { computed } from 'vue'
import { ui } from '@/content/id'
import { ui2025 } from '@/content/id-2025'
import { useEdition } from '@/composables/useEdition'

const { edition, home } = useEdition()
const t = computed(() => (edition.value === '2025' ? ui2025.comingSoon : ui.comingSoon))
</script>

<template>
  <section class="mx-auto max-w-xl py-10 text-center">
    <h1 class="text-3xl">{{ t.title }}</h1>
    <p class="mt-3 text-ink-700">{{ t.body }}</p>
    <RouterLink
      :to="home"
      class="mt-6 inline-block rounded-md bg-accent-700 px-4 py-2 font-semibold text-paper-50 hover:bg-accent-600"
    >
      {{ t.back }}
    </RouterLink>
  </section>
</template>
