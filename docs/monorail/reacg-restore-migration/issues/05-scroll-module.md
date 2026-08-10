# 05 — scroll 模块（滚动隐藏导航）

Status: done
Blocked by: 01

## What to build

从提交 `654fde48^` 的 `src/themes/reacg/build/scroll/` 恢复滚动隐藏导航，迁入 `themes/reacg/src/modules/scroll/`：

- `index.js`：原样迁入滚动方向判定（`scrollFunc`）与 `$(window).scroll` 监听：向下滚动给 `#header` 加 `header-hide`、给 `#catalog` 加 `catalog-scroll-up`；向上滚动移除。导出 `export function install()`。
- `header-hide` 样式补进 `themes/reacg/src/style/index.scss`：
  ```scss
  #header.header-hide {
    transform: translate3d(0, -100%, 0);
    transition: all 0.2s;
  }
  ```
  （`catalog-scroll-up` 样式已在 `plugins.scss`，不重复。注意 `#header` 在 index.scss 已有 `position: fixed`，transform 隐藏有效。）

**适配改动（相对旧代码）**：`install()` 内部为事件绑定，无 import 依赖（纯 jQuery + window）。

## Acceptance criteria

- [ ] `modules/scroll/index.js` 就位，导出 `install()`
- [ ] `index.scss` 含 `#header.header-hide` 的 `translate3d` 样式
- [ ] 构建成功；产物 `dist/reacg.js` 含 `header-hide`/`catalog-scroll-up` 滚动逻辑
- [ ] 产物 inline CSS 含 `#header.header-hide` 样式
