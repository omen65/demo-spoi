/** Perubahan persen dari `from` ke `to`. Null bila titik awal 0 (tidak terdefinisi). */
export function changePct(from: number, to: number): number | null {
  if (from === 0) return null
  return ((to - from) / from) * 100
}

export type Direction = 'naik' | 'turun' | 'tetap'

export function direction(pct: number | null): Direction | null {
  if (pct === null) return null
  if (Math.abs(pct) < 0.05) return 'tetap'
  return pct > 0 ? 'naik' : 'turun'
}

/** Produktivitas = produksi (ton) dibagi jumlah petani. Null bila salah satunya 0 (tidak bermakna). */
export function productivity(produksi: number | undefined, petani: number | undefined): number | null {
  if (!produksi || !petani) return null
  return produksi / petani
}
