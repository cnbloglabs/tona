# Domain glossary

## Reacg Migration Loss

reacg 主题在 monorepo 迁移（提交 654fde48）时丢失的 5 类功能：iconfont 图标系统、移动端菜单（`#side-btn`）、侧边栏个人信息（`custom-avatar`/`custom-info`）、滚动隐藏导航（`header-hide`）、三个代码插件（codeHighlight/codeCopy/codeLinenumbers）。对应 effort 见 `docs/monorail/reacg-restore-migration/`。

## Legacy Theme Migration

monorepo 迁移（提交 654fde48）时未迁入的旧主题补迁。仅 `simple`/`view` 两个（用户指定），其余 7 个（bilibili/bilibiliv1/csdn/demo/element/elementv1/silence）不迁。simple 保留自研 catalog（不用新 catalog 插件）；view 用新 catalog 插件。对应 effort 见 `docs/monorail/migrate-simple-view-themes/`。

## Geek Migration Loss

geek 主题在 monorepo 迁移（提交 654fde48）时丢失的 1 个模块逻辑 + 4 个代码插件：左下角 GitHub 按钮（`buildLeftsideBottomBtns`）、`codeHighlight`/`codeLinenumbers`/`codeCopy`/`codeLang`。对应 effort 见 `docs/monorail/geek-restore-migration/`。

## Live2D Mute

live2d 插件 `live2d` 配置里的布尔键 `mute`（默认 `false`）：为 true 时模型互动照常触发动画，但播放 motion sound 的 audio 不发声。

## Custom Links

用户通过主题配置 `links` 提供的外链列表（`name` + `link`）。宽屏下以侧边栏文字列表呈现；收起态下通过 Custom Links Popover 呈现。

## Collapsed Sidebar

geek 左侧栏在视口 ≤1366px 时的纯图标态：`#cnblog-nav` 只显示图标、隐藏文案；宽屏下的 `.links` 文字列表在此态隐藏。

## Custom Links Popover

Collapsed Sidebar 下挂在 `#cnblog-nav` 末尾 `fa-link` 图标上的浮层：列出 Custom Links，支持 hover 与 click 打开/关闭。

## Theme Dist

主题经 `tona-vite` 构建后的可分发产物目录（通常为 `dist/`）。默认形态为带 File Hash 的 IIFE JS + 独立 CSS；可选 Inline CSS Dist。

## Inline CSS Dist

Theme Dist 的一种形态：样式不单独输出 `.css`，由构建把 CSS 打进 IIFE JS，运行时通过 `document.createElement('style')` 注入。由 `tona-vite` 的 `inlineCss` 开启。

## File Hash

Theme Dist JS 文件名中的内容哈希段（如 `geek.DOZM4b0L.js`）。`tona-vite` 的 `hash` 控制是否写入；默认开启。
