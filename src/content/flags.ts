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
    note: 'Produksi 2020 turun tajam dibanding tahun sekitarnya; perlu konfirmasi AOI.',
  },
  {
    issue: 6,
    commodity: 'jeruk',
    metric: 'luas',
    years: ALL,
    note: 'Buku menyebut angka jeruk tidak dapat dijadikan acuan karena sebagian lembaga sertifikasi tidak melapor.',
  },
  {
    issue: 6,
    commodity: 'jeruk',
    metric: 'produksi',
    years: ['2019', '2020', '2021'],
    note: 'Produksi tercatat 0 padahal ada lahan dan petani; kemungkinan belum dilaporkan.',
  },
  {
    issue: 10,
    commodity: 'aren',
    metric: 'luas',
    years: ['2022'],
    note: 'Lonjakan 2022 sebagian besar berasal dari provinsi yang baru muncul di data; perlu konfirmasi AOI.',
  },
  {
    issue: 10,
    commodity: 'aren',
    metric: 'produksi',
    years: ['2022'],
    note: 'Lonjakan 2022 perlu konfirmasi AOI.',
  },
  {
    issue: 10,
    commodity: 'aren',
    metric: 'petani',
    years: ['2022'],
    note: 'Lonjakan 2022 perlu konfirmasi AOI.',
  },
  {
    issue: 11,
    commodity: 'ternak',
    metric: 'produksi',
    years: ['2019', '2022'],
    note: 'Nilai berubah ribuan kali lipat antartahun; cakupan data kemungkinan berbeda.',
  },
  {
    issue: 12,
    commodity: 'pupuk',
    metric: 'operator',
    years: ['2019'],
    note: 'Teks buku menyebut 42 operator pada awal rentang, sedangkan grafik 2019 menunjukkan 88; perlu konfirmasi AOI.',
  },
  {
    issue: 12,
    commodity: 'pupuk',
    metric: 'produksi',
    years: ['2022'],
    note: 'Produksi turun sekitar separuh pada 2022 tanpa penjelasan di buku; perlu konfirmasi AOI.',
  },
  {
    issue: 16,
    commodity: 'pasar',
    metric: 'produksi',
    years: ['2021'],
    note: 'Lonjakan satu tahun tanpa penjelasan di buku.',
  },
]

export function findFlag(commodity: string, metric: Metric, year: YearKey): FlagNote | undefined {
  return FLAGS.find((f) => f.commodity === commodity && f.metric === metric && f.years.includes(year))
}

/** Catatan untuk tabel provinsi (butir 21 dan 23). */
export const PROVINCE_NOTES: Readonly<Record<string, { issue: number; note: string }>> = {
  kelapa: {
    issue: 21,
    note: 'Banyak provinsi memuat angka yang sama di keempat tahun dan luas yang sama dengan produksi; perlu konfirmasi AOI.',
  },
  teh: {
    issue: 23,
    note: 'Jumlah provinsi pada beberapa tahun tidak sama dengan angka nasional di buku; perlu konfirmasi AOI.',
  },
}
