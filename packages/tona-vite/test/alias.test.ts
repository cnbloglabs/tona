import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'
import type { ConfigEnv, UserConfig } from 'vite'
import { build } from 'vite'
import tona from '../src/index.js'

const THEME = 'demo'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// packages/tona-vite/test -> packages/plugins (the real node_modules/tona-plugins target)
const PLUGINS_DIR = path.resolve(__dirname, '..', '..', 'plugins')

type ConfigHook = (config: UserConfig, env: ConfigEnv) => UserConfig

function writeEntry(dir: string, file: 'main.js' | 'main.ts') {
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true })
  fs.writeFileSync(path.join(dir, 'src', file), "console.log('demo')\n")
}

function runConfig(
  dir: string,
  config: UserConfig,
  command: ConfigEnv['command'] = 'build',
): UserConfig {
  const prev = process.cwd()
  process.chdir(dir)
  try {
    // NOTE: tona() captures baseDir (process.cwd()) at instantiation,
    // so it must be created AFTER chdir, like theme-dist.test.ts does.
    const plugin = tona({ themeName: THEME })
    const hook = plugin.config as unknown as ConfigHook
    return hook(config, { command } as ConfigEnv)
  } finally {
    process.chdir(prev)
  }
}

const aliasTarget = (root: string) =>
  path.resolve(root, 'node_modules/tona-plugins')

// The hook returns UserConfig where resolve.alias is AliasOptions (array | object);
// the plugin always injects the object form, so narrow it for assertions.
const pluginAlias = (result: UserConfig) =>
  (result.resolve?.alias as Record<string, string> | undefined)?.['@tona-plugins']

describe('@tona-plugins resolve.alias injection', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tona-vite-alias-'))
    // process.cwd() returns the real path (macOS /var -> /private/var),
    // so normalize tempDir the same way for expected alias values.
    tempDir = fs.realpathSync(tempDir)
  })

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('injects resolve.alias["@tona-plugins"] based on cwd when config.root is absent', () => {
    writeEntry(tempDir, 'main.js')

    const result = runConfig(tempDir, {}, 'build')

    expect(result.resolve?.alias).toEqual({
      '@tona-plugins': aliasTarget(tempDir),
    })
  })

  it('uses an explicitly provided config.root as the alias base', () => {
    writeEntry(tempDir, 'main.js')
    const root = path.join(tempDir, 'custom-root')

    const result = runConfig(tempDir, { root }, 'build')

    expect(result.resolve?.alias).toEqual({
      '@tona-plugins': aliasTarget(root),
    })
  })

  it('keeps the default scss charset:false while injecting the alias', () => {
    writeEntry(tempDir, 'main.js')

    const result = runConfig(tempDir, {}, 'build')

    expect(result.css?.preprocessorOptions?.scss?.charset).toBe(false)
    expect(pluginAlias(result)).toBe(aliasTarget(tempDir))
  })

  it('does not override a user-provided scss charset:true', () => {
    writeEntry(tempDir, 'main.js')

    const result = runConfig(
      tempDir,
      { css: { preprocessorOptions: { scss: { charset: true } } } },
      'build',
    )

    expect(result.css?.preprocessorOptions?.scss?.charset).toBe(true)
    expect(pluginAlias(result)).toBe(aliasTarget(tempDir))
  })

  it('preserves user-provided resolve.alias entries', () => {
    writeEntry(tempDir, 'main.js')

    const result = runConfig(
      tempDir,
      { resolve: { alias: { '@custom': '/some/path' } } },
      'build',
    )

    expect(result.resolve?.alias).toEqual({
      '@custom': '/some/path',
      '@tona-plugins': aliasTarget(tempDir),
    })
  })

  it('builds a css @import "@tona-plugins/..." to the real darkMode css (integration)', async () => {
    // Mirror the real layout: the alias target <root>/node_modules/tona-plugins
    // is a workspace symlink to packages/plugins in the tona monorepo.
    fs.mkdirSync(path.join(tempDir, 'node_modules'), { recursive: true })
    fs.symlinkSync(PLUGINS_DIR, path.join(tempDir, 'node_modules', 'tona-plugins'))

    fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true })
    fs.writeFileSync(
      path.join(tempDir, 'src', 'main.js'),
      `import './style.css'\nconsole.log('demo')\n`,
    )
    fs.writeFileSync(
      path.join(tempDir, 'src', 'style.css'),
      `@import '@tona-plugins/src/plugins/darkMode/index.css';\n`,
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

    // darkMode plugin css is inlined through the alias.
    const css = fs.readFileSync(
      path.join(tempDir, 'dist', `${THEME}.min.css`),
      'utf8',
    )
    expect(css).toContain('.dark-to-light')
    expect(css).toContain('--mode-bg-dark')

    // Alias only affects css resolution — the JS bundle stays untouched.
    const js = fs.readFileSync(
      path.join(tempDir, 'dist', `${THEME}.min.js`),
      'utf8',
    )
    expect(js).not.toContain('dark-to-light')
  })
})
