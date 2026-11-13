export type YearKey = '2019' | '2020' | '2021' | '2022'
export type Metric = 'luas' | 'produksi' | 'petani' | 'operator'
export type CommodityGroup = 'utama' | 'lainnya' | 'pasar'

export interface SeriesData {
  unit: string
  values: Record<YearKey, number>
  /** Rujukan halaman dan gambar/tabel di buku SPOI 2023 */
  source: string
  /** Nomor butir di docs/data-issues.md */
  issues?: number[]
}

export interface Commodity {
  id: string
  name: string
  group: CommodityGroup
  metrics: Partial<Record<Metric, SeriesData>>
}

export interface NationalData {
  edition: string
  years: number[]
  commodities: Commodity[]
}

export interface Meta {
  edition: string
  title: string
  publisher: string
  printer: string
  published: string
  dataYears: { from: number; to: number }
  collection: { period: string; certifiers: number; pgs: number }
  source: string
}

export type ProvinceMetric = 'luas' | 'produksi' | 'produsen'

export interface ProvinceSeries {
  unit: string
  /** tahun -> provinsi -> nilai. null = sel kosong di tabel asli ("Tidak ada data"), bukan 0 */
  values: Record<YearKey, Record<string, number | null>>
}

export interface ProvinceTable {
  id: string
  tabel: number
  source: string
  metrics: Partial<Record<ProvinceMetric, ProvinceSeries>>
}

export interface ProvinceData {
  edition: string
  years: number[]
  provinces: string[]
  tables: ProvinceTable[]
}

export interface PgsFigure {
  key: string
  label: string
  value: number
  unit: string
}

export interface PgsSystem {
  id: string
  name: string
  source: string
  figures: PgsFigure[]
}

export interface PgsData {
  source: string
  systems: PgsSystem[]
}

export interface ResearchRow {
  topic: string
  values: Record<string, number>
}

export interface ResearchData {
  title: string
  unit: string
  note: string
  snapshots: string[]
  rows: ResearchRow[]
  totalArticles: Record<string, number>
  garudaTotalApprox: Record<string, number>
  source: string
}
