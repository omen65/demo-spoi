<script setup lang="ts">
import { ui2025 } from '@/content/id-2025'
import { getMeta2025 } from '@/data/api'
import aoiLogo from '@/assets/aoi-logo.png'

const meta = getMeta2025()
const credit = ui2025.footer.credit(meta.publisher, 'SPOI 2025')
</script>

<template>
  <footer class="mx-auto max-w-[1280px] px-4 pb-24 pt-2 sm:px-6 md:pb-10 lg:px-8">
    <div class="space-y-1 pt-6 text-xs leading-relaxed text-ink-600">
      <img :src="aoiLogo" :alt="ui2025.logoAlt" width="465" height="275" class="mb-2 h-10 w-auto mix-blend-multiply" />
      <p class="font-medium text-ink-700">{{ credit }}</p>
      <p>{{ ui2025.footer.demoNote }}</p>
      <p>
        <RouterLink to="/2025/tentang-data" class="font-medium text-accent-700 underline underline-offset-4">{{ ui2025.footer.aboutLink }}</RouterLink>
      </p>
    </div>
  </footer>
</template>
