/**
 * Menggabungkan beberapa `source` ("SPOI 2023, hlm. 19, Gambar 15") menjadi satu keterangan sumber
 * untuk chart yang memakai banyak deret: "SPOI 2023: hlm. 19 (Gambar 15); hlm. 21 (Gambar 18); ...".
 */
export function combineSources(sources: string[]): string {
  const parsed = sources.map((s) => /^(.*?), (hlm\. [\d-]+), (.+)$/.exec(s))
  const edition = parsed.find((m) => m)?.[1]
  const parts = parsed.flatMap((m) => (m ? [`${m[2]} (${m[3]})`] : []))
  if (!edition || parts.length === 0) return sources.join('; ')
  return `${edition}: ${parts.join('; ')}`
}
