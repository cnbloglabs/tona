import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { AddressInfo } from 'node:net'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { createServer } from 'vite'
import type { ViteDevServer } from 'vite'
import tona from '../src/index.js'

const THEME = 'demo'

/**
 * A valid theme project root (no index.html — HTML is virtualized by
 * tona-vite in real usage). Contains a local fake node_modules dep that
 * src/main.js statically imports.
 */
function writeFixture(dir: string) {
  fs.writeFileSync(
    path.join(dir, 'package.json'),
    JSON.stringify({ name: 'fixture-theme', type: 'module', private: true }),
  )

  const fakeDepDir = path.join(dir, 'node_modules', 'fake-dep')
  fs.mkdirSync(fakeDepDir, { recursive: true })
  fs.writeFileSync(
    path.join(fakeDepDir, 'package.json'),
    JSON.stringify({
      name: 'fake-dep',
      version: '1.0.0',
      type: 'module',
      main: 'index.js',
      exports: { '.': './index.js' },
    }),
  )
  fs.writeFileSync(
    path.join(fakeDepDir, 'index.js'),
    "export function hello() {\n  return 'hello from fake-dep'\n}\n",
  )

  fs.mkdirSync(path.join(dir, 'src'), { recursive: true })
  fs.writeFileSync(
    path.join(dir, 'src/main.js'),
    "import { hello } from 'fake-dep'\nconsole.log(hello())\n",
  )
}

describe('dev cold start pre-bundling', () => {
  let tempDir: string
  let server: ViteDevServer | undefined

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tona-vite-dev-'))
    writeFixture(tempDir)
  })

  afterEach(async () => {
    if (server) {
      await server.close()
      server = undefined
    }
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('pre-bundles fake-dep at cold start, zero runtime discovery', async () => {
    const prev = process.cwd()
    process.chdir(tempDir)
    try {
      // tona() captures baseDir (process.cwd()) at instantiation,
      // so the plugin must be created AFTER chdir.
      server = await createServer({
        configFile: false,
        logLevel: 'silent',
        root: tempDir,
        // The fixture lives under os.tmpdir(), outside the workspace root —
        // allow serving it so the entry module can be loaded.
        server: { fs: { allow: [tempDir] } },
        plugins: [tona({ themeName: THEME })],
      })
      await server.listen(0)
      const port = (server.httpServer!.address() as AddressInfo).port

      const optimizer = server.environments.client.depsOptimizer
      expect(optimizer).toBeDefined()

      // Request the entry module, like the browser does on first paint.
      // optimizeDeps.entries points the scanner at src/main.js, so fake-dep
      // gets pre-bundled during the cold-start scan — no runtime discovery.
      const res = await fetch(`http://localhost:${port}/src/main.js`)
      expect(res.status).toBe(200)
      await res.text()

      await vi.waitFor(
        () => {
          expect(Object.keys(optimizer!.metadata.optimized)).toContain(
            'fake-dep',
          )
        },
        { timeout: 10_000, interval: 100 },
      )

      // Zero runtime discovery: nothing was added via the
      // "new dependencies optimized" path.
      expect(optimizer!.metadata.discovered).toEqual({})
    } finally {
      process.chdir(prev)
    }
  })
})
