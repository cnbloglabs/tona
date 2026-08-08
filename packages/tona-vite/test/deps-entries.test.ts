import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'
import type { ConfigEnv, UserConfig } from 'vite'
import tona from '../src/index.js'

const THEME = 'demo'

type ConfigHook = (config: UserConfig, env: ConfigEnv) => UserConfig

function writeEntry(dir: string, file: 'main.js' | 'main.ts') {
  fs.mkdirSync(path.join(dir, 'src'), { recursive: true })
  fs.writeFileSync(path.join(dir, 'src', file), "console.log('demo')\n")
}

function runConfig(
  dir: string,
  config: UserConfig,
  command: ConfigEnv['command'],
): UserConfig {
  const prev = process.cwd()
  process.chdir(dir)
  try {
    // NOTE: tona() captures baseDir (process.cwd()) at instantiation,
    // so it must be created AFTER chdir, like theme-dist.test.ts does.
    const plugin = tona({ themeName: THEME })
    const hook = plugin.config as unknown as ConfigHook
    return hook(config, { command })
  } finally {
    process.chdir(prev)
  }
}

describe('optimizeDeps.entries injection', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tona-vite-entries-'))
  })

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('injects entries pointing at src/main.js when only main.js exists', () => {
    writeEntry(tempDir, 'main.js')

    const result = runConfig(tempDir, {}, 'serve')

    expect(result.optimizeDeps?.entries).toEqual(['src/main.js'])
  })

  it('prefers src/main.ts over src/main.js', () => {
    writeEntry(tempDir, 'main.js')
    writeEntry(tempDir, 'main.ts')

    const result = runConfig(tempDir, {}, 'serve')

    expect(result.optimizeDeps?.entries).toEqual(['src/main.ts'])
  })

  it('does not inject optimizeDeps for build command', () => {
    writeEntry(tempDir, 'main.js')

    const result = runConfig(tempDir, {}, 'build')

    expect(result.optimizeDeps).toBeUndefined()
  })

  it('does not override user-provided optimizeDeps.entries', () => {
    writeEntry(tempDir, 'main.js')

    const result = runConfig(
      tempDir,
      { optimizeDeps: { entries: ['custom/entry.js'] } },
      'serve',
    )

    // Plugin must leave optimizeDeps untouched so Vite's deep-merge keeps
    // the user's entries (arrays are replaced, not concatenated).
    expect(result.optimizeDeps).toBeUndefined()
  })

  it('adds entries to existing optimizeDeps while preserving other options', () => {
    writeEntry(tempDir, 'main.js')

    const result = runConfig(
      tempDir,
      { optimizeDeps: { include: ['notyf'] } },
      'serve',
    )

    expect(result.optimizeDeps?.include).toEqual(['notyf'])
    expect(result.optimizeDeps?.entries).toEqual(['src/main.js'])
  })

  it('does not inject when no src/main entry exists', () => {
    const result = runConfig(tempDir, {}, 'serve')

    expect(result.optimizeDeps).toBeUndefined()
  })
})
