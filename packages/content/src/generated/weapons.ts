/**
 * GENERATED FILE — do not edit by hand.
 * Source: tools/legacy-audit/out/* (audited legacy baseline)
 * Regenerate: npm run content:import
 */

import type { WeaponDef } from '../types.js';

export const WEAPONS: WeaponDef[] = [
  {
    "id": "normalgrenade",
    "name": "爆炎手雷",
    "slot": "grenade",
    "category": "投掷武器",
    "quality": 1,
    "qualityLabel": "1级",
    "icon": "💣",
    "price": 0,
    "tagline": "1级投掷武器 — 初始装备",
    "typeLabel": "投掷武器",
    "passives": [
      "灼烧区域持续3秒伤害"
    ],
    "actives": [
      "投掷[左键/右键]",
      "蓄力投[左键长按]"
    ],
    "isDefault": true,
    "stats": {
      "baseDamage": 240,
      "unit": "",
      "label": "爆炸伤害",
      "fireInterval": 2,
      "magazine": null,
      "reserve": null,
      "reloadTime": null
    }
  },
  {
    "id": "froststar",
    "name": "急冻霜星",
    "slot": "grenade",
    "category": "投掷武器",
    "quality": 3,
    "qualityLabel": "3级",
    "icon": "❄",
    "price": 3000,
    "tagline": "3级投掷武器 — 二段式冰霜毁灭装置",
    "typeLabel": "投掷武器",
    "passives": [
      "二段爆炸：冰冻解除时自动触发二段冰霜爆炸"
    ],
    "actives": [
      "投掷[左键/右键]"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 120,
      "unit": "",
      "label": "首爆/二段",
      "fireInterval": 2,
      "magazine": null,
      "reserve": null,
      "reloadTime": null,
      "extras": {
        "baseDmgFirst": 120,
        "baseDmgSecond": 120
      }
    }
  },
  {
    "id": "deathlight",
    "name": "死神之光",
    "slot": "grenade",
    "category": "投掷武器",
    "quality": 3,
    "qualityLabel": "3级",
    "icon": "☢",
    "price": 3000,
    "tagline": "3级投掷武器 — 毁灭性光能爆破装置",
    "typeLabel": "投掷武器",
    "passives": [
      "25%概率使用后返还一枚投掷武器"
    ],
    "actives": [
      "投掷[左键/右键]"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 120,
      "unit": "",
      "label": "爆炸伤害",
      "fireInterval": 2,
      "magazine": null,
      "reserve": null,
      "reloadTime": null,
      "extras": {
        "baseDmgRocket": 12
      }
    }
  },
  {
    "id": "luowang",
    "name": "罗网",
    "slot": "grenade",
    "category": "投掷武器",
    "quality": 4,
    "qualityLabel": "4级",
    "icon": "🕸",
    "price": 8000,
    "tagline": "4级投掷武器 — 天罗地网，蛛丝缚敌",
    "typeLabel": "投掷武器",
    "passives": [
      "天罗地网：落地生成蛛网，范围内敌人减速60%并持续受伤，停留2秒被眩晕1.2秒",
      "分裂：蛛网结束后裂出3只蜘蛛，命中敌人生成小型蛛网(减速+持续伤害)"
    ],
    "actives": [
      "投掷[左键/右键]：直线投出罗网，落地布网"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 90,
      "unit": "",
      "label": "蛛网伤害",
      "fireInterval": 2,
      "magazine": null,
      "reserve": null,
      "reloadTime": null
    }
  },
  {
    "id": "fate",
    "name": "命运审判",
    "slot": "grenade",
    "category": "投掷武器",
    "quality": 5,
    "qualityLabel": "5级",
    "icon": "⚖",
    "price": 120000,
    "tagline": "5级投掷武器 — 命运审判，天平裁决",
    "typeLabel": "投掷武器",
    "passives": [
      "命运天平：被命运闪光致盲的敌人受到伤害+40%（强力增伤），并陷入减速",
      "不熄闪光：命运领域每0.5秒对范围内敌人造成闪光伤害并致盲"
    ],
    "actives": [
      "投掷[左键/右键]：投掷后化作命运领域，持续闪光伤害+致盲"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 650,
      "unit": "",
      "label": "爆炸伤害",
      "fireInterval": 2,
      "magazine": null,
      "reserve": null,
      "reloadTime": null
    }
  },
  {
    "id": "genesislight",
    "name": "创世之光",
    "slot": "grenade",
    "category": "投掷武器",
    "quality": 6,
    "qualityLabel": "6级",
    "icon": "🌟",
    "price": 200000,
    "tagline": "6级投掷武器 — 创世之光，生灭同源",
    "typeLabel": "投掷武器",
    "passives": [
      "圣光索敌[右键]：向最近敌人射出追踪圣光（400%武器伤害），命中附加致盲（攻击概率丢失，对召唤物/幻影更高），并在目标处展开解构领域（持续5秒、停留越久伤害越高）",
      "诞生与毁灭：装备时获得——PVE中死亡立即以自身为中心引爆创世之光（1500%范围伤害）并满血复活，冷却60秒"
    ],
    "actives": [
      "创世·裁决[中键]：消耗18%最大能量，对周围10米释放创世裁决——范围500%圣光伤害+击退+展开解构领域，冷却8秒"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 600,
      "unit": "",
      "label": "爆炸伤害",
      "fireInterval": 0.0714285714,
      "magazine": null,
      "reserve": null,
      "reloadTime": null
    }
  },
  {
    "id": "tanglotus",
    "name": "佛怒唐莲",
    "slot": "grenade",
    "category": "投掷武器",
    "quality": 8,
    "qualityLabel": "8级",
    "icon": "🪷",
    "price": 200000,
    "tagline": "8级投掷武器 — 金红龙卷，万瓣追魂",
    "typeLabel": "投掷武器",
    "passives": [
      "花瓣追踪：所有花瓣自动追踪地图范围内全部敌人，必定命中，不会落空",
      "若仅剩一个敌人，该目标承受每秒100朵全部伤害",
      "每朵花瓣独立判定：1%秒杀小怪，1%对BOSS造成1%最大生命真伤(秒杀对BOSS无效)"
    ],
    "actives": [
      "投掷[左键/右键]：引爆后生成金红龙卷，持续释放追踪花瓣"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 800,
      "unit": "",
      "label": "爆炸/花瓣",
      "fireInterval": 2,
      "magazine": null,
      "reserve": null,
      "reloadTime": null,
      "extras": {
        "petalDmg": 8,
        "petalCount": 1000
      }
    }
  },
  {
    "id": "thunderblade",
    "name": "雷霆战刃",
    "slot": "melee",
    "category": "近战武器",
    "quality": 1,
    "qualityLabel": "1级",
    "icon": "⚔",
    "price": 0,
    "tagline": "1级近战武器 — 初始装备",
    "typeLabel": "近战武器",
    "passives": [
      "重击命中产生电场范围持续伤害"
    ],
    "actives": [
      "轻击[左键]：快速近战",
      "重击[右键]：蓄力重击+眩晕+电场"
    ],
    "isDefault": true,
    "stats": {
      "baseDamage": 43,
      "unit": "",
      "label": "轻击/重击",
      "fireInterval": 0.4,
      "magazine": null,
      "reserve": null,
      "reloadTime": null,
      "extras": {
        "heavyInterval": 0.8,
        "heavyDamage": 130,
        "baseDmgLight": 43,
        "baseDmgHeavy": 130
      }
    }
  },
  {
    "id": "hellscythe",
    "name": "地狱魔镰",
    "slot": "melee",
    "category": "近战武器",
    "quality": 3,
    "qualityLabel": "3级",
    "icon": "🌀",
    "price": 5000,
    "tagline": "3级近战武器 — 地狱锻造的魔镰",
    "typeLabel": "近战武器",
    "passives": [
      "狂风投射物可卷起敌人击退"
    ],
    "actives": [
      "普通狂风[右键]：1道x10次，基础伤害800/次，无冷却，消耗2%最大能量",
      "地狱狂风[中键]：3道x10次，基础伤害800/次，冷却15秒，30能量"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 9,
      "unit": "/次",
      "label": "基础伤害",
      "fireInterval": 0.4,
      "magazine": null,
      "reserve": null,
      "reloadTime": null,
      "extras": {
        "heavyInterval": 0.8,
        "heavyDamage": 2000,
        "heavyCount": 3
      }
    }
  },
  {
    "id": "thor",
    "name": "托尔之触",
    "slot": "melee",
    "category": "近战武器",
    "quality": 4,
    "qualityLabel": "4级",
    "icon": "⚡",
    "price": 10000,
    "tagline": "4级近战武器 — 托尔之触，雷霆圣洗",
    "typeLabel": "近战武器（雷锤）",
    "passives": [
      "雷神之怒：唤雷期间近战命中吸取15%伤害为生命，且受到伤害-30%",
      "雷印：电圈内敌人累计3层雷印触发落雷爆发"
    ],
    "actives": [
      "轻击[左键]：黄金雷锤挥击，800基础伤害，命中引发链式闪电",
      "唤雷[中键]：消耗12%最大能量，以自身为中心生成电圈(半径7米，持续12秒)，圈内敌人持续受到伤害并累积雷印",
      "雷神降临[右键]：向准星发射信标，命中爆炸造成范围伤害并生成次级电圈"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 800,
      "unit": "",
      "label": "轻击/重击",
      "fireInterval": 0.4,
      "magazine": null,
      "reserve": null,
      "reloadTime": null,
      "extras": {
        "heavyInterval": 0.8,
        "heavyDamage": 1200,
        "baseDmgLight": 800,
        "baseDmgHeavy": 1200
      }
    }
  },
  {
    "id": "guangling",
    "name": "广陵",
    "slot": "melee",
    "category": "近战武器",
    "quality": 5,
    "qualityLabel": "5级",
    "icon": "🎵",
    "price": 80000,
    "tagline": "5级近战武器 — 广陵，琴剑双绝",
    "typeLabel": "近战武器（琴剑）",
    "passives": [
      "剑意：剑形态下每0.5秒对最近3名敌人释放剑罡（150基础伤害）",
      "影遁：剑形态期间受到伤害-50%，身形隐于琴音",
      "易伤：音波/剑气命中使目标受到广陵伤害+25%（5秒）"
    ],
    "actives": [
      "音波冲击[左键]：琴形态向前方释放音波，范围伤害",
      "环音波[右键]：琴形态以自身为中心扩散环音波",
      "剑形态[中键]：消耗7%最大能量切换剑形态（持续8秒，冷却14秒），左键剑气斩/右键剑气爆",
      "剑气斩[左键]：剑形态弧形剑气斩击",
      "剑气爆[右键]：剑形态范围剑气爆发"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 160,
      "unit": "",
      "label": "音波/环音",
      "fireInterval": 0.4,
      "magazine": null,
      "reserve": null,
      "reloadTime": null,
      "extras": {
        "heavyInterval": 0.8
      }
    }
  },
  {
    "id": "sharkblade",
    "name": "血鲨神锯",
    "slot": "melee",
    "category": "近战武器",
    "quality": 5,
    "qualityLabel": "5级",
    "icon": "🦈",
    "price": 50000,
    "tagline": "5级近战武器 — 血鲨神锯，深渊鲨戮",
    "typeLabel": "近战武器（链锯）",
    "passives": [
      "酸蚀唾液：链锯命中35%概率施加酸蚀——目标受到伤害+100%且移动时持续受伤",
      "血之气息：连续命中叠加血之气息（最高10层，每层+12%伤害），停手3秒衰减",
      "深海血怒：链锯命中吸取3%伤害为生命；对酸蚀目标额外+100%伤害"
    ],
    "actives": [
      "链锯攻击[左键]：持续链锯撕咬，10跳/秒，每跳80基础伤害",
      "碎齿重击[右键]：范围重击，造成600基础伤害+击退+眩晕1.5秒+施加酸蚀",
      "吞噬漩涡[中键]：消耗18%最大能量，在准星处召唤巨鲨造成范围伤害+击飞+眩晕，并留下持续6秒的鲨海（范围持续伤害+施加酸蚀），冷却15秒"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 80,
      "unit": "/跳",
      "label": "链锯伤害",
      "fireInterval": 0.1,
      "magazine": null,
      "reserve": null,
      "reloadTime": null,
      "extras": {
        "heavyInterval": 0.8,
        "heavyDamage": 600
      }
    }
  },
  {
    "id": "thousandumbrella",
    "name": "千机伞",
    "slot": "melee",
    "category": "近战武器",
    "quality": 6,
    "qualityLabel": "6级",
    "icon": "☂",
    "price": 30000,
    "tagline": "6级近战武器 — 千机百变，三形态机关伞刃",
    "typeLabel": "近战武器",
    "passives": [
      "千机百变：刃形态扇形范围斩击200%伤害 | 盾形态减免90%伤害+反弹50%近战 | 羽形态飞行+移速+100%+3道风刃150%伤害",
      "形态切换：切换瞬间0.5秒无敌，3秒内下次攻击伤害+100%"
    ],
    "actives": [
      "天罗伞阵[中键]：跃空投射巨型伞阵(直径20米)，持续10秒，每秒108道伞刃(300%伤害+0.5秒禁锢)，结束万伞归一爆炸(1200%伤害+5米击飞)，期间闪避+80%，消耗28%最大能量冷却15秒",
      "伞舞龙卷[右键]：解体360片飞刃形成龙卷(5米)，持续5秒，每秒400%伤害+吸附，重组冲击波800%伤害，飞行状态范围10米×2吸附，消耗14%最大能量冷却8秒"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 520,
      "unit": "/击",
      "label": "基础伤害",
      "fireInterval": 0.5,
      "magazine": null,
      "reserve": null,
      "reloadTime": null
    }
  },
  {
    "id": "thunder",
    "name": "雷霆之怒",
    "slot": "primary",
    "category": "主武器",
    "quality": 1,
    "qualityLabel": "1级",
    "icon": "🔫",
    "price": 0,
    "tagline": "1级突击步枪 — 初始装备",
    "typeLabel": "主武器（突击步枪）",
    "passives": [
      "无"
    ],
    "actives": [
      "无"
    ],
    "isDefault": true,
    "stats": {
      "baseDamage": 9,
      "unit": "/发",
      "label": "基础伤害",
      "fireInterval": 0.1,
      "magazine": 150,
      "reserve": 1500,
      "reloadTime": 1.8
    }
  },
  {
    "id": "shadowasura",
    "name": "暗影修罗",
    "slot": "primary",
    "category": "主武器",
    "quality": 3,
    "qualityLabel": "3级",
    "icon": "🌑",
    "price": 50000,
    "tagline": "3级暗影步枪 — 影魔附体，斩尽八荒",
    "typeLabel": "主武器（暗影步枪）",
    "passives": [
      "影·加持：命中目标施加影痕（6秒），影痕目标受到暗影修罗的伤害+50%",
      "影·刃：右键挥出暗影利刃，对前方范围造成150%基础暗影伤害并击退"
    ],
    "actives": [
      "影·斩[中键]：消耗15%最大能量，对周围8米释放影之斩击——范围300%基础暗影伤害+击退+施加影痕，冷却8秒"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 28,
      "unit": "/发",
      "label": "基础伤害",
      "fireInterval": 0.0833,
      "magazine": null,
      "reserve": null,
      "reloadTime": null
    }
  },
  {
    "id": "dragonlyknight",
    "name": "魔龙骑士",
    "slot": "primary",
    "category": "主武器",
    "quality": 4,
    "qualityLabel": "4级",
    "icon": "🐉",
    "price": 10000,
    "tagline": "4级AK47步枪 — 魔龙化身，战场主宰",
    "typeLabel": "主武器（AK47步枪）",
    "passives": [
      "血怒：每损失1%生命值，伤害提升1%",
      "龙鳞守护：受到致命伤害时触发，无敌3秒并恢复护盾至上限，冷却60秒"
    ],
    "actives": [
      "龙威[中键]：开关型，移速+50%，伤害+100%，开枪不消耗子弹，每秒消耗1%最大能量，能量低于10%自动关闭，无冷却"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 17,
      "unit": "/发",
      "label": "基础伤害",
      "fireInterval": 0.0833,
      "magazine": 50,
      "reserve": 1000,
      "reloadTime": 2
    }
  },
  {
    "id": "tianshen",
    "name": "天神·冰律裁决",
    "slot": "primary",
    "category": "主武器",
    "quality": 5,
    "qualityLabel": "5级",
    "icon": "🔱",
    "price": 150000,
    "tagline": "5级机枪 — 天神降世，冰律裁决",
    "typeLabel": "主武器（神级机枪）",
    "passives": [
      "钛合金铸体：无视距离衰减，子弹数+80，机枪压制火力全开",
      "天神雷：命中35%概率降下天神雷（120伤害，无视距离）",
      "极限换弹：每15秒换弹就绪，期间伤害+20%"
    ],
    "actives": [
      "左键：冰律连射（78/发，18发/秒，无视距离衰减）",
      "右键：势能爆珠——发射弹射能量珠，命中敌人弹射最多4次（每次500伤害），冷却2秒",
      "冰封力场[中键]：消耗14%最大能量，身前展开冰封力场——减速60%+冰冻+净化伤害（200/秒），持续8秒，冷却14秒"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 78,
      "unit": "/发",
      "label": "基础伤害（天神雷）",
      "fireInterval": 0.0555555556,
      "magazine": 150,
      "reserve": 1500,
      "reloadTime": 1.8
    }
  },
  {
    "id": "zeushand",
    "name": "宙斯之手",
    "slot": "primary",
    "category": "主武器",
    "quality": 5,
    "qualityLabel": "5级",
    "icon": "⚡",
    "price": 30000,
    "tagline": "5级能量枪 — 雷霆万钧，宙斯降临",
    "typeLabel": "主武器（能量枪）",
    "passives": [
      "雷霆能量：雷球命中充能，充满后释放闪电链，跳跃10次，每次50%武器基础伤害",
      "感电：闪电链击中目标施加15秒感电，受宙斯之手伤害+100%，击中感电目标回复1%能量"
    ],
    "actives": [
      "宙斯降临[中键]：在当前位置召唤宙斯幻影，自动攻击大范围敌人，继承本体普攻。最多5个幻影，每个消耗12%最大能量，无冷却。幻影不会自动消失，无生命值，无持续时间限制"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 173,
      "unit": "/发",
      "label": "基础伤害",
      "fireInterval": 0.125,
      "magazine": 150,
      "reserve": 1500,
      "reloadTime": 1.8
    }
  },
  {
    "id": "thunderex",
    "name": "湮雷·无限",
    "slot": "primary",
    "category": "主武器",
    "quality": 5,
    "qualityLabel": "5级",
    "icon": "🌩",
    "price": 30000,
    "tagline": "5级等离子步枪 — 湮雷无限，雷罚加身",
    "typeLabel": "主武器（等离子步枪）",
    "passives": [
      "等离子贯穿：左键等离子弹贯穿前方所有敌人（无视障碍/破甲），命中使目标受到伤害+12%（3秒，可刷新）",
      "火力全开：击杀叠加连杀层数（3秒内，最高5层），满层左键触发闪电链弹射附近敌人",
      "电浆环绕：2颗电浆球环绕身周，自动以等离子攻击最近敌人",
      "雷切：右键雷切重击，对血量<40%目标伤害+50%，<20%目标伤害+100%（处决）"
    ],
    "actives": [
      "左键：等离子贯穿射击（90/发，9发/秒）",
      "右键：雷切——处决重击（420基础伤害，穿透并享受处决加成）",
      "圣化·无限领域[中键]：消耗12%最大能量，以自身为中心展开圣化领域——持续治疗+护盾回复+净化AOE伤害，持续6秒，冷却12秒"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 90,
      "unit": "/发",
      "label": "基础伤害（贯穿）",
      "fireInterval": 0.1111111111,
      "magazine": 150,
      "reserve": 1500,
      "reloadTime": 1.8
    }
  },
  {
    "id": "yanzhi",
    "name": "裁决之炎",
    "slot": "primary",
    "category": "主武器",
    "quality": 5,
    "qualityLabel": "5级",
    "icon": "🔥",
    "price": 150000,
    "tagline": "7级狙击枪 — 裁决之炎，红莲审判（已强化）",
    "typeLabel": "主武器（狙击枪）",
    "passives": [
      "龙息弹：全自动狙击，子弹100%穿透前方所有敌人，无视距离衰减",
      "红莲印记：命中使目标受到裁决之炎伤害+40%（5秒，可刷新），并为炎皇帝冠充能",
      "炎皇帝冠：装备时浮空自动攻击最近敌人（优先红莲印记目标），伤害可暴击",
      "红莲殉爆：红莲印记目标死亡时引发火焰殉爆，对半径9内敌人造成范围伤害"
    ],
    "actives": [
      "左键：龙息连射（150/发，8发/秒，穿透）",
      "红莲爆裂[中键]：消耗12%最大能量，眩晕所有红莲印记敌人（对BOSS无效），8秒内武器伤害+100%且炎皇帝冠攻速翻倍，冷却8秒"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 150,
      "unit": "/发",
      "label": "基础伤害",
      "fireInterval": 0.125,
      "magazine": 150,
      "reserve": 1500,
      "reloadTime": 1.8
    }
  },
  {
    "id": "tumo",
    "name": "屠魔",
    "slot": "primary",
    "category": "主武器",
    "quality": 6,
    "qualityLabel": "6级",
    "icon": "🎯",
    "price": 10000,
    "tagline": "6级主武器 — 屠魔弑神之枪",
    "typeLabel": "主武器",
    "passives": [
      "割裂箭头：命中施加10秒割裂，移动时每帧受基础伤害100%",
      "巨力一击：命中击退3米，子弹100%穿透前方所有敌人与建筑物"
    ],
    "actives": [
      "屠魔护体[中键]：开关型，无冷却，90%减伤，每秒消耗2%最大能量"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 800,
      "unit": "/发",
      "label": "基础伤害",
      "fireInterval": 0.3333333333,
      "magazine": null,
      "reserve": null,
      "reloadTime": 2.5
    }
  },
  {
    "id": "prism",
    "name": "棱镜",
    "slot": "primary",
    "category": "主武器",
    "quality": 6,
    "qualityLabel": "6级",
    "icon": "⌖",
    "price": 120000,
    "tagline": "6级主武器 — 棱镜，几何即火力",
    "typeLabel": "主武器（折射步枪）",
    "passives": [
      "聚光：同一发子弹对同一目标的第 N 次命中，伤害 ×(1+65%×(N-1))，最多叠 6 层。子弹命中敌人后不会消失，继续飞行",
      "棱镜聚焦：反弹次数 ≥2 的子弹命中时必定暴击（×2），且无视 BOSS 护盾减伤"
    ],
    "actives": [
      "棱镜矩阵[中键]：消耗18%能量，冷却18秒，持续12秒——身前弧形生成4面悬浮棱镜，己方子弹撞到棱镜同样计为一次反弹（+1）；期间射速×2.2",
      "相位折叠[右键]：消耗12%能量，冷却4秒——场上所有己方子弹原地折返180°，各获得一次反弹计数"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 2200,
      "unit": "/发",
      "label": "基础伤害（直击）",
      "fireInterval": 0.2,
      "magazine": 150,
      "reserve": 1500,
      "reloadTime": 1.8
    }
  },
  {
    "id": "ciyuan",
    "name": "次元之星",
    "slot": "primary",
    "category": "主武器",
    "quality": 6,
    "qualityLabel": "6级",
    "icon": "🔷",
    "price": 150000,
    "tagline": "6级霰弹枪 — 次元之星，维度裂变",
    "typeLabel": "主武器（霰弹枪）",
    "passives": [
      "次元散射：8枚紧凑弹丸，无视距离衰减，近距全中爆发极高",
      "次元标记：弹丸命中施加次元标记(最多5层)，标记目标受到次元之星伤害+15%，每0.5秒引发维度爆炸(范围伤害+治疗3%最大生命)",
      "次元替身：受到伤害时召唤次元分身(8秒冷却)，分身存在1秒无敌抵挡并4秒后引爆造成范围伤害",
      "次元之力：标记爆炸伤害提升，次元领域冷却降低"
    ],
    "actives": [
      "左键：次元散射（45×8/发，15发/秒）",
      "次元领域[中键]：消耗14%最大能量，在准星处引爆次元裂隙——范围眩晕(对BOSS无效)+爆发伤害+展开6秒次元领域(持续对场内敌人施加5层标记并治疗)，冷却12秒"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 45,
      "unit": "/发(×8弹丸)",
      "label": "基础伤害（每弹丸）",
      "fireInterval": 0.0666666667,
      "magazine": 150,
      "reserve": 1500,
      "reloadTime": 1.8,
      "extras": {
        "pellets": 8
      }
    }
  },
  {
    "id": "dawnlight",
    "name": "黎明之光",
    "slot": "primary",
    "category": "主武器",
    "quality": 6,
    "qualityLabel": "6级",
    "icon": "☀",
    "price": 10000,
    "tagline": "6级主武器 — 破晓之光，净化黑暗",
    "typeLabel": "主武器",
    "passives": [
      "黎明之力：持续射击时每秒+30%伤害，最高+300%，中断归零"
    ],
    "actives": [
      "黎明解放[右键]：长按右键释放，松开右键关闭，每秒消耗1%能量上限，范围大幅扩大，伤害+100%，激光穿透障碍物"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 150,
      "unit": "/次",
      "label": "基础伤害",
      "fireInterval": 0.05,
      "magazine": null,
      "reserve": null,
      "reloadTime": null
    }
  },
  {
    "id": "tianfa",
    "name": "天罚·神裁之眼",
    "slot": "primary",
    "category": "主武器",
    "quality": 7,
    "qualityLabel": "7级",
    "icon": "👁",
    "price": 150000,
    "tagline": "7级雷霆冲锋枪 — 天罚降临，雷霆审判",
    "typeLabel": "主武器（雷霆冲锋枪）",
    "passives": [
      "诺法雷构造：左键射击时对准星周围敌人降下落雷（无视距离），每发最多3道，每道1000%技能伤害系数（10×基础伤害），并施加神之注视",
      "神之注视：命中使目标受到伤害+25%（4秒，可刷新）；神之注视目标受到本武器所有伤害额外+25%",
      "雷之步伐：装备时移速+3（神级标准），身形如雷霆般迅捷",
      "湮雷压缩弹[右键]：发射压缩雷弹，命中展开狂暴星云——4秒持续范围伤害（220/秒，半径8米）"
    ],
    "actives": [
      "左键：雷霆连射（750/发，18发/秒）",
      "右键：湮雷压缩弹——500%技能伤害系数（5×基础伤害）冲击+狂暴星云范围持续伤害，冷却2秒",
      "神裁领域[中键]：消耗14%最大能量，展开神裁领域——治疗+护盾回复+净化AOE（300/秒），每0.5秒对全场所有敌方目标降下强化落雷（1000%技能伤害系数，10×基础伤害）并施加神之注视，持续7秒，冷却14秒"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 750,
      "unit": "/发",
      "label": "基础伤害（落雷）",
      "fireInterval": 0.0555555556,
      "magazine": 150,
      "reserve": 1500,
      "reloadTime": 1.8
    }
  },
  {
    "id": "parasite",
    "name": "寄生者",
    "slot": "primary",
    "category": "主武器",
    "quality": 7,
    "qualityLabel": "7级",
    "icon": "💀",
    "price": 20000,
    "tagline": "7级主武器 — 寄生于死，噬魂而生",
    "typeLabel": "主武器",
    "passives": [
      "内脏暴击：炮狙模式下命中目标施加递增层数标记（1层300%、2层600%、3层900%、4层1200%、5层1500%范围伤害），最高5层后50%维持/50%重置。范围伤害可同时为多目标叠加"
    ],
    "actives": [
      "炮狙模式[右键]：需能量>10%，开关型。开启后左键发射巨炮冲击波，消耗1%能量，造成200%武器基础范围伤害，吸入附近目标。再次按右键关闭"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 1800,
      "unit": "/发",
      "label": "基础伤害",
      "fireInterval": 0.5,
      "magazine": 150,
      "reserve": 1500,
      "reloadTime": 1.8
    }
  },
  {
    "id": "rift",
    "name": "裂界",
    "slot": "primary",
    "category": "主武器",
    "quality": 7,
    "qualityLabel": "7级",
    "icon": "⧗",
    "price": 180000,
    "tagline": "7级主武器 — 裂界，以枪为笔，以场为纸",
    "typeLabel": "主武器（锚点发生器）",
    "passives": [
      "锐化：锚点存续期间，你对该锚点所属敌人的射击伤害 +60%",
      "共振：同一敌人被多条裂界线覆盖时，其受到的裂界线伤害按 ×2.0 逐条递增（最多计 3 条 → ×4.0）",
      "定锚：坍缩不清空锚点，改为剩余存续时间减半，便于连续引爆"
    ],
    "actives": [
      "坍缩[中键]：引爆全部裂界线，每条线对沿线 4.2m 范围内的敌人造成 1200% 基础伤害；冷却10秒。锚点：命中敌人或场景留下锚点（存续9秒，最多4个，两两成线共6条）；两两之间自动生成裂界线，对沿线范围内的敌人每秒造成 380% 基础伤害；命中敌人时锚点跟随该敌人移动"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 5600,
      "unit": "/发",
      "label": "基础伤害",
      "fireInterval": 0.222,
      "magazine": 150,
      "reserve": 1500,
      "reloadTime": 1.8
    }
  },
  {
    "id": "meiying",
    "name": "魅影",
    "slot": "primary",
    "category": "主武器",
    "quality": 7,
    "qualityLabel": "7级",
    "icon": "⚡",
    "price": 200000,
    "tagline": "8级黄金冲锋枪 — 魅影，幽影与闪电的协奏",
    "typeLabel": "主武器（黄金冲锋枪）",
    "passives": [
      "电弧连击：命中概率发射电弧α，连锁闪电跳跃至附近敌人(最多4跳)并施加感电",
      "感电：电弧命中施加可叠加易伤(最多5层)，每层使目标受到伤害+6%，满层触发强化感电(对该目标额外+25%)",
      "双重打击：双持爆发期间本武器伤害×1.4，并随双持时间持续提升(最高+50%)",
      "回溯：双持爆发瞬间获得短暂无敌；生命低于30%自动触发回溯无敌(20秒冷却)",
      "亦正亦邪：击杀回复6能量；满层感电目标死亡引发电弧殉爆(范围伤害)"
    ],
    "actives": [
      "左键：幽影连射（80/发，18发/秒）",
      "双持爆发[中键]：消耗14%最大能量，进入双持形态——双枪连射(射速提升+伤害×1.4+电弧连锁)，持续7秒，增伤随时间提升至+50%，冷却12秒"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 900,
      "unit": "/发",
      "label": "基础伤害",
      "fireInterval": 0.0555555556,
      "magazine": 150,
      "reserve": 1500,
      "reloadTime": 1.8
    }
  },
  {
    "id": "arcion",
    "name": "弧电离子",
    "slot": "primary",
    "category": "主武器",
    "quality": 8,
    "qualityLabel": "8级",
    "icon": "⚡",
    "price": 100000,
    "tagline": "8级电磁双持 — 弧电离子，双枪制霸",
    "typeLabel": "主武器（电磁双持）",
    "passives": [
      "磁能增伤：电离能激活时伤害+40%，并完全无视敌方力场(AT-field)减伤",
      "爆裂电浆：双枪电离能每3发(每把枪独立计数)各自动发射1枚追踪离子弹(1000%伤害)，自动锁定最近敌人",
      "超强稳定：移动/跳跃中弹道依旧精准，无视距离衰减"
    ],
    "actives": [
      "电离能[中键]：开关型，无冷却。每秒消耗1%能量上限，能量<10%无法开启。激活期间左右双枪同步开火，伤害+40%且无视力场减伤，每射击3发(每把枪独立计数)自动追加1枚追踪离子弹",
      "弧电闪现[右键]：向前瞬移至14米外，对沿途敌人造成伤害，并在原地留下弧电幻影(持续8秒)。幻影与本体同步开火，伤害与本体完全一致(100%)，且幻影恒定处于电离能开启状态(始终+40%且无视力场减伤)；最多3层充能，每层6秒回复"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 1300,
      "unit": "/发",
      "label": "基础伤害",
      "fireInterval": 0.0476190476,
      "magazine": 150,
      "reserve": 1500,
      "reloadTime": 1.8
    }
  },
  {
    "id": "phasewalker",
    "name": "相位行者",
    "slot": "primary",
    "category": "主武器",
    "quality": 8,
    "qualityLabel": "8级",
    "icon": "✦",
    "price": 180000,
    "tagline": "8级相位步枪 — 相位行者，穿行虚实",
    "typeLabel": "主武器（相位步枪）",
    "passives": [
      "相位打击：敌方存在信标时，每发 1% 概率造成目标 1% 生命上限真实伤害",
      "相位怒火：命中目标血量低于 75%/50%/25% 时，对该目标伤害分别 +100%/+200%/+300%"
    ],
    "actives": [
      "相位制导[中键]：按中键开关，无冷却。每秒消耗 1% 能量上限，能量低于 10% 无法开启。命中目标附加信标整体标记（不区分部位），标记目标受到的伤害必定为爆头伤害"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 1200,
      "unit": "/发",
      "label": "基础伤害",
      "fireInterval": 0.0625,
      "magazine": 150,
      "reserve": 1500,
      "reloadTime": 1.8
    }
  },
  {
    "id": "ponghong",
    "name": "破鸿",
    "slot": "primary",
    "category": "主武器",
    "quality": 9,
    "qualityLabel": "9级",
    "icon": "🪶",
    "price": 150000,
    "tagline": "9级主武器 — 破鸿，鸿羽裂空，聚能噬魂",
    "typeLabel": "主武器",
    "passives": [
      "聚能耦合：左键锁定视野内最近敌人发射聚能射线(自动索敌)，命中触发耦合爆炸(500%系数)范围伤害",
      "聚能嗜血：对敌伤害1%转化为生命；满血溢出治疗突破上限，最高10倍最大生命(仅当局)",
      "破鸿之魂：对同一目标持续伤害，第一秒为原始伤害，之后每持续1秒+10%，上限+500%"
    ],
    "actives": [
      "聚能耦合·怒火[中键]：开关型技能，开启后每秒消耗2%能量，强化为固定发射10条聚能射线（单体集火·敌人少于10个则多余射线优先集火最近目标）、耦合爆炸2000%系数；能量低于10%自动关闭，也可手动关闭",
      "破鸿之翼[右键]：漂浮至30米空中自由移动，30%伤害减免并无视负面效果，开关型，无冷却，每秒消耗1%能量，能量低于10%自动关闭，也可手动关闭"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 1500,
      "unit": "/发",
      "label": "基础伤害",
      "fireInterval": 0.0333333333,
      "magazine": 150,
      "reserve": 1500,
      "reloadTime": 1.8
    }
  },
  {
    "id": "shadow",
    "name": "幽影双枪",
    "slot": "secondary",
    "category": "副武器",
    "quality": 1,
    "qualityLabel": "1级",
    "icon": "🔫",
    "price": 0,
    "tagline": "1级双持手枪 — 初始装备",
    "typeLabel": "副武器（双持手枪）",
    "passives": [
      "无"
    ],
    "actives": [
      "扇火[右键]：扇形快速连射6发，每发基础伤害8"
    ],
    "isDefault": true,
    "stats": {
      "baseDamage": 8,
      "unit": "/发",
      "label": "基础伤害",
      "fireInterval": 0.0769,
      "magazine": 30,
      "reserve": 180,
      "reloadTime": 1.2
    }
  },
  {
    "id": "metalstorm",
    "name": "金属风暴",
    "slot": "secondary",
    "category": "副武器",
    "quality": 2,
    "qualityLabel": "2级",
    "icon": "🔫",
    "price": 5000,
    "tagline": "2级双持手枪 — 毁灭性弹幕压制装置",
    "typeLabel": "副武器（双持手枪）",
    "passives": [
      "极速射速：双持高射速手枪"
    ],
    "actives": [
      "锁敌风暴[中键]：每秒消耗2%最大能量，自动锁定范围内敌人射击，基础伤害50/发，不消耗弹药，无冷却，能量>20%可激活"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 5,
      "unit": "/发",
      "label": "基础伤害",
      "fireInterval": 0.0769,
      "magazine": 60,
      "reserve": 360,
      "reloadTime": 1.5
    }
  },
  {
    "id": "whitenight",
    "name": "白夜铳刃",
    "slot": "secondary",
    "category": "副武器",
    "quality": 4,
    "qualityLabel": "4级",
    "icon": "⚔",
    "price": 10000,
    "tagline": "4级铳刃手枪 — 白夜降临，万物肃杀",
    "typeLabel": "副武器（铳刃手枪）",
    "passives": [
      "领域牵引：技能激活期间，左键命中敌人可将范围中心转移至该敌人并跟随移动"
    ],
    "actives": [
      "白夜领域[右键]：对目标区域持续造成高频范围伤害，持续20秒，消耗5%最大能量，冷却5秒"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 78,
      "unit": "/发",
      "label": "基础伤害",
      "fireInterval": 0.1429,
      "magazine": 25,
      "reserve": 500,
      "reloadTime": 1.8
    }
  },
  {
    "id": "duel",
    "name": "黄金决斗",
    "slot": "secondary",
    "category": "副武器",
    "quality": 4,
    "qualityLabel": "4级",
    "icon": "🔫",
    "price": 10000,
    "tagline": "4级黄金副武器 — 马格南转轮，决斗时刻",
    "typeLabel": "副武器（马格南转轮）",
    "passives": [
      "致命磁能：自身命中叠加磁能，每层+5%伤害（上限+60%），停火4秒后衰减清零",
      "自动装填：收起武器时自动装填弹巢",
      "死眼：生命低于30%时左键射击必定暴击且伤害×1.5（处决）"
    ],
    "actives": [
      "左键：黄金决斗射击（260/发，2.4发/秒）",
      "毁灭射击[右键]：蓄力连发≤6发，从第2发起每发伤害+22%，释放时枪口炽红"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 260,
      "unit": "/发",
      "label": "基础伤害",
      "fireInterval": 0.42,
      "magazine": 7,
      "reserve": 48,
      "reloadTime": 1.6,
      "extras": {
        "autoReload": true
      }
    }
  },
  {
    "id": "energydefender",
    "name": "能量防卫者",
    "slot": "secondary",
    "category": "副武器",
    "quality": 5,
    "qualityLabel": "5级",
    "icon": "🛡",
    "price": 30000,
    "tagline": "5级能量防卫手枪 — 自充护盾，攻防一体",
    "typeLabel": "副武器（能量防卫手枪）",
    "passives": [
      "自充式能量炮：左键发射能量炮，贯穿前方所有敌人，每多穿透1个目标伤害+40%，备弹自充",
      "护盾屏障：展开屏蔽领域时全武器伤害+25%，最多叠加3层（最高+75%）"
    ],
    "actives": [
      "屏蔽领域[右键]：消耗8%最大能量，在身前展开能量护盾，持续18秒，期间免疫眩晕/击飞/击退并抵挡正面攻击；护盾存在时触发护盾屏障增伤。冷却2秒"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 95,
      "unit": "/发",
      "label": "基础伤害（贯穿）",
      "fireInterval": 0.125,
      "magazine": 10,
      "reserve": 30,
      "reloadTime": 1.5,
      "extras": {
        "reserveRegenPerSecond": 4
      }
    }
  },
  {
    "id": "moonbow",
    "name": "皓月神弓",
    "slot": "secondary",
    "category": "副武器",
    "quality": 6,
    "qualityLabel": "6级",
    "icon": "🏹",
    "price": 30000,
    "tagline": "6级副武器 — 皓月当空，冰霜降临",
    "typeLabel": "副武器（神弓）",
    "passives": [
      "冰霜箭：命中施加50%减速3秒 | 命中10%概率触发冰冻1秒（1秒内置冷却，不叠加）"
    ],
    "actives": [
      "万箭齐发[中键]：选定区域降下箭雨，每秒30次，每次300%基础伤害，持续30秒，消耗18%最大能量，冷却5秒"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 92,
      "unit": "/发",
      "label": "基础伤害",
      "fireInterval": 0.125,
      "magazine": 150,
      "reserve": 1500,
      "reloadTime": 1.8
    }
  },
  {
    "id": "terminus",
    "name": "终焉·神裁",
    "slot": "secondary",
    "category": "副武器",
    "quality": 6,
    "qualityLabel": "6级",
    "icon": "🌌",
    "price": 30000,
    "tagline": "6级副武器 — 终焉·神裁，暗物质灭世",
    "typeLabel": "副武器（暗能手枪）",
    "passives": [
      "暗物质能量：暗能弹贯穿前方所有敌人（无视障碍），命中使目标受到伤害+15%（3秒，可刷新）",
      "双子祝福：目标血量<50%时伤害+20%，<25%时伤害+35%（处决）",
      "双子之影：持续造成伤害积攒虚影能量，满100%召唤虚影，自动以同等暗能弹攻击视野内敌人"
    ],
    "actives": [
      "左键：暗能贯穿射击（120/发，10发/秒）",
      "右键：双生连击——5段 frontal 近战，每段300伤害",
      "横行无忌[中键]：消耗15%最大能量，以自身为中心降下终焉领域——内层(6米)近战伤害+冰冻，外层(22米)每秒40次、每次350%基础伤害，持续20秒，冷却8秒",
      "双子之力：切换到此武器时自动横扫前方敌人"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 120,
      "unit": "/发",
      "label": "基础伤害（贯穿）",
      "fireInterval": 0.1,
      "magazine": 150,
      "reserve": 1500,
      "reloadTime": 1.8
    }
  },
  {
    "id": "datacube",
    "name": "数据魔方",
    "slot": "tactical",
    "category": "战术武器",
    "quality": 4,
    "qualityLabel": "4级",
    "icon": "🧊",
    "price": 8000,
    "tagline": "4级战术武器 — 辅助增益型数据魔方装置",
    "typeLabel": "战术武器",
    "passives": [
      "魔方增幅：伤害加成初始为0%，每秒自动累加1%，100秒达到100%上限。死亡后伤害加成立即重置为0%，复活后重新从0%开始累加"
    ],
    "actives": [
      "无主动技能（纯被动辅助增益武器）"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 0,
      "unit": "",
      "label": "无",
      "fireInterval": null,
      "magazine": null,
      "reserve": null,
      "reloadTime": null
    }
  },
  {
    "id": "starcore",
    "name": "璀璨星核",
    "slot": "tactical",
    "category": "战术武器",
    "quality": 5,
    "qualityLabel": "5级",
    "icon": "🌟",
    "price": 30000,
    "tagline": "5级战术武器 — 璀璨星核，星海庇护",
    "typeLabel": "战术武器",
    "passives": [
      "星辉：伤害增幅初始即+25%，每秒自动累加2%，最高+200%（高于数据魔方初始0%/每秒1%/上限100%）；死亡后从25%重新累加",
      "星弹：星环激活期间自动追踪准星前方敌人，每0.5秒发射一发星弹（120基础伤害，落点4米范围溅射），伤害享受星辉增幅"
    ],
    "actives": [
      "星环[中键]：冷却22秒，持续12秒——移速+50%、免疫眩晕/冰冻/禁锢、受到的所有伤害降低50%，期间持续自动发射追踪星弹"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 120,
      "unit": "/发",
      "label": "星弹伤害",
      "fireInterval": 0.5,
      "magazine": null,
      "reserve": null,
      "reloadTime": null
    }
  },
  {
    "id": "juexian",
    "name": "绝弦之诗",
    "slot": "tactical",
    "category": "战术武器",
    "quality": 5,
    "qualityLabel": "5级",
    "icon": "🎻",
    "price": 60000,
    "tagline": "5级战术武器 — 绝弦之诗，终焉弦音",
    "typeLabel": "战术武器",
    "passives": [
      "弦韵共鸣：伤害增幅初始+15%，每秒+2%（HP<50%叠层×2、HP<25%×3），最高+180%；死亡重置",
      "乐感：毁灭形态期间自动叠加乐感，HP越低叠层越快，每层追加伤害增幅"
    ],
    "actives": [
      "毁灭形态[中键]：冷却20秒，持续14秒——移速+50%、免疫眩晕/冰冻/禁锢/减速、受到伤害-60%，期间自动追踪弦矢（160基础伤害/0.4秒）；周期抽取灵韵值提升灵韵增幅等级（每层+15%伤害，最高+75%），首启必满灵韵[绝弦]"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 160,
      "unit": "/发",
      "label": "弦矢伤害",
      "fireInterval": 0.333,
      "magazine": null,
      "reserve": null,
      "reloadTime": null
    }
  },
  {
    "id": "yanmo",
    "name": "炎魔灭世",
    "slot": "tactical",
    "category": "战术武器",
    "quality": 6,
    "qualityLabel": "6级",
    "icon": "🔥",
    "price": 35000,
    "tagline": "6级战术武器 — 炎魔灭世，焚尽八荒",
    "typeLabel": "战术武器",
    "passives": [
      "磁能增幅：伤害增幅初始+20%，每秒+2.5%，最高+220%；死亡重置",
      "炎魔火箭：炎魔领域期间自动追踪敌人，命中爆炸造成范围伤害并施加磁缚定身+灼烧"
    ],
    "actives": [
      "炎魔领域[中键]：冷却18秒，持续12秒——移速+50%、免疫眩晕/冰冻/禁锢/减速、受到伤害-50%，期间持续自动发射追踪炎魔火箭（200基础伤害/0.4秒，爆炸范围5米，命中施加减/定身+灼烧）"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 200,
      "unit": "/发",
      "label": "炎魔火箭伤害",
      "fireInterval": 0.4,
      "magazine": null,
      "reserve": null,
      "reloadTime": null
    }
  },
  {
    "id": "chronoterminus",
    "name": "终焉时序",
    "slot": "tactical",
    "category": "战术武器",
    "quality": 7,
    "qualityLabel": "7级",
    "icon": "⏳",
    "price": 60000,
    "tagline": "7级战术武器 — 终焉时序，逆乱流光",
    "typeLabel": "战术武器",
    "passives": [
      "时序增幅：伤害增幅初始+30%，每秒+3%，最高+280%（全战术武器最高）；死亡重置",
      "时序飞刃：时停领域期间自动追踪敌人，飞刃可穿透多个目标，命中施加减速"
    ],
    "actives": [
      "时停领域[中键]：冷却20秒，持续14秒——移速+70%、免疫眩晕/冰冻/禁锢/减速、受到伤害-55%，期间持续自动发射穿透时序飞刃（250基础伤害/0.35秒），命中敌人减速50%持续2.5秒"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 250,
      "unit": "/发",
      "label": "时序飞刃伤害",
      "fireInterval": 0.35,
      "magazine": null,
      "reserve": null,
      "reloadTime": null
    }
  },
  {
    "id": "nullsingularity",
    "name": "虚数奇点",
    "slot": "tactical",
    "category": "战术武器",
    "quality": 9,
    "qualityLabel": "9级",
    "icon": "🕳",
    "price": 999999,
    "tagline": "9级战术武器 — 虚数奇点，吞噬万象",
    "typeLabel": "战术武器（奇点操控）",
    "passives": [
      "奇点层数：相位弹命中给目标叠加奇点标记（最多 5 层，持续 6 秒），每层使本武器对该目标伤害 +12%",
      "奇点护盾：脱离战斗 2.5 秒后，护盾每秒回充最大护盾的 3%（上限 25%）",
      "虚数同调：奇点层数叠满 5 层时，本武器对该目标伤害额外 +15%（与层数易伤相乘）"
    ],
    "actives": [
      "奇点坍缩[中键]：在准星前方 28 米处撕开半径 9 米的奇点，持续 5 秒。领域内敌人被持续牵引向奇点、移速降低 70%，并每 0.5 秒受到「2400 × 当前层数」的坍缩伤害。释放瞬间若领域内存在 3 个及以上敌人，触发链式奇点并返还 50% 冷却。冷却 18 秒",
      "虚数行走[右键]：向准星方向相位传送最多 15 米（可穿墙），落地获得 1.5 秒无敌，清除自身减速/定身/眩晕，并在落地处生成 1.6 秒小型奇点造成范围伤害。冷却 6 秒"
    ],
    "isDefault": false,
    "stats": {
      "baseDamage": 2600,
      "unit": "/发",
      "label": "相位弹伤害",
      "fireInterval": 0.22,
      "magazine": null,
      "reserve": null,
      "reloadTime": null
    }
  }
];
