import { parseColor } from './parse'
import type { RGBA } from './types'

function channelLuminance(val: number): number {
  const n = val / 255
  return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4)
}

export function luminanceFromRgba({ r, g, b, a }: RGBA): number {
  const raw = 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b)
  if (a >= 1) return raw
  return a * raw + (1 - a) * 1 // blend against white
}

export function luminance(color: string): number {
  return luminanceFromRgba(parseColor(color))
}
