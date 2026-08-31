import { ratio as getRatio } from './ratio'
import type { PairResult } from './types'
import { WCAG_AA_NORMAL, WCAG_AAA_NORMAL } from './constants'

export function checkPalette(colors: string[]): PairResult[] {
  const results: PairResult[] = []

  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const r = getRatio(colors[i], colors[j])
      results.push({
        pair: [colors[i], colors[j]],
        ratio: r,
        aa: r >= WCAG_AA_NORMAL,
        aaa: r >= WCAG_AAA_NORMAL,
      })
    }
  }

  return results.sort((a, b) => a.ratio - b.ratio)
}
