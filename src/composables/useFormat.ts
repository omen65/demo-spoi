const number = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 })
const percent = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 })
const compact = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1, notation: 'compact' })

/** Angka lengkap, format id-ID (titik ribuan, koma desimal). */
export function formatNumber(value: number): string {
  return number.format(value)
}

/** Angka ringkas untuk sumbu chart (mis. 31,8 rb). */
export function formatCompact(value: number): string {
  return compact.format(value)
}

export function formatPercent(value: number): string {
  return `${percent.format(Math.abs(value))}%`
}

export function formatValueUnit(value: number, unit: string): string {
  return `${formatNumber(value)} ${unit}`
}
