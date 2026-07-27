## Problem Statement

geek 主题在视口 ≤1366px 时左侧栏进入 Collapsed Sidebar：`#cnblog-nav` 只显示图标，而 Custom Links 所在的 `.links` 被隐藏。用户在该尺寸下无法访问已配置的自定义链接。

## Solution

在 Collapsed Sidebar 下，于 `#cnblog-nav` 末尾增加 `fa-link` 入口；hover 或 click 打开 Custom Links Popover，列出与宽屏相同的链接名称。宽屏仍用文字 `.links`，与收起态入口互斥。无链接或未启用时不渲染该入口。≤768px 左侧栏整栏隐藏，本期不另做入口。

## User Stories

1. As a 博客访客（视口 ≤1366px 且 >768px），I want 在侧边栏看到自定义链接图标并能打开列表，so that 收起态下仍能打开博主配置的外链。
2. As a 触控设备用户（同视口范围），I want 点击图标切换 popover，so that 没有稳定 hover 时也能用。
3. As a 未配置自定义链接的博主，I want 收起态不出现多余图标，so that 导航不被空入口干扰。

## Implementation Decisions

- 改动范围：geek 主题 left-sidebar（构建逻辑 + 样式），不改 `tona-options` 的 links schema
- 复用现有 Custom Links 解析（含旧 Array 配置兼容）；宽屏继续渲染 `.links`，收起态由 CSS 隐藏 `.links` 并显示 nav 内入口
- 入口并入 `#cnblog-nav` 最后一项：图标 `fa-link`，文案可保留但收起态由现有规则隐藏
- Popover：挂在该入口旁，出现在图标右侧；支持 hover 开/移出关（图标与面板之间可连续移动）；click 切换；click 打开后点文档空白关闭；列表项 `target="_blank"`
- `links.enable === false` 或解析后列表为空：不插入该 nav 项、不建 popover
- ≤768px：维持 `#left-side { display: none }`，不新增移动端入口

## Testing Decisions

- 主缝：手动验收
  - >1366：仅文字 `.links`，无 `fa-link` 入口（或入口不可见）
  - ≤1366 且 >768：无文字列表，有 `fa-link`；hover/click/移出/点空白行为符合 Solution；链接新标签打开
  - enable false 或空列表：无该图标
- 不引入 geek 主题测试脚手架；不重复测试 `getLinksOptions`

## Out of Scope

- ≤768px 移动端自定义链接入口
- 改宽屏 `.links` 形态
- 其他主题
- links 配置 schema 变更

## Further Notes

- 断点与现有样式一致：1366 / 768
- Domain：`docs/monorail/CONTEXT.md`（Custom Links、Collapsed Sidebar、Custom Links Popover）
- Align：`docs/monorail/geek-collapsed-links-popover/align.md`
