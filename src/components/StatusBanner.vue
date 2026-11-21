<script setup lang="ts">
import { ui2025 } from '@/content/id-2025'

/** Penanda status draf, tampil di semua halaman edisi 2025. */
const t = ui2025.banner
</script>

<template>
  <div class="mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border border-paper-300 bg-white px-4 py-2.5 text-[13px] leading-snug text-ink-700" role="note">
    <span class="rounded bg-paper-100 px-1.5 py-0.5 text-xs font-semibold text-ink-900">{{ t.title }}</span>
    <span class="min-w-0 flex-1 basis-60">{{ t.body }}</span>
    <RouterLink to="/2025/tentang-data" class="shrink-0 font-medium text-accent-700 underline underline-offset-4">{{ t.link }}</RouterLink>
  </div>
</template>
