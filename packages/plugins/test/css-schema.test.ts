import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vite-plus/test'

/**
 * css-schema：插件 scss → css + CSS 变量迁移（issue 01）的结构断言。
 * - packages/plugins 内（src/plugins 与 example）无 .scss 残留
 * - 每个 src/plugins 下 index.css 存在；含配置变量的插件顶部有 :root 声明块
 *   （7 个原空 scss 插件——background/catalog/clickEffects/codeTrafficLight/
 *   colorMode/live2d/webTag——无配置变量，迁移后为空 css，不要求 :root）
 * - 所有 index.css 无 sass 语法残留（@use / sass: / $var / map. / @for）
 * - postMessage 展开 6 条 .message-tags a:nth-child(N) 规则，
 *   变量 --post-message-tags-background-1..6
 * - example/index.js 的 import 已改为 ./index.css
 */

const pluginsRoot = path.resolve(__dirname, '../src/plugins')
const exampleDir = path.resolve(__dirname, '../example')

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

function pluginNames() {
  return fs
    .readdirSync(pluginsRoot)
    // toast 无样式文件（无 scss 也无 css），不是 scss→css 迁移对象
    .filter((name) => name !== 'toast')
    .filter((name) => fs.statSync(path.join(pluginsRoot, name)).isDirectory())
    .sort()
}

describe('css schema：插件 scss → css + CSS 变量迁移', () => {
  it('packages/plugins 内（src/plugins 与 example）无残留 *.scss', () => {
    const scssFiles = [
      ...findFiles(pluginsRoot, '.scss'),
      ...findFiles(exampleDir, '.scss'),
    ]
    expect(scssFiles).toEqual([])
  })

  it('每个 src/plugins/*/index.css 存在', () => {
    for (const name of pluginNames()) {
      expect(fs.existsSync(path.join(pluginsRoot, name, 'index.css')), `${name}/index.css 应存在`).toBe(true)
    }
  })

  it('含配置变量的插件 index.css 顶部为 :root 声明块', () => {
    for (const name of pluginNames()) {
      const file = path.join(pluginsRoot, name, 'index.css')
      const css = fs.readFileSync(file, 'utf8')
      if (css.trim().length === 0) {
        // 原空 scss 插件（无配置变量）迁移后为空 css，无 :root
        continue
      }
      if (!css.includes(':root')) {
        // 纯样式插件（barrage 等）与 codeHighlight（--hl-* 体系）
        // 无配置变量，不要求 :root
        continue
      }
      expect(css.startsWith(':root {'), `${name}/index.css 顶部应为 :root 声明块`).toBe(true)
    }
  })

  it('所有 index.css 无 sass 语法残留', () => {
    const sassPatterns: Array<{ label: string; re: RegExp }> = [
      { label: '@use', re: /@use\b/ },
      { label: 'sass:', re: /sass:/ },
      { label: '$ 变量引用', re: /\$[A-Za-z_][\w-]*/ },
      { label: 'map.', re: /map\./ },
      { label: '@for', re: /@for\b/ },
    ]
    for (const file of findFiles(pluginsRoot, '.css')) {
      const css = fs.readFileSync(file, 'utf8')
      for (const { label, re } of sassPatterns) {
        expect(css.match(re), `${path.relative(pluginsRoot, file)} 不应含 ${label}`).toBeNull()
      }
    }
    const exampleCss = fs.readFileSync(path.join(exampleDir, 'index.css'), 'utf8')
    for (const { label, re } of sassPatterns) {
      expect(exampleCss.match(re), `example/index.css 不应含 ${label}`).toBeNull()
    }
  })

  it('postMessage/index.css 恰含 6 条 nth-child 规则且变量 -1..-6 齐备', () => {
    const css = fs.readFileSync(path.join(pluginsRoot, 'postMessage', 'index.css'), 'utf8')

    const ruleCount = (css.match(/\.message-tags a:nth-child\(/g) ?? []).length
    expect(ruleCount).toBe(6)

    for (let i = 1; i <= 6; i++) {
      expect(css, `应含 var(--post-message-tags-background-${i})`).toContain(
        `var(--post-message-tags-background-${i})`,
      )
    }
    expect(css, '不应含 sass list.nth 残留').not.toContain('list.nth')
    expect(css, '不应含 sass #{} 插值').not.toContain('#{')
  })

  it('example/index.ts 的 import 已改为 ./index.css', () => {
    const js = fs.readFileSync(path.join(exampleDir, 'index.ts'), 'utf8')
    expect(js).toContain("import './index.css'")
  })
})
