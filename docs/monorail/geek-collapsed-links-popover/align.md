## Intent

geek 主题在较小视口（≤1366px）下侧边栏收起为纯图标时，自定义链接整块被隐藏，用户无法访问。期望在收起态提供一个自定义链接图标入口，hover/click 后通过 popover 展示自定义链接列表。

## Decisions settled

- 触发：hover 打开、移出关闭；同时支持 click 切换（兼顾触控）
- 位置：并入 `#cnblog-nav`，作为导航图标列最后一项
- 图标：`fa-link`
- 宽屏（>1366px）仍用现有文字 `.links` 列表；仅收起态显示图标 + popover；两者互斥、不重复
- `links.enable === false` 或列表为空时不渲染该 nav 图标
- popover：出现在图标右侧；鼠标可从图标移入面板；移出图标+面板后关闭；click 打开后点空白处关闭；链接 `target="_blank"`；内容为名称列表（与宽屏一致）
- ≤768px 左侧栏整栏隐藏时不另做移动端入口（本需求不管）

## Deferred

- ≤768px 移动端自定义链接入口（位置未定）

## Out of scope

- 改宽屏文字列表形态
- 其他主题（如 shadcn）
- ≤768px 另做入口

## Domain pointers

- `docs/monorail/CONTEXT.md` — Custom Links、Collapsed Sidebar、Custom Links Popover
