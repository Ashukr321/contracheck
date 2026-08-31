<p align="center">
  <img src="https://img.shields.io/npm/v/contracheck?color=blue&label=npm" alt="npm version" />
  <img src="https://img.shields.io/bundlephobia/minzip/contracheck?color=green&label=size" alt="bundle size" />
  <img src="https://img.shields.io/npm/l/contracheck" alt="license" />
  <img src="https://img.shields.io/npm/dt/contracheck?color=orange" alt="downloads" />
  <img src="https://img.shields.io/badge/types-TypeScript-blue" alt="typescript" />
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="zero deps" />
</p>

# contracheck

> Tiny, zero-dependency color contrast toolkit for the web.
> WCAG 2.1 AA/AAA compliance checking, contrast ratios, color suggestions, palette audit — under 4KB gzipped.

---

## Features

- **WCAG 2.1 Contrast Ratios** — accurate 1:1 to 21:1 ratio calculation
- **AA / AAA Pass/Fail** — instant compliance check for normal & large text
- **Color Suggestions** — auto-fix failing pairs with the nearest passing color
- **Palette Audit** — check every pair in your design tokens at once
- **Best Text Color** — pick the most readable text for any background
- **6 Color Formats** — HEX, RGB, HSL, OKLCH, HWB, CSS named colors
- **React Hook** — `useContracheck()` for component-level checks
- **TypeScript** — full type definitions included
- **Tree-shakeable** — import only what you use (ESM + CJS)
- **Zero dependencies** — nothing to audit

---

## Installation

```bash
# npm
npm install contracheck

# yarn
yarn add contracheck

# pnpm
pnpm add contracheck
```

---

## Quick Start

```ts
import { ratio, check, suggest } from 'contracheck'

// 1. Get the contrast ratio
ratio('#000', '#fff') // 21

// 2. Check WCAG compliance
const result = check('#3498db', '#ffffff')
console.log(result.score) // 'fail'
console.log(result.aa)    // { normal: false, large: false }

// 3. Get a suggested fix
suggest('#3498db', '#ffffff', 'aa') // '#1a5276' — passes AA
```

---

## API Reference

### `ratio(color1, color2)`

Returns the WCAG contrast ratio between two colors (range: 1 to 21).

```ts
import { ratio } from 'contracheck'

ratio('#000000', '#ffffff')          // 21
ratio('red', 'white')                // 3.99
ratio('hsl(210, 50%, 40%)', '#fff')  // 5.67
ratio('rgb(0, 128, 255)', '#000')    // 5.12
```

**Parameters:**
| Param | Type | Description |
|---|---|---|
| `color1` | `string` | Any supported color string |
| `color2` | `string` | Any supported color string |

**Returns:** `number` — contrast ratio rounded to 2 decimal places

---

### `check(color1, color2)`

Full WCAG compliance check. Returns ratio + pass/fail for every level.

```ts
import { check } from 'contracheck'

// Failing pair
check('#3498db', '#ffffff')
// {
//   ratio: 2.94,
//   aa:  { normal: false, large: false },
//   aaa: { normal: false, large: false },
//   score: 'fail'
// }

// Passing pair
check('#1a1a1a', '#ffffff')
// {
//   ratio: 17.41,
//   aa:  { normal: true, large: true },
//   aaa: { normal: true, large: true },
//   score: 'aaa'
// }
```

**Returns:** `CheckResult`

```ts
type CheckResult = {
  ratio: number
  aa:  { normal: boolean; large: boolean }
  aaa: { normal: boolean; large: boolean }
  score: 'fail' | 'aa-large' | 'aa' | 'aaa'
}
```

| Score | Meaning |
|---|---|
| `'fail'` | Does not meet any WCAG level |
| `'aa-large'` | Passes AA for large text only (≥ 3:1) |
| `'aa'` | Passes AA for all text (≥ 4.5:1) |
| `'aaa'` | Passes AAA for all text (≥ 7:1) |

---

### `suggest(bg, fg, level?)`

If the pair fails, returns the nearest color to `fg` that meets the target level against `bg`. If already passing, returns the original `fg`.

```ts
import { suggest } from 'contracheck'

// White text on blue bg fails AA — suggest a fix
suggest('#3498db', '#ffffff', 'aa')
// '#0e3d5c' — darkened white that passes AA against #3498db

// Already passing — returns original
suggest('#000', '#fff', 'aa')
// '#fff'

// Target AAA instead
suggest('#3498db', '#ffffff', 'aaa')
// '#092635' — darker still to meet 7:1
```

**Parameters:**
| Param | Type | Default | Description |
|---|---|---|---|
| `bg` | `string` | — | Background color |
| `fg` | `string` | — | Foreground (text) color |
| `level` | `'aa' \| 'aa-large' \| 'aaa'` | `'aa'` | Target WCAG level |

**Returns:** `string` — hex color that passes the target level

---

### `luminance(color)`

Relative luminance per [WCAG 2.1 spec](https://www.w3.org/TR/WCAG21/#dfn-relative-luminance) (range: 0 to 1). Accounts for alpha transparency (blended against white).

```ts
import { luminance } from 'contracheck'

luminance('#000000')                // 0
luminance('#ffffff')                // 1
luminance('red')                    // 0.2126
luminance('rgba(0, 0, 0, 0.5)')    // 0.5 (blended against white)
luminance('hsl(120, 100%, 50%)')    // 0.7152
```

**Returns:** `number` — relative luminance (0 = darkest, 1 = lightest)

---

### `bestTextColor(bg, candidates?)`

Picks the highest-contrast text color from a list of candidates. Defaults to `['#000000', '#ffffff']`.

```ts
import { bestTextColor } from 'contracheck'

// Default: picks black or white
bestTextColor('#3498db')       // '#ffffff'
bestTextColor('#ecf0f1')       // '#000000'

// Custom candidates
bestTextColor('#3498db', ['#fff', '#000', '#333', '#e8e8e8'])
// '#fff' — highest contrast among candidates

// Use with design tokens
const brandColors = ['#1a1a2e', '#e94560', '#0f3460', '#16213e']
bestTextColor('#f5f5f5', brandColors)
// '#1a1a2e' — best readable brand color on light bg
```

**Parameters:**
| Param | Type | Default | Description |
|---|---|---|---|
| `bg` | `string` | — | Background color |
| `candidates` | `string[]` | `['#000000', '#ffffff']` | Colors to choose from |

**Returns:** `string` — the candidate with the highest contrast ratio

---

### `checkPalette(colors)`

Check every unique pair in a color palette. Returns results sorted worst-first — failing pairs bubble to the top.

```ts
import { checkPalette } from 'contracheck'

const designTokens = ['#ffffff', '#f5f5f5', '#333333', '#000000']
const results = checkPalette(designTokens)

// [
//   { pair: ['#ffffff', '#f5f5f5'], ratio: 1.04, aa: false, aaa: false },
//   { pair: ['#333333', '#000000'], ratio: 5.14, aa: true,  aaa: false },
//   { pair: ['#f5f5f5', '#333333'], ratio: 9.57, aa: true,  aaa: true  },
//   { pair: ['#f5f5f5', '#000000'], ratio: 19.13,aa: true,  aaa: true  },
//   { pair: ['#ffffff', '#333333'], ratio: 12.63,aa: true,  aaa: true  },
//   { pair: ['#ffffff', '#000000'], ratio: 21,   aa: true,  aaa: true  },
// ]

// Filter only failing pairs
const failing = results.filter(r => !r.aa)
console.log(`${failing.length} pairs fail WCAG AA`)
```

**Returns:** `PairResult[]`

```ts
type PairResult = {
  pair: [string, string]
  ratio: number
  aa: boolean   // passes AA normal text (≥ 4.5:1)
  aaa: boolean  // passes AAA normal text (≥ 7:1)
}
```

---

### `parseColor(input)`

Parse any supported CSS color string to an RGBA object.

```ts
import { parseColor } from 'contracheck'

parseColor('#ff6347')               // { r: 255, g: 99, b: 71, a: 1 }
parseColor('rgb(100, 200, 50)')     // { r: 100, g: 200, b: 50, a: 1 }
parseColor('rgba(100, 200, 50, 0.8)')// { r: 100, g: 200, b: 50, a: 0.8 }
parseColor('hsl(210, 50%, 40%)')    // { r: 51, g: 102, b: 153, a: 1 }
parseColor('hwb(0 0% 0%)')          // { r: 255, g: 0, b: 0, a: 1 }
parseColor('oklch(0.63 0.26 29)')   // { r: 255, g: 56, b: 0, a: 1 }
parseColor('tomato')                // { r: 255, g: 99, b: 71, a: 1 }
```

**Returns:** `RGBA`

```ts
type RGBA = { r: number; g: number; b: number; a: number }
```

---

## Supported Color Formats

| Format | Examples | Alpha |
|---|---|---|
| **HEX** (3/4/6/8 digit) | `#f00`, `#ff0000`, `#ff000080` | Yes |
| **RGB / RGBA** | `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.5)` | Yes |
| **HSL / HSLA** | `hsl(0, 100%, 50%)`, `hsla(0, 100%, 50%, 0.5)` | Yes |
| **HWB** | `hwb(0 0% 0%)`, `hwb(0 0% 0% / 0.5)` | Yes |
| **OKLCH** | `oklch(0.63 0.26 29)`, `oklch(0.63 0.26 29 / 0.5)` | Yes |
| **CSS Named** | `red`, `tomato`, `cornflowerblue` (all 148) | No |

---

## React Hook

Separate import — only loads if you use it. React 17+ required.

```tsx
import { useContracheck } from 'contracheck/react'

function AccessibleBadge({ bg, text, children }) {
  const { ratio, aa, aaa, suggestion } = useContracheck(bg, text)

  // Auto-fix: use suggested color if original fails
  const safeColor = aa.normal ? text : suggestion

  return (
    <span
      style={{
        backgroundColor: bg,
        color: safeColor,
        padding: '4px 12px',
        borderRadius: '4px',
      }}
    >
      {children}
      <small style={{ opacity: 0.7, marginLeft: 8 }}>
        {ratio.toFixed(1)}:1 {aa.normal ? 'AA Pass' : 'Fixed'}
      </small>
    </span>
  )
}

// Usage
<AccessibleBadge bg="#3498db" text="#ffffff">
  Hello World
</AccessibleBadge>
```

**Returns:** `CheckResult & { suggestion: string }`

The hook memoizes the result — only recalculates when `bg`, `fg`, or `level` changes.

---

## Real-World Examples

### Design System Token Audit

```ts
import { checkPalette, suggest } from 'contracheck'

const tokens = {
  primary: '#2563eb',
  secondary: '#64748b',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#0f172a',
  muted: '#94a3b8',
}

const colors = Object.values(tokens)
const results = checkPalette(colors)
const failing = results.filter(r => !r.aa)

console.log(`Checked ${results.length} pairs`)
console.log(`${failing.length} pairs fail WCAG AA:`)
failing.forEach(({ pair, ratio }) => {
  const fix = suggest(pair[0], pair[1], 'aa')
  console.log(`  ${pair[0]} + ${pair[1]} → ${ratio}:1 (fix: use ${fix})`)
})
```

### Dynamic Theme Validator

```ts
import { check, bestTextColor } from 'contracheck'

function validateTheme(theme: Record<string, string>) {
  const issues: string[] = []

  // Check text on background
  const bgText = check(theme.background, theme.text)
  if (!bgText.aa.normal) {
    issues.push(`text on background fails AA (${bgText.ratio}:1)`)
  }

  // Check text on primary (buttons, links)
  const primaryText = bestTextColor(theme.primary)
  const primaryCheck = check(theme.primary, primaryText)
  if (!primaryCheck.aa.normal) {
    issues.push(`no readable text color for primary`)
  }

  return { valid: issues.length === 0, issues }
}
```

### Express Middleware — API Endpoint

```ts
import express from 'express'
import { check, suggest, ratio } from 'contracheck'

const app = express()

app.get('/api/contrast', (req, res) => {
  const { bg, fg, level = 'aa' } = req.query

  if (!bg || !fg) {
    return res.status(400).json({ error: 'bg and fg are required' })
  }

  try {
    const result = check(bg as string, fg as string)
    const suggestion = result.score === 'fail'
      ? suggest(bg as string, fg as string, level as any)
      : null

    res.json({ ...result, suggestion })
  } catch (e) {
    res.status(400).json({ error: 'Invalid color format' })
  }
})
```

### Figma Plugin / CI Linter

```ts
import { checkPalette } from 'contracheck'

// In your CI pipeline or Figma plugin
function lintColors(colors: string[]): { pass: boolean; report: string } {
  const results = checkPalette(colors)
  const failing = results.filter(r => !r.aa)

  if (failing.length === 0) {
    return { pass: true, report: `All ${results.length} pairs pass WCAG AA` }
  }

  const lines = failing.map(
    f => `  FAIL: ${f.pair[0]} + ${f.pair[1]} = ${f.ratio}:1`
  )

  return {
    pass: false,
    report: `${failing.length}/${results.length} pairs fail WCAG AA:\n${lines.join('\n')}`,
  }
}
```

---

## WCAG Thresholds Reference

| Level | Normal Text | Large Text | Ratio |
|---|---|---|---|
| **AA** | 14px+ regular | 18px+ regular / 14px+ bold | **4.5:1** / **3:1** |
| **AAA** | 14px+ regular | 18px+ regular / 14px+ bold | **7:1** / **4.5:1** |

> **Large text** = 18pt (24px) or larger, OR 14pt (18.67px) bold or larger.

---

## How to Publish

```bash
# 1. Update version
npm version patch  # or minor / major

# 2. Build & test (runs automatically via prepublishOnly)
npm publish

# 3. Verify on npm
npm info contracheck
```

### First-time publish

```bash
# Login to npm
npm login

# Publish (public package)
npm publish --access public
```

### Publish with GitHub Actions

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm
on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://registry.npmjs.org
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Bundle Size

| Export | Min + Gzip |
|---|---|
| `ratio` | ~1.2 KB |
| `check` | ~1.3 KB |
| `suggest` | ~2.1 KB |
| Full package | ~3.5 KB |
| React hook | ~0.3 KB |

Tree-shakeable — you only pay for what you import.

---

## TypeScript Types

All types are exported for your convenience:

```ts
import type {
  RGBA,
  CheckResult,
  PairResult,
  WCAGLevel,
  WCAGStandard,
} from 'contracheck'
```

---

## Contributing

```bash
git clone https://github.com/Ashukr321/contracheck.git
cd contracheck
npm install
npm test          # run tests
npm run test:watch # watch mode
npm run build     # build dist/
npm run lint      # type check
```

---

## License

MIT
