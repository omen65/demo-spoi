<script setup lang="ts">
import { ui } from '@/content/id'
import { getMeta } from '@/data/api'

const meta = getMeta()
</script>

<template>
  <footer class="mx-auto max-w-[1280px] px-4 pb-24 pt-2 sm:px-6 md:pb-10 lg:px-8">
    <div class="space-y-1 pt-6 text-xs leading-relaxed text-ink-600">
      <p class="font-medium text-ink-700">{{ ui.footer.credit(meta.publisher, meta.edition, meta.published) }}</p>
      <p>{{ ui.footer.demoNote }}</p>
      <p>
        <RouterLink to="/tentang-data" class="font-medium text-accent-700 underline underline-offset-4">{{ ui.footer.aboutLink }}</RouterLink>
      </p>
    </div>
  </footer>
</template>
