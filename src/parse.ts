import { CSS_COLORS } from './constants'
import type { RGBA } from './types'

function hexToRgba(hex: string): RGBA {
  const clean = hex.replace(/^#/, '')
  let r: number, g: number, b: number, a = 1

  if (clean.length === 3 || clean.length === 4) {
    r = parseInt(clean[0] + clean[0], 16)
    g = parseInt(clean[1] + clean[1], 16)
    b = parseInt(clean[2] + clean[2], 16)
    if (clean.length === 4) a = parseInt(clean[3] + clean[3], 16) / 255
  } else if (clean.length === 6 || clean.length === 8) {
    r = parseInt(clean.slice(0, 2), 16)
    g = parseInt(clean.slice(2, 4), 16)
    b = parseInt(clean.slice(4, 6), 16)
    if (clean.length === 8) a = parseInt(clean.slice(6, 8), 16) / 255
  } else {
    throw new Error(`Invalid hex: ${hex}`)
  }

  return { r, g, b, a }
}

function parseRgb(str: string): RGBA {
  const match = str.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/)
  if (!match) throw new Error(`Invalid rgb: ${str}`)
  return {
    r: clampChannel(+match[1]),
    g: clampChannel(+match[2]),
    b: clampChannel(+match[3]),
    a: match[4] !== undefined ? clampAlpha(+match[4]) : 1,
  }
}

function parseHsl(str: string): RGBA {
  const match = str.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+))?\s*\)$/)
  if (!match) throw new Error(`Invalid hsl: ${str}`)
  const h = +match[1], s = +match[2] / 100, l = +match[3] / 100
  const a = match[4] !== undefined ? clampAlpha(+match[4]) : 1
  return { ...hslToRgb(h, s, l), a }
}

function parseHwb(str: string): RGBA {
  const match = str.match(/^hwb\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*(?:\/\s*([\d.]+))?\s*\)$/)
  if (!match) throw new Error(`Invalid hwb: ${str}`)
  const h = +match[1], w = +match[2] / 100, bk = +match[3] / 100
  const a = match[4] !== undefined ? clampAlpha(+match[4]) : 1
  const total = w + bk
  const wn = total > 1 ? w / total : w
  const bn = total > 1 ? bk / total : bk
  const { r, g, b } = hslToRgb(h, 1, 0.5)
  return {
    r: Math.round(r * (1 - wn - bn) + wn * 255),
    g: Math.round(g * (1 - wn - bn) + wn * 255),
    b: Math.round(b * (1 - wn - bn) + wn * 255),
    a,
  }
}

function parseOklch(str: string): RGBA {
  const match = str.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\s*\)$/)
  if (!match) throw new Error(`Invalid oklch: ${str}`)
  const L = +match[1], C = +match[2], H = +match[3]
  const a = match[4] !== undefined ? clampAlpha(+match[4]) : 1
  const hRad = (H * Math.PI) / 180
  const lab_a = C * Math.cos(hRad)
  const lab_b = C * Math.sin(hRad)

  const l_ = L + 0.3963377774 * lab_a + 0.2158037573 * lab_b
  const m_ = L - 0.1055613458 * lab_a - 0.0638541728 * lab_b
  const s_ = L - 0.0894841775 * lab_a - 1.2914855480 * lab_b

  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  const r = +( 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)
  const g = +(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)
  const b = +(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)

  const toSrgb = (x: number) => {
    const clamped = Math.max(0, Math.min(1, x))
    return Math.round((clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055) * 255)
  }

  return { r: toSrgb(r), g: toSrgb(g), b: toSrgb(b), a }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0

  if (h < 60)       { r = c; g = x }
  else if (h < 120) { r = x; g = c }
  else if (h < 180) { g = c; b = x }
  else if (h < 240) { g = x; b = c }
  else if (h < 300) { r = x; b = c }
  else              { r = c; b = x }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

function clampChannel(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)))
}

function clampAlpha(v: number): number {
  return Math.max(0, Math.min(1, v))
}

export function parseColor(input: string): RGBA {
  const str = input.trim().toLowerCase()

  if (str in CSS_COLORS) return hexToRgba(CSS_COLORS[str])
  if (str.startsWith('#')) return hexToRgba(str)
  if (str.startsWith('rgb')) return parseRgb(str)
  if (str.startsWith('hsl')) return parseHsl(str)
  if (str.startsWith('hwb')) return parseHwb(str)
  if (str.startsWith('oklch')) return parseOklch(str)

  throw new Error(`Unsupported color format: ${input}`)
}
