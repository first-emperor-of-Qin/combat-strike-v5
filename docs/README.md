# 枪战突击 · COMBAT STRIKE — 文档索引

《枪战突击 · COMBAT STRIKE》单人 PvE 战术射击战役，从 48,512 行单文件原型迁移到 TypeScript 单仓的重写工程。

本目录是这套重写的交付文档集。

---

## 文档清单

| 文档 | 内容 | 适合谁读 |
| --- | --- | --- |
| [`MIGRATION.md`](./MIGRATION.md) | **迁移清单**。50 关 / 44 武器 / 42 BOSS 技能 / 12 BOSS 被动逐项对照表；死配置去向；机制保护清单；C1～C32 缺陷的「现象 / 旧代码位置 / 影响范围 / 修复方式 / 验证方式」；未修复项与需审批的提案 | 所有人 |
| [`PERFORMANCE.md`](./PERFORMANCE.md) | **性能实测报告**。首屏启动时间、进入关卡耗时、平均 FPS、平均帧时、P95 帧时、最差帧时、同屏敌人数、JS 堆占用，以及连续重试后的内存增量 | 性能 / QA |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | **技术选型与架构决策**。技术栈与理由、仓库结构、模拟 / 渲染 / 音频 / 输入的边界、定步长循环、内容管线、存档格式与版本、API 契约、画质档位、性能预算与度量方法 | 开发者 |
| [`LEGACY-AUDIT.md`](./LEGACY-AUDIT.md) | **旧版基线取证记录**。基线结构、三个审计脚本的提取方法、死配置与死代码台账、旧版不具备离线能力的证据 | 开发者、审阅者 |
| [`README.md`](./README.md) | 本文件 | 所有人 |

---

## 从哪里开始

### 我是维护者（要改代码）

1. 先读 [`ARCHITECTURE.md`](./ARCHITECTURE.md) 第 2 节「仓库结构」和第 3 节「模拟 / 渲染 / 音频 / 输入的边界」。
2. 记住两条硬约束：
   - **依赖方向** `apps/* → packages/game-core → packages/content`，`packages/content` 不依赖任何其他 workspace，`packages/game-core` 不依赖 DOM。
   - **`packages/content/src/generated/` 下的文件是机器产物**，不要手改——改 `packages/content/src/curated/` 下的对应文件，然后跑 `npm run content:import`。
3. 改数值之前，先在 [`MIGRATION.md`](./MIGRATION.md) 第 8 节「后续提案」里确认这件事是否已经有人提过、是否需要审批。**技能数值、伤害窗口、冷却、难度曲线、奖励经济这五类改动都需要产品审批。**
4. 改完跑一遍：

   ```bash
   npm run typecheck        # 四个 workspace 的类型检查
   npm run test             # 单元测试（game-core 76 + content 10 + api 18 = 104 个用例，全部通过）
   npm run test:e2e         # Playwright 端到端
   ```

5. 如果改动触碰了旧版行为，先查 [`MIGRATION.md`](./MIGRATION.md) 第 5 节「机制保护清单」，找到对应的回归测试，确认它仍然通过。

### 我是测试工程师

1. 现有测试分三层，都可以直接跑：

   | 层 | 命令 | 文件 | 规模 |
   | --- | --- | --- | --- |
   | 模拟内核 + 存档 + 内容包断言 | `npm run test -w @combat-strike/game-core` | `packages/game-core/test/content.test.ts`、`simulation.test.ts`、`save.test.ts`、`elite.test.ts`、`rng.test.ts` | 76 个用例 |
   | 内容包自身 | `npm run test -w @combat-strike/content` | `packages/content/test/content.test.ts` | 10 个用例 |
   | 服务端接口 | `npm run test -w @combat-strike/api` | `apps/api/test/{auth,profile,import,health}.test.ts` | 18 个用例 |
   | 端到端 | `npm run test:e2e` | `apps/web/test/e2e.spec.ts` | 14 个用例 |

2. 回归基线是 [`MIGRATION.md`](./MIGRATION.md) 第 5 节「机制保护清单」——那张表的每一行都给出了「机制 → 旧版位置 → 新模块 → 回归测试」。**新增机制时，请同时在那一节补一行**，否则下次没人说得清这个行为是有意保留还是被改坏了。

3. 重点关注 [`MIGRATION.md`](./MIGRATION.md) 第 6 节里标注了「**无自动化测试覆盖**」的条目——音频图拓扑（C18）、`AudioContext.resume()`（C19）、失焦暂停（C20）、监听器拆卸（C22）、清除存档（C25）、加载进度（C26）、设置项持久化（C27）、音效（C28）。这些是当前测试的空白区。

4. 已知的问题：内容包不变量目前有**两份**断言——`packages/content/test/content.test.ts`（中文用例名，10 个）与 `packages/game-core/test/content.test.ts`（英文用例名，11 个）。两处都要跑通；合并它们属于 `packages/` 的工作范围，见 [`MIGRATION.md`](./MIGRATION.md) 的提案 P6。

### 我是内容设计师

1. **所有游戏数据都在 `packages/content`**，不在代码里。图鉴、商店、HUD、结算里显示的每一个数字，都从内容包读出来，不存在"面板写死一份、规则用另一份"的情况。

2. 改动分两种路径：

   | 你想改什么 | 改哪里 | 然后跑 |
   | --- | --- | --- |
   | 第 31～50 关的敌人 / BOSS 描述 | `packages/content/src/curated/copy.json` | `npm run content:import` |
   | 章节名称 | `packages/content/src/curated/copy.ts` 的 `CHAPTERS` | `npm run content:import` |
   | BOSS 技能的冷却 / 前摇 / 半径 / 伤害系数 | `packages/content/src/curated/boss-skills.json` | `npm run content:import` |
   | BOSS 被动的减伤与回复数值 | `packages/content/src/curated/boss-passives.json` | `npm run content:import` |
   | 精英专属技能名 | `packages/content/src/curated/elite-skills.json` | `npm run content:import` |
   | 武器后坐力权重 | `packages/content/src/curated/recoil.json` | `npm run content:import` |

3. 导入器会**主动拦截**未处理的占位文案：某个关卡带着「XX 的近战单位」这类模板文案却没有对应的 `copy.json` 条目时，导入直接报错中止。这是为了防止旧版的占位文案回流。

4. 改完后的自检清单：

   - `npm run content:import` 成功，没有抛错；
   - `npm run test -w @combat-strike/game-core` 与 `npm run test -w @combat-strike/content` 都通过（两处都校验关卡数、章节、技能可解析性、占位文案、精英技能名）；
   - `npm run test:e2e` 通过（其中「图鉴不出现占位文案」与「图鉴展示装备与怪物两页，且数值来自内容包」两条直接覆盖内容展示）。

5. **有两处内容缺口需要设计决策**，见 [`MIGRATION.md`](./MIGRATION.md) 第 7 节：
   - 第 35 关「崩解平台」的塌陷平台机制在旧版就不存在（是名称与实现不符，不是迁移丢失）；
   - BOSS 被动在 50 关中当前全部未接线（这是数据链路的缺陷，不是设计问题，已记录待修）。

---

## 常用命令

```bash
npm run dev            # 启动客户端（Vite）
npm run dev:api        # 启动服务端（tsx watch）
npm run build          # 构建全部四个 workspace
npm run typecheck      # 类型检查
npm run test           # 单元测试（三个 workspace 依次执行：game-core → content → api）
npm run test:e2e       # 端到端
npm run content:import # 由 tools/out/ 重新生成内容包
npm run content:verify # 内容包校验
npm run db:migrate     # 应用数据库迁移
npm run db:seed        # 写入种子数据
```

---

## 已知问题

| 问题 | 位置 | 影响 |
| --- | --- | --- |
| 50 关的 `boss.passive` 全部为 `null`，BOSS 被动分支不触发 | `tools/out/deep.json` 的 `BOSS_BP_SUMMARY` 丢失了 `passive` 的值 | 12 条 BOSS 被动全部失效，详见 [`MIGRATION.md`](./MIGRATION.md) 第 7 节 |
| 18 个精英技能在 `BOSS_SKILLS` 注册表中没有条目 | `packages/content/src/generated/boss-skills.ts` | 这些精英技能仍是无操作，详见 [`MIGRATION.md`](./MIGRATION.md) C16 |

---

## 仓库一句话地图

```
packages/content   所有游戏数据与规则常量（50 关 / 44 武器 / 42 技能 / 12 被动 / 10 档难度）
packages/game-core 纯逻辑模拟内核：定步长循环、伤害管线、存档 schema、旧档迁移
apps/web            Vite + Three.js + Web Audio 客户端
apps/api            Fastify + PostgreSQL 存档服务
tools/              旧版基线审计脚本与内容包生成器
docs/               本文档集
```

旧版基线 `baseline/index.html`（48,512 行 / 3.2 MB）**只读**，不在本仓库内，由迁移工具保留。取证细节见 [`LEGACY-AUDIT.md`](./LEGACY-AUDIT.md)。
