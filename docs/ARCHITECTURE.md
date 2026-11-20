# 技术选型与架构 · ARCHITECTURE

《枪战突击 · COMBAT STRIKE》重写版的技术选型记录与架构决策。

本文回答四个问题：**为什么选这套栈**、**代码怎么组织**、**各子系统边界在哪**、**怎么验证它是对的**。

配套文档：`docs/MIGRATION.md`（逐项迁移台账）、`docs/LEGACY-AUDIT.md`（旧版取证记录）、`docs/README.md`（索引）。

---

## 1. 技术选型

### 1.1 选型总表

| 层 | 选型 | 版本 | 为什么是它 |
| --- | --- | --- | --- |
| 语言 | TypeScript | `^5.7.2` | 旧版是 48,512 行无类型 JS，286 个 `window` 全局。重写后**任何跨模块的数据形状都有编译期契约**，内容包与模拟内核之间的接口不会悄悄漂移。`strict` 模式由 `tsconfig.base.json` 统一控制。 |
| 打包 / 开发 | Vite | `^6.0.7` | 旧版从 CDN 拉 three.js、字体、GLB，离线完全不可用（见 `docs/LEGACY-AUDIT.md`）。Vite 把依赖打进产物，部署后不再需要任何外网资源。 |
| 3D | Three.js | `^0.170.0` | 沿用旧版的 three.js 生态（场景图、阴影、GLTFLoader），但版本从 CDN 上的 0.152 升到 npm 锁定的 0.170，避免 `@dev` 浮动标签。 |
| 音频 | Web Audio API（原生） | — | 旧版用的是原生 Web Audio 但图接错了（见 `docs/MIGRATION.md` C18）。重写仍用原生 API，不引入 Howler 等封装：混音图只有一个主总线和两条支路，封装反而会掩盖增益拓扑。 |
| 服务端 | Fastify | `^5.12.8` | 插件化的 schema 校验与钩子模型正好对上「认证 + 限流 + 统一错误信封」三个横切关注点；`@fastify/cors`、`@fastify/rate-limit` 官方插件齐全。 |
| 数据库 | PostgreSQL | — | 旧版云同步依赖第三方托管 Postgres + OAuth 中转，无法独立运行。重写自持 Postgres，用 `jsonb` 存档、整型 `revision` 做乐观并发。 |
| 认证 | scrypt + HMAC JWT | `jose ^6.2.18` | scrypt 是 Node 内置的内存硬 KDF，无需原生编译；会话用 JWT 签发、服务端只存 token 的哈希（`token_hash`），登出即可单点失效。 |
| 运行时校验 | Zod | `^3.24.1` | 内容包与存档 schema 共用一份定义。服务端比客户端**更严格**（`.strict()` 拒绝未知字段），客户端拼错字段会立刻报错而不是静默丢数据。 |
| 单元测试 | Vitest | `^2.1.8` | 与 Vite 共用同一套模块解析，`import` 源码即可测，不需要先构建。 |
| 端到端测试 | Playwright | `^1.65.1` | 覆盖选关、图鉴、战斗 HUD、结算、存档导入等真实用户路径。 |
| 包管理 | npm workspaces | Node `>=20` | 四个 workspace 之间的依赖用 `*` 版本互相引用，本地开发不需要额外工具链。 |

### 1.2 明确没有选的东西

| 没有选 | 原因 |
| --- | --- |
| 任何前端框架（React / Vue） | 游戏主循环是命令式的，每帧读写 DOM 与 WebGL。虚拟 DOM 在 60 FPS 下只会增加负担。UI 层用原生 DOM 辅助函数（`apps/web/src/ui/dom.ts`）按需创建元素。 |
| 物理引擎（Rapier / Cannon） | 旧版没有物理模拟，弹道是射线检测，移动是直接改坐标。引入物理引擎会改变手感，属于设计变更。 |
| ORM（Prisma / TypeORM） | 只有三张表、查询形状固定。`apps/api/src/db/` 直接用 `pg` 写 SQL，schema 变更由 `apps/api/migrations/*.sql` 显式管理。 |
| 状态管理库（Redux / Pinia） | 全局状态只有一个存档文档（`PlayerProfile`），加订阅回调即可（`apps/web/src/core/profile.ts` 的 `ProfileStore`）。 |
| Redis / 消息队列 | 单人 PvE，存档按用户 id 直接读写 Postgres，无热点。 |

---

## 2. 仓库结构

```
combat-strike/
├── packages/
│   ├── content/               内容包：所有游戏数据与规则常量
│   │   ├── src/
│   │   │   ├── types.ts       类型契约（LevelDef / WeaponDef / BossSkillDef …）
│   │   │   ├── schema.ts      Zod 运行时校验 + 占位文案检测
│   │   │   ├── index.ts       公开出口与访问器（getLevel / getWeapon / bossHpFor …）
│   │   │   ├── generated/     机器生成，勿手改
│   │   │   │   ├── levels.ts        50 关
│   │   │   │   ├── weapons.ts       44 武器
│   │   │   │   ├── boss-skills.ts   42 技能 + 12 被动
│   │   │   │   ├── boss-hp.ts       BOSS 血量表
│   │   │   │   ├── difficulty.ts    10 档难度
│   │   │   │   └── manifest.ts      清单与统计
│   │   │   └── curated/       人工修正，覆盖机器生成结果
│   │       ├── copy.json          31-50 关的模板文案替换
│   │       ├── copy.ts            章节定义（10 个具名章节）
│   │       ├── boss-skills.json    BOSS 技能行为参数
│   │       ├── boss-passives.json  BOSS 被动数值
│   │       ├── elite-skills.json   精英专属技能名
│   │       ├── recoil.json         武器后坐力权重
│   │       └── weapon-runtime.json 武器运行时数值修正
│   │   └── test/              内容包自身测试（content.test.ts，10 个用例）
│   └── game-core/             模拟内核：纯逻辑，不依赖 DOM
│       ├── src/
│       │   ├── sim/combat.ts      战斗模拟主体（1378 行）
│       │   ├── systems/damage.ts  统一伤害管线
│       │   ├── systems/weapon.ts  武器状态机
│       │   ├── systems/progression.ts 进度与难度解锁
│       │   ├── util/clock.ts      定步长时钟
│       │   ├── util/rng.ts        可复现随机数
│       │   └── save/              存档 schema / 本地存储 / 旧档迁移
│       └── test/               单元测试（content.test.ts / simulation.test.ts）
├── apps/
│   ├── web/                   客户端
│   │   ├── src/main.ts          启动与主循环
│   │   ├── src/core/            API 客户端与存档仓库
│   │   ├── src/render/          Three.js 渲染
│   │   ├── src/audio/           音频混音
│   │   ├── src/input/           输入与按键映射
│   │   └── src/ui/              DOM 界面、HUD、样式
│   │   └── test/e2e.spec.ts   Playwright 端到端用例
│   └── api/                   服务端
│       ├── src/routes/          auth / profile / health
│       ├── src/lib/             认证、密码、档案校验、错误信封
│       ├── src/db/              pg 与内存两种实现
│       ├── migrations/001_init.sql
│       └── test/               接口测试
├── tools/
│   ├── legacy-audit/          旧版基线取证脚本（Playwright 驱动真实浏览器）
│   │   ├── extract.mjs            第一轮：window 上的运行时数据
│   │   ├── extract-deep.mjs       第二轮：脚本作用域 let 绑定
│   │   ├── extract-constants.mjs  第三轮：源码数值常量
│   │   └── extract-snapshot.mjs   快照存档样本
│   ├── content-import/import-legacy-content.mjs  内容包生成器
│   └── out/                   审计产物（内容包的唯一上游）
└── docs/                      本文档集
```

### 2.1 依赖方向

```
apps/web  ──►  packages/game-core  ──►  packages/content
apps/api  ──►  packages/game-core  ──►  packages/content
```

`packages/content` **不依赖任何其他 workspace**，`packages/game-core` **不依赖 DOM**。这条依赖方向是整个架构的硬约束：

- 内容包可以被服务端（做导入校验）、客户端（做展示）、测试（做断言）三方共用。
- 模拟内核可以在 Node 里跑，不需要浏览器。`packages/game-core/test/simulation.test.ts` 的 28 个用例全部在无 DOM 环境下通过。

---

## 3. 模拟 / 渲染 / 音频 / 输入的边界

旧版把四件事塞在一个 `requestAnimationFrame` 回调里，任何一处出错都会污染其余三层。重写把它们拆成四个只通过**数据**通信的层。

### 3.1 边界定义

| 层 | 位置 | 输入 | 输出 | 禁止做的事 |
| --- | --- | --- | --- | --- |
| 模拟 | `packages/game-core/src/sim/combat.ts` | `SimulationInput`（本步的按键、视角） | `SimulationEvent[]`（命中、死亡、预警、结算） | 不读 DOM、不读时钟、不产生随机（随机走注入的 `Rng`） |
| 渲染 | `apps/web/src/render/renderer.ts` | 模拟快照 + 事件 | 画面 | 不改游戏状态、不决定规则 |
| 音频 | `apps/web/src/audio/audio.ts` | 事件 + 距离 | 声音 | 不参与游戏逻辑 |
| 输入 | `apps/web/src/input/input.ts` | 浏览器事件 | `SimulationInput` | 不直接改模拟状态 |

### 3.2 事件驱动的表现层

模拟层不直接调 `hud.showDamage()`。它把一切"发生了某事"表达成事件，由 `apps/web/src/main.ts` 统一分发：

```ts
const events = simulation.drainEvents();
for (const event of events) {
  hud.handleEvent(event);
  handleGameEvent(event);
}
```

好处是音频、UI、渲染可以各自订阅同一批事件，而不必互相认识。旧版没有这一层，所以「暴击音效」和「暴击数字」必须写在伤害结算代码里，缺一个就少一个（这正是 C28 的成因）。

### 3.3 输入边界

`InputController` 负责三件旧版没做的事：

1. **完整拆卸**：`dispose()` 移除它注册过的全部 11 个监听器，并用 `disposed` 标志保证幂等（对应 C22）。
2. **失焦即停**：`window` 的 `blur` 与 `document` 的 `visibilitychange` 都会清空按键与鼠标状态并触发暂停（对应 C20）。
3. **设置驱动**：灵敏度来自 `settings.mouseSensitivity`，不再硬编码 `0.002`（对应 C27）。

指针锁定丢失时同样清空所有按键——否则切出游戏再切回来会看到"按住不放"的状态。

---

## 4. 定步长循环

### 4.1 为什么

旧版用可变 `requestAnimationFrame` delta（上限 clamp 到 50 ms）推进整个游戏，冷却用 `> 0` 在每帧里比较。后果是射速被量化到帧栅格：0.0769 秒冷却的副武器在 60 FPS 下每 6 帧才能开火一次，实际 10 发/秒而非设计值 13 发/秒（对应 C23）。

### 4.2 怎么做

`packages/game-core/src/util/clock.ts` 的 `FixedStepClock` 把模拟与渲染解耦：

```ts
export const FIXED_STEP_SECONDS = 1 / 60;
export const MAX_FRAME_SECONDS = 0.25;   // 死亡螺旋保护
```

`advance(realDeltaSeconds)` 把真实经过的时间累加进累加器，返回**应当执行的定步长步数**；调用方逐个执行 `simulation.step(1/60, input)`。渲染用 `clock.alpha`（`[0, 1)`）在上一状态与当前状态之间插值，因此画面依然平滑，但规则与帧率无关。

主循环（`apps/web/src/main.ts`）：

```ts
const steps = clock.advance(realDelta);
for (let i = 0; i < steps; i++) {
  const snapshot = input?.buildInput() ?? EMPTY_INPUT;
  simulation.step(1 / 60, { ...snapshot, yaw, pitch });
  if (simulation.phase !== 'playing') break;
}
```

`MAX_FRAME_SECONDS = 0.25` 是死亡螺旋保护：标签页被挂起再恢复时，若不封顶，一帧会试图补上几分钟的模拟，把浏览器卡死。

### 4.3 确定性

随机性通过注入的 `Rng`（`packages/game-core/src/util/rng.ts`）产生，同一种子必然得到同一局。回归测试 `simulation determinism > produces identical results for the same seed` 与 `> produces different results for a different seed` 成对存在——前者保证可复现，后者保证随机数确实生效（防止 `Rng` 退化成常量）。

这让"重放一局看某个 bug"成为可能，也是把 42 条 BOSS 技能的行为参数搬进内容包后能安全回归的前提。

### 4.4 固定步长的代价

固定 60 Hz 意味着模拟每秒跑 60 次完整碰撞与 AI 评估，即使显示器是 144 Hz。这是有意的取舍：规则正确性优先于极限帧率。实测开销可接受（见第 9 节性能预算）。

---

## 5. 内容管线

### 5.1 三层结构

内容包的数据分三层，每层的可信度不同：

| 层 | 位置 | 可信度 | 维护方式 |
| --- | --- | --- | --- |
| 审计快照 | `tools/out/*.json` | 最高（从旧版真实运行态提取） | 由 `npm run content:import` 之外的 `tools/legacy-audit/` 脚本重新生成 |
| 人工修正 | `packages/content/src/curated/*.json` | 人工判断，覆盖机器值 | 手写，带注释说明理由 |
| 机器生成 | `packages/content/src/generated/*.ts` | 只读产物 | `npm run content:import` 重新生成 |

**关键约束**：`generated/` 下的文件头都写着「GENERATED FILE — do not edit by hand」。任何手改都会在下次 `content:import` 时被覆盖。要改数值，改 `curated/` 下的对应文件。

### 5.2 生成流程

```
baseline/index.html
   │  tools/legacy-audit/extract.mjs          （Playwright 驱动真实浏览器，取 window 上的运行时数据）
   │  tools/legacy-audit/extract-deep.mjs     （间接 eval，取脚本作用域的 let 绑定）
   │  tools/legacy-audit/extract-constants.mjs（纯源码解析，取数值常量）
   ▼
tools/out/*.json
   │  tools/content-import/import-legacy-content.mjs
   │    · 合并 curated/*.json 的修正
   │    · 规范化空洞边界（min/max）
   │    · 校验模板占位文案是否已人工覆盖，未覆盖直接抛错
   ▼
packages/content/src/generated/*.ts
   │
   ▼
packages/game-core · apps/web · apps/api
```

### 5.3 三层审计脚本各解决什么

| 脚本 | 解决的问题 | 关键手法 |
| --- | --- | --- |
| `extract.mjs` | 运行时才存在的数据（被序列化的 `LEVELS`、`BOSS_BLUEPRINTS`、存档键） | 用 Playwright 打开 `file://baseline/index.html`，在页面上下文里求值并序列化；函数保留源码文本（`__FN__` 前缀） |
| `extract-deep.mjs` | 脚本作用域的 `let` 绑定（不在 `window` 上，普通 `window.X` 取不到） | 用间接 `eval`（`(0, eval)`）在全局作用域求值，使其能看到脚本作用域绑定 |
| `extract-constants.mjs` | 数值常量（武器冷却、伤害上限等） | 纯源码解析：先用括号配对跳过字符串与注释，再按源码顺序抽取 `const`/`let`/`var` 数值声明，最后用这些常量解析 `WEAPON_CATALOG` 的取值表达式 |

第三个脚本是 C11 的解药：旧版的武器射速既不在 `WEAPON_DISPLAY_DATA`（那里是给图鉴看的展示字符串）也不在任何单一表里，而是散落在常量声明中。只有回到源码按声明顺序解析，才能拿到**运行时真实值**而不是设计意图。

### 5.4 生成即校验

导入器不是纯拷贝，它在生成过程中做三件校验，失败即中止：

1. 模板占位文案未覆盖 → 抛错（`import-legacy-content.mjs:179-183`）。这保证第 31～50 关的文案不会回退成「XX 的近战单位」。
2. 空洞矩形边界规范化 → `min`/`max` 交换（`:150-153`）。
3. 章节配置必须是连续区间 → 否则 `chapterOfLevel()` 查不到。

运行时还有一层：`packages/content/src/index.ts` 的 `validateContent()` 在启动与测试时校验整个内容包，检查关卡数量、schema 合法性、技能 / 被动可解析、空洞边界合法、武器基础伤害为正等。

### 5.5 单一数据源原则

内容包是**唯一**的数据源。图鉴、商店、HUD、结算界面里显示的每一个数字，都从同一个对象读出来，不存在"面板写死一份、规则用另一份"的情况。

旧版正是因为违反这条原则才产生 C2、C3、C11 这类缺陷：设计表、注释、运行时常量各说各话。

---

## 6. 存档格式与版本

### 6.1 从六个键到一个文档

旧版用六个互不相关的 `localStorage` 键：

| 旧键 | 内容 | 格式 |
| --- | --- | --- |
| `cs_save_v2` | 主存档 | JSON |
| `cs_characters_v1` | 英雄名册与碎片 | JSON |
| `cs_companion_v1` | 伙伴选择 | 裸字符串，**不是 JSON** |
| `cs_quality_pref_v1` | 画质偏好 | JSON |
| `cs_arena_best_v1` | 竞技场记录 | JSON |
| `cs_raid_best_v1` | 副本记录 | 十进制字符串，**不是 JSON** |

它们没有版本号、没有事务、写入互不同步——旧版的"清除存档"只删了 `cs_save_v2`（对应 C25），旧版的导出 / 导入也只覆盖 `cs_save_v2`。

重写合并为**一个带版本号的文档**：

```ts
export const PROFILE_SCHEMA_VERSION = 5;
```

文档结构（`packages/game-core/src/save/schema.ts`）：

```
PlayerProfile
├── schemaVersion : number     当前 5
├── revision      : number     单调递增，服务端乐观并发用
├── updatedAt     : number     epoch 毫秒
├── progression   : 金币、拥有物、装备栏、武器等级与经验、已解锁难度
├── loadout       : 五个槽位各一把武器
├── settings      : 音量、画质、键位、灵敏度、FOV、震屏、减弱闪光
└── stats         : 自由计数器
```

### 6.2 版本策略

- `schemaVersion` 是**形状版本**，只在文档结构不兼容变更时 +1。
- `revision` 是**并发版本**，每次成功写入 +1，与形状无关。
- 客户端提交的 `revision` / `updatedAt` 是可选的：它们归服务端所有。

服务端比客户端更严格：`apps/api/src/lib/profile.ts` 的 `requestProfileSchema` 在客户端 schema 基础上加了 `.strict()`，未知字段直接 400，而不是静默丢弃。

### 6.3 本地存储与备份

`packages/game-core/src/save/local-store.ts`：

| 键 | 内容 |
| --- | --- |
| `cs_profile_v5` | 主档 |
| `cs_profile_v5_backup` | 上一份可解析的备份 |

`saveProfile()` 的写入顺序是**先备份、再写主档**，且只有当旧主档能被 `JSON.parse` 成功时才覆盖备份——不会用一份坏数据盖掉好备份。`loadProfile()` 主档解析失败时自动回退备份，再失败才返回默认档。

`clearProfile()` 一次删除**两个**键（对应 C25）。

### 6.4 旧档迁移

`packages/game-core/src/save/legacy-migration.ts` 的 `migrateLegacySave(snapshot)` 读取全部六个旧键，产出一份新档，并返回：

```ts
interface MigrationReport {
  migrated: boolean;      // 是否有任何旧键贡献了数据
  keysRead: string[];     // 读到并解析成功的键
  keysFailed: string[];   // 存在但解析失败的键
  warnings: string[];     // 给玩家看的提示
  backup: LegacySnapshot; // 原始快照，迁移可撤销
  profile: PlayerProfile; // 迁移结果
}
```

设计要点：

- **不丢数据**：解析失败的键进入 `keysFailed` 并附警告，而不是抛异常或静默丢弃。
- **可撤销**：`backup` 保留原始快照。
- **忠实复刻旧版唯一的迁移**：旧版自己做的唯一一件事是把 `weaponSkill: 'KeyE'` 改成 `'Mouse1'`（旧版 `baseline/index.html:17607`）。重写复刻了这一点，但把目标键改成中键 `Mouse2`（重写的默认键位是 `Mouse2`，与旧版默认值 `Mouse1` 的语义一致）。
- **不迁移 `ts`**：旧档里的 `ts` 是第三方后端的云冲突键，新架构用 `revision` 取代，直接丢弃。

`readLegacySnapshot(storage)` 从任意 `localStorage` 兼容对象里抽出六个键，与迁移逻辑解耦，因此可以脱离浏览器做单元测试。

### 6.5 两条迁移路径

| 路径 | 入口 | 用途 |
| --- | --- | --- |
| 本地导入 | `apps/web` 启动时调用 `readLegacySnapshot()` + `migrateLegacySave()` | 老玩家在浏览器里直接升级 |
| 服务端导入 | `POST /api/profile/import` | 把旧档内容提交给服务端转换 |

两条路径共用同一个 `migrateLegacySave()`，因此行为一致。

---

## 7. API 契约

服务端的每个响应体要么是数据，要么是统一错误信封：

```json
{ "error": { "code": "...", "message": "..." } }
```

`code` 取自 `apps/api/src/lib/errors.ts` 的封闭集合：`validation_error`、`invalid_credentials`、`unauthorized`、`email_taken`、`revision_conflict`、`not_found`、`rate_limited`、`bad_request`、`internal_error`。冲突等场景会在 `error` 旁边**并列**附加额外字段（如当前档案）。

### 7.1 端点一览

| 方法 | 路径 | 认证 | 说明 |
| --- | --- | --- | --- |
| `GET` | `/api/health` | 否 | 数据库状态与 API 版本 |
| `POST` | `/api/auth/register` | 否 | 注册，返回 token 与用户 |
| `POST` | `/api/auth/login` | 否 | 登录，返回 token 与用户 |
| `POST` | `/api/auth/logout` | 是 | 注销当前会话（204） |
| `GET` | `/api/me` | 是 | 当前用户 |
| `GET` | `/api/profile` | 是 | 读取档案与修订号 |
| `PUT` | `/api/profile` | 是 | 写入档案（乐观并发） |
| `POST` | `/api/profile/import` | 是 | 导入旧版存档 |

每个端点都有对应的接口测试（`apps/api/test/`，共 18 个用例）：

| 端点 | 测试 |
| --- | --- |
| `GET /api/health` | `GET /api/health > reports the database state and the api version`；`GET /api/health > returns the error envelope for an unknown route` |
| `POST /api/auth/register` | `auth routes > registers a user, logs in and returns the same account on /api/me`；`auth routes > refuses to register the same email twice` |
| `POST /api/auth/login` | `auth routes > rejects a wrong password with 401 and the error envelope`；`auth routes > rejects an unknown email with the same envelope` |
| `POST /api/auth/logout` | `auth routes > invalidates the session on logout` |
| 全部受保护端点 | `auth routes > rejects a protected route without a token`；`profile routes > requires authentication`；`POST /api/profile/import > requires authentication` |
| `GET /api/profile` | `profile routes > returns the default profile with revision 0 when nothing was saved yet` |
| `PUT /api/profile` | `profile routes > stores a profile and returns revision 1`；`profile routes > rejects a stale baseRevision with 409 and returns the current profile`；`profile routes > does not bump the revision when the payload is unchanged`；`profile routes > keeps one user out of another user profile`；`profile routes > rejects a profile with unknown fields` |
| `POST /api/profile/import` | `POST /api/profile/import > converts a legacy blob and reports which keys were read`；`POST /api/profile/import > reports unreadable blobs instead of failing` |

### 7.2 认证

- 密码用 **scrypt** 哈希（`apps/api/src/lib/password.ts`），参数可配。
- 会话 token 是 **HMAC 签名的 JWT**（`apps/api/src/lib/auth.ts`），默认有效期 7 天（`SESSION_TTL_SECONDS`）。
- 服务端**只存 token 的哈希**（`sessions.token_hash`），不存明文；登出删除该行即失效。
- 未知邮箱与错误密码返回**相同**的信封（`invalid_credentials`），并且未知邮箱分支会额外跑一次 scrypt 校验，把两边耗时拉平（`apps/api/src/routes/auth.ts` 的 `timingEqualiser`）。
- 注册与登录路由单独配置限流（`config.authRateLimitMax`）。

生产环境必填项：`DATABASE_URL`、`JWT_SECRET`（长度 ≥ 32）。缺失时 `loadConfig()` 抛 `ConfigError`，不静默降级。

### 7.3 `PUT /api/profile`：修订号冲突与幂等

请求体：

```json
{
  "profile": { "schemaVersion": 5, "progression": {...}, "loadout": {...}, "settings": {...} },
  "baseRevision": 3
}
```

服务端处理顺序（`apps/api/src/routes/profile.ts`）：

1. **校验**：`putProfileBodySchema` 解析失败 → 400 `validation_error`，附每个 issue 的路径与消息。
2. **幂等**：若存档内容与当前存档**内容相等**（比较时剔除服务端拥有的 `revision` / `updatedAt`），直接返回 200 且**不推进修订号**。重试因此是安全的空操作。
3. **冲突**：若 `baseRevision !== currentRevision` → 409 `revision_conflict`，并在响应中并列返回**当前档案**与当前修订号，客户端据此提示玩家。
4. **写入**：`revision = currentRevision + 1`，`db.putProfile()` 以 `expectedRevision` 做数据库层的条件更新。
5. **竞态兜底**：若第 4 步的条件更新失败（读写之间被别人抢先），重新读取并返回 409。

客户端提交内容相同但本地时钟不同，不应推进修订号——这是第 2 步存在的原因，比较函数 `profilesEqual()` 专门剔除了两个服务端字段。

对应测试：`profile routes > stores a profile and returns revision 1`、`> rejects a stale baseRevision with 409 and returns the current profile`、`> does not bump the revision when the payload is unchanged`、`> keeps one user out of another user profile`、`> rejects a profile with unknown fields`。

### 7.4 `POST /api/profile/import`：旧档导入

请求体：

```json
{ "legacy": { "cs_save_v2": "{...}", "cs_characters_v1": "{...}", "cs_companion_v1": "myriad", "...": null } }
```

处理流程：

1. 未知键 → 记入 `warnings`（`未知的旧版存档键「X」已忽略。`），不报错。
2. 调用 `migrateLegacySave()`，得到档案与迁移报告。
3. 与 `PUT` 相同的幂等 / 冲突 / 竞态处理。
4. 响应包含 `profile`、`revision`，以及 `report`（`migrated`、`keysRead`、`keysFailed`、`warnings`、`backup`）。

对应测试：`POST /api/profile/import > converts a legacy blob and reports which keys were read`、`> reports unreadable blobs instead of failing`、`> requires authentication`。

### 7.5 数据表

`apps/api/migrations/001_init.sql` 定义三张表：

| 表 | 主键 | 说明 |
| --- | --- | --- |
| `users` | `id uuid` | 邮箱（`citext`，大小写不敏感）唯一 + scrypt 密码哈希 |
| `sessions` | `id uuid` | 每设备一行，只存 token 哈希，带过期时间 |
| `profiles` | `user_id uuid` | 一人一档；`revision integer` + `payload jsonb` |

`profiles.user_id` 既是主键又是外键，**一档不可能属于两个账号，也不可能成为孤儿**（对应测试 `profile routes > keeps one user out of another user profile`）。`payload` 上有 `CHECK (jsonb_typeof(payload) = 'object')` 约束。

`apps/api/src/db/` 同时提供 `pg.ts`（PostgreSQL）与 `in-memory.ts`（测试用）两套实现，接口定义在 `db/types.ts` 的 `Db` 接口上，因此测试不需要真实数据库。

---

## 8. 画质档位

`apps/web/src/render/renderer.ts` 的 `QUALITY_PROFILES` 定义四档：

| 档位 | 名称 | 像素比 | 阴影 | 阴影贴图 | 同屏敌人数 | 伤害数字上限 | 粒子上限 | 抗锯齿 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 低 | 0.75 | 关 | 512 | 40 | 8 | 30 | 关 |
| 1 | 中 | 1.00 | 关 | 1024 | 55 | 16 | 60 | 关 |
| 2 | 高 | 1.00 | 开 | 2048 | 80 | 28 | 120 | 开 |
| 3 | 极致 | 1.50 | 开 | 2048 | 80 | 40 | 200 | 开 |

默认值是档位 2（"高"），并开启自适应画质（`adaptiveQuality`）。三处上限都是**渲染层**的节流，不影响模拟：模拟里敌人数量由波次配置决定，渲染层只决定同屏画多少个。

像素比取 `Math.min(window.devicePixelRatio, quality.pixelRatio)`，避免在 3× 屏上按 3× 渲染而把填充率打满。

震屏与闪光由 `shakeIntensity`（0～2）和 `reduceFlashing` 控制（对应 C27）。`reduceFlashing` 打开后全屏闪光被关闭。

---

## 9. 性能预算与度量方法

### 9.1 预算

以下是**目标值**，不是实测值。它们定义了"什么算慢"，用于后续回归对比。

| 指标 | 预算 | 度量点 |
| --- | --- | --- |
| 模拟单步耗时 | ≤ 1.5 ms（60 Hz 下占预算的 9%） | `simulation.step()` 前后的 `performance.now()` 差值 |
| 渲染单帧耗时 | ≤ 16.6 ms（60 FPS 满帧） | `requestAnimationFrame` 回调内 `renderer.render()` 前后的差值 |
| 关卡切换到可操作 | ≤ 500 ms | 点击关卡 → 第一帧渲染完成 |
| 档案内存本地写入 | ≤ 5 ms | `saveProfile()` 同步耗时（`JSON.stringify` + 两次 `setItem`） |
| API `PUT /api/profile` | ≤ 300 ms（服务端，不含网络） | 服务端路由耗时 |
| 稳定内存占用 | ≤ 350 MB（档位 2，Chromium） | `performance.memory.usedJSHeapSize` |
| 首屏可交互 | ≤ 1.5 s | `DOMContentLoaded` → 主菜单可点击 |

### 9.2 度量方法

**模拟耗时**——`packages/game-core` 里用 `ManualClock`（`util/clock.ts`）驱动，测试环境没有真实时钟：

```ts
const clock = new ManualClock();
clock.advance(60);            // 推进 60 秒
const t0 = performance.now();
for (let i = 0; i < 3600; i++) simulation.step(1 / 60, EMPTY_INPUT);
const perStep = (performance.now() - t0) / 3600;
```

**渲染耗时**——`apps/web` 的 HUD 有 FPS 计数器（`settings.showFps`），但它测的是整帧率而非渲染分段。要定位瓶颈，用 Chromium DevTools Performance 面板录制，按 `renderer.render()` 的调用点切开。

**端到端帧率**——Playwright 的 `apps/web/test/e2e.spec.ts` 已经能进入关卡并驱动模拟推进，可在此基础上扩展一个性能用例：在无头浏览器里连续采样 `requestAnimationFrame` 间隔，断言中位数帧时间低于预算。

**档案内存写入**——`loadProfile()` / `saveProfile()` 接受任意 `ProfileStorage` 实现，`createMemoryStorage()` 提供内存实现，因此写入耗时可以在单元测试里直接测，不必打开真实 `localStorage`。

**API 耗时**——服务端已有 `FastifyDeprecation` 日志与结构化日志字段，`apps/api/src/app.ts` 注册了请求日志。压测用 `autocannon` 打 `PUT /api/profile`，观察 p99。

### 9.3 确定性带来的性能红利

因为模拟是确定性的（固定步长 + 注入 `Rng`），性能回归可以用**固定脚本**重放：同一颗种子、同一串输入，模拟侧的 CPU 耗时应该逐帧稳定。这让"这次提交让模拟慢了 3%"变成一个可自动检测的指标，而不是靠感觉。

---

## 10. 相关文档

- `docs/MIGRATION.md` — 迁移台账：50 关 / 44 武器 / 42 技能 / 12 被动逐项对照，C1～C32 缺陷修复记录
- `docs/LEGACY-AUDIT.md` — 旧版基线的取证方法与死代码台账
- `docs/README.md` — 文档索引与「从哪里开始」
