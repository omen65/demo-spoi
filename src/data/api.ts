/**
 * Satu-satunya pintu akses data. Komponen dan halaman tidak boleh membaca JSON langsung.
 * Nanti sumber bisa diganti ke API platform asli tanpa menulis ulang halaman,
 * dan edisi SPOI berikutnya cukup ditambahkan sebagai folder data baru.
 */
import nationalRaw from './spoi-2023/national.json'
import metaRaw from './spoi-2023/meta.json'
import pgsRaw from './spoi-2023/pgs.json'
import researchRaw from './spoi-2023/research.json'
import provincesRaw from './spoi-2023/provinces.json'
import geoUrl from '@/assets/geo/indonesia-38-provinces.geojson?url'
import type { FeatureCollection } from 'geojson'
import type {
  Commodity,
  CommodityGroup,
  Meta,
  Metric,
  NationalData,
  PgsData,
  PgsSystem,
  ResearchData,
  ProvinceData,
  ProvinceTable,
  SeriesData,
  YearKey,
} from './types'

const national = nationalRaw as unknown as NationalData
const meta = metaRaw as unknown as Meta
const pgs = pgsRaw as unknown as PgsData
const research = researchRaw as unknown as ResearchData
const provinces = provincesRaw as unknown as ProvinceData

export const YEARS: readonly YearKey[] = ['2019', '2020', '2021', '2022']
export const LATEST_YEAR: YearKey = '2022'
export const FIRST_YEAR: YearKey = '2019'

/** Sistem penjaminan komunitas (PAMOR, ROLEs): satu potret, bukan deret tahunan. */
export function getPgsSystems(): PgsSystem[] {
  return [...pgs.systems]
}

/** Tabel 1 (riset): tiga potret waktu (2015, 2020, 2023), bukan deret tahunan. */
export function getResearch(): ResearchData {
  return research
}

export function getMeta(): Meta {
  return meta
}

export function getCommodities(group?: CommodityGroup): Commodity[] {
  return group ? national.commodities.filter((c) => c.group === group) : [...national.commodities]
}

export function getCommodity(id: string): Commodity | undefined {
  return national.commodities.find((c) => c.id === id)
}

export function getSeries(commodity: Commodity, metric: Metric): SeriesData | undefined {
  return commodity.metrics[metric]
}

/** Tabel sebaran provinsi (SPOI 2023, Bab 8) untuk satu komoditas; undefined bila bukan salah satu dari 13 tabel. */
export function getProvinceTable(id: string): ProvinceTable | undefined {
  return provinces.tables.find((t) => t.id === id)
}

export function getProvinceNames(): string[] {
  return [...provinces.provinces]
}

export function getProvinceTableIds(): string[] {
  return provinces.tables.map((t) => t.id)
}

/** Batas provinsi (GeoJSON, 38 provinsi). Dimuat saat dibutuhkan agar tidak membebani halaman lain. */
export async function loadProvinceGeo(): Promise<FeatureCollection> {
  const res = await fetch(geoUrl)
  if (!res.ok) throw new Error(`Gagal memuat batas provinsi (${res.status})`)
  return (await res.json()) as FeatureCollection
}

export interface ProvinceProfileRow {
  id: string
  name: string
  /** undefined = komoditas ini tidak punya metrik tsb di buku; null = sel kosong di tabel */
  luas: number | null | undefined
  produksi: number | null | undefined
  produsen: number | null | undefined
}

/** Seluruh komoditas (13 tabel) untuk satu provinsi pada satu tahun, diurutkan menurut luas lalu produksi. */
export function getProvinceProfile(province: string, year: YearKey): ProvinceProfileRow[] {
  const rows = provinces.tables.map((t) => ({
    id: t.id,
    name: getCommodity(t.id)?.name ?? t.id,
    luas: t.metrics.luas?.values[year][province],
    produksi: t.metrics.produksi?.values[year][province],
    produsen: t.metrics.produsen?.values[year][province],
  }))
  const key = (v: number | null | undefined): number => (v === null || v === undefined ? -1 : v)
  return rows.sort((a, b) => key(b.luas) - key(a.luas) || key(b.produksi) - key(a.produksi))
}
