import type { Feature, FeatureCollection, Geometry, Position } from 'geojson'
import { GEO_TO_SPOI } from '@/data/provinceMap'

/** Kotak Indonesia (bujur 94,5 sampai 141,5; lintang 6,5 sampai -11,5) dipetakan ke viewBox 1000 x 383. */
export const GEO_VIEWBOX = { width: 1000, height: 383 }
const LON0 = 94.5
const LAT0 = 6.5
const SCALE = 1000 / 47

export interface ProvincePath {
  /** Nama provinsi seperti di data SPOI */
  name: string
  d: string
}

function ring(coords: Position[]): string {
  return (
    coords
      .map((p, i) => {
        const x = ((p[0] ?? 0) - LON0) * SCALE
        const y = (LAT0 - (p[1] ?? 0)) * SCALE
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join('') + 'Z'
  )
}

function geometryPath(g: Geometry): string {
  if (g.type === 'Polygon') return g.coordinates.map(ring).join('')
  if (g.type === 'MultiPolygon') return g.coordinates.map((poly) => poly.map(ring).join('')).join('')
  return ''
}

/** Siluet provinsi untuk SVG ringan (proyeksi sederhana, cukup untuk ilustrasi nasional). */
export function geoToPaths(fc: FeatureCollection): ProvincePath[] {
  return fc.features.flatMap((f: Feature) => {
    const raw = f.properties?.PROVINSI as string | undefined
    const name = raw ? GEO_TO_SPOI[raw] : undefined
    return name ? [{ name, d: geometryPath(f.geometry) }] : []
  })
}
