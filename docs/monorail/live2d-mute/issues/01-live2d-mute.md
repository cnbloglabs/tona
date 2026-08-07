# 01 — live2d 插件新增 mute 静音配置开关

Status: done
Blocked by: None

## What to build

博客主配置 `live2d.mute: true` 后，模型互动（点击触发 motion）动画照常，但不再播放语音/音效；不配置时行为与现状完全一致（默认发声）；同页面的 musicPlayer 等其他音频不受影响。

端到端路径：`tona-options` 的 live2d 选项定义与类型 → `tona-plugins` 的 live2d 插件静音实现 → 既有选项测试更新。

## Acceptance criteria

- [ ] `packages/options/src/index.ts`：`defineOptions('live2d', …)` 默认值新增 `mute: false`
- [ ] `packages/options/src/types.ts`：`Live2dOptions` 补全实际键（`page/agent/model/width/height/position/gap`）并新增 `mute: boolean`
- [ ] `packages/plugins/src/plugins/live2d/index.js`：`live2d()` 解构新增 `mute`；`mute: true` 时在 `loadScript(live2djs, …)` 回调内、`loadlive2d` 调用前安装一次 `HTMLAudioElement.prototype.play` 包装器（模块级标志判重，避免重复包装）
- [ ] 包装器仅对 `this.src` 包含 live2d 模型库 base（`live2dBase`）的 audio 返回 `Promise.resolve()` 拦截播放；其余 audio 委托原 `play`
- [ ] `packages/options/test/index.test.ts`「Live2D 配置测试」更新：默认值断言含 `mute: false`；合并断言含 `mute`（含一条用户传 `mute: true` 的断言）
- [ ] `pnpm -F tona-options test:run` 通过
- [ ] 浏览器手动验证：`mute: true` 点击模型无声且动画照常、musicPlayer 正常发声；`mute: false` 与现状一致
