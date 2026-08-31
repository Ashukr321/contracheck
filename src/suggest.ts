import { parseColor } from './parse'
import { luminanceFromRgba } from './luminance'
import { WCAG_AA_NORMAL, WCAG_AA_LARGE, WCAG_AAA_NORMAL } from './constants'
import type { RGBA, WCAGStandard } from './types'

const THRESHOLDS: Record<WCAGStandard, number> = {
  'aa': WCAG_AA_NORMAL,
  'aa-large': WCAG_AA_LARGE,
  'aaa': WCAG_AAA_NORMAL,
}

function rgbaToHex({ r, g, b }: RGBA): string {
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
}

export function suggest(bg: string, fg: string, level: WCAGStandard = 'aa'): string {
  const bgRgba = parseColor(bg)
  const fgRgba = parseColor(fg)
  const bgLum = luminanceFromRgba(bgRgba)
  const target = THRESHOLDS[level]

  const currentRatio = contrastRatio(bgLum, luminanceFromRgba(fgRgba))
  if (currentRatio >= target) return fg

  // try both directions (darken toward black, lighten toward white), pick the one closer to original fg
  const directions = [0, 255] as const
  let bestResult: RGBA | null = null
  let bestAmount = Infinity

  for (const targetVal of directions) {
    let lo = 0, hi = 1
    let found = false
    for (let i = 0; i < 32; i++) {
      const mid = (lo + hi) / 2
      const adjusted = mixWithTarget(fgRgba, targetVal, mid)
      const r = contrastRatio(bgLum, luminanceFromRgba(adjusted))
      if (r >= target) { hi = mid; found = true }
      else lo = mid
    }
    if (found && hi < bestAmount) {
      bestAmount = hi
      bestResult = mixWithTarget(fgRgba, targetVal, hi)
    }
  }

  return bestResult ? rgbaToHex(bestResult) : fg
}

function mixWithTarget(base: RGBA, target: number, amount: number): RGBA {
  return {
    r: Math.round(base.r + (target - base.r) * amount),
    g: Math.round(base.g + (target - base.g) * amount),
    b: Math.round(base.b + (target - base.b) * amount),
    a: base.a,
  }
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}
