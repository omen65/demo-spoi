<script setup lang="ts">
defineProps<{ name: 'home' | 'users' | 'grid' | 'pin' | 'layers' | 'flask' | 'info' | 'arrow' | 'up' | 'down' | 'sidebar' | 'chevron' | 'download' }>()
</script>

<template>
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="shrink-0">
    <template v-if="name === 'home'"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></template>
    <template v-else-if="name === 'users'"><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0M16 5.2a3.2 3.2 0 0 1 0 5.6M18 14.5a6 6 0 0 1 3 5.5" /></template>
    <template v-else-if="name === 'grid'"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /></template>
    <template v-else-if="name === 'pin'"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></template>
    <template v-else-if="name === 'layers'"><path d="m12 3 9 5-9 5-9-5 9-5z" /><path d="m3 13 9 5 9-5" /></template>
    <template v-else-if="name === 'flask'"><path d="M9 3h6M10 3v6l-5.5 9.5A1.5 1.5 0 0 0 5.8 21h12.4a1.5 1.5 0 0 0 1.3-2.5L14 9V3" /></template>
    <template v-else-if="name === 'info'"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></template>
    <template v-else-if="name === 'arrow'"><path d="M5 12h14M13 6l6 6-6 6" /></template>
    <template v-else-if="name === 'up'"><path d="M12 19V5M6 11l6-6 6 6" /></template>
    <template v-else-if="name === 'sidebar'"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /></template>
    <template v-else-if="name === 'chevron'"><path d="m9 6 6 6-6 6" /></template>
    <template v-else-if="name === 'download'"><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></template>
    <template v-else><path d="M12 5v14M6 13l6 6 6-6" /></template>
  </svg>
</template>
