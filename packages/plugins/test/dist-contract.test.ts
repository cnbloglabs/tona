import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vite-plus/test'

/**
 * dist 产物契约（ADR-004）：plugins 从源码分发迁移为产物分发。
 * - dist/index.js 为 ESM 聚合 re-export（未 minify），含全部插件导出
 * - dist/index.d.ts 为 TS 源码产出的真实类型声明（取代原手写全 any 的 index.d.ts）
 * - 插件 CSS 复制为 dist 扁平布局：dist/<相对 src/plugins 路径>，无 dist/plugins 层
 * - package.json exports/files/scripts 切换到产物契约
 *
 * 前置：dist 需先构建（pnpm --dir packages/plugins build 或根 pnpm build:pkg）。
 */

const pkgRoot = path.resolve(__dirname, '..')
const srcPluginsRoot = path.join(pkgRoot, 'src/plugins')
const distRoot = path.join(pkgRoot, 'dist')

/** 全部插件导出名（src/index.ts 的 re-export 清单，30 个模块 31 个名字） */
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

/** tools 按钮工厂导出名 */
const BUTTON_EXPORTS = [
  'createBackTopButton',
  'createLikeButton',
  'createFollowButton',
  'createFavoriteButton',
  'createCommentButton',
  'createDarkModeButton',
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

  it('dist/index.d.ts 为生成的真实类型声明：全插件与按钮工厂具名导出，无 any 兜底', () => {
    const file = path.join(distRoot, 'index.d.ts')
    expect(
      fs.existsSync(file),
      'dist/index.d.ts 应存在（先运行 pnpm --dir packages/plugins build）',
    ).toBe(true)

    const code = fs.readFileSync(file, 'utf8')

    // 全部插件工厂与 tools 按钮工厂的导出签名
    const exportNames = [...PLUGIN_EXPORTS, ...BUTTON_EXPORTS]
    for (const name of exportNames) {
      expect(
        code,
        `dist/index.d.ts 应含 ${name} 的导出声明`,
      ).toMatch(new RegExp(`\\b${name}\\b`))
    }

    // 类型契约真实化：Theme 取自核心包、选项为具名类型，导出签名不以 any 兜底
    expect(code, 'Theme 应来自核心包 tona').toContain('tona')
    expect(code, '不应再以 any 兜底导出签名').not.toMatch(
      /(?:export (?:declare )?function \w+\([^)]*\): any)/,
    )
    expect(code, '不应含手写全 any 契约的 createXxxButton(options?: Record<string, any>)').not.toContain(
      'options?: Record<string, any>',
    )
    expect(code, '不应含手写全 any 契约的 (theme: any, devOptions?: any)').not.toContain(
      '(theme: any, devOptions?: any)',
    )
    expect(code, '声明应真实具名（含选项类型接口名）').toContain('ToolbarItem')
  })

  it('package.json exports/files/scripts 切换到产物契约', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8'))

    expect(pkg.exports['./*'], 'exports 应含 "./*": "./dist/*"').toBe('./dist/*')
    expect(pkg.exports['.'].import, 'exports["."].import 应指向 dist').toBe(
      './dist/index.js',
    )
    expect(pkg.exports['.'].types, 'exports["."].types 应指向生成声明').toBe(
      './dist/index.d.ts',
    )
    expect(pkg.main).toBe('./dist/index.js')
    expect(pkg.module).toBe('./dist/index.js')
    expect(pkg.types, 'types 应指向生成声明').toBe('./dist/index.d.ts')
    expect(pkg.files, 'files 应只发布 dist（手写 index.d.ts 已移除）').toEqual([
      'dist',
    ])
    expect(pkg.scripts.build, 'build 应为 vp pack').toBe('vp pack')
    expect(pkg.scripts.dev, 'dev 应为 vp pack --watch').toBe('vp pack --watch')
  })
})
