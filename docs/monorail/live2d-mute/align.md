# live2d-mute — align

## Intent

给 live2d 插件新增 `mute` 静音配置开关：启用 live2d 且配置 `mute: true` 时，模型互动（点击触发 motion）照常播放动画，但不再发出声音。面向不希望模型出声的博客用户。

## Decisions settled

- 配置形态：`live2d` 选项新增布尔 `mute`，默认 `false`（不配置时行为与现状完全一致，向后兼容）。
- 静音语义：只静音声音，互动/动画照常触发；不改变点击命中等行为。
- 实现方向：`live2d.min.js` 库内部通过 `document.createElement('audio')` + `play()` 播放 motion sound，库本身无 mute/volume 支持（`loadlive2d` 第三参数不是音量）。插件内包装 `HTMLAudioElement.prototype.play`，仅对 `src` 命中 live2d 模型库 base URL 的 audio 生效，避免影响页面其他音频（如 musicPlayer）。
- 顺带修正：`Live2dOptions` 类型当前只有 `enable` 字段，与 `defineOptions('live2d', …)` 实际键（page/agent/model/width/height/position/gap）不符；本次补全并加入 `mute`。

## Deferred

None

## Out of scope

- 页面上可交互的静音/恢复按钮（纯配置开关，无 UI）
- 音量调节（非布尔，`volume` 0–1 配置）
- 修改或替换 `live2d.min.js` 库本身

## Domain pointers

- `docs/monorail/CONTEXT.md` — 新增术语 `Live2D Mute`（锁定 `mute` 作为规范配置键名）
