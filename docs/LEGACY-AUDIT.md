# 旧版基线取证记录 · LEGACY-AUDIT

本文是对旧版原型 `baseline/index.html` 的取证记录：**它长什么样**、**我们怎么把它拆开看的**、**哪些代码从来没被执行过**。

本文只记录事实，不做设计判断。缺陷清单与修复方式见 `docs/MIGRATION.md`。

---

## 1. 基线概况

| 项目 | 实测值 | 取证方式 |
| --- | --- | --- |
| 文件大小 | 3,268,069 字节（约 3.2 MB） | `wc -c` |
| 行数 | 48,512 行 | `wc -l` |
| `<script>` 标签总数 | 10 | 逐行匹配行首 `<script` |
| 其中内联块 | **8** 个 | 同上，排除带 `src` 的 |
| 其中外部脚本 | **2** 个 | `three@0.152.0`、WorkBuddy 云 SDK |
| `window` 上的全局变量 | **286** 个 | `tools/out/global-registry.json`（104 个函数 + 182 个对象） |
| `addEventListener` 调用 | 134 处 | 正则计数 |
| `removeEventListener` 调用 | **11** 处 | 正则计数 |
| `setTimeout(` 调用 | **113** 处 | 正则计数 |
| `setInterval(` 调用 | **13** 处 | 正则计数 |
| `regTimeout(` / `regInterval(` 调用 | 22 / 2 处（共 24） | 正则计数 |
| `AudioContext.resume()` 调用 | **0** 处 | 正则计数 |
| `visibilitychange` 监听 | **0** 处 | 正则计数 |

> **与上游工作说明的差异**：说明里写「9 个内联 `<script>` 块」「10 处 `removeEventListener`」。实测为 **8** 个内联块 + 2 个外部标签（共 10 个标签）与 **11** 处 `removeEventListener`。本文以实测为准。

### 1.1 内联脚本块分布

8 个内联块的长度极不均衡——第 6 块占了全文的 82%：

| 块 | 行范围 | 行数 | 内容 |
| --- | --- | --- | --- |
| 1 | 5285–5328 | 44 | 启动引导 |
| 2 | 6364–6366 | 3 | 注释：纯单机 PVE，无联机 / 登录 / 匹配逻辑，游戏直接启动 |
| 3 | 6368–7382 | 1,015 | 图鉴系统（纯数据 + DOM，不依赖 three.js） |
| 4 | 7387–7427 | 41 | 多源容错的 GLTFLoader 加载 |
| 5 | 7429–7572 | 144 | 常量与基础定义 |
| 6 | **7574–47615** | **40,042** | 游戏主体（场景、敌人、武器、音频、UI、存档） |
| 7 | 47645–48087 | 443 | 商城 / 角色 / 伙伴等外围系统 |
| 8 | 48095–48509 | 415 | WorkBuddy 云服务（登录 / 云存档 / 排行榜） |

第 6 块内部没有模块边界——数据表、渲染、规则、音效、DOM 操作全部混在一起。这是旧版所有"注释说的和代码做的对不上"类缺陷的结构性根源。

---

## 2. 取证方法

### 2.1 为什么必须用浏览器

旧版有一半的数据**只在运行时存在**：

- `LEVELS`、`BOSS_BLUEPRINTS`、`BOSS_SKILLS` 等以 `const` / `let` 声明在脚本作用域里，**不在 `window` 上**；
- 部分数值经过运行时计算或 getter 求值，源码里读不出来；
- `localStorage` 里的内容取决于用户操作。

因此静态解析只能拿到一部分，必须真正把页面跑起来。

### 2.2 三个脚本，三种手法

`tools/legacy-audit/` 下的三个脚本分别解决不同的问题：

#### `extract.mjs` — 第一轮：运行时数据

用 Playwright 打开 `file://` 指向的基线，在页面上下文里求值并序列化。

- 序列化器用 `WeakSet` 处理循环引用，用 `__FN__` 前缀保留函数源码，用 `__UNDEF__` / `__CIRC__` / `__DEPTH__` 标记特殊值。
- 全局注册表用 `Object.keys(window)` 遍历，只记录 `function` 与 `object` 类型的属性（跳过 `__` 前缀），得到那 286 个全局。
- 同时采集页面加载期间的 `console` 错误与未捕获异常。

产物：`tools/out/legacy-snapshot.json`、`global-registry.json`、`levels.json`、`boss-blueprints.json`、`weapon-display-data.json`、`weapon-full-desc.json`、`save-fn-sources.json`、`localstorage-keys.json`、`runtime-errors.json` 等。

**取证细节**：`runtime-errors.json` 记录了整页加载期间**只有 1 条 warning、0 条未捕获异常**——那条 warning 是 three.js 提示 `build/three.min.js` 在 r160 会被移除。也就是说旧版能正常跑起来，它的问题是设计层面的，不是崩溃层面的。

**取证细节**：`localstorage-keys.json` 采集到的结果是**空对象 `{}`**。审计用的是全新的浏览器 profile，本地没有任何存档。这提示了一件事：旧版的六个存档键全部依赖用户自己的浏览器，换机器即全部丢失。

#### `extract-deep.mjs` — 第二轮：脚本作用域的 `let` 绑定

有些表用 `let` 声明且从未挂到 `window`（例如 `LEVEL_WAVE_COUNTS`、`BOSS_SKILLS`、`BOSS_PASSIVES`、`TIER_DR`）。普通 `window.X` 取不到。

解法是**间接 eval**：`(0, eval)` 在全局作用域求值，因此能看到脚本作用域的绑定。

```js
const g = (0, eval);
const v = g('LEVEL_WAVE_COUNTS');
```

产物：`tools/out/deep.json`，含 `LEVEL_SUMMARY`（50 关逐关摘要）、`WEAPON_SUMMARY`、`BOSS_BP_SUMMARY`、`SLOT_DISTRIBUTION` 等。

#### `extract-constants.mjs` — 第三轮：源码数值常量

武器的真实冷却与基础伤害**不在任何一张表里**，而是散落在上百条 `const` / `let` 数值声明中，并被 `WEAPON_CATALOG` 的取值表达式引用。

脚本做法：

1. 扫描源码，按**源码顺序**抽取所有 `const|let|var NAME = <数字>;` 声明；
2. 用一个带状态的括号配对器跳过字符串字面量与行 / 块注释，避免误匹配；
3. 定位 `const WEAPON_CATALOG = {` 并括号配对取出整块；
4. 在第 1 步得到的常量表作用域内解析 `WEAPON_CATALOG` 各字段的取值表达式。

产物：`tools/out/legacy-constants.json`（含 `constants`、`weaponCatalog`）。

这一步是 C11 的解药：旧版的「18 件武器基础伤害推导表」（`baseline/index.html:13151`）写的是**设计意图**，而常量表给的是**运行时真值**。两者在 19 项中有 14 项不一致（详见 `docs/MIGRATION.md` C11）。

### 2.3 三轮取证的产物清单

| 文件 | 内容 |
| --- | --- |
| `legacy-snapshot.json` | 第一轮全量快照 |
| `global-registry.json` | 286 个 `window` 全局及其类型 |
| `levels.json` | `LEVELS` 序列化结果 |
| `boss-blueprints.json` | `BOSS_BLUEPRINTS`（50 条，含 `passive`） |
| `weapon-display-data.json` | `WEAPON_DISPLAY_DATA`（44 条，图鉴展示用） |
| `weapon-full-desc.json` | `WEAPON_FULL_DESC`（44 条） |
| `save-fn-sources.json` | 存档相关函数的源码文本 |
| `runtime-errors.json` | 加载期控制台错误与未捕获异常 |
| `localstorage-keys.json` | 采集到的 localStorage（本次为空） |
| `legacy-constants.json` | 第三轮的数值常量与武器目录 |
| `deep.json` | 第二轮的脚本作用域数据 + 逐关 / 逐武器摘要 |
| `boss-hp-table.json` | `__BOSS_HP_TABLE__`（51 个条目） |
| `level-wave-counts.json` | 第一轮尝试失败（`{"ok": false, "reason": "undefined"}`），实际数据由 `deep.json` 与源码解析补齐 |
| `tier-bonus.json` | `TIER_BONUS`（9 档） |
| `quality-level-colors.json` | 品质配色 |
| `dragoons.json` / `companions.json` / `enemies.json` / `items.json` / `monsters.json` | 各类小表 |

### 2.4 从快照到内容包

`tools/content-import/import-legacy-content.mjs` 消费上述快照，产出 `packages/content/src/generated/*`。它同时做三件校验（模板占位文案未覆盖即抛错、空洞边界规范化、章节区间连续），详见 `docs/ARCHITECTURE.md` 第 5 节。

---

## 3. 数据表台账

以下为实测的表规模。所有数字来自 `tools/out/`，可用 `node` 直接复核。

| 表 | 规模 | 位置 | 状态 |
| --- | --- | --- | --- |
| `LEVELS` | 50 关 | `baseline/index.html:16862` | 部分字段是死配置，见第 4 节 |
| `LEVEL_WAVE_COUNTS` | 50 关 | `baseline/index.html:16796` | 第 31～50 关第三槽（48～64）是死数据 |
| `BOSS_BLUEPRINTS` | 50 条 | `baseline/index.html:25069` | **运行时唯一实例化路径** |
| `BOSS_SKILLS` | **42** 条 | `baseline/index.html:24111` | 全部可达 |
| `BOSS_PASSIVES` | **12** 条 | `baseline/index.html:24805` | 全部可达 |
| `WEAPON_DISPLAY_DATA` | 44 条 | `baseline/index.html:10882` | 图鉴展示用，非运行时真值 |
| `WEAPON_FULL_DESC` | 44 条 | — | 展示文案 |
| `DIFFICULTY_CONFIG` | 10 档 | `baseline/index.html:7604` | 运行时真值 |
| `__BOSS_HP_TABLE__` | 51 个条目 | `baseline/index.html:6375` | 索引 0 占位 + 50 关 |
| `ENEMY_SHAPES` | 50 个 | `baseline/index.html:16861` | 敌人网格原型 |
| `LEVEL_TERRAIN` / `LEVEL_VOID` / `LEVEL_HAZARDS` / `LEVEL_PADS` / `LEVEL_BUFFS` | 仅第 31～50 关 | `baseline/index.html:46774` 起 | 空洞边界颠倒等缺陷见 `docs/MIGRATION.md` C14 |
| `TIER_BONUS` | 9 档 | `baseline/index.html:10823` | 装备加成 |
| `TIER_DR` | 9 档 | `baseline/index.html:10835` | 减伤，**取最高档不叠加** |
| `WEAPON_WEIGHTS` | 后坐力权重 | `baseline/index.html:10844` | — |
| `LEVEL_VARIANTS` | 50 条 | `baseline/index.html:17399` | **完全死配置** |
| `CHAPTER_CONFIGS` | 50 条 | `baseline/index.html:17398` | **完全死配置** |
| `QUALITY_DAMAGE_MULT` | 9 档 | `baseline/index.html:16535` | **完全死配置**（见 C1） |

### 3.1 武器槽位分布

实测（`tools/out/deep.json` 的 `SLOT_DISTRIBUTION`）：

| 槽位 | 数量 |
| --- | --- |
| 主武器 primary | 18 |
| 副武器 secondary | 7 |
| 近战武器 melee | 6 |
| 投掷武器 grenade | 7 |
| 战术装备 tactical | 6 |
| **合计** | **44** |

### 3.2 难度阶梯

`baseline/index.html:7604` 的 `DIFFICULTY_CONFIG` 实测倍率：

```
1 → 3 → 6 → 16 → 39 → 98 → 244 → 610 → 1526 → 3815
```

词缀分档：第 5～6 档「装甲 armored」、第 7～8 档「迅捷 swift」、第 9～10 档「再生 regen」，第 1～4 档为「标准」。

> 同一份文件里 `baseline/index.html:6373` 的注释写的是「难度倍率改为 2.5 倍制（1/2.5/6.25/… /3815，共10级）」。这是 C2。

### 3.3 BOSS 血量

`window.__BOSS_HP_TABLE__`（`baseline/index.html:6375`）实测：

| 关卡 | 血量 |
| --- | --- |
| 1 | 40,000,000 |
| 50 | 7,167,183,174,936 |

每关 ×1.28。

> `baseline/index.html:16848` 的注释写的是「BOSS血量表：20 关扁平结构（索引 0-20），第1关1亿起，每关×1.5」。这是 C3。

### 3.4 波次

`LEVEL_WAVE_COUNTS` 实测：

- 第 1～30 关一律 `[100, 100, 0]`；
- 第 15 / 20 / 25 / 30 关为 `[0, 0, 0]`（纯 BOSS）；
- 第 31～50 关第三槽为 52 / 56 / 60 / 64 / 48 循环。

但 `startNextWave()`（`baseline/index.html:17438`）在最后一波把 `waveEnemyTotal` 强制置 0，因此第三槽永远不生效（C15）。

### 3.5 BOSS 名称双源

`LEVELS[].boss.name` 与 `BOSS_BLUEPRINTS[id].name` 实测对比：

- **40 关完全相同**；
- **10 关不同，且差异全部集中在第 1～10 关**：

| 关卡 | 关卡名 | 蓝图 BOSS 名 |
| --- | --- | --- |
| 1 | 熔岩炼狱 | 熔岩巨像 |
| 2 | 深渊水域 | 水晶织网者 |
| 3 | 时空裂隙 | 沙漠吞噬者 |
| 4 | 机械坟场 | 极光守望者 |
| 5 | 毒雾沼泽 | 机械暴君 |
| 6 | 冰封王座 | 深海利维坦 |
| 7 | 雷暴高原 | 时空编织者 |
| 8 | 亡灵墓园 | 腐尸领主 |
| 9 | 炼金工坊 | 虚空主宰 |
| 10 | 虚空终焉 | 混沌原核 |

前 10 关的蓝图名是一套与关卡主题无关的旧系列（"水晶织网者"出现在"深渊水域"）。这是 C12。

---

## 4. 死配置台账

"死配置"指**被声明、被赋值、但运行时从未被读取**的字段。它们不产生错误，只是让源码看起来比实际更复杂，并诱使后来的维护者按注释去推断行为。

### 4.1 `LEVELS` 条目中的死字段

| 字段 | 声明位置 | 说明 |
| --- | --- | --- |
| `id` | `baseline/index.html:16862` 起 | 运行时用 `currentLevel` 变量，不读数组里的 `id` |
| `subtitle` | 同上 | 选关卡片未使用 |
| `boss.skills` | 同上 | 运行时走 `BOSS_BLUEPRINTS` |
| `boss.skillNames` | 同上 | 同上 |
| `boss.skillCooldowns` | 同上 | 同上 |
| `boss.passive` | 同上 | 同上 |
| `boss.passiveName` | 同上 | 同上 |
| `boss.colors` | 同上 | 同上 |
| `theme.fogNear` | 同上 | 旧版雾距固定，未按关卡读取 |
| `melee.name` / `melee.desc` | 同上 | 第 31～50 关的 `desc` 被模板覆盖 |
| `ranged.name` / `ranged.desc` | 同上 | 同上 |
| `elite.name` / `elite.desc` | 同上 | 同上 |
| `coverPattern` | 同上 | 50 关中 **46 关**的取值从未被建房逻辑读取 |
| `enemyBaseHP` | 同上 | 血量实际由 `__BOSS_HP_TABLE__` 决定 |

### 4.2 整表级的死配置

| 表 / 变量 | 位置 | 说明 |
| --- | --- | --- |
| `LEVEL_VARIANTS` | `baseline/index.html:17399` | `LEVELS.slice(1).map(...)` 派生后从未被引用 |
| `CHAPTER_CONFIGS` | `baseline/index.html:17398` | 同上 |
| `QUALITY_DAMAGE_MULT` | `baseline/index.html:16535` | 9 档倍率表；唯一调用者 `getQualityDamageMult()`（`:16536`）函数体无条件 `return 1;` |
| `getQualityDamageMult` 的调用点 | `:16416`、`:16426` | 调用了但结果恒为 1 |
| `LEVELS[].boss` 的 `skillCooldowns` | `:16883`、`:16894` 等 | 覆盖用的逐关冷却表，与注册表冲突 |
| `skillXActive` 管线 | `:11257` 起 | 9 处引用中**只被赋值为 false**，从未置 true → `skillXTimer` / `skillXCooldown` / `thunderBeamAutoFireTimer` / `THUNDER_BEAM_BASE_DMG`（`:13221`）全部不可达（C5） |
| `activateThunderBeamSkill` | `:29642` | 函数体只有 `return;`，注释「保留为空占位」 |

### 4.3 悬空引用（配置指向不存在的实体）

| 引用 | 规模 | 说明 |
| --- | --- | --- |
| `LEVELS[].boss.skills` → `BOSS_SKILLS` | 引用 65 个不同 id，其中 **23 个**不在 42 条注册表内 | `summon_firelings`、`chronoshift`、`self_repair`、`water_jet`、`summon_jellyfish`、`timeline_fracture`、`missile_barrage`、`spore_burst`、`root_prison`、`poison_rain`、`blizzard`、`ice_prison`、`chain_lightning`、`thunderstorm`、`magnetic_pull`、`summon_skeletons`、`death_aura`、`acid_flood`、`gold_transmutation`、`explosive_potion`、`black_hole`、`void_rift`、`reality_collapse`，每条恰好影响 1 关 |
| `LEVELS[].boss.passive` → `BOSS_PASSIVES` | 引用 21 个不同 id，其中 **9 个**不在 12 条被动注册表内 | `abyssal_shield`、`temporal_phasing`、`titanium_plating`、`regrowth`、`frozen_heart`、`static_field`、`undead_resilience`、`philosophers_stone`、`entropy` |
| `BOSS_BLUEPRINTS` → `BOSS_SKILLS` | 42 个技能 id，**0 处悬空** | 运行时路径是干净的 |
| `BOSS_BLUEPRINTS` → `BOSS_PASSIVES` | 12 个被动 id，**0 处悬空** | 同上 |

因为 `LEVELS[].boss` 一族是死配置，上述 23 + 9 处悬空**当前不会在运行时爆炸**。它们是定时炸弹：一旦有人"复活"死配置，就会静默失配。这是 C30。

---

## 5. 死代码台账

### 5.1 从未调用的建房函数：59 / 61，合计 2,921 行

旧版有 **61** 个 `build*Room()` 形态的函数定义。实测调用点：

| 函数 | 状态 |
| --- | --- |
| `buildRoom()` | **在用**，2 处调用（`:18663`、`:20164`） |
| `buildChapterRoom(level)` | **在用**，1 处真实调用（`:20145`） |
| 其余 **59** 个 | **从未被调用** |

那 3 个只被注释提到的（`buildForestRoom`、`buildDesertRoom`、`buildGlacierRoom`，注释在 `:18774`）也属于死代码——它们只在注释里出现，没有任何调用点。

死代码总行数按括号配对逐函数统计：**2,921 行**（约占全文 6%）。

最大的几个：

| 函数 | 行范围 | 行数 |
| --- | --- | --- |
| `buildTimeRoom` | 20937–21022 | 86 |
| `buildAbyssRoom` | 20856–20935 | 80 |
| `buildSeaGodIslandRoom` | 21991–22069 | 79 |
| `buildPrimordialAxisRoom` | 23553–23619 | 67 |
| `buildRooftopRoom` | 21024–21086 | 63 |
| `buildPrimordialChaosRoom` | 23027–23089 | 63 |

最小的三个：`buildBloodMoonTownRoom`（35 行）、`buildDesertRoom`（34 行）、`buildGlacierRoom`（30 行）。

这些函数是为 50 关各自手写场景的尝试，但最终被 `buildChapterRoom(level)` 的通用流程取代。旧版保留它们，是"作者知道方案变了但没删掉"的痕迹。

> **与上游工作说明的差异**：说明写「约 3,000 行，61 个中 59 个」。实测为 **59** 个从未调用、合计 **2,921** 行。结论一致，行数为精确值。

### 5.2 其他成规模的死代码

| 类别 | 规模 | 说明 |
| --- | --- | --- |
| 雷霆万钧（skillX）管线 | 约 200 行 | `skillXActive` 从不为 true，整条管线不可达（C5） |
| 精英技能分支 | 15 个技能 | `executeEliteSkill` 的 `switch` 只有 18 个分支且无 `default`（C16） |
| 第 31～50 关模板文案 | 80 条描述 | 「XX 的近战单位」等（C13） |
| 旧版导出 / 导入 | — | 只覆盖 `cs_save_v2`，其余五个键从未被导出 |

### 5.3 定时器与监听器的逃逸

| 现象 | 实测 | 后果 |
| --- | --- | --- |
| 定时器注册表被绕过 | `regTimeout` / `regInterval` 共 24 个调用点，裸 `setTimeout(` 113 处、裸 `setInterval(` 13 处 | 场景重建后旧回调仍会触发（C21） |
| 监听器无拆卸 | `addEventListener` 134 处 / `removeEventListener` 11 处，且 11 处全在购买确认弹窗 | 重开关卡后监听器累积（C22） |

---

## 6. 离线能力：旧版不具备

**结论：旧版构建完全无法离线运行。** 它的每一个外部资源都来自 CDN，没有一个被打包进 `index.html`。

### 6.1 外部脚本（2 个）

| 资源 | 位置 | 说明 |
| --- | --- | --- |
| `https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.min.js` | `baseline/index.html:7384` | 渲染引擎本体。three.js 官方在 r150+ 已弃用这个构建产物，并在 r160 移除——审计时控制台捕获到的唯一一条 warning 正是这个提示 |
| `https://cdn.jsdelivr.net/npm/@tencent-ai/workbuddy-cloud-sdk@dev/lib/index.global.js` | `baseline/index.html:5271` | 云服务 SDK。**`@dev` 是浮动标签**：上游任何一次发布都会改变旧版的行为，内容不可复现 |

### 6.2 加载器（4 个，多源容错）

`GLTFLoader` 从三个地址尝试加载，且**三个版本互不相同**：

- `three@0.147.0/examples/js/loaders/GLTFLoader.js`（cdn.jsdelivr.net）
- `three@0.147.0/examples/js/loaders/GLTFLoader.js`（unpkg.com）
- `three@0.137.0/examples/js/loaders/GLTFLoader.js`（cdn.jsdelivr.net）
- `three@0.137.0/examples/js/loaders/GLTFLoader.js`（unpkg.com）

加载器版本（0.147 / 0.137）与引擎版本（0.152）**不匹配**。

### 6.3 3D 模型（9 个，全部在 GitHub CDN）

`https://cdn.jsdelivr.net/gh/mrdoob/three.js@r152/examples/models/gltf/` 下的 `Soldier.glb`、`RobotExpressive.glb`、`Xbot.glb`、`Flamingo.glb`、`Parrot.glb`、`Stork.glb`、`Horse.glb`，以及 `BusterDrone/BusterDrone.gltf`。

### 6.4 字体（Google Fonts，3 个字族）

`baseline/index.html:9-11` 用 `<link>` 引入，`styles.css` 内还有两处 `@import`（`:1251`、`:2554`）：

- Orbitron（400/500/700/900）
- Rajdhani（400/500/600/700）
- JetBrains Mono（400/700）

### 6.5 外部主机汇总

| 主机 | 引用次数 | 用途 |
| --- | --- | --- |
| `cdn.jsdelivr.net` | 15 | three.js、加载器、GLB 模型、云 SDK |
| `fonts.googleapis.com` | 4 | 字体 CSS |
| `unpkg.com` | 2 | 加载器备用源 |
| `fonts.gstatic.com` | 1 | 字体文件 |
| `combat-strike.app.workbuddy.host` | 1 | 云存档服务端点 |
| `www.workbuddy.cn` | 1 | OAuth 中转 |
| `www.w3.org` | 17 | SVG 命名空间，无网络依赖 |

### 6.6 后果

| 后果 | 说明 |
| --- | --- |
| 断网即白屏 | three.js 拿不到，页面里没有 fallback |
| CDN 挂掉即不可用 | 无本地副本 |
| 行为不可复现 | `@dev` 标签 + 三个版本的加载器 |
| 字体回退导致排版变化 | 离线时 Orbitron / Rajdhani / JetBrains Mono 全部缺失 |
| 无 SRI 校验 | `<script>` 标签上没有 `integrity` 属性 |

重写版通过 npm 锁定依赖（three `^0.170.0`）、Vite 打包产物、字体本地化，消除了这一整类问题。

---

## 7. 云同步：完全耦合第三方

旧版的云路径绑定两个外部服务：

```js
// baseline/index.html:48100-48101
endpoint: 'https://combat-strike.app.workbuddy.host',
oauthRelayBaseUrl: 'https://www.workbuddy.cn/v2/as/genie-baas/oauth',
```

| 特征 | 结论 |
| --- | --- |
| 是否能独立运行 | **不能**。没有这两个服务，云存档、登录、排行榜全部失效 |
| 同步范围 | **只有 `cs_save_v2` 一个键**。英雄名册、伙伴选择、画质偏好、竞技场与副本记录都不在云端 |
| 导出 / 导入范围 | **同样只有 `cs_save_v2`** |
| 认证方式 | 第三方 OAuth 中转，登录流程不归游戏控制 |
| SDK 版本 | `@dev` 浮动标签 |

结果：一个玩家换一台电脑（或换一个浏览器），会丢失除 `cs_save_v2` 之外的一切；即使 `cs_save_v2`，也要依赖那个第三方服务仍然可用。

重写版用自持的 Fastify + PostgreSQL 取代，并支持六个旧键的完整迁移，见 `docs/ARCHITECTURE.md` 第 6～7 节。

---

## 8. 旧版存档键

| 键 | 内容 | 格式 | 清除存档是否删除 | 是否导出 | 是否上云 |
| --- | --- | --- | --- | --- | --- |
| `cs_save_v2` | 主存档（金币、拥有武器、装备栏、武器等级与经验、已解锁难度、键位、音量） | JSON | **是** | 是 | 是 |
| `cs_characters_v1` | 英雄名册与碎片 | JSON | 否 | 否 | 否 |
| `cs_companion_v1` | 伙伴选择 | 裸字符串 | 否 | 否 | 否 |
| `cs_quality_pref_v1` | 画质偏好 | JSON | 否 | 否 | 否 |
| `cs_arena_best_v1` | 竞技场记录 | JSON | 否 | 否 | 否 |
| `cs_raid_best_v1` | 副本记录 | 十进制字符串 | 否 | 否 | 否 |

「清除存档」的两处实现（`baseline/index.html:7009` 与 `:46345`）都只执行 `localStorage.removeItem('cs_save_v2')`（C25）。

旧版自己做的**唯一**一次存档迁移是把 `weaponSkill: 'KeyE'` 改成 `'Mouse1'`（`baseline/index.html:17607`）。

---

## 9. 如何复核本文的每个数字

所有数字都可以用只读方式复现，不需要改动任何文件：

```bash
# 行数、体积
wc -l baseline/index.html && wc -c baseline/index.html

# 内联脚本块
grep -n '^<script>$' baseline/index.html

# 定时器与监听器
grep -c 'setTimeout(' baseline/index.html
grep -c 'setInterval(' baseline/index.html
grep -c 'addEventListener(' baseline/index.html
grep -c 'removeEventListener(' baseline/index.html

# 死亡螺旋相关的缺席项
grep -c '\.resume()' baseline/index.html      # 0
grep -c 'visibilitychange' baseline/index.html # 0

# 审计产物
node -e "const j=require('./tools/out/global-registry.json'); console.log(Object.keys(j.data).length)"  # 286
node -e "const j=require('./tools/out/deep.json'); console.log(Object.keys(j.data.BOSS_SKILLS).length, Object.keys(j.data.BOSS_PASSIVES).length)"  # 42 12
```

`build*Room()` 的死代码统计（59 个未调用 / 2,921 行）需要做括号配对，脚本逻辑见本文第 2.2 节描述的 `extract-constants.mjs` 中同款的 `matchBraces()` 实现。

---

## 10. 相关文档

- `docs/MIGRATION.md` — 迁移台账与 C1～C30 缺陷修复记录
- `docs/ARCHITECTURE.md` — 重写版的选型与架构
- `docs/README.md` — 文档索引
