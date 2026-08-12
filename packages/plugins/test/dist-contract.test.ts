import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vite-plus/test'

/**
 * dist 产物契约（ADR-004）：plugins 从源码分发迁移为产物分发。
 * - dist/index.js 为 ESM 聚合 re-export（未 minify），含全部插件导出
 * - 插件 CSS 复制为 dist 扁平布局：dist/<相对 src/plugins 路径>，无 dist/plugins 层
 * - package.json exports/files/scripts 切换到产物契约
 *
 * 前置：dist 需先构建（pnpm --dir packages/plugins build 或根 pnpm build:pkg）。
 */

const pkgRoot = path.resolve(__dirname, '..')
const srcPluginsRoot = path.join(pkgRoot, 'src/plugins')
const distRoot = path.join(pkgRoot, 'dist')

/** 全部插件导出名（src/index.js 的 re-export 清单，30 个模块 31 个名字） */
const PLUGIN_EXPORTS = [
  'background',
  'barrage',
  'catalog',
  'charts',
  'clickEffects',
  'codeCopy',
  'codeHighlight',
  'codeLang',
  'codeLinenumbers',
  'codeTrafficLight',
  'colorMode',
  'commentsAvatars',
  'darkMode',
  'donation',
  'emoji',
  'footer',
  'imagePreview',
  'license',
  'live2d',
  'lock',
  'musicPlayer',
  'notation',
  'notice',
  'postBottomImage',
  'postMessage',
  'postTopImage',
  'qrcode',
  'signature',
  'toast',
  'tools',
  'webTag',
]

function findFiles(dir: string, ext: string, out: string[] = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry)
    const st = fs.statSync(full)
    if (st.isDirectory()) {
      findFiles(full, ext, out)
    } else if (entry.endsWith(ext)) {
      out.push(full)
    }
  }
  return out
}

describe('dist 产物契约：扁平布局 + exports 通配', () => {
  it('dist/index.js 存在且为未 minify 的 ESM 聚合（含全部插件 re-export）', () => {
    const file = path.join(distRoot, 'index.js')
    expect(
      fs.existsSync(file),
      'dist/index.js 应存在（先运行 pnpm --dir packages/plugins build）',
    ).toBe(true)

    const code = fs.readFileSync(file, 'utf8')
    // ESM 聚合：导出语句
    expect(code, '应为 ESM（含 export { 导出语句）').toContain('export {')
    // 未 minify：多行输出（30 个插件的未压缩 bundle 应有数百行）
    expect(code.split('\n').length, '未 minify（行数应远超压缩产物）').toBeGreaterThan(50)
    // 含全部插件 re-export
    for (const name of PLUGIN_EXPORTS) {
      expect(code, `dist/index.js 应含 ${name} 的 re-export`).toContain(name)
    }
  })

  it('dist/<plugin>/index.css 与 src/plugins/**/*.css 一一对应，dist/plugins 层不存在', () => {
    const srcCss = findFiles(srcPluginsRoot, '.css')
      .map((f) => path.relative(srcPluginsRoot, f))
      .sort()
    expect(srcCss.length, 'src/plugins 下应有 css 清单').toBeGreaterThan(0)

    for (const rel of srcCss) {
      const dest = path.join(distRoot, rel)
      expect(fs.existsSync(dest), `dist/${rel} 应存在`).toBe(true)
      expect(
        fs.readFileSync(dest, 'utf8'),
        `dist/${rel} 内容应与 src/plugins/${rel} 一致`,
      ).toBe(fs.readFileSync(path.join(srcPluginsRoot, rel), 'utf8'))
    }

    // dist 侧无陈旧/多余 css（与 src 清单完全一致）
    const distCss = findFiles(distRoot, '.css')
      .map((f) => path.relative(distRoot, f))
      .sort()
    expect(distCss, 'dist css 应与 src css 一一对应').toEqual(srcCss)

    // 扁平布局：无 dist/plugins 层
    expect(
      fs.existsSync(path.join(distRoot, 'plugins')),
      'dist/plugins 层不应存在',
    ).toBe(false)
  })

  it('package.json exports/files/scripts 切换到产物契约', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8'))

    expect(pkg.exports['./*'], 'exports 应含 "./*": "./dist/*"').toBe('./dist/*')
    expect(pkg.exports['.'].import, 'exports["."].import 应指向 dist').toBe(
      './dist/index.js',
    )
    expect(pkg.exports['.'].types, 'exports["."].types 保持手写 index.d.ts').toBe(
      './index.d.ts',
    )
    expect(pkg.main).toBe('./dist/index.js')
    expect(pkg.module).toBe('./dist/index.js')
    expect(pkg.types).toBe('./index.d.ts')
    expect(pkg.files, 'files 应只发布 dist + index.d.ts').toEqual([
      'dist',
      'index.d.ts',
    ])
    expect(pkg.scripts.build, 'build 应为 vp pack').toBe('vp pack')
    expect(pkg.scripts.dev, 'dev 应为 vp pack --watch').toBe('vp pack --watch')
  })
})
