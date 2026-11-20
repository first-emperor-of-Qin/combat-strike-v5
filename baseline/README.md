# 旧版基线（只读）

`index.html` 是重制前的原始原型：**48,512 行 / 3.2 MB 的单文件实现**，包含内联的
`<style>`、9 个内联 `<script>` 块，以及从 CDN 加载的 three.js、字体、GLB 模型与云服务 SDK。

本目录**只用于取证比对**，不参与构建，也不会被任何运行时代码引用。

## 用途

- `tools/legacy-audit/` 下的脚本从这里提取权威数据表与运行时快照，写入 `tools/out/`。
- `tools/content-import/` 再把快照转换为 `packages/content/src/generated/*`。
- 因此 `npm run content:import` 可以从一份干净检出完整复现内容包。

## 重新生成取证快照

```bash
npm install
node tools/legacy-audit/extract.mjs          # 浏览器运行时快照
node tools/legacy-audit/extract-deep.mjs      # 深层表（LEVELS / 武器 / BOSS）
node tools/legacy-audit/extract-snapshot.mjs  # 源码级表（波次 / 难度 / 地形）
node tools/legacy-audit/extract-constants.mjs # 运行时数值常量与武器目录
```

审计结论见 `docs/LEGACY-AUDIT.md`，逐条对照见 `docs/MIGRATION.md`。
