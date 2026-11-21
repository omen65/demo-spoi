<script setup lang="ts">
import AppFooter from '@/components/AppFooter.vue'
import AppNav from '@/components/AppNav.vue'
import StatusBanner from '@/components/StatusBanner.vue'
import { watchEffect } from 'vue'
import { ui } from '@/content/id'
import { useEdition } from '@/composables/useEdition'

const { edition } = useEdition()
watchEffect(() => {
  document.title = edition.value === '2025' ? 'SPOI 2025 (draf) · AOI' : 'SPOI 2023 (arsip) · AOI'
})
</script>

<template>
  <a
    href="#konten"
    class="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-ink-900 focus:px-3 focus:py-2 focus:text-paper-50"
  >
    {{ ui.skipToContent }}
  </a>
  <AppNav />
  <main id="konten" class="mx-auto w-full max-w-[1280px] px-4 pb-8 pt-6 sm:px-6 md:pt-8 lg:px-8" tabindex="-1">
    <StatusBanner v-if="edition === '2025'" />
    <RouterView />
  </main>
  <AppFooter />
</template>
