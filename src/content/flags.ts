/**
 * Angka di buku yang janggal dan diberi penanda di UI (keputusan Feri: tampil apa adanya + penanda).
 * Nomor `issue` merujuk ke docs/data-issues.md. Angka TIDAK diubah.
 */
import type { Metric, YearKey } from '@/data/types'

export interface FlagNote {
  issue: number
  commodity: string
  metric: Metric
  years: readonly YearKey[]
  note: string
}

const ALL: readonly YearKey[] = ['2019', '2020', '2021', '2022']

export const FLAGS: readonly FlagNote[] = [
  {
    issue: 5,
    commodity: 'pisang',
    metric: 'produksi',
    years: ['2020'],
    note: 'Produksi 2020 turun tajam dibanding tahun sekitarnya; sedang diverifikasi.',
  },
  {
    issue: 6,
    commodity: 'jeruk',
    metric: 'luas',
    years: ALL,
    note: 'Sebagian lembaga sertifikasi tidak melapor; data sedang diverifikasi.',
  },
  {
    issue: 6,
    commodity: 'jeruk',
    metric: 'produksi',
    years: ['2019', '2020', '2021'],
    note: 'Produksi tercatat 0; data sedang diverifikasi.',
  },
  {
    issue: 10,
    commodity: 'aren',
    metric: 'luas',
    years: ['2022'],
    note: 'Lonjakan 2022 sebagian besar berasal dari provinsi yang baru muncul di data; sedang diverifikasi.',
  },
  {
    issue: 10,
    commodity: 'aren',
    metric: 'produksi',
    years: ['2022'],
    note: 'Lonjakan 2022 sedang diverifikasi.',
  },
  {
    issue: 10,
    commodity: 'aren',
    metric: 'petani',
    years: ['2022'],
    note: 'Lonjakan 2022 sedang diverifikasi.',
  },
  {
    issue: 11,
    commodity: 'ternak',
    metric: 'produksi',
    years: ['2019', '2022'],
    note: 'Nilai berubah tajam antartahun; data sedang diverifikasi.',
  },
  {
    issue: 12,
    commodity: 'pupuk',
    metric: 'operator',
    years: ['2019'],
    note: 'Data sedang diverifikasi.',
  },
  {
    issue: 12,
    commodity: 'pupuk',
    metric: 'produksi',
    years: ['2022'],
    note: 'Penurunan tajam pada 2022; data sedang diverifikasi.',
  },
  {
    issue: 16,
    commodity: 'pasar',
    metric: 'produksi',
    years: ['2021'],
    note: 'Lonjakan satu tahun; data sedang diverifikasi.',
  },
]

export function findFlag(commodity: string, metric: Metric, year: YearKey): FlagNote | undefined {
  return FLAGS.find((f) => f.commodity === commodity && f.metric === metric && f.years.includes(year))
}

/** Catatan untuk tabel provinsi (butir 21 dan 23). */
export const PROVINCE_NOTES: Readonly<Record<string, { issue: number; note: string }>> = {
  kelapa: {
    issue: 21,
    note: 'Data sebaran provinsi sedang diverifikasi.',
  },
  teh: {
    issue: 23,
    note: 'Data sebaran provinsi sedang diverifikasi.',
  },
}
