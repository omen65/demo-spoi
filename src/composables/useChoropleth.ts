/** Kelas warna peta (latar hijau hutan gelap, hijau ke kuning, makin terang makin besar): kuantil dari nilai positif; nol dan "tidak ada data" punya kelas sendiri. */
export const CLASS_COLORS = ['#2f8a5b', '#62ab52', '#a2c93b', '#e3dc3a', '#fff176'] as const
export const ZERO_COLOR = '#163527'

export interface ColorClass {
  color: string
  /** Nilai terkecil dan terbesar yang benar-benar ada di kelas ini (bukan batas bulat) */
  min: number
  max: number
}

export interface Classification {
  classes: ColorClass[]
  /** Indeks kelas untuk nilai positif, atau 'zero' / 'nodata' */
  classify: (value: number | null | undefined) => number | 'zero' | 'nodata'
}

export function classify(values: (number | null | undefined)[], k = CLASS_COLORS.length): Classification {
  const pos = values.filter((v): v is number => typeof v === 'number' && v > 0).sort((a, b) => a - b)
  if (pos.length === 0) {
    return { classes: [], classify: (v) => (v === null || v === undefined ? 'nodata' : 'zero') }
  }
  // batas atas kelas: kuantil, tanpa duplikat
  const uppers: number[] = []
  const classCount = Math.min(k, new Set(pos).size)
  for (let j = 1; j <= classCount; j++) {
    const idx = Math.ceil((j * pos.length) / classCount) - 1
    const u = pos[idx]!
    if (uppers[uppers.length - 1] !== u) uppers.push(u)
  }
  const indexOf = (v: number): number => {
    const i = uppers.findIndex((u) => v <= u)
    return i === -1 ? uppers.length - 1 : i
  }
  const classes: ColorClass[] = uppers.map((_, i) => ({
    color: CLASS_COLORS[Math.round((i * (CLASS_COLORS.length - 1)) / Math.max(1, uppers.length - 1))]!,
    min: Infinity,
    max: -Infinity,
  }))
  for (const v of pos) {
    const c = classes[indexOf(v)]!
    c.min = Math.min(c.min, v)
    c.max = Math.max(c.max, v)
  }
  return {
    classes,
    classify: (v) => (v === null || v === undefined ? 'nodata' : v === 0 ? 'zero' : indexOf(v)),
  }
}
