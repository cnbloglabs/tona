# 03 — publish.yml 构建/打包/上传扩展到 5 主题

- Status: claimed
- Blocked by: 02

## What to build

`.github/workflows/publish.yml` 从 3 个主题扩展到 5 个（geek / reacg / shadcn / simple / view）：

- **Build themes** 步骤：5 个 `pnpm --dir themes/<name> build`
- **Package theme assets** 步骤：5 个 `zip -j <name>.zip themes/<name>/dist/<name>.min.js themes/<name>/dist/<name>.min.css`（显式列出两文件，不用 `dist/*` 通配，避免误收 `.map` 等）
- **Upload theme assets** 步骤：`gh release upload` 上传 5 个 zip（保留 `--clobber`）

npm 发布与 `changelogithub` 步骤不动。

## Acceptance criteria

- [ ] tag push 触发后，GitHub Release 出现 5 个 zip：`geek.zip` / `reacg.zip` / `shadcn.zip` / `simple.zip` / `view.zip`
- [ ] 每个 zip 恰含 `<name>.min.js` + `<name>.min.css` 两个文件（`unzip -l` 验证）
- [ ] npm 发布、changelogithub、`--clobber` 上传等既有行为不变
