/**
 * SPOI 2025: angka yang diberi penanda † (sedang diverifikasi). Angka TIDAK diubah.
 * Nomor `issue` merujuk ke docs/data-issues-2025.md (butir 1-31, draf V13) dan docs/data-issues-xlsx-2025.md (butir 101 dst., Excel AOI).
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


export const FLAGS_2025: readonly FlagNote2025[] = []

export interface YearFlag {
  year: YearKey2025
  issue: number
  note: string
}

/** Semua penanda † untuk satu seri, per tahun. */
export function flagsFor(
  commodity: string,
  metric: Metric,
  _values: Readonly<Record<YearKey2025, number | null>>,
  _years: readonly YearKey2025[],
): YearFlag[] {
  const manual = FLAGS_2025.filter((f) => f.commodity === commodity && f.metric === metric).flatMap((f) =>
    f.years.map((year) => ({ year, issue: f.issue, note: f.note })),
  )
  return manual
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
