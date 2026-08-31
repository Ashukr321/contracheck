import { useMemo } from 'react'
import { check, suggest } from './index'
import type { CheckResult, WCAGStandard } from './types'

type ContraCheckResult = CheckResult & { suggestion: string }

export function useContracheck(bg: string, fg: string, level: WCAGStandard = 'aa'): ContraCheckResult {
  return useMemo(() => {
    const result = check(bg, fg)
    const suggestion = result.score === 'fail' ? suggest(bg, fg, level) : fg
    return { ...result, suggestion }
  }, [bg, fg, level])
}
