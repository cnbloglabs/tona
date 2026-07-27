import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'
import { build } from 'vite'
import tona from '../src/index.js'

const THEME = 'demo'

function writeFixture(dir: string) {
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true })
  fs.writeFileSync(
    path.join(dir, 'src/main.js'),
    `import './style.css'\nconsole.log('demo')\n`,
  )
  fs.writeFileSync(path.join(dir, 'src/style.css'), `.demo { color: red; }\n`)
}

async function buildTheme(
  dir: string,
  options: Parameters<typeof tona>[0] = {},
) {
  const prev = process.cwd()
  process.chdir(dir)
  try {
    await build({
      configFile: false,
      logLevel: 'silent',
      plugins: [tona({ themeName: THEME, ...options })],
      build: {
        outDir: 'dist',
        emptyOutDir: true,
        write: true,
      },
    })
  } finally {
    process.chdir(prev)
  }
}

function distFiles(dir: string) {
  return fs.readdirSync(path.join(dir, 'dist')).sort()
}

describe('Theme Dist', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tona-vite-dist-'))
    writeFixture(tempDir)
  })

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('inlineCss produces Inline CSS Dist: single hashed JS, no theme CSS', async () => {
    await buildTheme(tempDir, { inlineCss: true })

    const files = distFiles(tempDir)
    expect(files).toHaveLength(1)
    expect(files[0]).toMatch(new RegExp(`^${THEME}\\.[A-Za-z0-9_-]+\\.js$`))
    expect(files.some((f) => f.endsWith('.css'))).toBe(false)

    const js = fs.readFileSync(path.join(tempDir, 'dist', files[0]!), 'utf8')
    expect(js).toMatch(/createElement\([`'"]style[`'"]\)/)
  })

  it('default Theme Dist is hashed JS plus independent .min.css', async () => {
    await buildTheme(tempDir)

    const files = distFiles(tempDir)
    expect(files.some((f) => new RegExp(`^${THEME}\\.[A-Za-z0-9_-]+\\.js$`).test(f))).toBe(
      true,
    )
    expect(files).toContain(`${THEME}.min.css`)
  })

  it('hash:false emits stable {themeName}.js filename', async () => {
    await buildTheme(tempDir, { hash: false })

    const files = distFiles(tempDir)
    expect(files).toContain(`${THEME}.js`)
    expect(files.some((f) => new RegExp(`^${THEME}\\.[A-Za-z0-9_-]+\\.js$`).test(f))).toBe(
      false,
    )
  })
})
