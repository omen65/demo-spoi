<script setup lang="ts">
defineProps<{ title: string; lead?: string; back?: { to: string; label: string } }>()
</script>

<template>
  <header class="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
    <div class="min-w-0">
      <RouterLink v-if="back" :to="back.to" class="mb-1 inline-flex items-center gap-1 text-[13px] font-medium text-ink-600 hover:text-ink-900">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>{{ back.label }}
      </RouterLink>
      <h1 class="text-[22px] font-semibold leading-tight md:text-[26px]">{{ title }}</h1>
      <p v-if="lead" class="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-600">{{ lead }}</p>
    </div>
    <div v-if="$slots.default" class="flex flex-wrap items-end gap-x-5 gap-y-3">
      <slot />
    </div>
  </header>
</template>
