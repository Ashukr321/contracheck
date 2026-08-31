import { ratio as getRatio } from './ratio'
import { WCAG_AA_NORMAL, WCAG_AA_LARGE, WCAG_AAA_NORMAL, WCAG_AAA_LARGE } from './constants'
import type { CheckResult } from './types'

export function check(color1: string, color2: string): CheckResult {
  const r = getRatio(color1, color2)

  const aa = { normal: r >= WCAG_AA_NORMAL, large: r >= WCAG_AA_LARGE }
  const aaa = { normal: r >= WCAG_AAA_NORMAL, large: r >= WCAG_AAA_LARGE }

  let score: CheckResult['score'] = 'fail'
  if (aaa.normal) score = 'aaa'
  else if (aa.normal) score = 'aa'
  else if (aa.large) score = 'aa-large'

  return { ratio: r, aa, aaa, score }
}
