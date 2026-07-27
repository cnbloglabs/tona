# Domain glossary

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
