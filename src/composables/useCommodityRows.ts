import { FIRST_YEAR, getSeries } from '@/data/api'
import type { Commodity, YearKey } from '@/data/types'
import { changePct, productivity } from '@/composables/useDerived'
import { findFlag } from '@/content/flags'

export interface CommodityRow {
  commodity: Commodity
  luas?: number
  produksi?: number
  petani?: number
  operator?: number
  /** Perubahan luas (%) dari tahun pertama ke tahun terpilih; null bila tidak terdefinisi */
  change: number | null
  productivity: number | null
  flags: { luas: boolean; produksi: boolean; petani: boolean }
}

/** Baris ringkas per komoditas untuk satu tahun. Semua angka berasal dari JSON; yang dihitung hanya perubahan dan produktivitas. */
export function buildRows(commodities: Commodity[], year: YearKey): CommodityRow[] {
  return commodities.map((c) => {
    const luas = getSeries(c, 'luas')
    const produksi = getSeries(c, 'produksi')
    const petani = getSeries(c, 'petani')
    const operator = getSeries(c, 'operator')
    const luasNow = luas?.values[year]
    const luasFirst = luas?.values[FIRST_YEAR]
    return {
      commodity: c,
      luas: luasNow,
      produksi: produksi?.values[year],
      petani: petani?.values[year],
      operator: operator?.values[year],
      change:
        year !== FIRST_YEAR && luasNow !== undefined && luasFirst !== undefined
          ? changePct(luasFirst, luasNow)
          : null,
      productivity: productivity(produksi?.values[year], petani?.values[year]),
      flags: {
        luas: !!findFlag(c.id, 'luas', year),
        produksi: !!findFlag(c.id, 'produksi', year),
        petani: !!findFlag(c.id, 'petani', year),
      },
    }
  })
}
