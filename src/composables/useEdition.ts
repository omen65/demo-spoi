import { computed } from 'vue'
import { useRoute } from 'vue-router'

export type Edition = '2023' | '2025'

/** Edisi aktif dibaca dari rute: semua halaman 2025 berawalan /2025, sisanya 2023. */
export function useEdition() {
  const route = useRoute()
  const edition = computed<Edition>(() => (route.path === '/2025' || route.path.startsWith('/2025/') ? '2025' : '2023'))
  const home = computed(() => (edition.value === '2025' ? '/2025' : '/2023'))
  return { edition, home }
}
