# 01 — Collapsed Custom Links Popover

Status: done
Blocked by: None

## What to build

在 geek Collapsed Sidebar（视口 ≤1366px 且 >768px）下，当 Custom Links 已启用且列表非空时，于 `#cnblog-nav` 末尾提供 `fa-link` 入口；hover 或 click 打开右侧 Custom Links Popover，列出与宽屏相同的链接（`target="_blank"`）。宽屏仍只用文字 `.links`；收起态隐藏 `.links`、只用该入口。无链接或不启用时不渲染入口。

## Acceptance criteria

- [x] `links.enable === false` 或列表为空：不出现 `fa-link` 入口
- [x] 视口 >1366px：可见文字 `.links`；收起态入口不可用/不可见（与文字列表互斥）
- [x] 视口 ≤1366px 且 >768px：文字 `.links` 隐藏；`#cnblog-nav` 末尾有 `fa-link`
- [x] hover 图标打开 popover；可从图标移入面板而不关闭；移出图标+面板后关闭
- [x] click 图标可切换 popover；click 打开后点击文档空白处关闭
- [x] popover 内每项为链接名称，点击在新标签打开（`target="_blank"`）
- [x] ≤768px 行为不变（左侧栏整栏隐藏），未新增移动端入口
