# 枪战突击 · COMBAT STRIKE

单人 PvE 战术射击战役的正式重制版。TypeScript + Vite + Three.js + Web Audio + Fastify + PostgreSQL。

> 本仓库是对旧版单文件原型（48,512 行 `index.html`）的完整重制。旧版原型保留在
> `../baseline/index.html`，**只读**，用于取证比对，不是运行依赖。

---

## 快速开始

```bash
npm install

# 启动前端开发服务器（http://127.0.0.1:5173）
npm run dev

# 启动 API（需要 Postgres）
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev:api
```

前端与 API 在开发模式下通过 Vite 代理互通（`/api` → `http://127.0.0.1:3000`）。

**没有网络、没有数据库也能玩**：客户端战斗不依赖 API，进度保存在浏览器本地。

---

## 仓库结构

| 路径 | 说明 |
| --- | --- |
| `packages/content` | 内容包：50 关、44 件装备、42 个 BOSS 技能、12 个 BOSS 被动、10 档难度。带类型校验。 |
| `packages/game-core` | 确定性模拟：固定步长战斗、武器/技能状态机、波次调度、结算、存档结构与旧档迁移。 |
| `apps/web` | 客户端：Three.js 渲染、输入、Web Audio 混音、HUD 与菜单。 |
| `apps/api` | 服务端：Fastify + PostgreSQL，账户、云存档、跨设备同步。 |
| `tools/legacy-audit` | 旧版取证脚本：从基线导出全部数据表与运行时快照。 |
| `tools/content-import` | 内容导入器：把取证快照转换成 `packages/content/src/generated/*`。 |
| `docs/` | 迁移清单、架构记录、旧版审计报告。 |

---

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run build` | 依次构建 content → game-core → api → web。 |
| `npm run typecheck` | 全仓库类型检查。 |
| `npm test` | 单元测试与行为回归（game-core / content / api）。 |
| `npm run test:e2e` | Playwright 端到端：菜单 → 战斗 → 结算 → 存档。 |
| `npm run content:import` | 从旧版取证快照重新生成内容包。 |
| `npm run content:verify` | 校验内容包（关卡数、装备数、占位文案、技能引用）。 |
| `npm run db:migrate` / `npm run db:seed` | 数据库迁移与种子数据。 |

---

## 旧档迁移

旧版使用 6 个互不相关的 localStorage 键。迁移工具读取它们并转换为一个带版本号的存档：

```bash
# 浏览器内：设置 → 存档 → 导入旧版存档（可粘贴或选择文件，导入前会校验并预览）
# 命令行：把旧版导出的 JSON 交给迁移工具
npm run build -w @combat-strike/game-core
node tools/migrate-legacy-save.mjs ./legacy-export.json
```

迁移会保留原档备份，并报告哪些键被读取、哪些无法解析。

---

## 部署

### 单域名生产部署（推荐）

一个容器同时提供前端静态文件与 API，只需一个域名和一套持久化 Postgres：

```bash
docker compose -f docker-compose.yml up -d postgres
docker build -t combat-strike:latest .
docker run -d --name combat-strike \
  -p 3000:3000 \
  -e DATABASE_URL="postgres://user:pass@host:5432/combat_strike" \
  -e SESSION_SECRET="<32+ 字符随机串>" \
  -e API_STATIC_DIR=/app/apps/web/dist \
  combat-strike:latest
```

环境变量模板见 `.env.example`，数据库迁移在容器启动前执行一次
（`npm run db:migrate -w @combat-strike/api`）。

### GitHub Pages 静态试玩

`.github/workflows/pages.yml` 会把 `apps/web/dist` 发布到 GitHub Pages。试玩版本不含云存档，
但本地存档与全部战斗功能完整可用。

### 备份与回滚

- Postgres 使用命名卷，`docker compose down -v` 会删除数据，普通 `docker compose down` 不会。
- 备份：`docker compose exec postgres pg_dump -U combat combat_strike > backup.sql`
- 恢复：`docker compose exec -T postgres psql -U combat combat_strike < backup.sql`
- 回滚应用：重新部署上一个镜像标签即可；数据库迁移只向前兼容，详见 `apps/api/README.md`。

---

## 文档

- [`docs/MIGRATION.md`](docs/MIGRATION.md) — 迁移清单：逐关卡 / 逐装备 / 逐技能的对照表、机制保护清单、已修复缺陷。
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — 技术选型与架构记录。
- [`docs/LEGACY-AUDIT.md`](docs/LEGACY-AUDIT.md) — 旧版基线的取证报告与死配置清单。
- [`apps/api/README.md`](apps/api/README.md) — API 接口契约、冲突与幂等语义、运维步骤。

---

## 许可与素材来源

- 代码：见仓库 LICENSE。
- 3D 模型：旧版使用的 three.js 示例模型（Soldier / Flamingo / Horse / Parrot / Stork /
  BusterDrone）仅作占位，新版尚未替换为正式资产，**属于待替换项**，已在迁移清单中标注。
- 音频：全部由 Web Audio 实时合成，无外部音频文件。
- 字体：使用系统字体栈，不依赖 Google Fonts。
