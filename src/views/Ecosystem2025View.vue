<script setup lang="ts">
import NavIcon from '@/components/NavIcon.vue'
import PageHeader from '@/components/PageHeader.vue'
import { formatNumber } from '@/composables/useFormat'
import { getCommunities2025, getPgs2025, getPolicy2025 } from '@/data/api'
import { ui2025 } from '@/content/id-2025'

const t = ui2025.ecosystem
const pgs = getPgs2025()
const communities = getCommunities2025()
const policy = getPolicy2025()

const sections = [t.sections.pgs, t.sections.communities, t.sections.policy]
const farmers = pgs.totalFarmersReported
// scrollIntoView lewat id (bukan $el) supaya jalan di template
function goTo(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' })
}
</script>

<template>
  <div class="space-y-8">
    <PageHeader :title="t.title" :lead="t.lead">
      <nav :aria-label="t.navAria" class="flex flex-wrap gap-2">
        <button
          v-for="s in sections"
          :key="s.id"
          type="button"
          class="rounded-md border border-paper-300 px-3 py-1.5 text-[13px] font-medium text-ink-900 hover:bg-paper-100"
          @click="goTo(s.id)"
        >
          {{ s.title }}
        </button>
      </nav>
    </PageHeader>

    <section :aria-labelledby="t.sections.pgs.id" class="scroll-mt-20 space-y-3">
      <div>
        <h2 :id="t.sections.pgs.id" class="text-base font-semibold">{{ t.sections.pgs.title }}</h2>
        <p class="text-xs text-ink-600">{{ t.sections.pgs.lead }}</p>
      </div>
      <p class="rounded-lg bg-white p-4 text-sm leading-relaxed text-ink-700">{{ t.pgs.total(formatNumber(farmers.value)) }}</p>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <article v-for="s in pgs.systems" :key="s.id" class="rounded-lg bg-white p-4 md:p-5">
          <h3 class="text-[15px] font-semibold">
            {{ s.name }}
          </h3>
          <p class="mt-1 text-[13px] leading-relaxed text-ink-600">{{ s.summary }}</p>
          <dl class="mt-3 grid grid-cols-2 gap-3" :aria-label="t.pgs.figuresAria(s.name)">
            <div v-for="f in s.figures" :key="f.key">
              <dt class="text-xs font-semibold text-ink-600">{{ f.label }}</dt>
              <dd class="text-2xl font-semibold tracking-tight tabular-nums text-ink-900">
                {{ formatNumber(f.value) }}
                <span class="block text-sm font-medium text-ink-600">{{ f.unit }}</span>
              </dd>
            </div>
          </dl>
          <p class="mt-3 text-xs text-ink-600">{{ t.sourcePrefix }} {{ s.source }}</p>
        </article>
      </div>
      <p class="text-sm leading-relaxed text-ink-700">{{ pgs.mergerNote }}</p>
    </section>

    <section :aria-labelledby="t.sections.communities.id" class="scroll-mt-20 space-y-3">
      <div>
        <h2 :id="t.sections.communities.id" class="text-base font-semibold">{{ t.sections.communities.title }}</h2>
        <p class="text-xs text-ink-600">{{ t.sections.communities.lead }}</p>
      </div>
      <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <article v-for="c in communities.rows" :key="c.name" class="rounded-lg bg-white p-4">
          <h3 class="text-[15px] font-semibold leading-snug">{{ c.name }}</h3>
          <dl class="mt-2 space-y-2 text-[13px] leading-relaxed">
            <div>
              <dt class="text-xs font-semibold text-ink-600">{{ t.communities.columns.base }}</dt>
              <dd class="text-ink-900">{{ c.base }}</dd>
            </div>
            <div>
              <dt class="text-xs font-semibold text-ink-600">{{ t.communities.columns.role }}</dt>
              <dd class="text-ink-900">{{ c.role }}</dd>
            </div>
          </dl>
        </article>
      </div>
      <p class="text-sm leading-relaxed text-ink-700">{{ t.communities.note }}</p>
      <p class="text-xs text-ink-600">{{ t.sourcePrefix }} {{ communities.source }}</p>
    </section>

    <section :aria-labelledby="t.sections.policy.id" class="scroll-mt-20 space-y-3">
      <div>
        <h2 :id="t.sections.policy.id" class="text-base font-semibold">{{ t.sections.policy.title }}</h2>
        <p class="text-xs text-ink-600">{{ t.sections.policy.lead }}</p>
      </div>
      <ol class="rounded-lg bg-white p-4 md:p-5" :aria-label="t.policy.aria">
        <li v-for="(p, i) in policy.rows" :key="p.period" class="relative grid grid-cols-1 gap-x-6 gap-y-1 pb-5 pl-5 last:pb-0 md:grid-cols-[9rem_1fr]">
          <span class="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-deep-900" aria-hidden="true" />
          <span v-if="i < policy.rows.length - 1" class="absolute bottom-0 left-[3px] top-4 w-px bg-paper-200" aria-hidden="true" />
          <p class="text-[13px] font-semibold tabular-nums text-ink-900">{{ p.period }}</p>
          <div>
            <p class="text-[15px] font-semibold leading-snug text-ink-900">{{ p.stage }}</p>
            <p class="mt-0.5 flex items-center gap-1 text-xs font-medium text-accent-700"><NavIcon name="arrow" class="!h-3 !w-3" />{{ p.instrument }}</p>
            <p class="mt-1 text-[13px] leading-relaxed text-ink-600">{{ p.substance }}</p>
          </div>
        </li>
      </ol>
      <p class="text-sm text-ink-700">{{ t.policy.note }}</p>
      <p class="text-xs text-ink-600">{{ t.sourcePrefix }} {{ policy.source }}</p>
    </section>
  </div>
</template>
