<p align="center">
  <img src="https://img.shields.io/npm/v/contracheck?color=blue&label=npm" alt="npm version" />
  <img src="https://img.shields.io/bundlephobia/minzip/contracheck?color=green&label=size" alt="bundle size" />
  <img src="https://img.shields.io/npm/l/contracheck" alt="license" />
  <img src="https://img.shields.io/npm/dt/contracheck?color=orange" alt="downloads" />
  <img src="https://img.shields.io/badge/types-TypeScript-blue" alt="typescript" />
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="zero deps" />
</p>

# contracheck

> Zero-dependency color contrast toolkit — WCAG 2.1 AA/AAA checking, contrast ratios, color suggestions, and palette audit. Under 4 KB gzipped.

## Features

- **WCAG 2.1 contrast ratios** — accurate relative luminance calculation
- **AA / AAA compliance** — instant pass/fail for normal and large text
- **Color suggestions** — auto-fix failing pairs to the nearest passing color
- **Palette audit** — check every pair in your design tokens at once
- **Best text color** — pick the most readable foreground for any background
- **6 color formats** — HEX, RGB, HSL, OKLCH, HWB, and all 148 CSS named colors
- **React hook** — `useContracheck()` for component-level checks
- **Tree-shakeable** — ESM + CJS, import only what you use

## Install

```bash
npm install contracheck
```

## Quick Start

```ts
import { ratio, check, suggest } from 'contracheck'

ratio('#000', '#fff')                // 21

const result = check('#3498db', '#fff')
result.score                         // 'fail'
result.aa                            // { normal: false, large: false }

suggest('#3498db', '#fff', 'aa')     // '#1a5276' — nearest color that passes AA
```

## API

### `ratio(color1, color2): number`

WCAG contrast ratio between two colors (1–21), rounded to two decimal places.

```ts
ratio('#000000', '#ffffff')          // 21
ratio('hsl(210, 50%, 40%)', '#fff')  // 5.67
```

### `check(color1, color2): CheckResult`

Full compliance check — ratio plus pass/fail for every WCAG level.

```ts
check('#1a1a1a', '#ffffff')
// {
//   ratio: 17.41,
//   aa:  { normal: true, large: true },
//   aaa: { normal: true, large: true },
//   score: 'aaa'
// }
```

| Score | Meaning |
|---|---|
| `'fail'` | Below all WCAG thresholds |
| `'aa-large'` | Passes AA for large text only (≥ 3:1) |
| `'aa'` | Passes AA for all text (≥ 4.5:1) |
| `'aaa'` | Passes AAA for all text (≥ 7:1) |

### `suggest(bg, fg, level?): string`

Returns the nearest color to `fg` that meets the target level against `bg`. If the pair already passes, returns `fg` unchanged.

```ts
suggest('#3498db', '#ffffff', 'aa')   // '#0e3d5c'
suggest('#3498db', '#ffffff', 'aaa')  // '#092635'
suggest('#000', '#fff', 'aa')        // '#fff' — already passes
```

| Param | Type | Default | Description |
|---|---|---|---|
| `bg` | `string` | — | Background color |
| `fg` | `string` | — | Foreground color |
| `level` | `'aa' \| 'aa-large' \| 'aaa'` | `'aa'` | Target WCAG level |

### `luminance(color): number`

Relative luminance per WCAG 2.1 (0–1). Alpha values are blended against white.

```ts
luminance('#000000')                // 0
luminance('#ffffff')                // 1
luminance('rgba(0, 0, 0, 0.5)')    // 0.5
```

### `bestTextColor(bg, candidates?): string`

Returns the candidate with the highest contrast ratio against `bg`. Defaults to `['#000000', '#ffffff']`.

```ts
bestTextColor('#3498db')                              // '#ffffff'
bestTextColor('#3498db', ['#fff', '#000', '#333'])     // '#fff'
```

### `checkPalette(colors): PairResult[]`

Checks every unique pair in a color array. Results are sorted worst-first.

```ts
const results = checkPalette(['#ffffff', '#f5f5f5', '#333333', '#000000'])
const failing = results.filter(r => !r.aa)
```

### `parseColor(input): RGBA`

Parses any supported CSS color string into an RGBA object.

```ts
parseColor('#ff6347')              // { r: 255, g: 99, b: 71, a: 1 }
parseColor('oklch(0.63 0.26 29)')  // { r: 255, g: 56, b: 0, a: 1 }
parseColor('tomato')               // { r: 255, g: 99, b: 71, a: 1 }
```

## Supported Color Formats

| Format | Examples | Alpha |
|---|---|---|
| HEX (3/4/6/8) | `#f00`, `#ff0000`, `#ff000080` | Yes |
| RGB / RGBA | `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.5)` | Yes |
| HSL / HSLA | `hsl(0, 100%, 50%)`, `hsla(0, 100%, 50%, 0.5)` | Yes |
| HWB | `hwb(0 0% 0%)`, `hwb(0 0% 0% / 0.5)` | Yes |
| OKLCH | `oklch(0.63 0.26 29)`, `oklch(0.63 0.26 29 / 0.5)` | Yes |
| CSS Named | `red`, `tomato`, `cornflowerblue` (all 148) | No |

## React Hook

Separate entry point — only loads when imported. Requires React 17+.

```tsx
import { useContracheck } from 'contracheck/react'

function Badge({ bg, fg, children }) {
  const { ratio, aa, suggestion } = useContracheck(bg, fg)
  const color = aa.normal ? fg : suggestion

  return (
    <span style={{ backgroundColor: bg, color, padding: '4px 12px', borderRadius: 4 }}>
      {children} <small>{ratio.toFixed(1)}:1</small>
    </span>
  )
}
```

The hook memoizes — it only recalculates when `bg`, `fg`, or `level` changes.

## Types

```ts
import type { RGBA, CheckResult, PairResult, WCAGLevel, WCAGStandard } from 'contracheck'
```

## WCAG Thresholds

| Level | Normal Text | Large Text | Ratio |
|---|---|---|---|
| AA | ≥ 14px regular | ≥ 18px regular / ≥ 14px bold | 4.5:1 / 3:1 |
| AAA | ≥ 14px regular | ≥ 18px regular / ≥ 14px bold | 7:1 / 4.5:1 |

> **Large text** = 18pt (24px) or larger, or 14pt (18.67px) bold or larger.

## License

MIT
