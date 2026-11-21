<script setup lang="ts">
import { computed } from 'vue'
import { ui } from '@/content/id'
import { ui2025 } from '@/content/id-2025'
import { useEdition } from '@/composables/useEdition'
import { getMeta, getMeta2025 } from '@/data/api'
import aoiLogo from '@/assets/aoi-logo.png'

const { edition } = useEdition()
const meta = getMeta()
const meta2025 = getMeta2025()

const credit = computed(() =>
  edition.value === '2025' ? ui2025.footer.credit(meta2025.publisher, 'SPOI 2025') : ui.footer.credit(meta.publisher, meta.edition, meta.published),
)
const note = computed(() => (edition.value === '2025' ? ui2025.footer.demoNote : ui.footer.demoNote))
const about = computed(() => (edition.value === '2025' ? '/2025/tentang-data' : '/tentang-data'))
const aboutLink = computed(() => (edition.value === '2025' ? ui2025.footer.aboutLink : ui.footer.aboutLink))
</script>

<template>
  <footer class="mx-auto max-w-[1280px] px-4 pb-24 pt-2 sm:px-6 md:pb-10 lg:px-8">
    <div class="space-y-1 pt-6 text-xs leading-relaxed text-ink-600">
      <img :src="aoiLogo" :alt="ui2025.logoAlt" width="465" height="275" class="mb-2 h-10 w-auto mix-blend-multiply" />
      <p class="font-medium text-ink-700">{{ credit }}</p>
      <p>{{ note }}</p>
      <p>
        <RouterLink :to="about" class="font-medium text-accent-700 underline underline-offset-4">{{ aboutLink }}</RouterLink>
      </p>
    </div>
  </footer>
</template>
