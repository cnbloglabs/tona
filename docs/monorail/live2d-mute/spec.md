# live2d-mute — spec

## Problem Statement

live2d 模型互动（点击命中区域触发 motion）会播放语音/音效（如 小埋 的 `voice/*.wav`、haru 的 `snd/tapBody_*.mp3`），由 `live2d.min.js` 内部 `document.createElement('audio')` + `play()` 播放。库本身无 mute/volume 支持，博客主无法关闭模型声音。部分用户希望保留模型动画但不出声。

## Solution

`live2d` 插件选项新增布尔 `mute`（默认 `false`）。`mute: true` 时，插件包装 `HTMLAudioElement.prototype.play`：凡 `src` 命中 live2d 模型库 base URL 的 audio 一律不播放（返回已 resolved 的 promise），模型互动动画照常触发；页面其他音频（如 musicPlayer）不受影响。同时修正 `Live2dOptions` 类型（当前只有 `enable`，与真实键不符），补全全部键并加入 `mute`。

## User Stories

1. As a 博客主, I want 配置 `live2d.mute: true`, so that 模型互动不再出声，动画照常。
2. As a 现有启用 live2d 的用户, I want 不配置 `mute`, so that 升级后行为与之前完全一致（默认发声）。
3. As a 同时使用 musicPlayer 与 live2d 的博客主, I want mute 只作用于模型声音, so that 音乐播放器不受静音影响。

## Implementation Decisions

- 选项定义：`packages/options/src/index.ts` 中 `defineOptions('live2d', { … })` 新增 `mute: false`。
- 类型：`packages/options/src/types.ts` 的 `Live2dOptions` 补全实际键 `page/agent/model/width/height/position/gap` 并新增 `mute: boolean`。
- 插件行为：`packages/plugins/src/plugins/live2d/index.js` 的 `live2d()` 解构新增 `mute`；在 `loadScript(live2djs, …)` 回调内、`loadlive2d` 调用之前，若 `mute` 为 true 则安装一次 play 包装器（模块级标志判重，避免重复包装）：
  - 保存 `HTMLAudioElement.prototype.play` 原函数；包装函数中若 `this.src` 包含 live2d 模型库 base（`live2dBase` = `https://cdn.jsdelivr.net/gh/guangzan/awesCnb-live2dModels`），返回 `Promise.resolve()`；否则委托原函数。
  - 依赖库内先 `s.src = …` 再 `s.play()` 的时序，按 src 过滤可靠。
- 不改动 `live2d.min.js` 库；不加 UI。

## Testing Decisions

- 外部行为断言落在既有测试缝：`packages/options/test/index.test.ts` 的「Live2D 配置测试」——默认值断言补充 `mute: false`；合并断言补充 `mute` 键（用户未传时默认 false，另加一条传 `mute: true` 的合并断言）。
- plugins 包无测试基建（无 test 文件），play 包装逻辑保持内联小函数；验证方式为浏览器手动验证：`mute: true` 时点击模型无声且动画照常、musicPlayer 出声不受影响；`mute: false` 时行为与现状一致。

## Out of Scope

- 页面上可交互的静音/恢复按钮
- 音量调节（`volume` 0–1 配置）
- 修改或替换 `live2d.min.js` 库

## Further Notes

- 已核实 `loadlive2d` 第三参数不是音量（minified 库中无 volume 引用），故不能借库参数实现静音。
- 涉及模型声音的示例：`小埋/13.json` 的 `start` motion 含 `voice/03.wav`；`haru02.model.json` 的 tap/pinch motion 含 `snd/*.mp3`。
