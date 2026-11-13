<script setup lang="ts">
import { computed } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { PROVINCE_NOTES, FLAGS } from '@/content/flags'
import { ui } from '@/content/id'
import { getCommodity, getMeta } from '@/data/api'

const t = ui.about
const meta = getMeta()
const s = t.sections

const toc = [s.source, s.method, s.definitions, s.limits, s.notes, s.map, s.demo]

const flagged = computed(() =>
  FLAGS.map((f) => ({
    key: `${f.issue}-${f.commodity}-${f.metric}`,
    title: `${getCommodity(f.commodity)?.name ?? f.commodity}, ${ui.detail.nouns[f.metric].toLowerCase()}, ${t.notes.years(f.years.join(', '))}`,
    note: f.note,
  })),
)
const provinceNotes = computed(() =>
  Object.entries(PROVINCE_NOTES).map(([id, n]) => ({ key: id, title: getCommodity(id)?.name ?? id, note: n.note })),
)

function goTo(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="space-y-5">
    <PageHeader :title="t.title" :lead="t.lead" />

    <div class="grid grid-cols-1 gap-5 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <nav :aria-label="t.toc" class="lg:sticky lg:top-20 lg:self-start">
        <ul class="flex flex-wrap gap-1 lg:flex-col lg:gap-0.5">
          <li v-for="x in toc" :key="x.id">
            <a
              :href="`#${x.id}`"
              class="block rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-ink-600 hover:bg-paper-100 hover:text-ink-900"
              @click.prevent="goTo(x.id)"
            >
              {{ x.title }}
            </a>
          </li>
        </ul>
      </nav>

      <div class="max-w-3xl space-y-3">
        <section :id="s.source.id" :aria-labelledby="`h-${s.source.id}`" class="scroll-mt-20 space-y-2 rounded-lg bg-white p-5">
          <h2 :id="`h-${s.source.id}`" class="text-base font-semibold">{{ s.source.title }}</h2>
          <p class="text-sm leading-relaxed">{{ t.source.lead(meta.title, meta.publisher, meta.published, meta.dataYears.from, meta.dataYears.to) }}</p>
          <p class="text-sm leading-relaxed text-ink-600">{{ t.source.printer(meta.printer) }} {{ t.source.trace }}</p>
        </section>

        <section :id="s.method.id" :aria-labelledby="`h-${s.method.id}`" class="scroll-mt-20 space-y-2 rounded-lg bg-white p-5">
          <h2 :id="`h-${s.method.id}`" class="text-base font-semibold">{{ s.method.title }}</h2>
          <p class="text-sm leading-relaxed">{{ t.method.collect(meta.collection.certifiers, meta.collection.pgs, meta.collection.period) }}</p>
          <p class="text-sm leading-relaxed">{{ t.method.aggregate }}</p>
          <p class="text-sm leading-relaxed">{{ t.method.extract }}</p>
          <p class="text-sm leading-relaxed">{{ t.method.provinces }}</p>
          <p class="text-sm leading-relaxed">{{ t.method.derived }}</p>
        </section>

        <section :id="s.definitions.id" :aria-labelledby="`h-${s.definitions.id}`" class="scroll-mt-20 rounded-lg bg-white p-5">
          <h2 :id="`h-${s.definitions.id}`" class="text-base font-semibold">{{ s.definitions.title }}</h2>
          <dl class="mt-2 divide-y divide-paper-200">
            <div v-for="d in t.definitions.items" :key="d.term" class="grid gap-1 py-2.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
              <dt class="text-sm font-semibold text-ink-900">{{ d.term }}</dt>
              <dd class="text-sm leading-relaxed text-ink-700">{{ d.text }}</dd>
            </div>
          </dl>
        </section>

        <section :id="s.limits.id" :aria-labelledby="`h-${s.limits.id}`" class="scroll-mt-20 rounded-lg bg-white p-5">
          <h2 :id="`h-${s.limits.id}`" class="text-base font-semibold">{{ s.limits.title }}</h2>
          <ul class="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
            <li v-for="l in t.limits.items" :key="l">{{ l }}</li>
          </ul>
        </section>

        <section :id="s.notes.id" :aria-labelledby="`h-${s.notes.id}`" class="scroll-mt-20 rounded-xl border border-flag/30 bg-white p-5">
          <h2 :id="`h-${s.notes.id}`" class="text-base font-semibold">{{ s.notes.title }}</h2>
          <p class="mt-1 text-sm text-ink-600">{{ t.notes.lead }}</p>
          <h3 class="mt-4 text-sm font-semibold"><span class="text-flag">†</span> {{ t.notes.flaggedHeading }}</h3>
          <ul class="mt-2 divide-y divide-paper-200 text-[13px] leading-relaxed">
            <li v-for="n in flagged" :key="n.key" class="py-2"><span class="font-semibold">{{ n.title }}.</span> {{ n.note }}</li>
          </ul>
          <h3 class="mt-4 text-sm font-semibold">{{ t.notes.provinceHeading }}</h3>
          <ul class="mt-2 divide-y divide-paper-200 text-[13px] leading-relaxed">
            <li v-for="n in provinceNotes" :key="n.key" class="py-2"><span class="font-semibold">{{ n.title }}.</span> {{ n.note }}</li>
          </ul>
          <h3 class="mt-4 text-sm font-semibold">{{ t.notes.otherHeading }}</h3>
          <ul class="mt-2 list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed">
            <li v-for="o in t.notes.other" :key="o">{{ o }}</li>
          </ul>
        </section>

        <section :id="s.map.id" :aria-labelledby="`h-${s.map.id}`" class="scroll-mt-20 space-y-2 rounded-lg bg-white p-5">
          <h2 :id="`h-${s.map.id}`" class="text-base font-semibold">{{ s.map.title }}</h2>
          <p class="text-sm leading-relaxed">{{ t.map.text }}</p>
        </section>

        <section :id="s.demo.id" :aria-labelledby="`h-${s.demo.id}`" class="scroll-mt-20 space-y-2 rounded-xl border border-gold-500/50 bg-gold-500/10 p-5">
          <h2 :id="`h-${s.demo.id}`" class="text-base font-semibold">{{ s.demo.title }}</h2>
          <p class="text-sm leading-relaxed">{{ t.demo.text }}</p>
        </section>
      </div>
    </div>
  </div>
</template>
