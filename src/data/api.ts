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
import national2025Raw from './spoi-2025/national.json'
import meta2025Raw from './spoi-2025/meta.json'
import coverage2025Raw from './spoi-2025/coverage.json'
import maps2025Raw from './spoi-2025/maps.json'
import survey2025Raw from './spoi-2025/survey.json'
import pgs2025Raw from './spoi-2025/pgs.json'
import policy2025Raw from './spoi-2025/policy.json'
import communities2025Raw from './spoi-2025/communities.json'
import research2025Raw from './spoi-2025/research.json'
import areaByRegion2025Raw from './spoi-2025/area-by-region.json'
import geoUrl from '@/assets/geo/indonesia-38-provinces.geojson?url'
import type { FeatureCollection } from 'geojson'
import type {
  Commodity,
  Commodity2025,
  CommodityGroup,
  CoverageData,
  MapsData2025,
  AreaByRegion2025,
  CommunitiesData2025,
  PgsData2025,
  PolicyData2025,
  ResearchData2025,
  SurveyChart2025,
  SurveyData2025,
  Meta2025,
  NationalData2025,
  SeriesData2025,
  YearKey2025,
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

// ---------------------------------------------------------------------------
// SPOI 2025 (Draft V13). Edisi terpisah: tidak ada fungsi yang mengambil dua edisi sekaligus.
// ---------------------------------------------------------------------------

const national2025 = national2025Raw as unknown as NationalData2025
const meta2025 = meta2025Raw as unknown as Meta2025
const coverage2025 = coverage2025Raw as unknown as CoverageData

export const YEARS_2025: readonly YearKey2025[] = ['2019', '2020', '2021', '2022', '2023', '2024']
export const LATEST_YEAR_2025: YearKey2025 = '2024'
export const PREVIOUS_YEAR_2025: YearKey2025 = '2023'
/** Tahun terakhir sebelum patahan data (metodologi: pengumpulan dibatasi pada 2023-2024). */
export const BREAK_AFTER_2025: YearKey2025 = '2022'

export function getMeta2025(): Meta2025 {
  return meta2025
}

export function getCommodities2025(): Commodity2025[] {
  return [...national2025.commodities]
}

export function getCommodity2025(id: string): Commodity2025 | undefined {
  return national2025.commodities.find((c) => c.id === id)
}

export function getSeries2025(commodity: Commodity2025, metric: Metric): SeriesData2025 | undefined {
  return commodity.metrics[metric]
}

/** Kelengkapan data: 7 wilayah x 3 status (Tabel 1) dan lembaga/mitra (Tabel 2). */
export function getCoverage2025(): CoverageData {
  return coverage2025
}

const maps2025 = maps2025Raw as unknown as MapsData2025
const mapUrls = import.meta.glob('../assets/spoi-2025/maps/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>

export interface MapView2025 {
  gambar: number
  caption: string
  source: string
  images: { year: number; url: string }[]
  /** Keterangan di dokumen menyebut luas, padahal judul dan skala peta adalah produksi (ton). */
  captionMismatch: boolean
}

/** Peta sebaran provinsi dari dokumen (gambar statis, tanpa angka) untuk satu komoditas; undefined bila tidak ada. */
export function getMap2025(commodityId: string): MapView2025 | undefined {
  const item = maps2025.items.find((m) => m.commodity === commodityId)
  if (!item) return undefined
  return {
    gambar: item.gambar,
    caption: item.caption,
    source: `SPOI 2025, Bab 3, Gambar ${item.gambar}`,
    images: item.images.flatMap((i) => {
      const url = mapUrls[`../assets/spoi-2025/maps/${i.file}`]
      return url ? [{ year: i.year, url }] : []
    }),
    captionMismatch: /luas/i.test(item.caption),
  }
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

const areaByRegion2025 = areaByRegion2025Raw as unknown as AreaByRegion2025

/** Tabel 3: luas lahan per wilayah pulau, hanya 2024 (kolom 2020 dan 2023 kosong di dokumen). */
export function getAreaByRegion2025(): AreaByRegion2025 {
  return areaByRegion2025
}

/** Peta nasional dari dokumen (Gambar 1): gambar statis, tanpa angka. */
export function getNationalMap2025(): { url: string; title: string; year: number; source: string } | undefined {
  const url = mapUrls['../assets/spoi-2025/maps/' + maps2025.national.file]
  return url
    ? { url, title: maps2025.national.title, year: maps2025.national.year, source: `SPOI 2025, Bab 3, Gambar ${maps2025.national.gambar}` }
    : undefined
}
