<script setup lang="ts">
import { ui } from '@/content/id'
</script>

<template>
  <section class="mx-auto max-w-xl py-10 text-center">
    <h1 class="text-3xl">{{ ui.comingSoon.title }}</h1>
    <p class="mt-3 text-ink-700">{{ ui.comingSoon.body }}</p>
    <RouterLink
      to="/"
      class="mt-6 inline-block rounded-md bg-accent-700 px-4 py-2 font-semibold text-paper-50 hover:bg-accent-600"
    >
      {{ ui.comingSoon.back }}
    </RouterLink>
  </section>
</template>
