/**
 * SPOI 2025: angka yang diberi penanda † (sedang diverifikasi). Angka TIDAK diubah.
 * Nomor `issue` merujuk ke docs/data-issues-2025.md.
 * Patahan 2022-2023 (butir 3) tidak diberi † per tahun; ditandai garis di grafik tren.
 */
import type { Metric } from '@/data/types'
import type { YearKey2025 } from '@/data/types'

export interface FlagNote2025 {
  issue: number
  commodity: string
  metric: Metric
  years: readonly YearKey2025[]
  note: string
}

const ALL: readonly YearKey2025[] = ['2019', '2020', '2021', '2022', '2023', '2024']

export const FLAGS_2025: readonly FlagNote2025[] = [
  {
    issue: 22,
    commodity: 'pisang',
    metric: 'luas',
    years: ALL,
    note: 'Data sedang diverifikasi.',
  },
  {
    issue: 22,
    commodity: 'kelapa',
    metric: 'petani',
    years: ALL,
    note: 'Data sedang diverifikasi.',
  },
  {
    issue: 22,
    commodity: 'jeruk',
    metric: 'produksi',
    years: ['2019', '2020', '2021'],
    note: 'Produksi tercatat mulai 2022; data sedang diverifikasi.',
  },
  {
    issue: 5,
    commodity: 'pupuk',
    metric: 'produksi',
    years: ['2024'],
    note: 'Lonjakan tajam dari 2023; data sedang diverifikasi.',
  },
  {
    issue: 6,
    commodity: 'ternak',
    metric: 'produksi',
    years: ALL,
    note: 'Fluktuasi tajam antartahun; data sedang diverifikasi.',
  },
  {
    issue: 19,
    commodity: 'aren',
    metric: 'luas',
    years: ['2023', '2024'],
    note: 'Luas lahan dan produksi tidak sejalan; data sedang diverifikasi.',
  },
  {
    issue: 19,
    commodity: 'aren',
    metric: 'produksi',
    years: ['2023', '2024'],
    note: 'Penurunan tajam dari 2022; data sedang diverifikasi.',
  },
]

const REPEAT_NOTE = 'Nilainya sama dengan tahun sebelumnya; data sedang diverifikasi.'

/** Tahun yang nilainya identik dengan tahun sebelumnya (bukan nol). Dihitung dari data, bukan ditebak. */
function repeatedYears(values: Readonly<Record<YearKey2025, number | null>>, years: readonly YearKey2025[]): YearKey2025[] {
  return years.filter((y, i) => {
    if (i === 0) return false
    const prev = values[years[i - 1] as YearKey2025]
    const v = values[y]
    return v !== null && v !== 0 && v === prev
  })
}

export interface YearFlag {
  year: YearKey2025
  issue: number
  note: string
}

/** Semua penanda † untuk satu seri, per tahun. */
export function flagsFor(
  commodity: string,
  metric: Metric,
  values: Readonly<Record<YearKey2025, number | null>>,
  years: readonly YearKey2025[],
): YearFlag[] {
  const manual = FLAGS_2025.filter((f) => f.commodity === commodity && f.metric === metric).flatMap((f) =>
    f.years.map((year) => ({ year, issue: f.issue, note: f.note })),
  )
  const repeats = repeatedYears(values, years).map((year) => ({ year, issue: 4, note: REPEAT_NOTE }))
  return [...manual, ...repeats]
}

export function flaggedYearsFor(
  commodity: string,
  metric: Metric,
  values: Readonly<Record<YearKey2025, number | null>>,
  years: readonly YearKey2025[],
): YearKey2025[] {
  return [...new Set(flagsFor(commodity, metric, values, years).map((f) => f.year))]
}

/** Catatan unik (satu per butir) untuk ditampilkan di bawah grafik. */
export function notesFor(
  commodity: string,
  metric: Metric,
  values: Readonly<Record<YearKey2025, number | null>>,
  years: readonly YearKey2025[],
): string[] {
  return [...new Set(flagsFor(commodity, metric, values, years).map((f) => f.note))]
}
