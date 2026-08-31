import { ratio } from './ratio'

export function bestTextColor(bg: string, candidates: string[] = ['#000000', '#ffffff']): string {
  let best = candidates[0]
  let bestRatio = 0

  for (const c of candidates) {
    const r = ratio(bg, c)
    if (r > bestRatio) {
      bestRatio = r
      best = c
    }
  }

  return best
}
