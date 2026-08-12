import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

/**
 * 插件 CSS 复制（ADR-004）：src/plugins 下全部 css 复制到 dist（去掉 plugins/ 前缀），
 * dist 扁平布局（dist/&lt;plugin&gt;/index.css 对应 tona-plugins/&lt;plugin&gt;/index.css）。
 *
 * CSS 不经 src/index.js 模块图（主题按需 @import），因此无法被 vp pack 打包，
 * 需独立复制步骤。以 vite 插件形态挂在 pack.plugins 上：
 * - build（vp pack）与 dev（vp pack --watch）共用同一逻辑；
 * - writeBundle 在产物写盘后触发（clean: true 先清空 dist，顺序安全）；
 * - watch 模式下 CSS 不在模块图中，buildStart 里 addWatchFile 显式纳入监听，
 *   改 css 触发重建后 writeBundle 重新复制。
 */

const here = path.dirname(fileURLToPath(import.meta.url))
const srcRoot = path.resolve(here, '../src/plugins')
const distRoot = path.resolve(here, '../dist')

function findCssFiles(dir: string, out: string[] = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry)
    const st = fs.statSync(full)
    if (st.isDirectory()) {
      findCssFiles(full, out)
    } else if (entry.endsWith('.css')) {
      out.push(full)
    }
  }
  return out
}

/** 复制 src/plugins 下全部 css 到 dist（去掉 plugins/ 前缀），并清理 dist 中已无源的陈旧 css */
export function copyPluginCss() {
  const sources = findCssFiles(srcRoot).map((file) => path.relative(srcRoot, file))
  const copied = new Set<string>()
  for (const rel of sources) {
    const dest = path.join(distRoot, rel)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(path.join(srcRoot, rel), dest)
    copied.add(rel)
  }
  // watch 模式下删除源 css 时，dist 同步移除（保持一一对应）
  for (const distFile of findCssFiles(distRoot)) {
    const rel = path.relative(distRoot, distFile)
    if (!copied.has(rel)) {
      fs.rmSync(distFile)
    }
  }
}

/** vite 插件：构建后复制 css；watch 模式下把 css 纳入监听，改动触发重建并重新复制 */
export function copyCssPlugin(): Plugin {
  return {
    name: 'tona-plugins:copy-css',
    buildStart() {
      for (const file of findCssFiles(srcRoot)) {
        this.addWatchFile(file)
      }
    },
    writeBundle() {
      copyPluginCss()
    },
  }
}
