<script setup lang="ts" generic="T extends string">
/** Kontrol segmen minimal (radio yang bisa dinavigasi dengan keyboard). */
defineProps<{
  legend: string
  name: string
  options: { value: T; label: string }[]
}>()

const model = defineModel<T>({ required: true })
</script>

<template>
  <fieldset class="min-w-0">
    <legend class="mb-1 text-xs text-ink-600">{{ legend }}</legend>
    <div class="inline-flex flex-wrap gap-0.5 rounded-md bg-paper-100 p-0.5">
      <label v-for="opt in options" :key="opt.value" class="cursor-pointer">
        <input v-model="model" type="radio" class="peer sr-only" :name="name" :value="opt.value" />
        <span
          class="block rounded px-2.5 py-1 text-[13px] font-medium text-ink-600 transition-colors hover:text-ink-900 peer-checked:bg-white peer-checked:text-ink-900 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-deep-900"
        >
          {{ opt.label }}
        </span>
      </label>
    </div>
  </fieldset>
</template>
