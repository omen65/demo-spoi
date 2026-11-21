import { changePct } from '@/composables/useDerived'
import { BREAK_AFTER_2025, LATEST_YEAR_2025, PREVIOUS_YEAR_2025, YEARS_2025, getSeries2025 } from '@/data/api'
import type { Commodity2025, Metric, YearKey2025 } from '@/data/types'
import { flaggedYearsFor } from '@/content/flags-2025'
import { OTHER_PRODUCTS_2025 } from '@/content/groups'

export type RowMetric = 'luas' | 'produksi' | 'petani'

export interface CommodityRow2025 {
  commodity: Commodity2025
  group: 'tanaman' | 'produkLain'
  /** undefined = komoditas tidak punya seri ini di dokumen; null = sel kosong di dokumen */
  luas?: number | null
  produksi?: number | null
  petani?: number | null
  operator?: number | null
  /** Perubahan metrik terpilih dari 2023 ke 2024 (%); null bila tidak terdefinisi */
  change: number | null
  /** Seri metrik terpilih untuk sparkline; kosong bila ada tahun yang kosong */
  spark: number[]
  flags: Record<Metric, boolean>
}

export const BREAK_INDEX_2025 = YEARS_2025.indexOf(BREAK_AFTER_2025)

/** Baris ringkas per komoditas untuk satu tahun. Semua angka dari JSON; yang dihitung hanya perubahan 2023-2024. */
export function buildRows2025(commodities: Commodity2025[], year: YearKey2025, metric: RowMetric): CommodityRow2025[] {
  const years = [...YEARS_2025]
  return commodities.map((c) => {
    const get = (m: Metric): number | null | undefined => getSeries2025(c, m)?.values[year]
    const flag = (m: Metric): boolean => {
      const s = getSeries2025(c, m)
      return !!s && flaggedYearsFor(c.id, m, s.values, years).includes(year)
    }
    const sel = getSeries2025(c, metric)
    const a = sel?.values[PREVIOUS_YEAR_2025]
    const b = sel?.values[LATEST_YEAR_2025]
    const values = sel ? years.map((y) => sel.values[y]) : []
    return {
      commodity: c,
      group: OTHER_PRODUCTS_2025.includes(c.id) ? 'produkLain' : 'tanaman',
      luas: get('luas'),
      produksi: get('produksi'),
      petani: get('petani'),
      operator: get('operator'),
      change: a !== undefined && a !== null && b !== undefined && b !== null ? changePct(a, b) : null,
      spark: values.every((v) => v !== null) ? (values as number[]) : [],
      flags: { luas: flag('luas'), produksi: flag('produksi'), petani: flag('petani'), operator: flag('operator') },
    }
  })
}
