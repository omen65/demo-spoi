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

/** SPOI 2025: "SPOI 2025 (Draft V13), Bab 3.2.1, Grafik 2" digabung menjadi "SPOI 2025 (Draft V13), Grafik 2, 4, 6". */
export function combineSources2025(sources: string[]): string {
  // Sumber Excel AOI: "<berkas>, sheet 'X', kolom Y" -> "<berkas>, sheet X, Y, Z"
  const excel = sources.map((s) => /^(.*?), sheet '(.+?)', kolom/.exec(s))
  if (excel.length > 0 && excel.every((m) => m)) {
    const file = excel[0]![1]
    const sheets = [...new Set(excel.map((m) => m![2]))]
    return `${file}, sheet ${sheets.join(', ')}`
  }
  const edition = sources.map((s) => /^(.*?), Bab /.exec(s)?.[1]).find((e) => e)
  const numbers = sources.flatMap((s) => {
    const m = /Grafik (\d+)/.exec(s)
    return m ? [Number(m[1])] : []
  })
  if (!edition || numbers.length === 0) return sources.join('; ')
  return `${edition}, Grafik ${[...new Set(numbers)].sort((a, b) => a - b).join(', ')}`
}
