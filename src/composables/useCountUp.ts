import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

/**
 * Angka yang berhitung naik sekali saat halaman dibuka. Nilai akhir selalu persis nilai data;
 * untuk pengguna yang memilih "kurangi gerakan" angka langsung tampil.
 */
export function useCountUp(target: () => number, duration = 1300): Ref<number> {
  const shown = ref(0)
  let raf = 0
  const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  function run(): void {
    cancelAnimationFrame(raf)
    const to = target()
    if (reduce || duration <= 0) {
      shown.value = to
      return
    }
    const start = performance.now()
    const tick = (now: number): void => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 4)
      shown.value = t >= 1 ? to : to * eased
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
  }

  onMounted(run)
  watch(target, run)
  onBeforeUnmount(() => cancelAnimationFrame(raf))
  return shown
}
