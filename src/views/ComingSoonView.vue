<script setup lang="ts">
import { ui2025 } from '@/content/id-2025'

const t = ui2025.comingSoon
</script>

<template>
  <section class="mx-auto max-w-xl py-10 text-center">
    <h1 class="text-3xl">{{ t.title }}</h1>
    <p class="mt-3 text-ink-700">{{ t.body }}</p>
    <RouterLink
      to="/2025"
      class="mt-6 inline-block rounded-md bg-accent-700 px-4 py-2 font-semibold text-paper-50 hover:bg-accent-600"
    >
      {{ t.back }}
    </RouterLink>
  </section>
</template>
