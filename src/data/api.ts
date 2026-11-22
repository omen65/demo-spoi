/**
 * Satu-satunya pintu akses data. Komponen dan halaman tidak boleh membaca JSON langsung.
 * Nanti sumber bisa diganti ke API platform asli tanpa menulis ulang halaman,
 * dan edisi SPOI berikutnya cukup ditambahkan sebagai folder data baru.
 *
 * Edisi aktif: SPOI 2025.
 *  - Komoditas dan provinsi: Excel AOI (scripts/extract_xlsx_2025.py).
 *  - Konsumen, ekosistem, riset, kelengkapan data: draf V13 (scripts/extract_docx_2025.py).
 */
import commodityProvincesRaw from './spoi-2025/commodity-provinces.json'
import provincesRaw from './spoi-2025/provinces-2025.json'
import meta2025Raw from './spoi-2025/meta.json'
import coverage2025Raw from './spoi-2025/coverage.json'
import survey2025Raw from './spoi-2025/survey.json'
import pgs2025Raw from './spoi-2025/pgs.json'
import policy2025Raw from './spoi-2025/policy.json'
import communities2025Raw from './spoi-2025/communities.json'
import research2025Raw from './spoi-2025/research.json'
import geoUrl from '@/assets/geo/indonesia-38-provinces.geojson?url'
import type { FeatureCollection } from 'geojson'
import type {
  Commodity2025,
  CommodityProvinces2025,
  CommodityProvincesData2025,
  CommunitiesData2025,
  CoverageData,
  Meta2025,
  Metric,
  PgsData2025,
  PolicyData2025,
  ProvinceMetric2025,
  ProvinceRow2025,
  ProvincesData2025,
  ResearchData2025,
  SeriesData2025,
  SurveyChart2025,
  SurveyData2025,
  YearKey2025,
} from './types'

const commodityProvinces = commodityProvincesRaw as unknown as CommodityProvincesData2025
const provinces = provincesRaw as unknown as ProvincesData2025
const meta2025 = meta2025Raw as unknown as Meta2025
const coverage2025 = coverage2025Raw as unknown as CoverageData

export const YEARS_2025: readonly YearKey2025[] = ['2019', '2020', '2021', '2022', '2023', '2024']
export const LATEST_YEAR_2025: YearKey2025 = '2024'
export const PREVIOUS_YEAR_2025: YearKey2025 = '2023'
/** Tahun terakhir sebelum patahan data (pendataan 2023-2024 berbeda cakupannya dari 2019-2022). */
export const BREAK_AFTER_2025: YearKey2025 = '2022'

export function getMeta2025(): Meta2025 {
  return meta2025
}

// ---------------------------------------------------------------------------
// Komoditas (nasional) dan sebaran provinsi, dari Excel AOI
// ---------------------------------------------------------------------------

/** Satuan komoditas dalam bentuk metrik lama ('petani' = jumlah produsen) agar tampilan ringkasan bisa dipakai bersama. */
const METRIC_MAP: readonly (readonly [Metric, ProvinceMetric2025])[] = [
  ['luas', 'luas'],
  ['produksi', 'produksi'],
  ['petani', 'produsen'],
]

/** Produktivitas hanya dihitung untuk 2023-2024: seri 2019-2022 punya produksi yang tidak sejalan dengan luasnya (mis. aren 60 ton/ha). */
const PRODUCTIVITY_YEARS: readonly YearKey2025[] = ['2023', '2024']

/** Produktivitas nasional (ton/ha) = jumlah produksi / jumlah luas, hanya dari provinsi yang punya keduanya. */
function productivity(c: CommodityProvinces2025): SeriesData2025 | undefined {
  const values = Object.fromEntries(YEARS_2025.map((y) => [y, null])) as Record<YearKey2025, number | null>
  let any = false
  for (const y of PRODUCTIVITY_YEARS) {
    let luas = 0
    let produksi = 0
    for (const [prov, byYear] of Object.entries(c.metrics.luas.byProvince)) {
      const l = byYear[y]
      const p = c.metrics.produksi.byProvince[prov]?.[y]
      if (l && p) {
        luas += l
        produksi += p
      }
    }
    if (luas > 0) {
      values[y] = Number((produksi / luas).toFixed(3))
      any = true
    }
  }
  if (!any) return undefined
  return {
    unit: 'ton/ha',
    values,
    source: `Dihitung dari produksi dan luas lahan (${c.metrics.luas.source.split(', kolom')[0]})`,
  }
}

function toCommodity(c: CommodityProvinces2025): Commodity2025 {
  const metrics: Partial<Record<Metric, SeriesData2025>> = {}
  for (const [metric, key] of METRIC_MAP) {
    const m = c.metrics[key]
    // Komoditas tanpa satu pun laporan pada metrik ini tidak punya seri (bukan deret nol)
    if (Object.values(m.national).every((v) => v === null)) continue
    // Produk olahan dan pemasar melaporkan jumlah operator, bukan petani
    const target: Metric = metric === 'petani' && m.unit === 'operator' ? 'operator' : metric
    metrics[target] = { unit: m.unit, values: m.national, source: m.source, ...(c.note ? { note: c.note } : {}) }
  }
  const yield_ = productivity(c)
  if (yield_) metrics.produktivitas = yield_
  return { id: c.id, name: c.name, metrics }
}

const commodities2025: Commodity2025[] = commodityProvinces.commodities.map(toCommodity)

export function getCommodities2025(): Commodity2025[] {
  return [...commodities2025]
}

export function getCommodity2025(id: string): Commodity2025 | undefined {
  return commodities2025.find((c) => c.id === id)
}

export function getSeries2025(commodity: Commodity2025, metric: Metric): SeriesData2025 | undefined {
  return commodity.metrics[metric]
}

export function getCommodityNote2025(id: string): string | undefined {
  return commodityProvinces.commodities.find((c) => c.id === id)?.note
}

export interface ProvinceValue2025 {
  name: string
  value: number | null
}

/** Nilai per provinsi (null = tidak ada yang melapor) untuk satu komoditas, metrik, dan tahun. */
export function getProvinceValues2025(commodityId: string, metric: ProvinceMetric2025, year: YearKey2025): Record<string, number | null> {
  const m = commodityProvinces.commodities.find((c) => c.id === commodityId)?.metrics[metric]
  if (!m) return {}
  return Object.fromEntries(Object.entries(m.byProvince).map(([name, byYear]) => [name, byYear[year]]))
}

export function getProvinceSource2025(commodityId: string, metric: ProvinceMetric2025): string {
  return commodityProvinces.commodities.find((c) => c.id === commodityId)?.metrics[metric]?.source ?? ''
}

export interface ProvinceProfileRow2025 {
  id: string
  name: string
  luas: number | null
  produksi: number | null
  produsen: number | null
}

/** Komoditas yang dilaporkan satu provinsi pada satu tahun (minimal satu metrik terisi), diurutkan menurut luas. */
export function getProvinceProfile2025(province: string, year: YearKey2025): ProvinceProfileRow2025[] {
  const rows = commodityProvinces.commodities.map((c) => ({
    id: c.id,
    name: c.name,
    luas: c.metrics.luas.byProvince[province]?.[year] ?? null,
    produksi: c.metrics.produksi.byProvince[province]?.[year] ?? null,
    produsen: c.metrics.produsen.byProvince[province]?.[year] ?? null,
  }))
  return rows
    .filter((r) => r.luas !== null || r.produksi !== null || r.produsen !== null)
    .sort((a, b) => (b.luas ?? -1) - (a.luas ?? -1) || (b.produksi ?? -1) - (a.produksi ?? -1))
}

/** Jumlah provinsi yang melapor (nilai > 0) untuk satu metrik komoditas pada satu tahun. */
export function countReportingProvinces2025(commodityId: string, metric: ProvinceMetric2025, year: YearKey2025): number {
  return Object.values(getProvinceValues2025(commodityId, metric, year)).filter((v) => v !== null).length
}

// ---------------------------------------------------------------------------
// Provinsi: luas total, produsen menurut gender, sertifikasi (Excel AOI, 2023-2024)
// ---------------------------------------------------------------------------

export type ProvinceYear2025 = '2023' | '2024'

export function getProvinces2025(): ProvincesData2025 {
  return provinces
}

/** Deret nasional 2019-2024: total luas lahan organik dan total produsen (jumlah 38 provinsi). */
export function getNationalSeries2025(): ProvincesData2025['nationalSeries'] {
  return provinces.nationalSeries
}

export function getProvinceRow2025(name: string): ProvinceRow2025 | undefined {
  return provinces.provinces.find((p) => p.name === name)
}

export function getProvinceNames2025(): string[] {
  return provinces.provinces.map((p) => p.name)
}

/** Batas provinsi (GeoJSON, 38 provinsi). Dimuat saat dibutuhkan agar tidak membebani halaman lain. */
export async function loadProvinceGeo(): Promise<FeatureCollection> {
  const res = await fetch(geoUrl)
  if (!res.ok) throw new Error(`Gagal memuat batas provinsi (${res.status})`)
  return (await res.json()) as FeatureCollection
}

// ---------------------------------------------------------------------------
// Bagian dari draf V13 (tidak ada di Excel)
// ---------------------------------------------------------------------------

/** Kelengkapan data: 7 wilayah x 3 status (Tabel 1) dan lembaga/mitra (Tabel 2). */
export function getCoverage2025(): CoverageData {
  return coverage2025
}

const survey2025 = survey2025Raw as unknown as SurveyData2025

/** Survei konsumen (Bab 8): jumlah responden dan 20 grafik persentase. */
export function getSurvey2025(): SurveyData2025 {
  return survey2025
}

export function getSurveyChart2025(id: string): SurveyChart2025 | undefined {
  return survey2025.charts.find((c) => c.id === id)
}

const pgs2025 = pgs2025Raw as unknown as PgsData2025
const policy2025 = policy2025Raw as unknown as PolicyData2025
const communities2025 = communities2025Raw as unknown as CommunitiesData2025
const research2025 = research2025Raw as unknown as ResearchData2025

/** Sistem penjaminan partisipatif (Bab 9): satu potret, bukan deret tahunan. */
export function getPgs2025(): PgsData2025 {
  return pgs2025
}

/** Linimasa kebijakan pertanian organik nasional (Bab 10). */
export function getPolicy2025(): PolicyData2025 {
  return policy2025
}

/** Komunitas dan jaringan konsumen organik (Bab 12). */
export function getCommunities2025(): CommunitiesData2025 {
  return communities2025
}

/** Tabel 4 (riset): empat potret waktu (2015, 2020, 2023, 2024), bukan deret tahunan. */
export function getResearch2025(): ResearchData2025 {
  return research2025
}
