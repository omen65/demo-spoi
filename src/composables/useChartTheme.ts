/** Membaca warna dari token CSS agar chart (canvas) memakai palet yang sama dengan halaman. */
export function themeColor(token: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  return v || fallback
}
