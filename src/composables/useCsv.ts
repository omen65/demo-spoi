function escapeCell(value: string | number): string {
  const s = String(value)
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** CSV dengan BOM UTF-8 supaya terbuka benar di Excel. Angka ditulis dengan titik desimal. */
export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers, ...rows].map((r) => r.map(escapeCell).join(','))
  return '﻿' + lines.join('\r\n')
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const blob = new Blob([toCsv(headers, rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
