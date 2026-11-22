export type YearKey = '2019' | '2020' | '2021' | '2022'
export type Metric = 'luas' | 'produksi' | 'petani' | 'operator' | 'produktivitas'
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

// ---------------------------------------------------------------------------
// SPOI 2025 (Draft V13). Berdiri sendiri: tidak dipakai bersama tipe 2023.
// ---------------------------------------------------------------------------

export type YearKey2025 = '2019' | '2020' | '2021' | '2022' | '2023' | '2024'

export interface SeriesData2025 {
  unit: string
  /** null = kosong di dokumen (bukan 0) */
  values: Record<YearKey2025, number | null>
  /** Rujukan bab dan nomor grafik di draf V13 */
  source: string
  /** Nomor butir di docs/data-issues-2025.md */
  issues?: number[]
  note?: string
}

export interface Commodity2025 {
  id: string
  name: string
  metrics: Partial<Record<Metric, SeriesData2025>>
}

export interface NationalData2025 {
  edition: string
  years: number[]
  commodities: Commodity2025[]
}

// --- Data Excel AOI (rekap per provinsi): sumber angka komoditas dan provinsi edisi 2025 ---

export type ProvinceMetric2025 = 'luas' | 'produksi' | 'produsen'

/** Nilai per provinsi per tahun; null = tidak ada yang melapor (0 atau kosong di Excel). */
export interface CommodityProvinceMetric2025 {
  unit: string
  national: Record<YearKey2025, number | null>
  byProvince: Record<string, Record<YearKey2025, number | null>>
  source: string
}

export interface CommodityProvinces2025 {
  id: string
  name: string
  sheet: string
  note?: string
  metrics: Record<ProvinceMetric2025, CommodityProvinceMetric2025>
}

export interface CommodityProvincesData2025 {
  edition: string
  years: number[]
  note: string
  commodities: CommodityProvinces2025[]
}

export interface GenderCount2025 {
  lakiLaki: number | null
  perempuan: number | null
  total: number | null
}

export interface ProvinceRow2025 {
  name: string
  luas: Record<'2023' | '2024', number | null>
  produsen: Record<'2023' | '2024', GenderCount2025>
  sertifikasi2024: { konversi: number | null; pgs: number | null; selfDeclare: number | null }
}

export interface ProvincesData2025 {
  edition: string
  years: number[]
  note: string
  sources: { luas: string; produsen: string; sertifikasi2024: string }
  national: Record<'2023' | '2024', { luas: number | null } & GenderCount2025>
  /** Deret nasional 2019-2024. luas = kolom "(real)" untuk 2023-2024; luasAlt = kolom tanpa keterangan di sheet AOI. */
  nationalSeries: Record<'luas' | 'luasAlt' | 'produsen', Record<YearKey2025, number | null>>
  provinces: ProvinceRow2025[]
}

export interface Meta2025 {
  edition: string
  title: string
  status: string
  publisher: string
  published: string
  dataYears: { from: number; to: number }
  collectionNote: string
  externalSource: string
  sourceFile: string
  coverage: { kabupatenKotaTotal: number; respondents: number }
  issuesDoc: string
}

export interface CoverageRow {
  name: string
  lengkap: number
  tidakLengkap: number
  tidakAda: number
}

export interface CoverageTotals {
  lengkap: number
  tidakLengkap: number
  tidakAda: number
}

export interface CoverageData {
  edition: string
  kabupatenKota: {
    unit: string
    source: string
    regions: CoverageRow[]
    total: CoverageTotals
    reportedPercent: CoverageTotals
  }
  lembaga: {
    unit: string
    source: string
    rows: CoverageRow[]
    total: CoverageTotals
    reportedPercent: CoverageTotals
  }
}

export interface MapImage2025 {
  year: number
  file: string
}

export interface MapItem2025 {
  commodity: string
  gambar: number
  /** Keterangan gambar di dokumen (apa adanya) */
  caption: string
  metricInImage: 'produksi'
  unitInImage: 'ton'
  issues: number[]
  images: MapImage2025[]
}

export interface MapsData2025 {
  edition: string
  source: string
  note: string
  national: { gambar: number; title: string; year: number; file: string }
  items: MapItem2025[]
}

export type SurveyKind2025 = 'single' | 'multi' | 'scale'

export interface SurveyChart2025 {
  id: string
  grafik: number
  title: string
  kind: SurveyKind2025
  unit: string
  /** null = penyebut tidak dinyatakan di dokumen */
  respondents: number | null
  source: string
  categories: string[]
  /** single/multi: proporsi (0-1) per kategori. scale: proporsi per tingkat, lalu per kategori */
  values: number[] | Record<string, number[]>
  /** hanya untuk scale: urutan tingkat dari paling negatif ke paling positif */
  levels?: string[]
  note?: string
}

export interface SurveyData2025 {
  edition: string
  respondents: number
  note: string
  charts: SurveyChart2025[]
}

export interface PgsSystem2025 {
  id: string
  name: string
  source: string
  issues: number[]
  summary: string
  figures: PgsFigure[]
  note?: string
}

export interface PgsData2025 {
  edition: string
  source: string
  mergerNote: string
  systems: PgsSystem2025[]
  totalFarmersReported: { value: number; unit: string; sum: number }
}

export interface PolicyRow2025 {
  period: string
  stage: string
  instrument: string
  substance: string
}

export interface PolicyData2025 {
  edition: string
  source: string
  rows: PolicyRow2025[]
}

export interface CommunityRow2025 {
  name: string
  base: string
  role: string
}

export interface CommunitiesData2025 {
  edition: string
  source: string
  rows: CommunityRow2025[]
}

export interface ResearchData2025 {
  edition: string
  title: string
  unit: string
  snapshots: string[]
  note: string
  issues: number[]
  rows: ResearchRow[]
  /** Total yang tertulis di dokumen */
  totalReported: Record<string, number>
  /** Jumlah topik, dihitung ulang */
  totalSummed: Record<string, number>
  garudaTotalApprox: Record<string, number>
  source: string
}

export interface AreaByRegion2025 {
  edition: string
  year: number
  unit: string
  source: string
  note: string
  issues: number[]
  regions: { name: string; luas2024: number | null }[]
  totalReported: number | null
  totalSummed: number
}
