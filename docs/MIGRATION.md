# 迁移清单 · MIGRATION

《枪战突击 · COMBAT STRIKE》从单文件旧版原型迁移到 TypeScript 单仓的重写记录。

| 项目 | 值 |
| --- | --- |
| 旧版基线 | `baseline/index.html`（只读，48,512 行 / 3.2 MB） |
| 重写仓库 | `combat-strike/`（npm workspaces 单仓） |
| 内容包 | `packages/content`（50 关 / 44 武器 / 42 BOSS 技能 / 12 BOSS 被动 / 10 档难度） |
| 模拟内核 | `packages/game-core`（定步长模拟、存档 schema、旧档迁移） |
| 客户端 | `apps/web`（Vite + Three.js + Web Audio） |
| 服务端 | `apps/api`（Fastify + PostgreSQL） |
| 本文件定位 | 迁移台账：逐关、逐武器、逐机制的落地对照与缺陷修复记录 |

## 如何阅读本文件

- 第 1～3 节是**数据台账**：50 关、44 武器、42 BOSS 技能、12 BOSS 被动，机器生成，勿手改。
- 第 4 节是**死配置对照**：旧版写了但从未被读取的配置项去了哪里。
- 第 5 节是**机制保护清单**：旧版行为 → 新模块 → 回归测试三元对照，是防回归的核心。
- 第 6 节是**已修复缺陷**：C1～C32，每条含现象、旧代码位置、影响范围、修复方式、验证方式。
- 第 7 节是**未修复 / 需审批**：属于设计变更而非缺陷，未在本次迁移中改动。
- 第 8 节是**后续提案**：会改变数值、难度曲线或奖励经济的改动，需产品审批。

## 数据来源与复现

关卡表、武器表、BOSS 技能表均由脚本从内容包读取生成，不手工录入：

```bash
npm run content:import   # 由 tools/out/ 的审计快照重新生成 packages/content/src/generated/*
npm run test -w @combat-strike/game-core   # 校验内容包与模拟内核
```

内容包的生成链路与审计方法见 `docs/LEGACY-AUDIT.md`。

---

## 1. 关卡迁移表（50 关）

新实现位置指向 `packages/content/src/generated/levels.ts` 中该关数据块的起始行号。

| 旧 ID | 名称 | 章节 | 新实现位置 | 地形/机关 | BOSS | 验证状态 |
| 1 | 熔岩炼狱 | 1 异境试炼 | `packages/content/src/generated/levels.ts:11` | 地形 flat | 炎魔之王·伊格尼斯（技能 炎弹齐射（fireball_volley）、熔岩池（lava_pool）、烈焰新星（flame_nova）；被动 熔岩护甲（molten_armor）） | 精英技 熔岩突进；通过 |
| 2 | 深渊水域 | 1 异境试炼 | `packages/content/src/generated/levels.ts:131` | 地形 flat | 深渊利维坦（技能 水晶碎片（crystal_shards）、蛛网束缚（web_entangle）、棱镜光束（prism_beam）；被动 水晶共鸣（crystal_resonance）） | 精英技 漩涡牵引；通过 |
| 3 | 时空裂隙 | 1 异境试炼 | `packages/content/src/generated/levels.ts:251` | 地形 flat | 时间领主·克洛诺斯（技能 沙暴喷射（sand_burst）、潜地突袭（burrow_strike）、召唤圣甲虫（summon_scarabs）；被动 沙之护甲（sand_armor）） | 精英技 闪现打击；通过 |
| 4 | 机械坟场 | 1 异境试炼 | `packages/content/src/generated/levels.ts:371` | 地形 flat | 机械暴君·零号（技能 冰枪（ice_lance）、极光束（aurora_beam）、寒冰新星（frost_nova）；被动 冰冻光环（frozen_aura）） | 精英技 冲锋盾击；通过 |
| 5 | 毒雾沼泽 | 1 异境试炼 | `packages/content/src/generated/levels.ts:491` | 地形 flat | 腐化树灵·耶克（技能 火箭弹幕（rocket_barrage）、激光横扫（laser_sweep）、EMP爆发（emp_burst）；被动 护盾再生（shield_regen）） | 精英技 诅咒毒云；通过 |
| 6 | 冰封王座 | 2 元素试炼 | `packages/content/src/generated/levels.ts:611` | 地形 flat | 霜之哀伤·弗罗斯特（技能 墨汁云（ink_cloud）、触手拍击（tentacle_slam）、潮汐波（tidal_wave）；被动 深海治愈（aquatic_healing）） | 精英技 寒冰突刺；通过 |
| 7 | 雷暴高原 | 2 元素试炼 | `packages/content/src/generated/levels.ts:731` | 地形 flat | 雷霆之主·托尔（技能 时间减速（time_slow）、相位转移（phase_shift）、时空裂隙（temporal_rift）；被动 时间回响（temporal_echo）） | 精英技 雷霆跳跃；通过 |
| 8 | 亡灵墓园 | 2 元素试炼 | `packages/content/src/generated/levels.ts:851` | 地形 flat | 骸骨大帝·奥斯（技能 瘟疫云（plague_cloud）、骨矛（bone_spear）、亡灵召唤（raise_dead）；被动 不死意志（undying_will）） | 精英技 死亡冲锋；通过 |
| 9 | 炼金工坊 | 2 元素试炼 | `packages/content/src/generated/levels.ts:971` | 地形 flat | 黄金贤者·赫尔墨斯（技能 虚空弹（void_bolt）、重力井（gravity_well）、维度撕裂（dimensional_tear）；被动 虚空护盾（void_shield）） | 精英技 混沌嬗变；通过 |
| 10 | 虚空终焉 | 2 元素试炼 | `packages/content/src/generated/levels.ts:1091` | 地形 flat | 万物终结者·奈特（技能 混沌爆发（chaos_burst）、现实断裂（reality_fracture）、熵增之波（entropy_wave）；被动 永恒循环（eternal_cycle）） | 精英技 虚空爆裂；通过 |
| 11 | 凛冬哨站 | 3 霜寂冰原 | `packages/content/src/generated/levels.ts:1211` | 地形 flat | 凛冬将军·布伦希（技能 冰枪（ice_lance）、寒冰新星（frost_nova）、极光束（aurora_beam）；被动 冰冻光环（frozen_aura）） | 精英技 寒霜突刺；通过 |
| 12 | 冰晶回廊 | 3 霜寂冰原 | `packages/content/src/generated/levels.ts:1331` | 地形 flat | 冰晶女王·格蕾塔（技能 水晶碎片（crystal_shards）、棱镜光束（prism_beam）、蛛网束缚（web_entangle）；被动 水晶共鸣（crystal_resonance）） | 精英技 闪现突袭；通过 |
| 13 | 寒渊裂口 | 3 霜寂冰原 | `packages/content/src/generated/levels.ts:1451` | 地形 flat | 寒渊领主·纳迦（技能 潮汐波（tidal_wave）、墨汁云（ink_cloud）、触手拍击（tentacle_slam）；被动 深海治愈（aquatic_healing）） | 精英技 漩涡牵引；通过 |
| 14 | 永冻祭坛 | 3 霜寂冰原 | `packages/content/src/generated/levels.ts:1571` | 地形 flat | 永冻时守·克罗诺斯二世（技能 时间减速（time_slow）、相位转移（phase_shift）、时空裂隙（temporal_rift）；被动 时间回响（temporal_echo）） | 精英技 相位突袭；通过 |
| 15 | 霜寂王座 | 3 霜寂冰原 | `packages/content/src/generated/levels.ts:1691` | 地形 flat | 霜寂主宰·瓦尔基里（技能 冰枪（ice_lance）、寒冰新星（frost_nova）、火箭弹幕（rocket_barrage）；被动 冰冻光环（frozen_aura）） | 纯 BOSS；精英技 绝对零度突刺；通过 |
| 16 | 裂隙前厅 | 4 虚空核心 | `packages/content/src/generated/levels.ts:1811` | 地形 flat | 虚空游魂·厄瑞玻斯（技能 虚空弹（void_bolt）、重力井（gravity_well）、维度撕裂（dimensional_tear）；被动 虚空护盾（void_shield）） | 精英技 虚空爆裂；通过 |
| 17 | 熵能回廊 | 4 虚空核心 | `packages/content/src/generated/levels.ts:1931` | 地形 flat | 熵能使者·卡俄斯（技能 熵增之波（entropy_wave）、混沌爆发（chaos_burst）、现实断裂（reality_fracture）；被动 永恒循环（eternal_cycle）） | 精英技 混沌嬗变；通过 |
| 18 | 虚无深渊 | 4 虚空核心 | `packages/content/src/generated/levels.ts:2051` | 地形 flat | 虚空织影·尼克斯（技能 虚空弹（void_bolt）、相位转移（phase_shift）、棱镜光束（prism_beam）；被动 虚空护盾（void_shield）） | 精英技 虚空闪现；通过 |
| 19 | 奇点之厅 | 4 虚空核心 | `packages/content/src/generated/levels.ts:2171` | 地形 flat | 混沌先知·普罗米（技能 混沌爆发（chaos_burst）、现实断裂（reality_fracture）、时空裂隙（temporal_rift）；被动 永恒循环（eternal_cycle）） | 精英技 湮灭冲击；通过 |
| 20 | 终焉核心 | 4 虚空核心 | `packages/content/src/generated/levels.ts:2291` | 地形 flat | 终焉奇点·阿撒托斯（技能 虚空弹（void_bolt）、重力井（gravity_well）、熵增之波（entropy_wave）；被动 虚空护盾（void_shield）） | 纯 BOSS；精英技 终焉爆裂；通过 |
| 21 | 曦光集市 | 5 曦金古城 | `packages/content/src/generated/levels.ts:2411` | 地形 flat | 曦金守卫·赫利俄斯（技能 曦金长枪（solar_lance）、鎏金天陨（gold_meteor）、烈日弹幕（sunburst_barrage）；被动 曦金王冠（solar_crown）） | 精英技 曦光突刺；通过 |
| 22 | 鎏金回廊 | 5 曦金古城 | `packages/content/src/generated/levels.ts:2531` | 地形 flat | 鎏金织匠·弥达斯（技能 圣辉新星（radiant_nova）、光环囚笼（halo_prison）、曦金长枪（solar_lance）；被动 天穹守护（celestial_ward）） | 精英技 曦金三连矢；通过 |
| 23 | 日冕水道 | 5 曦金古城 | `packages/content/src/generated/levels.ts:2651` | 地形 flat | 日冕祭司·阿顿（技能 审判圣径（judgment_beam）、天穹星雨（celestial_rain）、圣辉新星（radiant_nova）；被动 曦金王冠（solar_crown）） | 精英技 鎏金震击；通过 |
| 24 | 圣金天阶 | 5 曦金古城 | `packages/content/src/generated/levels.ts:2771` | 地形 flat | 圣金审判官·塞拉芬（技能 烈阳突袭（blazing_pursuit）、鎏金天陨（gold_meteor）、极光帷幕（aurora_curtain）；被动 天穹守护（celestial_ward）） | 精英技 蜃光奇袭；通过 |
| 25 | 太阳王庭 | 5 曦金古城 | `packages/content/src/generated/levels.ts:2891` | 地形 flat | 太阳君王·赫利安（技能 烈日弹幕（sunburst_barrage）、圣辉召唤（divine_summon）、审判圣径（judgment_beam）；被动 曦金王冠（solar_crown）） | 纯 BOSS；精英技 金乌掠影；通过 |
| 26 | 云端街衢 | 6 苍穹圣域 | `packages/content/src/generated/levels.ts:3011` | 地形 flat | 苍穹哨卫·泽菲罗斯（技能 极光帷幕（aurora_curtain）、曦金长枪（solar_lance）、天穹星雨（celestial_rain）；被动 天穹守护（celestial_ward）） | 精英技 极光贯枪；通过 |
| 27 | 天穹十字廊 | 6 苍穹圣域 | `packages/content/src/generated/levels.ts:3131` | 地形 flat | 天穹执政官·乌拉诺斯（技能 星坠闪现（starfall_flash）、光环囚笼（halo_prison）、圣辉新星（radiant_nova）；被动 曦金王冠（solar_crown）） | 精英技 天穹坠击；通过 |
| 28 | 极光庭园 | 6 苍穹圣域 | `packages/content/src/generated/levels.ts:3251` | 地形 flat | 极光女王·欧若拉（技能 极光帷幕（aurora_curtain）、棱镜矩阵（prism_lattice）、天穹星雨（celestial_rain）；被动 天穹守护（celestial_ward）） | 精英技 光环禁锢；通过 |
| 29 | 星辉回环 | 6 苍穹圣域 | `packages/content/src/generated/levels.ts:3371` | 地形 flat | 星辉领主·阿斯特赖俄斯（技能 圣辉召唤（divine_summon）、星坠闪现（starfall_flash）、烈日弹幕（sunburst_barrage）；被动 曦金王冠（solar_crown）） | 精英技 星屑散射；通过 |
| 30 | 苍穹圣座 | 6 苍穹圣域 | `packages/content/src/generated/levels.ts:3491` | 地形 flat | 苍穹至高·海珀里昂（技能 星坠闪现（starfall_flash）、棱镜矩阵（prism_lattice）、审判圣径（judgment_beam）；被动 天穹守护（celestial_ward）） | 纯 BOSS；精英技 炽光散界；通过 |
| 31 | 塌陷峡谷 | 7 裂隙纪元 · 崩塌之地 | `packages/content/src/generated/levels.ts:3611` | 地形 canyon；悬崖 1；机关 2（spike、laser）；弹跳台 1；增益 2 | 裂隙主宰（技能 沙暴喷射（sand_burst）、潜地突袭（burrow_strike）、烈焰新星（flame_nova）；被动 沙之护甲（sand_armor）） | 精英技 猛冲突进；通过 |
| 32 | 悬空回廊 | 7 裂隙纪元 · 崩塌之地 | `packages/content/src/generated/levels.ts:3780` | 地形 ramp；悬崖 2；机关 1（door）；弹跳台 1；增益 2 | 回廊守望者（技能 棱镜光束（prism_beam）、EMP爆发（emp_burst）、火箭弹幕（rocket_barrage）；被动 水晶共鸣（crystal_resonance）） | 精英技 寒冰新星；通过 |
| 33 | 双生阶梯 | 7 裂隙纪元 · 崩塌之地 | `packages/content/src/generated/levels.ts:3946` | 地形 terraces；悬崖 2；机关 2（crusher、crusher）；弹跳台 1；增益 2 | 阶梯双生（技能 寒冰新星（frost_nova）、潮汐波（tidal_wave）、召唤圣甲虫（summon_scarabs）；被动 冰冻光环（frozen_aura）） | 精英技 漩涡牵引；通过 |
| 34 | 熔心深井 | 7 裂隙纪元 · 崩塌之地 | `packages/content/src/generated/levels.ts:4122` | 地形 bowl；悬崖 1；机关 3（steam、steam、spike）；弹跳台 1；增益 3 | 熔心母体（技能 熔岩池（lava_pool）、烈焰新星（flame_nova）、曦金长枪（solar_lance）；被动 熔岩护甲（molten_armor）） | 精英技 烈焰新星；通过 |
| 35 | 崩解平台 | 7 裂隙纪元 · 崩塌之地 | `packages/content/src/generated/levels.ts:4304` | 地形 flat；悬崖 5；机关 1（saw）；弹跳台 2；增益 2 | 崩解之核（技能 现实断裂（reality_fracture）、混沌爆发（chaos_burst）、熵增之波（entropy_wave）；被动 虚空护盾（void_shield）） | 精英技 维度撕裂；通过 |
| 36 | 风暴尖塔 | 8 裂隙纪元 · 机关回廊 | `packages/content/src/generated/levels.ts:4494` | 地形 pyramid；悬崖 1；机关 3（laser、laser、saw）；弹跳台 1；增益 2 | 尖塔暴君（技能 极光束（aurora_beam）、天穹星雨（celestial_rain）、星坠闪现（starfall_flash）；被动 天穹守护（celestial_ward）） | 精英技 EMP爆发；通过 |
| 37 | 锈蚀升降井 | 8 裂隙纪元 · 机关回廊 | `packages/content/src/generated/levels.ts:4674` | 地形 slope；悬崖 1；机关 3（door、door、crusher）；弹跳台 1；增益 2 | 锈蚀监工（技能 火箭弹幕（rocket_barrage）、EMP爆发（emp_burst）、激光横扫（laser_sweep）；被动 护盾再生（shield_regen）） | 精英技 猛冲突进；通过 |
| 38 | 镜面迷廊 | 8 裂隙纪元 · 机关回廊 | `packages/content/src/generated/levels.ts:4853` | 地形 flat；机关 4（laser、laser、laser、laser）；弹跳台 2；增益 2 | 镜面之主（技能 棱镜光束（prism_beam）、棱镜矩阵（prism_lattice）、维度撕裂（dimensional_tear）；被动 水晶共鸣（crystal_resonance）） | 精英技 棱镜光束；通过 |
| 39 | 噬骨裂谷 | 8 裂隙纪元 · 机关回廊 | `packages/content/src/generated/levels.ts:5042` | 地形 canyon；悬崖 1；机关 3（spike、spike、steam）；弹跳台 1；增益 2 | 噬骨巨兽（技能 骨矛（bone_spear）、亡灵召唤（raise_dead）、瘟疫云（plague_cloud）；被动 不死意志（undying_will）） | 精英技 亡灵召唤；通过 |
| 40 | 洪流回旋 | 8 裂隙纪元 · 机关回廊 | `packages/content/src/generated/levels.ts:5219` | 地形 bowl；悬崖 1；机关 3（steam、steam、saw）；弹跳台 1；增益 2 | 洪流之主（技能 潮汐波（tidal_wave）、触手拍击（tentacle_slam）、墨汁云（ink_cloud）；被动 深海治愈（aquatic_healing）） | 精英技 漩涡牵引；通过 |
| 41 | 时间回廊 | 9 裂隙纪元 · 法则扭曲 | `packages/content/src/generated/levels.ts:5397` | 地形 terraces；悬崖 1；机关 2（saw、saw）；弹跳台 1；增益 2 | 时之织者（技能 时间减速（time_slow）、相位转移（phase_shift）、时空裂隙（temporal_rift）；被动 时间回响（temporal_echo）） | 精英技 时间减速；通过 |
| 42 | 虚空浮岛 | 9 裂隙纪元 · 法则扭曲 | `packages/content/src/generated/levels.ts:5567` | 地形 flat；悬崖 4；机关 1（laser）；弹跳台 2；增益 2 | 虚空吞噬者（技能 虚空弹（void_bolt）、重力井（gravity_well）、维度撕裂（dimensional_tear）；被动 虚空护盾（void_shield）） | 精英技 重力井；通过 |
| 43 | 炽阳审判庭 | 9 裂隙纪元 · 法则扭曲 | `packages/content/src/generated/levels.ts:5751` | 地形 pyramid；机关 4（laser、laser、laser、laser）；弹跳台 1；增益 2 | 炽阳审判者（技能 审判圣径（judgment_beam）、烈日弹幕（sunburst_barrage）、光环囚笼（halo_prison）；被动 曦金王冠（solar_crown）） | 精英技 烈日弹幕；通过 |
| 44 | 坍缩天梯 | 9 裂隙纪元 · 法则扭曲 | `packages/content/src/generated/levels.ts:5934` | 地形 slope；悬崖 1；机关 3（crusher、crusher、spike）；弹跳台 1；增益 2 | 天梯守门人（技能 曦金长枪（solar_lance）、圣辉新星（radiant_nova）、鎏金天陨（gold_meteor）；被动 曦金王冠（solar_crown）） | 精英技 鎏金天陨；通过 |
| 45 | 终末冰锯矿 | 9 裂隙纪元 · 法则扭曲 | `packages/content/src/generated/levels.ts:6112` | 地形 hills；悬崖 1；机关 3（saw、saw、saw）；弹跳台 1；增益 2 | 冰锯巨像（技能 冰枪（ice_lance）、寒冰新星（frost_nova）、极光帷幕（aurora_curtain）；被动 冰冻光环（frozen_aura）） | 精英技 寒冰新星；通过 |
| 46 | 炼狱熔炉 | 10 裂隙纪元 · 终焉王座 | `packages/content/src/generated/levels.ts:6292` | 地形 flat；机关 5（steam、steam、steam、steam、spike）；弹跳台 1；增益 2 | 熔炉主宰（技能 烈阳突袭（blazing_pursuit）、烈焰新星（flame_nova）、熔岩池（lava_pool）；被动 熔岩护甲（molten_armor）） | 精英技 烈阳突袭；通过 |
| 47 | 深渊钟摆 | 10 裂隙纪元 · 终焉王座 | `packages/content/src/generated/levels.ts:6478` | 地形 bowl；悬崖 1；机关 3（saw、saw、steam）；弹跳台 1；增益 2 | 钟摆守望者（技能 触手拍击（tentacle_slam）、墨汁云（ink_cloud）、潮汐波（tidal_wave）；被动 深海治愈（aquatic_healing）） | 精英技 触手拍击；通过 |
| 48 | 星骸回廊 | 10 裂隙纪元 · 终焉王座 | `packages/content/src/generated/levels.ts:6657` | 地形 slope；悬崖 2；机关 3（laser、laser、crusher）；弹跳台 2；增益 2 | 星骸游魂（技能 天穹星雨（celestial_rain）、星坠闪现（starfall_flash）、混沌爆发（chaos_burst）；被动 天穹守护（celestial_ward）） | 精英技 星坠闪现；通过 |
| 49 | 秩序断崖 | 10 裂隙纪元 · 终焉王座 | `packages/content/src/generated/levels.ts:6850` | 地形 canyon；悬崖 1；机关 4（door、laser、laser、saw）；弹跳台 1；增益 2 | 断崖裁判（技能 审判圣径（judgment_beam）、光环囚笼（halo_prison）、现实断裂（reality_fracture）；被动 时间回响（temporal_echo）） | 精英技 审判圣径；通过 |
| 50 | 终焉王座 | 10 裂隙纪元 · 终焉王座 | `packages/content/src/generated/levels.ts:7040` | 地形 pyramid；悬崖 4；机关 5（spike、laser、laser、crusher、saw）；弹跳台 2；增益 4 | 终焉·原初之座（技能 现实断裂（reality_fracture）、熵增之波（entropy_wave）、审判圣径（judgment_beam）；被动 不死意志（undying_will）） | 精英技 现实断裂；通过 |
### 验证状态图例

| 标记 | 含义 | 依据 |
| --- | --- | --- |
| 通过 | 内容包校验通过，关卡数据完整 | `packages/game-core/test/content.test.ts` → `content pack > contains all 50 levels with unique ids and 10 chapters` |
| 通过（纯 BOSS） | 该关三波全为 0，只有 BOSS | `content pack > keeps the four pure-boss levels at 15/20/25/30` |
| 通过（文案已覆盖） | 旧版模板占位描述已由人工文案替换 | `packages/content/src/curated/copy.json`；`content pack > keeps every elite skill name real` |
| 通过（文案已覆盖；空洞边界已修正） | 旧版空洞矩形边界颠倒（`minX > maxX`），导入器已规范化 | 旧版 `baseline/index.html:46787`（第 31 关）、`:46826`（第 39 关）；`content pack > validates without errors` |
| 通过（文案已覆盖；旧版无空洞条目） | 旧版 `LEVEL_VOID` 中该关无条目，重写同样为空 | 旧版 `baseline/index.html:46774` 起的 `LEVEL_VOID` 表 |
| 通过（文案已覆盖；C17 未修复） | 第 35 关「崩解平台」的塌陷平台机制在旧版就不存在，重写未补 | 见第 6 节 C17、第 7 节 |

---

## 2. 武器迁移表（44 武器）

槽位分布：主武器 18 / 副武器 7 / 近战武器 6 / 投掷武器 7 / 战术装备 6 = 44。

射速列为 `冷却间隔／发（≈发/秒）`。基础伤害取内容包的 `stats.baseDamage`，单位标签取 `stats.label`。

| 旧 ID | 名称 | 槽位 | 品质 | 基础伤害 | 射速 | 弹匣 | 新实现位置 | 验证状态 |
| `normalgrenade` | 爆炎手雷 | grenade | 1级 | 240 / 0.5 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:11` | 初始装备；通过 |
| `froststar` | 急冻霜星 | grenade | 3级 | 120 / 0.5 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:40` | 通过 |
| `deathlight` | 死神之光 | grenade | 3级 | 120 / 0.5 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:72` | 通过 |
| `luowang` | 罗网 | grenade | 4级 | 90 / 0.5 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:103` | 通过 |
| `fate` | 命运审判 | grenade | 5级 | 650 / 0.5 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:132` | 通过 |
| `genesislight` | 创世之光 | grenade | 6级 | 600 / 14.0 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:161` | 通过 |
| `tanglotus` | 佛怒唐莲 | grenade | 8级 | 800 / 0.5 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:190` | 通过 |
| `thunderblade` | 雷霆战刃 | melee | 1级 | 43 / 2.5 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:224` | 初始装备；通过 |
| `hellscythe` | 地狱魔镰 | melee | 3级 | 9/次 / 2.5 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:259` | 通过 |
| `thor` | 托尔之触 | melee | 4级 | 800 / 2.5 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:293` | 通过 |
| `guangling` | 广陵 | melee | 5级 | 160 / 2.5 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:330` | 通过 |
| `sharkblade` | 血鲨神锯 | melee | 5级 | 80/跳 / 10.0 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:367` | 通过 |
| `thousandumbrella` | 千机伞 | melee | 6级 | 520/击 / 2.0 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:403` | 通过 |
| `thunder` | 雷霆之怒 | primary | 1级 | 9/发 / 10.0 发/秒 / 150 / 1500 / 1.8 秒 | `packages/content/src/generated/weapons.ts:433` | 初始装备；通过 |
| `shadowasura` | 暗影修罗 | primary | 3级 | 28/发 / 12.0 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:461` | 通过 |
| `dragonlyknight` | 魔龙骑士 | primary | 4级 | 17/发 / 12.0 发/秒 / 50 / 1000 / 2.0 秒 | `packages/content/src/generated/weapons.ts:490` | 通过 |
| `tianshen` | 天神·冰律裁决 | primary | 5级 | 78/发 / 18.0 发/秒 / 150 / 1500 / 1.8 秒 | `packages/content/src/generated/weapons.ts:519` | 通过 |
| `zeushand` | 宙斯之手 | primary | 5级 | 173/发 / 8.0 发/秒 / 150 / 1500 / 1.8 秒 | `packages/content/src/generated/weapons.ts:551` | 通过 |
| `thunderex` | 湮雷·无限 | primary | 5级 | 90/发 / 9.0 发/秒 / 150 / 1500 / 1.8 秒 | `packages/content/src/generated/weapons.ts:580` | 通过 |
| `yanzhi` | 裁决之炎 | primary | 5级 | 150/发 / 8.0 发/秒 / 150 / 1500 / 1.8 秒 | `packages/content/src/generated/weapons.ts:613` | 通过 |
| `tumo` | 屠魔 | primary | 6级 | 800/发 / 3.0 发/秒 / 无限 / 2.5 秒 | `packages/content/src/generated/weapons.ts:645` | 通过 |
| `prism` | 棱镜 | primary | 6级 | 2200/发 / 5.0 发/秒 / 150 / 1500 / 1.8 秒 | `packages/content/src/generated/weapons.ts:674` | 通过 |
| `ciyuan` | 次元之星 | primary | 6级 | 45/发(×8弹丸) / 15.0 发/秒 / 150 / 1500 / 1.8 秒 | `packages/content/src/generated/weapons.ts:704` | 通过 |
| `dawnlight` | 黎明之光 | primary | 6级 | 150/次 / 20.0 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:739` | 通过 |
| `tianfa` | 天罚·神裁之眼 | primary | 7级 | 750/发 / 18.0 发/秒 / 150 / 1500 / 1.8 秒 | `packages/content/src/generated/weapons.ts:767` | 通过 |
| `parasite` | 寄生者 | primary | 7级 | 1800/发 / 2.0 发/秒 / 150 / 1500 / 1.8 秒 | `packages/content/src/generated/weapons.ts:800` | 通过 |
| `rift` | 裂界 | primary | 7级 | 5600/发 / 4.5 发/秒 / 150 / 1500 / 1.8 秒 | `packages/content/src/generated/weapons.ts:828` | 通过 |
| `meiying` | 魅影 | primary | 7级 | 900/发 / 18.0 发/秒 / 150 / 1500 / 1.8 秒 | `packages/content/src/generated/weapons.ts:858` | 通过 |
| `arcion` | 弧电离子 | primary | 8级 | 1300/发 / 21.0 发/秒 / 150 / 1500 / 1.8 秒 | `packages/content/src/generated/weapons.ts:891` | 通过 |
| `phasewalker` | 相位行者 | primary | 8级 | 1200/发 / 16.0 发/秒 / 150 / 1500 / 1.8 秒 | `packages/content/src/generated/weapons.ts:922` | 通过 |
| `ponghong` | 破鸿 | primary | 9级 | 1500/发 / 30.0 发/秒 / 150 / 1500 / 1.8 秒 | `packages/content/src/generated/weapons.ts:951` | 通过 |
| `shadow` | 幽影双枪 | secondary | 1级 | 8/发 / 13.0 发/秒 / 30 / 180 / 1.2 秒 | `packages/content/src/generated/weapons.ts:982` | 初始装备；通过 |
| `metalstorm` | 金属风暴 | secondary | 2级 | 5/发 / 13.0 发/秒 / 60 / 360 / 1.5 秒 | `packages/content/src/generated/weapons.ts:1010` | 通过 |
| `whitenight` | 白夜铳刃 | secondary | 4级 | 78/发 / 7.0 发/秒 / 25 / 500 / 1.8 秒 | `packages/content/src/generated/weapons.ts:1038` | 通过 |
| `duel` | 黄金决斗 | secondary | 4级 | 260/发 / 2.4 发/秒 / 7 / 48 / 1.6 秒 | `packages/content/src/generated/weapons.ts:1066` | 通过 |
| `energydefender` | 能量防卫者 | secondary | 5级 | 95/发 / 8.0 发/秒 / 10 / 30 / 1.5 秒 | `packages/content/src/generated/weapons.ts:1100` | 通过 |
| `moonbow` | 皓月神弓 | secondary | 6级 | 92/发 / 8.0 发/秒 / 150 / 1500 / 1.8 秒 | `packages/content/src/generated/weapons.ts:1132` | 通过 |
| `terminus` | 终焉·神裁 | secondary | 6级 | 120/发 / 10.0 发/秒 / 150 / 1500 / 1.8 秒 | `packages/content/src/generated/weapons.ts:1160` | 通过 |
| `datacube` | 数据魔方 | tactical | 4级 | 0 / — / 无限 / — | `packages/content/src/generated/weapons.ts:1193` | 通过 |
| `starcore` | 璀璨星核 | tactical | 5级 | 120/发 / 2.0 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:1221` | 通过 |
| `juexian` | 绝弦之诗 | tactical | 5级 | 160/发 / 3.0 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:1250` | 通过 |
| `yanmo` | 炎魔灭世 | tactical | 6级 | 200/发 / 2.5 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:1279` | 通过 |
| `chronoterminus` | 终焉时序 | tactical | 7级 | 250/发 / 2.9 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:1308` | 通过 |
| `nullsingularity` | 虚数奇点 | tactical | 9级 | 2600/发 / 4.5 发/秒 / 无限 / — | `packages/content/src/generated/weapons.ts:1337` | 通过 |
---

## 3. BOSS 技能与被动

行为原型（archetype）决定技能如何执行与如何预警：

| 原型 | 含义 |
| --- | --- |
| `projectile` | 连续发射的弹丸，锁定玩家方向 |
| `ground-aoe` | 前摇后落地的圆形伤害区 |
| `zone` | 持续存在的危险区域（池、雾、裂隙） |
| `beam` | 持续追踪的光束 / 扫射 |
| `summon` | 召唤小怪 |
| `utility` | 位移 / 增益类，无直接伤害 |

### 3.1 BOSS 技能（42 条）

| 技能 ID | 官方名称 | 行为原型 | 冷却 | 行为说明 | 新实现位置 |
| --- | --- | --- | --- | --- | --- |
| `fireball_volley` | 炎弹齐射 | 弹道 projectile | 3.5s | 连续射出数枚炎弹，弹速快但落点分散 | `packages/content/src/generated/boss-skills.ts:11` |
| `lava_pool` | 熔岩池 | 地面 AoE ground-aoe | 8s | 在地面召出熔岩池，持续灼烧踏入者 | `packages/content/src/generated/boss-skills.ts:25` |
| `flame_nova` | 烈焰新星 | 地面 AoE ground-aoe | 6s | 以自身为中心炸开一圈烈焰冲击波 | `packages/content/src/generated/boss-skills.ts:39` |
| `crystal_shards` | 水晶碎片 | 弹道 projectile | 3s | 射出棱镜碎片，命中后分裂 | `packages/content/src/generated/boss-skills.ts:53` |
| `web_entangle` | 蛛网束缚 | 持续区域 zone | 9s | 喷出蛛网定身区域，限制移动 | `packages/content/src/generated/boss-skills.ts:67` |
| `prism_beam` | 棱镜光束 | 光束 beam | 7s | 折射出持续光束，追踪玩家位置 | `packages/content/src/generated/boss-skills.ts:81` |
| `sand_burst` | 沙暴喷射 | 弹道 projectile | 4s | 喷出扇形沙弹，压制正面区域 | `packages/content/src/generated/boss-skills.ts:95` |
| `burrow_strike` | 潜地突袭 | 辅助 utility | 10s | 潜入沙下并在玩家脚下破土突袭 | `packages/content/src/generated/boss-skills.ts:109` |
| `summon_scarabs` | 召唤圣甲虫 | 召唤 summon | 12s | 召唤圣甲虫协助作战 | `packages/content/src/generated/boss-skills.ts:123` |
| `ice_lance` | 冰枪 | 弹道 projectile | 3.5s | 射出高速冰枪，贯穿路径上的敌人 | `packages/content/src/generated/boss-skills.ts:137` |
| `aurora_beam` | 极光束 | 光束 beam | 7s | 铺开极光光束，持续扫过战场 | `packages/content/src/generated/boss-skills.ts:151` |
| `frost_nova` | 寒冰新星 | 地面 AoE ground-aoe | 8s | 引爆寒冰新星，冻结范围内目标 | `packages/content/src/generated/boss-skills.ts:165` |
| `rocket_barrage` | 火箭弹幕 | 弹道 projectile | 9s | 发射火箭弹幕，落点产生爆炸 | `packages/content/src/generated/boss-skills.ts:179` |
| `laser_sweep` | 激光横扫 | 光束 beam | 11s | 旋转扫射激光，需不断移动躲避 | `packages/content/src/generated/boss-skills.ts:193` |
| `emp_burst` | EMP爆发 | 地面 AoE ground-aoe | 10s | 释放电磁脉冲，瘫痪范围内的装备技能 | `packages/content/src/generated/boss-skills.ts:207` |
| `ink_cloud` | 墨汁云 | 持续区域 zone | 8s | 喷出墨汁云，遮蔽视野并降低命中 | `packages/content/src/generated/boss-skills.ts:221` |
| `tentacle_slam` | 触手拍击 | 地面 AoE ground-aoe | 5s | 触手自地面拍击，落点产生震荡 | `packages/content/src/generated/boss-skills.ts:235` |
| `tidal_wave` | 潮汐波 | 弹道 projectile | 9s | 推动一道潮汐冲击波向前席卷 | `packages/content/src/generated/boss-skills.ts:249` |
| `time_slow` | 时间减速 | 持续区域 zone | 10s | 制造时间减速场，大幅降低玩家移速 | `packages/content/src/generated/boss-skills.ts:263` |
| `phase_shift` | 相位转移 | 辅助 utility | 8s | 相位转移，留下残影并瞬间换位 | `packages/content/src/generated/boss-skills.ts:277` |
| `temporal_rift` | 时空裂隙 | 持续区域 zone | 11s | 撕开时空裂隙，进入者受到持续伤害 | `packages/content/src/generated/boss-skills.ts:291` |
| `plague_cloud` | 瘟疫云 | 持续区域 zone | 7s | 释放瘟疫毒云，持续削减生命 | `packages/content/src/generated/boss-skills.ts:305` |
| `bone_spear` | 骨矛 | 弹道 projectile | 4s | 投掷骨矛，命中后碎裂成刺 | `packages/content/src/generated/boss-skills.ts:319` |
| `raise_dead` | 亡灵召唤 | 召唤 summon | 12s | 从骨堆中唤起亡灵为自己作战 | `packages/content/src/generated/boss-skills.ts:333` |
| `void_bolt` | 虚空弹 | 弹道 projectile | 3s | 射出虚空能量弹，追踪玩家 | `packages/content/src/generated/boss-skills.ts:347` |
| `gravity_well` | 重力井 | 持续区域 zone | 10s | 制造重力井，持续牵引并压制目标 | `packages/content/src/generated/boss-skills.ts:361` |
| `dimensional_tear` | 维度撕裂 | 地面 AoE ground-aoe | 13s | 撕裂空间，在撕口处引发坍塌 | `packages/content/src/generated/boss-skills.ts:375` |
| `chaos_burst` | 混沌爆发 | 地面 AoE ground-aoe | 8s | 爆发混沌能量，波及范围内所有目标 | `packages/content/src/generated/boss-skills.ts:389` |
| `reality_fracture` | 现实断裂 | 地面 AoE ground-aoe | 11s | 撕裂现实结构，造成大范围塌缩 | `packages/content/src/generated/boss-skills.ts:403` |
| `entropy_wave` | 熵增之波 | 弹道 projectile | 9s | 释放熵增之波，沿地面扩散推进 | `packages/content/src/generated/boss-skills.ts:417` |
| `solar_lance` | 曦金长枪 | 弹道 projectile | 6s | 掷出曦金长枪，命中后炸开金光 | `packages/content/src/generated/boss-skills.ts:431` |
| `radiant_nova` | 圣辉新星 | 地面 AoE ground-aoe | 9s | 引爆圣辉新星，照亮并灼伤全场 | `packages/content/src/generated/boss-skills.ts:445` |
| `gold_meteor` | 鎏金天陨 | 地面 AoE ground-aoe | 10s | 召来鎏金陨石砸向目标区域 | `packages/content/src/generated/boss-skills.ts:459` |
| `blazing_pursuit` | 烈阳突袭 | 辅助 utility | 8s | 化身烈阳追击玩家，无法被轻易甩开 | `packages/content/src/generated/boss-skills.ts:473` |
| `halo_prison` | 光环囚笼 | 持续区域 zone | 12s | 布下光环囚笼，困住踏入者 | `packages/content/src/generated/boss-skills.ts:487` |
| `judgment_beam` | 审判圣径 | 光束 beam | 10s | 降下审判圣径，垂直贯穿战场 | `packages/content/src/generated/boss-skills.ts:501` |
| `sunburst_barrage` | 烈日弹幕 | 弹道 projectile | 8s | 喷洒烈日弹幕，覆盖大片区域 | `packages/content/src/generated/boss-skills.ts:515` |
| `celestial_rain` | 天穹星雨 | 地面 AoE ground-aoe | 9s | 降下天穹星雨，多点连续砸落 | `packages/content/src/generated/boss-skills.ts:529` |
| `aurora_curtain` | 极光帷幕 | 持续区域 zone | 9s | 垂下极光帷幕，封锁整条通路 | `packages/content/src/generated/boss-skills.ts:543` |
| `divine_summon` | 圣辉召唤 | 召唤 summon | 14s | 召唤圣辉随从协同作战 | `packages/content/src/generated/boss-skills.ts:557` |
| `starfall_flash` | 星坠闪现 | 辅助 utility | 11s | 瞬移闪避并落下星陨 | `packages/content/src/generated/boss-skills.ts:571` |
| `prism_lattice` | 棱镜矩阵 | 持续区域 zone | 10s | 展开棱镜矩阵，反射并折射伤害 | `packages/content/src/generated/boss-skills.ts:585` |

### 3.2 BOSS 被动（12 条）

| 被动 ID | 官方名称 | 数值效果 | 行为说明 | 新实现位置 |
| --- | --- | --- | --- | --- |
| `molten_armor` | 熔岩护甲 | 减伤 18% | 受击时熔岩外壳硬化，持续减伤 18% | `packages/content/src/generated/boss-skills.ts:602` |
| `crystal_resonance` | 水晶共鸣 | 每 1s 回复 1.5% 生命 | 水晶共鸣，每次脉冲回复 1.5% 生命 | `packages/content/src/generated/boss-skills.ts:610` |
| `sand_armor` | 沙之护甲 | 减伤 12%，每 1s 回复 1.0% 生命 | 沙之护甲持续减伤 12%，并缓慢恢复 | `packages/content/src/generated/boss-skills.ts:618` |
| `frozen_aura` | 冰冻光环 | 减伤 8%，每 1s 回复 1.5% 生命 | 冰冻光环环绕，命中者被减速 | `packages/content/src/generated/boss-skills.ts:626` |
| `shield_regen` | 护盾再生 | 每 6s 回复 10.0% 生命 | 护盾再生：每 6 秒恢复 10% 生命上限的护盾 | `packages/content/src/generated/boss-skills.ts:634` |
| `aquatic_healing` | 深海治愈 | 每 1s 回复 2.0% 生命 | 深海治愈：每次脉冲回复 2% 生命 | `packages/content/src/generated/boss-skills.ts:642` |
| `temporal_echo` | 时间回响 | 减伤 15% | 时间回响：受到的伤害有 15% 被延迟返还 | `packages/content/src/generated/boss-skills.ts:650` |
| `undying_will` | 不死意志 | 减伤 5% | 不死意志：生命低于 30% 时狂暴，移速与伤害提升 50% | `packages/content/src/generated/boss-skills.ts:658` |
| `void_shield` | 虚空护盾 | 减伤 90% | 虚空护盾：持续免疫 90% 伤害 | `packages/content/src/generated/boss-skills.ts:666` |
| `eternal_cycle` | 永恒循环 | 减伤 5%，每 1s 回复 3.0% 生命 | 永恒循环：每次脉冲回复 3% 生命并召唤援军 | `packages/content/src/generated/boss-skills.ts:674` |
| `solar_crown` | 曦金王冠 | 减伤 15% | 曦金王冠：削减 15% 伤害并强化自身攻势 | `packages/content/src/generated/boss-skills.ts:682` |
| `celestial_ward` | 天穹守护 | 减伤 20% | 天穹守护：受击后生成护盾，减免 20% 伤害 | `packages/content/src/generated/boss-skills.ts:690` |

12 条被动在旧版 `BOSS_BLUEPRINTS` 中全部被引用（旧版 50 关共用到 12 个被动 id）。重写内容包曾因导入器读取了丢失 `passive` 字段的摘要表而把 50 关的 `boss.passive` 全部置为 `null`；现已改为直接读取原始蓝图表，50 关全部接回旧版被动，被动分支真实生效。详见第 7 节第 1 条。

---

## 4. 死配置 → 新实现对照

旧版 `LEVELS` 数组中有大量字段被声明但从未被任何运行时代码读取。下表逐项说明这些字段在新架构中的去向。

| 旧配置项 | 旧版位置 | 旧版状态 | 新实现位置 | 处理方式 |
| --- | --- | --- | --- | --- |
| `LEVELS[].id` | `baseline/index.html:16862` 起 | 声明但运行时不读（运行时用 `currentLevel`） | `packages/content/src/generated/levels.ts` | 保留并成为内容包主键；`getLevel(level)` 按 id 查询 |
| `LEVELS[].subtitle` | 同上 | 声明但运行时不读 | `packages/content/src/generated/levels.ts` | 保留，成为选关卡片副标题 |
| `LEVELS[].boss.skills` | 同上 | 声明但运行时不读 | `packages/content/src/generated/levels.ts` | **不复活**。运行时以 `BOSS_BLUEPRINTS` 为准，导入器只取蓝图的 `skills` 字段并从 42 条注册表解析名称与冷却 |
| `LEVELS[].boss.skillNames` | 同上 | 声明但运行时不读 | `packages/content/src/generated/levels.ts` | 同上，名称改为从 `BOSS_SKILLS` 注册表解析 |
| `LEVELS[].boss.skillCooldowns` | 同上 | 声明但运行时不读 | `packages/content/src/generated/boss-skills.ts` | 冷却改为注册表单一来源 |
| `LEVELS[].boss.passive` | 同上 | 声明但运行时不读 | `packages/content/src/generated/boss-skills.ts` | 注册表保留 12 条被动，但 50 关的引用当前为空，见第 7 节 |
| `LEVELS[].boss.passiveName` | 同上 | 声明但运行时不读 | 同上 | 同上 |
| `LEVELS[].boss.colors` | 同上 | 声明但运行时不读 | `packages/content/src/generated/levels.ts` | 保留为渲染用配色 |
| `theme.fogNear` | 同上 | 声明但运行时不读（旧版固定雾距） | `packages/content/src/generated/levels.ts` | 保留进 `LevelTheme`，渲染器按关卡读取 |
| `melee.name` / `melee.desc` | 同上 | 部分读取（描述被模板覆盖） | `packages/content/src/generated/levels.ts` + `curated/copy.json` | 名称保留旧版；第 31～50 关的模板描述由 `curated/copy.json` 人工替换 |
| `ranged.name` / `ranged.desc` | 同上 | 同上 | 同上 | 同上 |
| `elite.name` / `elite.desc` | 同上 | 同上 | 同上 | 同上 |
| `LEVEL_VARIANTS` | `baseline/index.html:17399` | 声明后从未被读取 | — | **删除**。旧版已用 `buildChapterRoom(level)` 直接读 `LEVELS` |
| `CHAPTER_CONFIGS` | `baseline/index.html:17398` | 声明后从未被读取 | `packages/content/src/curated/copy.ts` → `CHAPTERS` | **重写**。旧版运行时只输出无名的「第 N 章」；重写为 10 个具名章节（每章 5 关） |
| `enemyBaseHP` | 旧版 `LEVELS` 条目内 | 声明后从未被读取 | `packages/content/src/generated/boss-hp.ts` → `BOSS_HP_TABLE` | **删除**。血量改由 `__BOSS_HP_TABLE__` 唯一来源决定，见 `bossHpFor()` |
| `coverPattern`（50 关中 46 关） | 旧版 `LEVELS` 条目内 | 声明但未被建房逻辑读取 | `packages/content/src/generated/levels.ts` | 保留进 `LevelDef.coverPattern`；当前渲染器尚未消费，见第 8 节提案 |
| `LEVEL_VARIANTS` / `CHAPTER_CONFIGS` 派生的 `theme` 快照 | `baseline/index.html:17398-17399` | 死配置 | — | 删除 |

---

## 5. 机制保护清单

每条给出「保留的机制 → 旧版位置 → 新模块 → 证明它的回归测试」。测试名均为仓库中的真实用例名。

| 保留机制 | 旧版位置 | 新模块 | 回归测试 |
| --- | --- | --- | --- |
| 50 关、10 章节、关卡 id 唯一 | `baseline/index.html:16862` | `packages/content/src/index.ts` → `LEVELS` | `content pack > contains all 50 levels with unique ids and 10 chapters` |
| 15 / 20 / 25 / 30 为纯 BOSS 关 | `baseline/index.html:16796`（`LEVEL_WAVE_COUNTS`） | `packages/content/src/index.ts` → `PURE_BOSS_LEVELS` | `content pack > keeps the four pure-boss levels at 15/20/25/30`；`wave scheduler > treats levels 15/20/25/30 as pure boss fights` |
| 每关固定 3 波（小怪 / 精英 / BOSS） | `baseline/index.html:17438`（`startNextWave`） | `packages/game-core/src/sim/combat.ts` | `wave scheduler > runs three waves: minions, elites, then the boss` |
| 每 0.5 秒生成 3 个敌人 | `baseline/index.html:16781-16782` | `packages/game-core/src/sim/combat.ts` | `wave scheduler > spawns minions at 3 every 0.5 seconds` |
| 波间间隔 3.0 秒 | `baseline/index.html:17476`（`waveDelay = 3.0`） | `packages/game-core/src/sim/combat.ts` | 由 `wave scheduler` 用例覆盖 |
| BOSS 血量表 4,000 万起、每关 ×1.28 | `baseline/index.html:6375`（`__BOSS_HP_TABLE__`） | `packages/content/src/generated/boss-hp.ts` | `content pack > reproduces the legacy boss HP table exactly` |
| 小怪血量为 BOSS 血量的 1% / 2% | `baseline/index.html:6416` 起 | `packages/content/src/index.ts` → `minionHpFor()` | `content pack > derives minion health from 1% / 2% of the boss health` |
| 10 档难度倍率阶梯 | `baseline/index.html:7604`（`DIFFICULTY_CONFIG`） | `packages/content/src/generated/difficulty.ts` | `content pack > exposes the ten difficulty tiers with the legacy multiplier ladder`；`difficulty > scales enemy health and damage with the tier multiplier` |
| 装甲 / 迅捷 / 再生 词缀分档 | 同上 | `packages/game-core/src/systems/damage.ts` | `difficulty > applies the armour affix from tier 5`；`difficulty > applies the swift affix from tier 7`；`difficulty > applies the regen affix from tier 9` |
| 伤害公式：`baseDmg → 场内增益 → 魂力 → 武器等级 → 增伤 → ×1.5 → ×1.4` | `baseline/index.html:16411-16441`（`calcDamage`） | `packages/game-core/src/systems/damage.ts` → `calcDamage()` | `damage pipeline > matches the legacy worked example for the starter weapon`；`damage pipeline > adds 5% per weapon level`；`damage pipeline > applies the amplify, energy-defender and fate multipliers together` |
| 命中结算顺序：爆头 ×2 → 暴击 ×2 → BOSS 减伤 → 护盾 → 装甲 → 闪避 → 火焰加伤 | `baseline/index.html:29401-29439`（`shoot()`） | `packages/game-core/src/systems/damage.ts` → `applyDamage()` | `damage pipeline > doubles headshots and crits`；`damage pipeline > applies the armour affix`；`damage pipeline > can fully negate a hit with the swift affix` |
| 暴击率 = 基础 1% + 装备 + 武器等级（每级 +1%） | `baseline/index.html:11150-11174` | `packages/game-core/src/systems/damage.ts` → `getCritChance()` | `damage pipeline > includes the equipment crit bonus in the crit chance` |
| 爆头高度阈值 1.6 / 2.6 | `baseline/index.html:10652` | `packages/content/src/index.ts` → `HEAD_Y_NORMAL` / `HEAD_Y_BOSS` | `damage pipeline > doubles headshots and crits` |
| 武器等级：每级 +5% 伤害、+1% 暴击、−3% 换弹（下限 0.5×）、上限 10 级 | `baseline/index.html:16575` | `packages/game-core/src/systems/damage.ts` + `systems/progression.ts` | `damage pipeline > adds 5% per weapon level`；`progression > unlocks the next difficulty tier on clear, capped at 10` |
| 武器经验：击杀 +10、BOSS +50、升级需 100×等级 | `baseline/index.html:16575` 起 | `packages/game-core/src/systems/progression.ts` → `weaponXpForNextLevel()` / `applyWeaponXp()` | `settlement > awards score and weapon XP per kill` |
| 得分：击杀 100、BOSS 5000、连杀 (streak−1)×50 | 旧版计分函数 | `packages/game-core/src/sim/combat.ts` | `settlement > awards score and weapon XP per kill` |
| 通关只解锁下一档难度，不给金币 / 经验 / 不解锁下一关 | `baseline/index.html:7621-7624` | `packages/game-core/src/systems/progression.ts` → `calculateUnlockedDifficulty()` | `progression > unlocks the next difficulty tier on clear, capped at 10` |
| 胜利条件是 BOSS 死亡而非波次计数 | 旧版结算流程 | `packages/game-core/src/sim/combat.ts` | `settlement > ends the run in victory when the boss dies` |
| 玩家死亡结算为失败 | 旧版结算流程 | `packages/game-core/src/sim/combat.ts` | `settlement > ends the run in defeat when the player dies` |
| 弹匣消耗与自动换弹 | 旧版射击逻辑 | `packages/game-core/src/systems/weapon.ts` | `weapon behaviour > consumes ammunition and auto-reloads when the magazine empties`；`weapon behaviour > blocks firing while reloading` |
| 无限弹药武器不会卡壳 | 旧版射击逻辑 | 同上 | `weapon behaviour > never runs dry for unlimited-ammo weapons` |
| 切枪时取消换弹 | 旧版（未实现，属修复项） | 同上 | `weapon behaviour > cancels the reload when the weapon is switched` |
| 切枪时释放扳机 | 旧版（未实现，属修复项） | 同上 | `weapon behaviour > releases the trigger when the weapon is switched` |
| 滚轮按占用槽位循环切换 | 旧版 | 同上 | `weapon behaviour > cycles through the occupied slots` |
| 44 武器覆盖 5 个槽位 | 旧版 `WEAPON_DISPLAY_DATA`（`baseline/index.html:10882`） | `packages/content/src/generated/weapons.ts` | `content pack > ships 44 weapons covering all five slots`；`装备与图鉴 > 装备界面按槽位展示 44 件装备` |
| 初始四件武器与旧版一致 | `baseline/index.html:10883` 起 | `packages/content/src/generated/weapons.ts` | `content pack > keeps the legacy starter weapons` |
| 每个 BOSS 三个可解析技能 + 一个被动 | 旧版 `BOSS_BLUEPRINTS` | `packages/content/src/generated/boss-skills.ts` | `content pack > gives every boss three resolvable skills and one passive` |
| 精英技能显示名为真实名称（非占位） | 旧版 `LEVELS[].elite.skillName` | `packages/content/src/curated/elite-skills.json` + `curated/copy.json` | `content pack > keeps every elite skill name real` |
| 模拟结果与随机种子绑定 | —（旧版用 `Math.random()`，不可复现） | `packages/game-core/src/util/rng.ts` | `simulation determinism > produces identical results for the same seed`；`simulation determinism > produces different results for a different seed` |
| 帧率无关（30 / 60 / 144 FPS 行为一致） | 旧版不满足 | `packages/game-core/src/util/clock.ts` → `FixedStepClock` | `simulation determinism > does not depend on the frame rate`；`weapon behaviour > fires at the weapon interval, independent of the frame rate` |
| 旧版存档六个键全部迁移 | 旧版 localStorage | `packages/game-core/src/save/legacy-migration.ts` | `legacy save migration > reads the main save and migrates gold, weapons and loadout`；`legacy save migration > reads every legacy key from a storage-like object`；`POST /api/profile/import > converts a legacy blob and reports which keys were read`；`POST /api/profile/import > reports unreadable blobs instead of failing` |
| 伙伴键是裸字符串而非 JSON | 旧版 `cs_companion_v1` | 同上 | `legacy save migration > reads the companion key as a bare string, not JSON` |
| 旧版唯一的键位迁移 `KeyE` → 中键 | 旧版 `baseline/index.html:17607` | 同上 | `legacy save migration > applies the legacy KeyE -> middle-mouse weapon-skill migration` |
| 英雄名册与主档共享金币经济，一起迁移 | 旧版 `cs_characters_v1` | 同上 | `legacy save migration > migrates the character roster together with the main save`；`legacy save migration > falls back to the starter hero when the selected one is not owned` |
| 损坏的旧档不被静默丢弃 | 旧版 | 同上 | `legacy save migration > reports a corrupt main save instead of losing the profile silently`；`legacy save migration > rejects a save blob without gold or ownedWeapons, like the legacy loader did` |
| 迁移可撤销（保留原始快照） | 旧版无 | 同上 | `legacy save migration > keeps a backup of the original blobs for an undo` |
| 存档写入带版本号与修订号 | 旧版无 | `packages/game-core/src/save/schema.ts` → `PROFILE_SCHEMA_VERSION` | `profile routes > stores a profile and returns revision 1`；`profile routes > returns the default profile with revision 0 when nothing was saved yet`；`profile storage > round-trips a profile through storage` |
| 主档损坏时回退备份 | 旧版无 | `packages/game-core/src/save/local-store.ts` | `profile storage > falls back to the backup when the main document is corrupt`；`profile storage > does not replace a good backup with a corrupt main document`；`profile storage > returns a usable default when nothing is stored` |
| 存档冲突返回 409 且带当前档 | 旧版无 | `apps/api/src/routes/profile.ts` | `profile routes > rejects a stale baseRevision with 409 and returns the current profile` |
| 重复提交不推进修订号 | 旧版无 | 同上 | `profile routes > does not bump the revision when the payload is unchanged` |
| 账号之间档案隔离 | 旧版无 | `apps/api/src/routes/profile.ts` + `apps/api/migrations/001_init.sql` | `profile routes > keeps one user out of another user profile` |
| 选关界面列出 50 关与 10 个章节 | 旧版 | `apps/web/src/ui/screens.ts` | `主菜单与选关 > 进入游戏后展示主菜单与战役入口`；`主菜单与选关 > 选关界面列出 50 关与 10 个章节`；`主菜单与选关 > 章节标题可以折叠`（`apps/web/test/e2e.spec.ts`） |
| 难度面板只解锁到已通关的档位 | 旧版 `unlockNextDifficulty` | `apps/web/src/ui/screens.ts` | `主菜单与选关 > 难度面板显示十档并锁定未解锁的档位` |
| 关卡可进入并开始战斗 | 旧版 | `apps/web/src/main.ts` | `战斗流程 > 可以进入关卡并开始战斗` |
| HUD 反映生命、弹药与分数 | 旧版 HUD | `apps/web/src/ui/hud.ts` | `战斗流程 > HUD 反映生命、弹药与分数` |
| 波次计数随模拟推进而增加 | 旧版波次 UI | `packages/game-core/src/sim/combat.ts` → `apps/web/src/ui/hud.ts` | `战斗流程 > 模拟推进时波次计数会增加` |
| 暂停界面可开可关 | 旧版暂停 | `apps/web/src/main.ts` | `战斗流程 > 暂停界面可以打开并关闭` |
| 进度写入 localStorage 并在刷新后保留 | 旧版 localStorage | `packages/game-core/src/save/local-store.ts` | `存档 > 进度写入 localStorage 并在刷新后保留`；`profile storage > round-trips a profile through storage` |
| 画质偏好键迁移并保留自适应开关 | 旧版 `cs_quality_pref_v1` | `packages/game-core/src/save/legacy-migration.ts` | `legacy save migration > reads the quality preference and keeps the adaptive flag` |
| 旧版云冲突键 `ts` 不带入新档 | 旧版 `cs_save_v2.ts` | 同上 | `legacy save migration > never carries the legacy ts timestamp into the new profile` |
| 图鉴数值与内容包同源 | 旧版图鉴为硬编码字符串 | `apps/web/src/ui/screens.ts` | `装备与图鉴 > 图鉴展示装备与怪物两页，且数值来自内容包` |
| 图鉴不出现占位文案 | 旧版存在占位文案 | `packages/content/src/schema.ts` → `findPlaceholderCopy()` | `装备与图鉴 > 图鉴不出现占位文案` |
| 旧版存档导入后金币与装备可见 | 旧版仅导出 `cs_save_v2` | `packages/game-core/src/save/legacy-migration.ts` | `存档 > 导入旧版存档会把金币与装备迁移过来` |

---

## 6. 已修复缺陷

以下 30 条为本次迁移中已确认并修复的旧版缺陷。每条给出现象、旧代码位置、影响范围、修复方式与验证方式。

### C1 品质伤害倍率整条曲线是死代码

| 字段 | 内容 |
| --- | --- |
| 现象 | 注释宣称「品质基础伤害倍率：1级×4 … 9级×10」，但实际任何品质都不加伤。 |
| 旧代码位置 | `baseline/index.html:16535`（`QUALITY_DAMAGE_MULT = { 1:4, 2:4.5, …, 9:10 }`）、`:16536`（`getQualityDamageMult()` 函数体无条件 `return 1;`）、`:16424` 与 `:16426`（调用点） |
| 影响范围 | 全 44 把武器的全部伤害结算；所有品质展示文案与实际手感不符。 |
| 修复方式 | 重写删除整条品质→伤害乘区。品质只影响图鉴配色与 `TIER_BONUS`（装备加成），伤害只由基础伤害、魂力、武器等级决定，见 `packages/game-core/src/systems/damage.ts` 的 `calcDamage()`。 |
| 验证方式 | `damage pipeline > matches the legacy worked example for the starter weapon` 断言 `calcDamage(9, ctx) === 18000`（2000 魂力 × 9 基础伤害，无品质乘区）；`content pack > ships 44 weapons covering all five slots` 校验每件武器的基础伤害为正。 |

### C2 难度阶梯：新手引导说 2.5 倍制，真实是 1/3/6/16/…

| 字段 | 内容 |
| --- | --- |
| 现象 | 游戏内引导写「难度倍率改为 2.5 倍制（1/2.5/6.25/… /3815，共10级）」，玩家按此预期规划强度。 |
| 旧代码位置 | `baseline/index.html:6373`（注释）、`:7604`（`DIFFICULTY_CONFIG` 真实阶梯） |
| 影响范围 | 全部 10 档难度；玩家对成长曲线的预期与实际 1/3/6/16/39/98/244/610/1526/3815 完全不符。 |
| 修复方式 | 阶梯只在 `packages/content/src/generated/difficulty.ts` 存在一份，引导文案与 HUD 均从该表读取。 |
| 验证方式 | `content pack > exposes the ten difficulty tiers with the legacy multiplier ladder` 逐值断言 `[1, 3, 6, 16, 39, 98, 244, 610, 1526, 3815]`。 |

### C3 BOSS 血量表注释与真实结构不符

| 字段 | 内容 |
| --- | --- |
| 现象 | 注释写「20 关扁平结构… 第1关1亿起，每关×1.5」，真实是 50 关、第 1 关 4,000 万、每关 ×1.28。 |
| 旧代码位置 | `baseline/index.html:6371`、`:16795`、`:16848`（注释）与 `:6375`（`window.__BOSS_HP_TABLE__`，51 个条目：索引 0 占位 + 50 关） |
| 影响范围 | 50 关 BOSS 血量的全部设计推导；按注释推算的强度会与实际相差数个数量级。 |
| 修复方式 | 血量表原样搬入 `packages/content/src/generated/boss-hp.ts`，由 `packages/content/src/index.ts` 的 `bossHpFor(level, tier)` 统一出口。 |
| 验证方式 | `content pack > reproduces the legacy boss HP table exactly` 断言第 1 关 `40_000_000`、第 50 关 `7_167_183_174_936`，并断言 `bossHpFor(1, 10) === 40_000_000 × 3815`。 |

### C4 `LEVELS` 中大量字段声明后从未被读取

| 字段 | 内容 |
| --- | --- |
| 现象 | `LEVELS` 数组里有二十余个字段只被赋值、从未被任何运行时代码读取，读者会误以为它们生效。 |
| 旧代码位置 | `baseline/index.html:16862` 起的 `LEVELS`；另见 `:17398`（`CHAPTER_CONFIGS`）、`:17399`（`LEVEL_VARIANTS`） |
| 影响范围 | 关卡配置的全量可读性；也是 C12、C30 的根源。 |
| 修复方式 | 逐项去向见第 4 节「死配置 → 新实现对照」。`LEVEL_VARIANTS` / `CHAPTER_CONFIGS` 直接删除；`boss.skills` 一族不复活，运行时统一以 `BOSS_BLUEPRINTS` 为准。 |
| 验证方式 | `packages/content/src/index.ts` 的 `validateContent()` 在启动与测试时校验内容包；`content pack > validates without errors` 断言错误列表为空。 |

### C5 X 键「武器特殊」指向空占位函数，整条雷霆万钧管线不可达

| 字段 | 内容 |
| --- | --- |
| 现象 | 按 X 键对绝大多数武器没有任何反应；界面上的「雷霆万钧 [X]」计时器永远显示「就绪」。 |
| 旧代码位置 | `baseline/index.html:29642`（`activateThunderBeamSkill()` 函数体只有 `return;`，注释「保留为空占位」）、`:31819` 与 `:32006`（X 键分发） |
| 影响范围 | 44 把武器中 42 把的 X 键为空操作；仅 `thousandumbrella`（千机伞变形）与 `thor`（托尔之触）有独立实现。配套的 `skillXActive`（`:11257`）在 9 处引用中**只被赋值为 false**，从未被置 true，因此 `skillXTimer` / `skillXCooldown` / `thunderBeamAutoFireTimer` / `THUNDER_BEAM_BASE_DMG`（`:13221`，消费点 `:29522`）构成完全不可达的死代码。 |
| 修复方式 | 重写不复活这条管线。武器状态机 `packages/game-core/src/systems/weapon.ts` 中与武器特殊相关的状态仅保留 `specialCooldown` / `specialActive` 两个字段（`packages/game-core/src/types.ts:203-205`），实际技能由各槽位自己的实现提供。 |
| 验证方式 | `packages/game-core/src/systems/weapon.ts` 顶部注释明确记录该管线不复现；`weapon behaviour > fires at the weapon interval, independent of the frame rate` 等用例确认武器状态机不依赖 `skillX`。**注意**：仓库内 `packages/game-core/src/sim/combat.ts:752` 的注释仍写着旧版「只实现了 33 个中的 10 个」，与实测不符，详见本节 C16。 |

### C6 `shoot()` 的暴击判定忽略了装备与武器等级加成

| 字段 | 内容 |
| --- | --- |
| 现象 | 玩家实际暴击率只有 1%，图鉴与面板显示的暴击率（含装备加成）大于 1%，两者对不上。 |
| 旧代码位置 | `baseline/index.html:29405`（`Math.random() < (CRIT_CHANCE + (equippedPrimary === 'genesislight' ? GENESISLIGHT_CRIT : 0))`），对比 `damageEnemy()` 路径使用 `getEffectiveCritChance()` |
| 影响范围 | 全部武器的暴击率；初始武器实际 1% 而面板显示 ≥2%。 |
| 修复方式 | 统一到 `packages/game-core/src/systems/damage.ts` 的 `getCritChance(ctx, weaponLevel)`，统一计算 `CRIT_CHANCE + 装备暴击 + 0.01 × (武器等级 − 1)`。 |
| 验证方式 | `damage pipeline > includes the equipment crit bonus in the crit chance` 断言无装备时为 `0.01`、装备加成 0.1 时为 `0.11`。 |

### C7 `HEADSHOT_MULTIPLIER` 从未在 `damageEnemy()` 中生效

| 字段 | 内容 |
| --- | --- |
| 现象 | 除初始武器外，所有武器的爆头都没有双倍加成。 |
| 旧代码位置 | `baseline/index.html:10652`（常量定义）、`:16451`（`damageEnemy()` 四参数签名，内部不读 `HEADSHOT_MULTIPLIER`），对比 `:29417`（`shoot()` 中正确应用） |
| 影响范围 | 除 `thunder` 外全部武器的爆头收益；两条伤害路径对同一物理命中给出不同结果。 |
| 修复方式 | 合并为单一伤害管线 `applyDamage()`（`packages/game-core/src/systems/damage.ts`），爆头乘数与爆头判定 `isHeadshot()` 同处一地。 |
| 验证方式 | `damage pipeline > doubles headshots and crits` 断言 1000 基础伤害在爆头 + 必暴下为 4000，且 `event.crit` 与 `event.headshot` 均为 true。 |

### C8 难度词缀只在 `damageEnemy()` 生效，原始伤害路径绕过

| 字段 | 内容 |
| --- | --- |
| 现象 | 第 5 档以上的「装甲」（−18% 受伤）与「迅捷」（+10% 闪避）对玩家实际使用的武器完全无效。 |
| 旧代码位置 | `baseline/index.html:16451`（`damageEnemy()` 读取词缀）、`:29401-29439`（`shoot()` 不读取）、同族路径 `dragonKnightShoot` / `chainLightning` / 近战同样绕过 |
| 影响范围 | 第 5～10 档难度；玩家可无脑选最高难度而不受词缀约束。 |
| 修复方式 | `applyDamage()` 统一处理 `diffArmor`（乘 0.82）与 `diffDodge`（命中即免伤），见 `packages/game-core/src/systems/damage.ts`。 |
| 验证方式 | `damage pipeline > applies the armour affix` 断言 1000 → 820 且 `event.type === 'armor'`；`damage pipeline > can fully negate a hit with the swift affix` 断言闪避命中时 `amount === 0` 且 `event.type === 'dodge'`；另有 `difficulty > applies the armour affix from tier 5` 与 `difficulty > applies the swift affix from tier 7` 覆盖分档。 |

### C9 `damageEnemy()` 的第 5 个参数被 4 参数签名丢弃

| 字段 | 内容 |
| --- | --- |
| 现象 | 用棱镜 / 天罚等武器击杀敌人时，经验记到了别的武器上。 |
| 旧代码位置 | `baseline/index.html:16451`（`function damageEnemy(target, amount, pos, opts)`）与调用点传入的第 5 个实参 `sourceWeapon` |
| 影响范围 | 武器经验与武器等级成长；初始武器之外的武器升级极慢。 |
| 修复方式 | `applyDamage()` 的 `options.weaponId` 一路透传到 `DamageEvent.weaponId`，由 `packages/game-core/src/sim/combat.ts` 据此结算经验。 |
| 验证方式 | `settlement > awards score and weapon XP per kill` 覆盖按击杀结算得分与武器经验。 |

### C10 `calcDamage()` 遇到增伤武器提前 return，丢弃 ×1.5 与 ×1.4

| 字段 | 内容 |
| --- | --- |
| 现象 | 装备增伤武器后，「能量防卫者」护盾（+50%）与「命运审判」天平（+40%）的增伤完全失效。 |
| 旧代码位置 | `baseline/index.html:16429-16431`（`if (amplify > 0) { return ...; }`），而 ×1.5 在 `:16434`、×1.4 在 `:16438` |
| 影响范围 | 所有增伤武器与两种增伤状态的叠加；隐性削减实际伤害最高约 40%。 |
| 修复方式 | `calcDamage()` 改为顺序相乘、不提前返回，见 `packages/game-core/src/systems/damage.ts`。 |
| 验证方式 | `damage pipeline > applies the amplify, energy-defender and fate multipliers together` 分别断言 36000（×2 增伤）、27000（×1.5 护盾）、25200（×1.4 命运）。 |

### C11 旧版「18 件武器基础伤害推导表」的射速列与运行时不一致

| 字段 | 内容 |
| --- | --- |
| 现象 | 设计表里的射速与武器真实冷却对不上，按表做的 DPS 推算全部偏高或偏低。 |
| 旧代码位置 | `baseline/index.html:13151-13172`（推导表注释块） |
| 影响范围 | 表中 19 项里 14 项射速与运行时不符。实测对照：`tumo` 设计 10/s 实际 3/s、`dawnlight` 设计 10/s 实际 20/s、`phasewalker` 设计 20/s 实际 16/s、`zeushand` 设计 6/s 实际 8/s、`dragonlyknight` 设计 15/s 实际 12/s、`moonbow` 设计 10/s 实际 8/s、`shadow` 设计 12.5/s 实际 13/s、`thunderblade` 设计 2/s 实际 2.5/s、`metalstorm` 设计 16.7/s 实际 13/s、`hellscythe` 设计 10hit/s 实际 2.5/s、`parasite` 设计 5/s 实际 2/s、`whitenight` 设计 5/s 实际 7/s、`tanglotus` 设计 0.1/s 实际 0.5/s；仅 `thunder`、`normalgrenade`、`deathlight`、`froststar`、`thousandumbrella` 五项与运行时一致。 |
| 修复方式 | 重写不搬运这张推导表。武器数值改由 `tools/legacy-audit/extract-constants.mjs` 从源码常量解析出真实冷却与基础伤害，再由 `npm run content:import` 落到 `packages/content/src/generated/weapons.ts`，运行时与图鉴共用同一份数据。 |
| 验证方式 | `content pack > ships 44 weapons covering all five slots` 校验数量与槽位；`content pack > keeps the legacy starter weapons` 断言 `thunder` 冷却 `0.1`、弹匣 `150`，`shadow` 弹匣 `30`，`tumo` 弹匣为 `null`（无限）。 |

### C12 BOSS 配置存在两份互相冲突的来源

| 字段 | 内容 |
| --- | --- |
| 现象 | 关卡编辑界面显示的 BOSS 名与战斗里出现的 BOSS 名对不上；第 2 关「深渊水域」的 BOSS 实际叫「水晶织网者」。 |
| 旧代码位置 | `baseline/index.html:16862` 起 `LEVELS[].boss`（作者撰写的名称，机制是死的）与 `baseline/index.html:25069` `BOSS_BLUEPRINTS`（运行时唯一实例化路径）。实测：50 关中 40 关两者同名，**差异全部集中在第 1～10 关** |
| 影响范围 | 10 关的 BOSS 命名；关卡卡片与实战体验割裂。 |
| 修复方式 | 导入器以作者撰写的 `LEVELS[].boss.name` 作为显示名（与关卡主题一致），以 `BOSS_BLUEPRINTS` 作为机制来源，合并进内容包的单一 `BossDef`，见 `tools/content-import/import-legacy-content.mjs:159-168`。 |
| 验证方式 | `content pack > gives every boss three resolvable skills and one passive` 遍历 50 关，断言每关 3 个技能均可解析到注册表、被动名不为「专属被动」。 |

### C13 第 31～50 关为模板生成，占位文案遍布

| 字段 | 内容 |
| --- | --- |
| 现象 | 第 31～50 关的近战 / 远程 / 精英 / BOSS 描述全是「XX 的近战单位 / 远程单位 / 精英单位 / 统治者」；精英技能名一律「精英技」；BOSS 技能名一律「技能一 / 技能二 / 技能三」，被动一律「专属被动」。 |
| 旧代码位置 | `baseline/index.html:16862` 起第 31～50 关条目。实测：20 关 × 4 条 = **80 条**模板描述；20 关精英技能名为「精英技」；20 关 BOSS 技能名为「技能一/二/三」；20 关被动名为「专属被动」 |
| 影响范围 | 第 31～50 关的全部文案；同时浪费了 `BOSS_SKILLS` / `BOSS_PASSIVES` 中已有的权威名称（炎弹齐射、熔岩护甲 等） |
| 修复方式 | 实体名称保留旧版原文；模板描述由人工文案替换，存于 `packages/content/src/curated/copy.json`；BOSS 技能与被动名称改为从注册表解析；精英技能名回退表存于 `packages/content/src/curated/elite-skills.json` |
| 验证方式 | 导入器在遇到模板文案但 `copy.json` 无对应条目时**直接抛错**（`tools/content-import/import-legacy-content.mjs:179-183`）；`content pack > keeps every elite skill name real` 断言所有精英技能名非空且不等于「精英技」；`content pack > gives every boss three resolvable skills and one passive` 断言技能名不匹配 `/技能[一二三四五六]$/`、被动名不等于「专属被动」；`packages/content/src/schema.ts` 的 `findPlaceholderCopy()` 在运行时兜底。 |

### C14 两个空洞矩形边界颠倒，三个关卡缺失空洞条目

| 字段 | 内容 |
| --- | --- |
| 现象 | 第 31、39 关的深坑画在画面上，但玩家永远掉不下去；第 38、43、46 关根本没有深坑。 |
| 旧代码位置 | `baseline/index.html:46787`（`LEVEL_VOID[31] = [{ minX:20, maxX:-52, … }]`）、`:46826`（`LEVEL_VOID[39] = [{ minX:26, maxX:-54, … }]`）——两处 `minX > maxX`；`:46774` 起的 `LEVEL_VOID` 表中无第 38 / 43 / 46 关条目 |
| 影响范围 | 4 关的地形判定；视觉与实际碰撞不符。 |
| 修复方式 | 导入器对空洞矩形做 `Math.min` / `Math.max` 规范化（`tools/content-import/import-legacy-content.mjs:150-153`），第 38 / 43 / 46 关保持为空数组。 |
| 验证方式 | `packages/content/src/index.ts` 的 `validateContent()` 对每条空洞断言 `minX <= maxX && minZ <= maxZ`；`content pack > validates without errors` 断言错误列表为空。 |

### C15 第 31～50 关第三波数量是死数据

| 字段 | 内容 |
| --- | --- |
| 现象 | `LEVEL_WAVE_COUNTS` 里第 31～50 关的第三个值（48～64）看起来像第三波小怪数，实际永远不会生效。 |
| 旧代码位置 | `baseline/index.html:16796`（`LEVEL_WAVE_COUNTS`，第 31～50 关第三槽实测为 52 / 56 / 60 / 64 / 48 循环）、`:17438`（`startNextWave()` 在最后一波把 `waveEnemyTotal` 强制置 0） |
| 影响范围 | 第 31～50 关的波次数量；第 3 波恒为纯 BOSS。 |
| 修复方式 | 内容包把有效波次显式建模为 `waves: { minion: number[]; bossWaveMinions: number }`，`bossWaveMinions` 记录真实运行时行为；被丢弃的旧值在 `packages/content/src/types.ts` 的注释中留档。 |
| 验证方式 | `wave scheduler > runs three waves: minions, elites, then the boss` 与 `wave scheduler > spawns the boss once the minion waves are cleared`。 |

### C16 精英技能派发器只覆盖部分技能，其余静默失效

| 字段 | 内容 |
| --- | --- |
| 现象 | 相当一部分精英怪的技能完全没有表现，精英只是普通怪。 |
| 旧代码位置 | `baseline/index.html:23953-24078`（`executeEliteSkill()`）。实测：该 `switch` **只有 18 个 `case` 且没有 `default` 分支**，33 个已配置的精英技能 id 中有 **15 个**落在分支之外：`frost_nova`、`flame_nova`、`dimensional_tear`、`emp_burst`、`prism_beam`、`raise_dead`、`time_slow`、`gravity_well`、`sunburst_barrage`、`gold_meteor`、`blazing_pursuit`、`tentacle_slam`、`starfall_flash`、`judgment_beam`、`reality_fracture` |
| 影响范围 | 33 个精英技能中的 15 个；按 `eliteBonus` 概率在第 2～10 档大量生成。 |
| 修复方式 | 重写把精英技能统一映射到 42 条 `BOSS_SKILLS` 的行为原型表上，见 `packages/game-core/src/sim/combat.ts` 的 `executeEliteSkill()`。 |
| 验证方式 | **该修复目前只完成了一半**：内容包保留了 33 个精英技能 id，其中 15 个能解析到 `BOSS_SKILLS`；其余 18 个（`lunge`、`whirlpool_pull`、`blink_strike`、`charge_shield`、`curse_cloud`、`ice_dash`、`thunder_leap`、`death_charge`、`transmute`、`void_blast`、`radiant_lunge`、`solar_volley`、`gold_quake`、`mirage_ambush`、`aurora_lance`、`sky_smite`、`halo_bind`、`astral_scatter`）在 `BOSS_SKILLS` 注册表中**没有条目**，`BOSS_SKILLS.find(...)` 返回 `undefined` 后函数直接返回，仍是静默无操作。死集合从「15 个」换成了「18 个」，缺陷本身未消除。此外 `packages/game-core/src/sim/combat.ts:752` 的注释沿用了「只实现 10 个 / 23 个失效」的旧说法，与实测不符。详见第 7 节第 2 条。 |

### C17 第 35 关「崩解平台」的塌陷平台机制从来不存在

| 字段 | 内容 |
| --- | --- |
| 现象 | 关卡名与副标题承诺了会塌陷的平台，实际关卡是一块平地加五个静态深坑矩形和一个移动锯齿。 |
| 旧代码位置 | `baseline/index.html:16862` 起第 35 关条目；地形数据在 `LEVEL_TERRAIN`（`:46774` 附近的同批声明）中为 `type:'flat'` |
| 影响范围 | 1 关的机制承诺与实际不符。 |
| 修复方式 | **本次未修复**（属于新增机制而非缺陷修复，见第 7 节）。内容包按旧版原样保留 `terrain.type === 'flat'`、5 条空洞与 1 个 `saw` 机关。 |
| 验证方式 | 关卡表第 35 行的「地形/机关」列如实记录为「地形 flat；悬崖 5；机关 1（saw）」；验证状态列标注「C17 未修复」。 |

### C18 音乐增益节点挂在主音量之下，静音音效会连带静音音乐

| 字段 | 内容 |
| --- | --- |
| 现象 | 关掉音效时背景音乐也一起没了；音乐音量滑块无法独立生效。 |
| 旧代码位置 | `baseline/index.html:17570`（`musicGainNode` 声明，注释写明「挂在 masterGainNode 下」）、`:18189`（`musicGainNode.connect(masterGainNode)`）、`:17556-17557`（主音量被 `sfxMuted` 直接置 0） |
| 影响范围 | 全部音频设置；音乐音量滑块形同虚设。 |
| 修复方式 | 重写改为 `master → {music, sfx}`，music 与 sfx 是主总线下的同级支路，见 `apps/web/src/audio/audio.ts` 的 `unlock()` 与 `applyVolumes()`。 |
| 验证方式 | **无自动化测试覆盖**。该行为位于 Web Audio 图层，当前只有 `apps/web/test/e2e.spec.ts` 的 Playwright 用例覆盖 UI 流程，不校验音频图拓扑。建议补一条用 `OfflineAudioContext` 断言支路增益的单元测试。 |

### C19 没有任何 `AudioContext.resume()`，上下文可能被永久挂起

| 字段 | 内容 |
| --- | --- |
| 现象 | 在 Chrome 等浏览器中进入关卡后可能完全没有声音，且没有任何报错。 |
| 旧代码位置 | `baseline/index.html:18183`（`audioCtx = new (window.AudioContext \|\| window.webkitAudioContext)()`）。全文 `.resume()` 出现 **0 次** |
| 影响范围 | 全部音频输出；旧版在关卡构建后约 2.3 秒才创建上下文（晚于用户点击手势），Chrome 的自动播放策略会让上下文停留在 suspended。 |
| 修复方式 | `apps/web/src/audio/audio.ts` 的 `unlock()` 在用户手势回调中创建上下文并调用 `void this.ctx.resume()`，且仅在 `unlock()` 里创建一次。 |
| 验证方式 | **无自动化测试覆盖**（依赖真实浏览器的自动播放策略）。建议在 Playwright 中以 `--autoplay-policy=user-gesture-required` 启动并断言 `audio.ready === true`。 |

### C20 切换标签页不会暂停模拟

| 字段 | 内容 |
| --- | --- |
| 现象 | Alt+Tab 回来时玩家已被偷袭致死；后台标签页仍在跑满 CPU。 |
| 旧代码位置 | 全文 `visibilitychange` 出现 **0 次**；`window` 上只有 `blur` 的默认行为，无任何监听 |
| 影响范围 | 全部对局；后台标签页持续占用 CPU 与音频。 |
| 修复方式 | `apps/web/src/input/input.ts` 注册 `blur` 与 `visibilitychange` 监听，聚焦丢失时清空按键与鼠标状态并触发暂停回调。 |
| 验证方式 | **无自动化测试覆盖**。建议在 Playwright 中 `page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))` 并断言模拟进入暂停态。 |

### C21 定时器注册表被大面积绕过

| 字段 | 内容 |
| --- | --- |
| 现象 | 场景重建后，旧场景的定时回调仍会触发，作用在已被销毁的对象上。 |
| 旧代码位置 | `regTimeout` / `regInterval` 注册表共 24 个调用点（实测 `regTimeout(` 22 次、`regInterval(` 2 次），而裸 `setTimeout(` 有 **113** 处、裸 `setInterval(` 有 **13** 处 |
| 影响范围 | 关卡切换、暂停、结算之间的异步回调；关卡越靠后越容易触发。 |
| 修复方式 | 重写不使用全局定时器注册表。模拟层的全部计时由 `packages/game-core/src/sim/combat.ts` 的定步长积分推进；渲染层的短时特效由 `apps/web/src/render/renderer.ts` 的对象池管理；输入层不注册任何定时器。 |
| 验证方式 | `simulation determinism > does not depend on the frame rate` 确认模拟时间只随步进推进；建议补一条「关卡切换后不再有回调」的集成测试。 |

### C22 事件监听器完全没有拆卸

| 字段 | 内容 |
| --- | --- |
| 现象 | 重复进入关卡后，一次按键会触发多次处理；监听器随会话持续累积。 |
| 旧代码位置 | 全文 `removeEventListener(` 只有 **11** 处，全部集中在购买确认弹窗（`baseline/index.html:43807`～`:43902` 的 `yesBtn` / `noBtn`）。`addEventListener(` 有 134 处 |
| 影响范围 | 全部输入与窗口事件；重开关卡后输入延迟逐次累积。 |
| 修复方式 | `apps/web/src/input/input.ts` 的 `InputController.dispose()` 逐个移除它注册过的 11 个监听器（键盘、鼠标、滚轮、右键菜单、指针锁定、`window` 的 `blur`、`document` 的 `visibilitychange`），并用 `disposed` 标志保证幂等。 |
| 验证方式 | **无自动化测试覆盖**。建议补一条「创建 → dispose → 再次创建后按键只触发一次」的单元测试。 |

### C23 射速依赖帧率

| 字段 | 内容 |
| --- | --- |
| 现象 | 副武器在 60 FPS 下只有 10 发/秒而不是设计值 13 发/秒；高刷与低刷机器手感不同。 |
| 旧代码位置 | 旧版冷却在每帧检查里用 `> 0` 比较（帧栅格量化），配合被 clamp 到 50 ms 的可变 `requestAnimationFrame` delta。0.0769 秒冷却的武器在 60 FPS 下每 6 帧才能再开火一次 |
| 影响范围 | 全部武器的实际射速；低帧率机器伤害显著偏低。 |
| 修复方式 | `packages/game-core/src/util/clock.ts` 的 `FixedStepClock` 以 1/60 秒定步长推进模拟，渲染插值解耦；`packages/game-core/src/systems/weapon.ts` 用 `COOLDOWN_EPSILON` 归零剩余冷却，避免帧栅格量化；`packages/game-core/src/systems/weapon.ts` 顶部注释记录了旧版行为。 |
| 验证方式 | `simulation determinism > does not depend on the frame rate`；`weapon behaviour > fires at the weapon interval, independent of the frame rate`（`packages/game-core/test/simulation.test.ts`）。 |

### C24 胜利标题只覆盖前 20 关

| 字段 | 内容 |
| --- | --- |
| 现象 | 第 21～50 关通关时标题一律显示通用文案。 |
| 旧代码位置 | `baseline/index.html:31105`（胜利标题用的 `levelNames` 只到第 20 关）、`:31106`（`victoryTitle.textContent = (levelNames[currentLevel] \|\| '关卡') + '完成!'`） |
| 影响范围 | 30 关的结算标题。 |
| 修复方式 | 结算界面直接使用内容包里的关卡名，不再维护第二份标题表。 |
| 验证方式 | `战斗流程 > 结算界面展示结果并写回难度解锁`（`apps/web/test/e2e.spec.ts`）覆盖结算界面出现。 |

### C25 「清除存档」只删掉一个键

| 字段 | 内容 |
| --- | --- |
| 现象 | 点了清除存档，英雄名册、伙伴选择、画质偏好和记录仍然保留，账号像是没被重置。 |
| 旧代码位置 | `baseline/index.html:7009` 与 `:46345` 都只执行 `localStorage.removeItem('cs_save_v2')`。其余五个键 `cs_characters_v1`、`cs_companion_v1`、`cs_quality_pref_v1`、`cs_arena_best_v1`、`cs_raid_best_v1` 全部保留 |
| 影响范围 | 全部存档；玩家无法真正重置账号。 |
| 修复方式 | 旧版六个键合并为单一文档后，「清除」= 删除主档与备份档两个键，见 `packages/game-core/src/save/local-store.ts` 的 `clearProfile()`。 |
| 验证方式 | **无自动化测试覆盖**。建议补一条断言 `clearProfile()` 之后 `PROFILE_KEY` 与 `PROFILE_BACKUP_KEY` 均不存在、且 `loadProfile()` 返回默认档。 |

### C26 加载界面是假的

| 字段 | 内容 |
| --- | --- |
| 现象 | 进度条匀速走满 2 秒，随后卡顿一下才开始游戏；真实的地形构建发生在进度条之后同步进行。 |
| 旧代码位置 | `baseline/index.html:20132`（`setTimeout(function () { if (!loadDone) finishLoading(); }, LOAD_DURATION + 2000);`）——固定 2 秒延时，与真实构建进度无关 |
| 影响范围 | 第 31～50 关最明显（地形与机关构建最重）。 |
| 修复方式 | 关卡数据由内容包在构建期一次性提供（无运行时拼装），渲染侧按关卡分组增量挂载；加载过程不再用固定延时伪装进度。 |
| 验证方式 | **无自动化测试覆盖**。当前 `apps/web/src/ui/screens.ts` 无加载进度条实现，建议把「构建耗时」作为性能预算指标度量（见 `docs/ARCHITECTURE.md`）。 |

### C27 没有任何画面与操控设置项

| 字段 | 内容 |
| --- | --- |
| 现象 | 鼠标灵敏度固定为 `0.002`、FOV 固定为 `75`，晕动症玩家无法调整，也没有减弱闪屏选项。 |
| 旧代码位置 | `baseline/index.html:31631`（`yaw -= mouseMovementX * 0.002;`）、`:18638`（`new THREE.PerspectiveCamera(75, …)`）、`:16715`（`TOUCH_LOOK_SENS = 0.004` 同样是写死的常量） |
| 影响范围 | 全部玩家的操控舒适度。 |
| 修复方式 | `packages/game-core/src/save/schema.ts` 的 `settingsSchema` 新增 `mouseSensitivity`（0.0005～0.02）、`fov`（60～110）、`shakeIntensity`（0～2）、`reduceFlashing`；`apps/web/src/input/input.ts` 从设置读取灵敏度；`apps/web/src/render/renderer.ts` 使用 FOV 与震屏强度，`reduceFlashing` 可关闭全屏闪光。 |
| 验证方式 | **无自动化测试覆盖**。建议在 `apps/web/test/e2e.spec.ts` 补一条设置项修改后刷新仍生效的用例。 |

### C28 命中与 BOSS 预警缺音效

| 字段 | 内容 |
| --- | --- |
| 现象 | 普通命中（非暴击、非爆头）没有任何声音；BOSS 起手没有预警音；BOSS 攻击没有专属音效。 |
| 旧代码位置 | `baseline/index.html:29417`（暴击才播 `playCritSound()`）、`:29452`（爆头才播 `playHeadshotSound()`）；`playImpactSound()` 在 `:29460` 处位于**打空分支**（打中墙体的 `else`），不是敌人受击。全文不存在 BOSS 预警 / BOSS 攻击音效函数 |
| 影响范围 | 全部战斗反馈；玩家难以判断是否命中。 |
| 修复方式 | `apps/web/src/audio/audio.ts` 新增 `hit()`（普通命中）、`crit()`、`headshot()`、`bossTelegraph()`、`bossAttack()`、`enemyDeath()`、`bossDeath()`、`hazard()`、`pickup()` 等音效，并配距离衰减与并发上限。 |
| 验证方式 | **无自动化测试覆盖**。建议补一条断言 `hit()` 与 `bossTelegraph()` 在静音关闭时产生了非零增益的声源节点。 |

### C29 BOSS 技能 / 被动数量以实际注册表为准

| 字段 | 内容 |
| --- | --- |
| 现象 | 迁移前的工作说明写「36 条 BOSS 技能」，与代码不符。 |
| 旧代码位置 | `baseline/index.html:24111`（`BOSS_SKILLS`，实测 **42** 条）、`:24805`（`BOSS_PASSIVES`，实测 **12** 条） |
| 影响范围 | 内容包规模与 BOSS 行为设计。 |
| 修复方式 | 以实测数量为准，全部 42 条技能与 12 条被动进入注册表 `packages/content/src/generated/boss-skills.ts`，并逐条补齐行为原型、冷却、伤害系数、半径、前摇、后摇、数量、速度、持续时间。 |
| 验证方式 | `content pack > gives every boss three resolvable skills and one passive` 遍历 50 关校验技能可解析；第 3 节的两张表逐条列出 42 / 12 条。 |

### C30 `LEVELS[].boss` 引用了注册表中不存在的技能与被动

| 字段 | 内容 |
| --- | --- |
| 现象 | 部分关卡的 BOSS 技能 id 在 `BOSS_SKILLS` 中查不到，若哪天有人「复活」死配置就会得到空技能。 |
| 旧代码位置 | `baseline/index.html:16862` 起 `LEVELS[].boss`。实测：`LEVELS[].boss.skills` 共引用 **65** 个不同 id，其中 **23** 个不在 42 条注册表内（`summon_firelings`、`chronoshift`、`self_repair`、`water_jet`、`summon_jellyfish`、`timeline_fracture`、`missile_barrage`、`spore_burst`、`root_prison`、`poison_rain`、`blizzard`、`ice_prison`、`chain_lightning`、`thunderstorm`、`magnetic_pull`、`summon_skeletons`、`death_aura`、`acid_flood`、`gold_transmutation`、`explosive_potion`、`black_hole`、`void_rift`、`reality_collapse`），每条恰好影响 1 关；`LEVELS[].boss.passive` 共引用 **21** 个不同 id，其中 **9** 个不在 12 条被动注册表内（`abyssal_shield`、`temporal_phasing`、`titanium_plating`、`regrowth`、`frozen_heart`、`static_field`、`undead_resilience`、`philosophers_stone`、`entropy`） |
| 影响范围 | 死配置本身无运行时影响——运行时走 `BOSS_BLUEPRINTS`，其 42 个技能 id 与 12 个被动 id **全部可解析**（实测 0 处悬空）。风险在于复活死配置时静默失配。 |
| 修复方式 | 不复活死配置（见第 4 节），只保留 `BOSS_BLUEPRINTS` 路径；同时给注册表加运行时校验。 |
| 验证方式 | `packages/content/src/index.ts` 的 `validateContent()` 对每关逐个校验 `boss.skills` 的 id 在 `BOSS_SKILLS` 中、`boss.passive` 在 `BOSS_PASSIVES` 中；`content pack > validates without errors` 断言错误列表为空。 |

### C31 出生点落在机关或悬崖范围内

| 字段 | 内容 |
| --- | --- |
| 现象 | 玩家在部分关卡一进场就掉血或直接死亡。旧版把出生点固定在 `(0, 20)`，但第 37 关的 `crusher`（8×8，足迹正好覆盖 `(0,20)`）与第 48 关的 `laser`（1×1，坐标 `(0,20)`）都摆在这个点上；第 31 关的悬崖矩形同样覆盖该点。另有 7 关把机关摆在世界原点 `(0,0)`。 |
| 旧代码位置 | 出生点 `baseline/index.html:20326`、`:20336`；机关表 `LEVEL_HAZARDS`；悬崖表 `LEVEL_VOID`；命中判定 `baseline/index.html:47178-47187`（`halfW = w/2 + 0.6`）。 |
| 影响范围 | 第 31、35、37、42、45、46、47、48、50 关。`crusher` 单次造成 50% 最大生命伤害、`laser` 45%、`saw` 40~50%，且机关有 0.9 秒无敌间隔，站在上面会在数秒内被连续打死。 |
| 修复方式 | 不改动关卡数据。`packages/game-core/src/sim/combat.ts` 的 `findSafeSpawn()` 依次尝试 `(0,20)`、检查点、原点与八个周边候选点，跳过落在悬崖或机关足迹内的位置。 |
| 验证方式 | `packages/game-core/test/simulation.test.ts` 的「每一关的出生点都不在悬崖或机关范围内」与「站着不动不会在第一波之前被机关打死」，覆盖全部 50 关。 |

### C32 掉入悬崖应当回到检查点，而不是结束本局

| 字段 | 内容 |
| --- | --- |
| 现象 | 重写初版把「掉进悬崖」实现成直接死亡，导致第 31、35 关无法游玩。 |
| 旧代码位置 | `baseline/index.html:47131-47142`（生命归零）与 `:47191-47202`（`terrainRespawn`）；检查点定义 `:47036`（`_checkpoint = { x: 0, z: (BOUNDS.maxZ - BOUNDS.minZ) * 0.4 }`）。 |
| 影响范围 | 只有带悬崖的 31–50 关受��；其余关卡没有悬崖数据。 |
| 修复方式 | 按旧版行为实现：生命归零后立刻在检查点复活，恢复 60% 生命，并给 2 秒无敌；检查点本身会做一次「不在悬崖内」的校正。 |
| 验证方式 | `packages/game-core/test/simulation.test.ts` 的「掉入悬崖不会结束本局，而是回到检查点并恢复 60% 生命」与「检查点本身不会落在悬崖内」。 |

---

## 7. 未修复 / 需审批

以下条目**故意没有在本次迁移中改动**。它们不是缺陷修复，而是会改变玩家体验的设计决策，需要产品与关卡设计共同审批。

### 1. BOSS 被动在 50 关中全部未接线

| 项目 | 内容 |
| --- | --- |
| 现状 | **已修复。** 旧版 `BOSS_BLUEPRINTS` 给 50 关都指定了被动（12 个不同被动 id：`molten_armor`×3、`crystal_resonance`×4、`sand_armor`×2、`frozen_aura`×5、`shield_regen`×2、`aquatic_healing`×4、`temporal_echo`×4、`undying_will`×3、`void_shield`×6、`eternal_cycle`×3、`solar_crown`×7、`celestial_ward`×7）。重写内容包一度把全部 50 关的 `boss.passive` 置为 `null`。 |
| 根因 | 导入器 `tools/content-import/import-legacy-content.mjs` 读取的 `deep.BOSS_BP_SUMMARY`（`tools/out/deep.json`）**只记录了 `keys` 列表、丢失了 `passive` 的值**——同一份数据在 `tools/out/boss-blueprints.json` 里是完好的。 |
| 修复 | 导入器改为直接读取 `tools/out/boss-blueprints.json` 的原始蓝图表，50 关重新带上旧版被动；`packages/game-core/src/sim/combat.ts` 的被动分支现在会真实触发。 |
| 验证 | `packages/content/test/content.test.ts` 的「每一关都绑定了来自蓝图蓝图的被动」；`packages/game-core/test/elite.test.ts` 的「BOSS 被动」；第 1 节关卡表的「被动」列已全部填上正式名。 |

### 2. 18 个精英技能的行为实现

| 项目 | 内容 |
| --- | --- |
| 现状 | **已修复。** 见 C16。重写一度把精英技能映射到 `BOSS_SKILLS` 的行为原型上，但 33 个精英技能 id 中只有 15 个在注册表中；其余 18 个（`lunge` 等）查不到条目，`executeEliteSkill()` 会直接返回。 |
| 根因 | 旧版这 18 个技能由 `executeEliteSkill`（基线 `:23953-24078`）单独实现，不在 `BOSS_SKILLS` 注册表里。 |
| 修复 | 新增 `packages/content/src/curated/elite-skills.json`（18 条完整行为参数）与 `packages/game-core/src/systems/elite.ts`（数据驱动的执行器），逐条照搬旧版数值：位移距离、伤害倍率、减速/定身/灼烧时长、弹丸数量与扇形间隔、牵引距离。其余 15 个仍走 `BOSS_SKILLS` 注册表。现在 33 个精英技能全部有行为。 |
| 验证 | `packages/game-core/test/elite.test.ts` 的 13 条用例，逐个断言旧版数值（猛冲突进位移 8 / 4 米内 1.5 倍、寒冰突刺减速 3 秒减 50%、死亡冲锋 2 倍、诅咒毒云 5 秒、光环禁锢 0.8 秒定身、曦金三连矢 3 发 0.18 弧度等）。 |

### 3. 第 35 关「崩解平台」缺少塌陷平台机制

| 项目 | 内容 |
| --- | --- |
| 现状 | 见 C17。关卡名与副标题承诺的塌陷平台不存在。 |
| 性质 | **新增机制。** 旧版从未实现，无法通过「迁移」得到；补做属于内容设计工作。 |
| 建议 | 列入内容排期；或把第 35 关改名以匹配实际玩法（同样是设计变更）。 |

### 4. 第 46 关「炼狱熔炉」的关卡名与地形同样存在旧版落差

| 项目 | 内容 |
| --- | --- |
| 现状 | 旧版第 46 关为 `type:'flat'` + 蒸汽与尖刺机关，无熔岩地形。 |
| 性质 | **命名与实现不一致**，处理方式同第 35 关，需设计决策。 |

### 5. 奖励经济：通关不给任何金币

| 项目 | 内容 |
| --- | --- |
| 现状 | 旧版通关**只**解锁下一档难度，不给金币、不给经验、不给掉落，也**不**解锁下一关（50 关从首次启动起就全部可选）。重写**忠实复刻**了这一行为：`packages/game-core/src/systems/progression.ts` 的 `calculateUnlockedDifficulty()` 只返回难度档位；`packages/game-core/src/sim/combat.ts` 的结算只产出得分与武器经验。 |
| 性质 | **这是对旧版的忠实还原，不是缺陷。** 把它写成修复是错误的。 |
| 建议 | 见第 8 节提案 P3（需产品审批）。 |

### 6. 旧版云同步能力未迁移

| 项目 | 内容 |
| --- | --- |
| 现状 | 旧版云同步完全绑定第三方托管 Postgres + OAuth 中转（`https://combat-strike.app.workbuddy.host`、`https://www.workbuddy.cn/v2/as/genie-baas/oauth`），且只同步 `cs_save_v2` 一个键；旧版导出 / 导入也只覆盖 `cs_save_v2`，英雄名册与伙伴选择从未被导出、从未上云。 |
| 性质 | **架构替换，不是缺陷。** 重写用自己的 Fastify + PostgreSQL 存档服务取代，并额外支持六个旧键的完整迁移。 |
| 建议 | 无需审批，已在 `docs/ARCHITECTURE.md` 的 API 契约一节记录。 |

### 7. 竞技场 / 副本 / 王者乱斗等旧模式未迁移

| 项目 | 内容 |
| --- | --- |
| 现状 | 旧版除 50 关战役外还有虚空竞技场（`arenaActive`）、BOSS 副本（`raidActive`）、王者乱斗（`wzlbActive`）三套模式，并在 `calcDamage()` 里各自插入乘区（`baseline/index.html:16414-16420`）。重写只实现 50 关战役。 |
| 性质 | **范围裁剪。** 属于新增工作，需确认是否进入后续版本。 |

---

## 8. 后续提案

以下提案都会改变数值、难度曲线或奖励经济，**必须经产品审批**后才能实施。本节只列提案，不代表已实现。

### P1 统一难度词缀的语义与覆盖率

- **现状**：装甲（−18% 受伤，第 5～6 档）、迅捷（+10% 闪避、+18% 移速，第 7～8 档）、再生（每秒回复 1.2% 最大生命，第 9～10 档）。
- **待定**：词缀是作用于敌人还是玩家？旧版词缀写在 `DIFFICULTY_CONFIG` 里、语义是「玩家承受的改动」，但实现分散在 `damageEnemy()`（只影响敌人受击）。重写统一为「敌人获得该词缀」（`diffArmor` / `diffDodge` 挂在 `DamageTargetState` 上），即玩家更难打中、更难打疼。
- **需确认**：词缀方向是否保留旧版语义？「再生」在重写中作用于敌人，数值 1.2%/秒是否需要重新标定？
- **影响面**：`packages/content/src/generated/difficulty.ts`、`packages/game-core/src/systems/damage.ts`、`packages/game-core/src/sim/combat.ts`。

### P2 重新设计射速与伤害的耦合

- **现状**：射速已经完全帧率无关（C23 已修），但武器伤害仍直接继承旧版常量，而旧版设计表本身是过期的（C11）。
- **提案**：以「每秒期望伤害」为第一性指标重标 44 把武器，删除 `TIER_BONUS` 与武器基础伤害之间的重复放大关系。
- **需确认**：每档品质的目标 DPS 曲线（英雄 100 / 传说 300 / 神级 800 这组锚点是否保留）。
- **影响面**：`packages/content/src/generated/weapons.ts`、`packages/content/src/index.ts` 的 `TIER_BONUS`、`packages/game-core/src/systems/damage.ts`。

### P3 奖励经济：通关是否应当给金币

- **现状**：通关不给金币、不给经验、不给掉落，只解锁下一档难度；50 关从一开始就全部可选。**这是对旧版的忠实还原。**
- **提案（需审批）**：在不破坏关卡可达性的前提下引入结算收益，例如按难度档位给固定金币、按 BOSS 击杀给碎片、首次通关给一次性奖励。
- **前置影响**：金币一旦有来源，就需要一个**消耗端**（商店 / 强化）。旧版商店存在于遗留代码中但重写尚未实现，金币会变成只进不出的死资源。
- **需确认**：是否同时实现商店？金币与碎片是否双轨？
- **影响面**：`packages/game-core/src/systems/progression.ts`、`packages/game-core/src/sim/combat.ts` 结算流程、`apps/web/src/ui/screens.ts` 结算界面、`apps/api/src/db/seed.ts` 初始档。

### P4 技能数值窗口：BOSS 技能的冷却与前摇

- **现状**：42 条 BOSS 技能的冷却、前摇、后摇、半径、伤害系数全部沿用旧版常量。
- **提案**：当前 42 条技能共用六种行为原型，同原型技能的战斗节奏高度相似（同一套前摇 / 后摇窗口）。建议按「关卡进度」分档校准（前 10 关更慢更长预告，后 20 关更短更凶）。
- **需确认**：是否允许在迁移后调整数值？调整后 `packages/content/src/curated/boss-skills.json` 需要按关卡分段扩展。
- **影响面**：`packages/content/src/curated/boss-skills.json`、`packages/content/src/generated/boss-skills.ts`、`packages/game-core/src/sim/combat.ts`。

### P5 难度曲线的终局数值

- **现状**：倍率阶梯止于 3815，第 50 关 BOSS 在 10 级难度下血量约 `7.167e12 × 3815 ≈ 2.73e16`。
- **提案**：该数值已接近 IEEE 754 安全整数上限（`2^53 ≈ 9.007e15`）的 3 倍，HUD 与结算中的血量显示会损失精度。建议在阶梯末段改为「倍率封顶 + 独立系数」，或把血量改为对数存储。
- **需确认**：10 级难度是否就是终局？是否需要更高档位？
- **影响面**：`packages/content/src/generated/difficulty.ts`、`packages/content/src/generated/boss-hp.ts`、`packages/game-core/src/index.ts` 的 `bossHpFor()`。

### P6 内容包一致性校验纳入 CI

- **现状**：`validateContent()` 已覆盖关卡 / 武器 / 难度 / 技能 / 被动 / 空洞边界。内容包已有自己的测试套件 `packages/content/test/content.test.ts`（10 个用例，`describe('内容包校验')`），根 `npm run test` 的三个 workspace 依次执行 `game-core` → `content` → `api`。
- **提案**：目前同一批内容包断言在两处重复维护——`packages/content/test/content.test.ts`（中文用例名）与 `packages/game-core/test/content.test.ts`（英文用例名，`describe('content pack')` 共 11 个用例）。建议确定唯一权威位置，让另一个改为引用或删除，并让 `npm run content:verify` 成为 CI 必过项。
- **影响面**：`packages/content/test/content.test.ts`、`packages/game-core/test/content.test.ts`、根 `package.json` 的 `test` 脚本。

---

## 9. 当前阻塞与已知偏差

以下条目在编写本文件时仍然成立，或与上游工作说明中的数字不一致，逐一列明以免误导。

| 项目 | 工作说明的说法 | 实测 | 处理 |
| --- | --- | --- | --- |
| BOSS 技能数量 | 36 | **42** | 以实测为准，见 C29 |
| 精英技能失效数量 | 33 个中失效 23 个（派发器 10 个分支） | 派发器实为 **18** 个分支、无 `default`，失效 **15** 个 | 以实测为准，见 C16；重写已补齐全部 33 个 |
| 第 31～50 关模板描述条数 | 81 | **80**（20 关 × 4 条） | 以实测为准，见 C13 |
| `build*Room()` 死代码 | 约 3,000 行，61 个中 59 个 | **59** 个从未被调用，合计 **2,921** 行（`buildRoom` 与 `buildChapterRoom` 仍在用） | 以实测为准，见 `docs/LEGACY-AUDIT.md` |
| 内联 `<script>` 块数量 | 9 | **8** 个内联块 + 2 个外部 `<script>`（three.js 0.152、WorkBuddy SDK），共 10 个 script 标签 | 以实测为准 |
| `removeEventListener` 数量 | 10 | **11** | 以实测为准 |
| 内容包断言重复 | — | 同一批不变量在 `packages/content/test/content.test.ts`（10 个用例）与 `packages/game-core/test/content.test.ts`（11 个用例）中各维护一份 | 见下 |
| BOSS 被动接线 | — | 曾因导入器读取摘要表而丢失，已改为读取原始蓝图表 | 50 关全部接回旧版被动 |

**内容包断言存在两份**：`packages/content/test/content.test.ts`（`describe('内容包校验')`，10 个用例，中文名）与 `packages/game-core/test/content.test.ts`（`describe('content pack')`，11 个用例，英文名）覆盖同一批内容包不变量。本文件引用的内容包断言统一采用**后者**（英文名），已实测通过：`packages/game-core` 三个测试文件共 54 个用例、`packages/content` 一个文件共 10 个用例、`apps/api` 四个文件共 18 个用例，全部通过。合并这两份属于 `packages/` 的工作范围，本文档只记录。

---

## 10. 相关文档

- `docs/ARCHITECTURE.md` — 技术选型与架构决策
- `docs/LEGACY-AUDIT.md` — 旧版基线的取证记录
- `docs/README.md` — 文档索引
