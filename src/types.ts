export type RGBA = { r: number; g: number; b: number; a: number }

export type WCAGLevel = { normal: boolean; large: boolean }

export type CheckResult = {
  ratio: number
  aa: WCAGLevel
  aaa: WCAGLevel
  score: 'fail' | 'aa-large' | 'aa' | 'aaa'
}

export type PairResult = {
  pair: [string, string]
  ratio: number
  aa: boolean
  aaa: boolean
}

export type WCAGStandard = 'aa' | 'aa-large' | 'aaa'
