import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'
import { build } from 'vite'
import tona from '../src/index.js'

const THEME = 'demo'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// packages/tona-vite/test -> packages/plugins (the real node_modules/tona-plugins target)
const PLUGINS_DIR = path.resolve(__dirname, '..', '..', 'plugins')

describe('bare tona-plugins css import via exports wildcard', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tona-vite-alias-'))
    // process.cwd() returns the real path (macOS /var -> /private/var),
    // so normalize tempDir the same way.
    tempDir = fs.realpathSync(tempDir)
  })

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('builds a css @import "tona-plugins/darkMode/index.css" to the real darkMode css (integration)', async () => {
    // Mirror the real layout: <root>/node_modules/tona-plugins is a workspace
    // symlink to packages/plugins; the bare specifier resolves through the
    // "./*" exports wildcard to dist/darkMode/index.css — no tona-vite alias
    // involved (ADR-004).
    fs.mkdirSync(path.join(tempDir, 'node_modules'), { recursive: true })
    fs.symlinkSync(PLUGINS_DIR, path.join(tempDir, 'node_modules', 'tona-plugins'))

    fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true })
    fs.writeFileSync(
      path.join(tempDir, 'src', 'main.js'),
      `import './style.css'\nconsole.log('demo')\n`,
    )
    fs.writeFileSync(
      path.join(tempDir, 'src', 'style.css'),
      `@import 'tona-plugins/darkMode/index.css';\n`,
    )

    const prev = process.cwd()
    process.chdir(tempDir)
    try {
      await build({
        configFile: false,
        logLevel: 'silent',
        plugins: [tona({ themeName: THEME })],
        build: {
          outDir: 'dist',
          emptyOutDir: true,
          write: true,
        },
      })
    } finally {
      process.chdir(prev)
    }

    // darkMode plugin css is inlined through the exports wildcard.
    const css = fs.readFileSync(
      path.join(tempDir, 'dist', `${THEME}.min.css`),
      'utf8',
    )
    expect(css).toContain('.dark-to-light')
    expect(css).toContain('--mode-bg-dark')

    // The import only affects css resolution — the JS bundle stays untouched.
    const js = fs.readFileSync(
      path.join(tempDir, 'dist', `${THEME}.min.js`),
      'utf8',
    )
    expect(js).not.toContain('dark-to-light')
  })
})
