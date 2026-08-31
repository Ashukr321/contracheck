import { describe, it, expect } from 'vitest'
import { parseColor, luminance, ratio, check, suggest, bestTextColor, checkPalette } from '../src/index'

describe('parseColor', () => {
  it('parses hex', () => {
    expect(parseColor('#ff0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(parseColor('#f00')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
  })

  it('parses rgb/rgba', () => {
    expect(parseColor('rgb(0, 128, 255)')).toEqual({ r: 0, g: 128, b: 255, a: 1 })
    expect(parseColor('rgba(0, 128, 255, 0.5)')).toEqual({ r: 0, g: 128, b: 255, a: 0.5 })
  })

  it('parses hsl', () => {
    const c = parseColor('hsl(0, 100%, 50%)')
    expect(c.r).toBe(255)
    expect(c.g).toBe(0)
    expect(c.b).toBe(0)
  })

  it('parses CSS named colors', () => {
    expect(parseColor('red')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(parseColor('white')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
  })

  it('parses hwb', () => {
    const c = parseColor('hwb(0 0% 0%)')
    expect(c.r).toBe(255)
    expect(c.g).toBe(0)
    expect(c.b).toBe(0)
  })

  it('throws on invalid', () => {
    expect(() => parseColor('not-a-color')).toThrow()
  })
})

describe('luminance', () => {
  it('black = 0, white = 1', () => {
    expect(luminance('#000000')).toBe(0)
    expect(luminance('#ffffff')).toBe(1)
  })
})

describe('ratio', () => {
  it('black vs white = 21', () => {
    expect(ratio('#000', '#fff')).toBe(21)
  })

  it('same color = 1', () => {
    expect(ratio('#abc', '#abc')).toBe(1)
  })
})

describe('check', () => {
  it('black/white passes everything', () => {
    const result = check('#000', '#fff')
    expect(result.ratio).toBe(21)
    expect(result.aa.normal).toBe(true)
    expect(result.aaa.normal).toBe(true)
    expect(result.score).toBe('aaa')
  })

  it('low contrast fails', () => {
    const result = check('#fff', '#f5f5f5')
    expect(result.aa.normal).toBe(false)
    expect(result.score).toBe('fail')
  })
})

describe('suggest', () => {
  it('returns original if already passing', () => {
    expect(suggest('#fff', '#000')).toBe('#000')
  })

  it('returns a darker/lighter alternative for failing pairs', () => {
    const suggested = suggest('#3498db', '#ffffff')
    const r = ratio('#3498db', suggested)
    expect(r).toBeGreaterThanOrEqual(4.5)
  })
})

describe('bestTextColor', () => {
  it('picks white for dark bg', () => {
    expect(bestTextColor('#000')).toBe('#ffffff')
  })

  it('picks black for light bg', () => {
    expect(bestTextColor('#fff')).toBe('#000000')
  })
})

describe('checkPalette', () => {
  it('returns pairs sorted worst-first', () => {
    const results = checkPalette(['#fff', '#f5f5f5', '#000'])
    expect(results.length).toBe(3)
    expect(results[0].ratio).toBeLessThanOrEqual(results[1].ratio)
  })
})
