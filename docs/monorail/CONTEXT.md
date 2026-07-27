# Domain glossary

## Custom Links

用户通过主题配置 `links` 提供的外链列表（`name` + `link`）。宽屏下以侧边栏文字列表呈现；收起态下通过 Custom Links Popover 呈现。

## Collapsed Sidebar

geek 左侧栏在视口 ≤1366px 时的纯图标态：`#cnblog-nav` 只显示图标、隐藏文案；宽屏下的 `.links` 文字列表在此态隐藏。

## Custom Links Popover

Collapsed Sidebar 下挂在 `#cnblog-nav` 末尾 `fa-link` 图标上的浮层：列出 Custom Links，支持 hover 与 click 打开/关闭。
