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

  // A JS filename carrying a content hash — excludes the stable `{themeName}.min.js`
  const hashedJs = new RegExp(`^${THEME}\\.(?!min\\.)[A-Za-z0-9_-]+\\.js$`)

  it('inlineCss produces Inline CSS Dist: single {themeName}.min.js with inline CSS, no theme CSS', async () => {
    await buildTheme(tempDir, { inlineCss: true })

    const files = distFiles(tempDir)
    expect(files).toHaveLength(1)
    expect(files[0]).toBe(`${THEME}.min.js`)
    expect(files.some((f) => f.endsWith('.css'))).toBe(false)

    const js = fs.readFileSync(path.join(tempDir, 'dist', files[0]!), 'utf8')
    expect(js).toMatch(/createElement\([`'"]style[`'"]\)/)
  })

  it('default Theme Dist is stable {themeName}.min.js plus independent .min.css', async () => {
    await buildTheme(tempDir)

    const files = distFiles(tempDir)
    expect(files).toContain(`${THEME}.min.js`)
    expect(files).toContain(`${THEME}.min.css`)
    expect(files.some((f) => hashedJs.test(f))).toBe(false)
    expect(files.some((f) => f.endsWith('.map'))).toBe(false)
  })

  it('hash:true emits hashed {themeName}.[hash].js plus independent .min.css', async () => {
    await buildTheme(tempDir, { hash: true })

    const files = distFiles(tempDir)
    expect(files.some((f) => hashedJs.test(f))).toBe(true)
    expect(files).toContain(`${THEME}.min.css`)
  })

  it('hash:false emits stable {themeName}.min.js filename', async () => {
    await buildTheme(tempDir, { hash: false })

    const files = distFiles(tempDir)
    expect(files).toContain(`${THEME}.min.js`)
    expect(files.some((f) => hashedJs.test(f))).toBe(false)
  })

  it('sourcemap:true emits a {themeName}.min.js.map file', async () => {
    await buildTheme(tempDir, { sourcemap: true })

    const files = distFiles(tempDir)
    expect(files.some((f) => f.endsWith('.map'))).toBe(true)
  })
})
