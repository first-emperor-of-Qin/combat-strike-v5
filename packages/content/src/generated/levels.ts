/**
 * GENERATED FILE — do not edit by hand.
 * Source: tools/legacy-audit/out/* (audited legacy baseline)
 * Regenerate: npm run content:import
 */

import type { LevelDef } from '../types.js';

export const LEVELS: LevelDef[] = [
  {
    "id": 1,
    "name": "熔岩炼狱",
    "subtitle": "烈焰与岩浆的试炼之地",
    "chapter": 1,
    "chapterName": "异境试炼",
    "theme": {
      "sky": 1705216,
      "fog": 3805189,
      "fogNear": 35,
      "fogFar": 95,
      "ground": 3806469,
      "groundRough": 0.9,
      "groundMetal": 0.1,
      "wall": 2755074,
      "wallRough": 0.85,
      "wallOpacity": 1,
      "hemiSky": 4857861,
      "hemiGround": 1705216,
      "ambient": 3806469,
      "dirColor": 16737843,
      "dirX": 10,
      "dirY": 25,
      "dirZ": -5,
      "accentLight": 16729088
    },
    "decoType": "lava",
    "coverPattern": "scattered",
    "decoDensity": 1.2,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "熔岩石魔",
      "desc": "由岩浆凝固而成的石巨人，缓慢但坚硬",
      "colors": {
        "body": 9118976,
        "head": 16729344,
        "accent": 16755200
      },
      "speed": 2,
      "attackRange": 3,
      "damage": 80
    },
    "ranged": {
      "name": "熔岩投手",
      "desc": "从体内喷吐熔岩球的远程怪物",
      "colors": {
        "body": 7017728,
        "head": 16737792,
        "accent": 16755200
      },
      "speed": 1.5,
      "attackRange": 14,
      "damage": 100,
      "shootInterval": 1.8
    },
    "elite": {
      "name": "熔岩禁卫",
      "desc": "身披熔岩铠甲的精英战士，擅长突进斩",
      "colors": {
        "body": 5967872,
        "head": 16724736,
        "accent": 16768256
      },
      "speed": 3,
      "attackRange": 4,
      "damage": 150,
      "skill": "lunge",
      "skillName": "熔岩突进",
      "skillCooldown": 5
    },
    "boss": {
      "name": "炎魔之王·伊格尼斯",
      "desc": "熔岩炼狱的统治者，掌控一切烈焰",
      "colors": {
        "body": 6949376,
        "head": 16720384,
        "accent": 16755200
      },
      "speed": 2.5,
      "attackRange": 18,
      "damage": 120,
      "shootInterval": 1.5,
      "skills": [
        {
          "id": "fireball_volley",
          "name": "炎弹齐射",
          "cooldown": 3.5
        },
        {
          "id": "lava_pool",
          "name": "熔岩池",
          "cooldown": 8
        },
        {
          "id": "flame_nova",
          "name": "烈焰新星",
          "cooldown": 6
        }
      ],
      "passive": "molten_armor",
      "passiveName": "熔岩护甲"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 2,
    "name": "深渊水域",
    "subtitle": "黑暗深海的压迫之境",
    "chapter": 1,
    "chapterName": "异境试炼",
    "theme": {
      "sky": 6698,
      "fog": 10810,
      "fogNear": 30,
      "fogFar": 85,
      "ground": 663600,
      "groundRough": 0.8,
      "groundMetal": 0.2,
      "wall": 333093,
      "wallRough": 0.7,
      "wallOpacity": 0.7,
      "hemiSky": 667728,
      "hemiGround": 4128,
      "ambient": 664885,
      "dirColor": 56831,
      "dirX": 5,
      "dirY": 20,
      "dirZ": 10,
      "accentLight": 65450
    },
    "decoType": "abyss",
    "coverPattern": "ring",
    "decoDensity": 1.1,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "深渊触手",
      "desc": "深海触手生物，缠绕近身敌人",
      "colors": {
        "body": 670288,
        "head": 52394,
        "accent": 65450
      },
      "speed": 2.5,
      "attackRange": 3,
      "damage": 90
    },
    "ranged": {
      "name": "水母射手",
      "desc": "发射毒刺的发光水母",
      "colors": {
        "body": 666176,
        "head": 56831,
        "accent": 8978380
      },
      "speed": 1.2,
      "attackRange": 15,
      "damage": 110,
      "shootInterval": 2
    },
    "elite": {
      "name": "深海鲨卫",
      "desc": "深海鲨鱼卫士，发动漩涡牵引",
      "colors": {
        "body": 337205,
        "head": 43690,
        "accent": 65484
      },
      "speed": 3.5,
      "attackRange": 5,
      "damage": 160,
      "skill": "whirlpool_pull",
      "skillName": "漩涡牵引",
      "skillCooldown": 6
    },
    "boss": {
      "name": "深渊利维坦",
      "desc": "统治深渊海域的远古巨兽",
      "colors": {
        "body": 667728,
        "head": 65484,
        "accent": 56831
      },
      "speed": 3.5,
      "attackRange": 20,
      "damage": 140,
      "shootInterval": 1.4,
      "skills": [
        {
          "id": "crystal_shards",
          "name": "水晶碎片",
          "cooldown": 3
        },
        {
          "id": "web_entangle",
          "name": "蛛网束缚",
          "cooldown": 9
        },
        {
          "id": "prism_beam",
          "name": "棱镜光束",
          "cooldown": 7
        }
      ],
      "passive": "crystal_resonance",
      "passiveName": "水晶共鸣"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 3,
    "name": "时空裂隙",
    "subtitle": "时间与空间交错的虚空",
    "chapter": 1,
    "chapterName": "异境试炼",
    "theme": {
      "sky": 655381,
      "fog": 1706538,
      "fogNear": 40,
      "fogFar": 100,
      "ground": 1377573,
      "groundRough": 0.5,
      "groundMetal": 0.4,
      "wall": 655896,
      "wallRough": 0.4,
      "wallOpacity": 0.6,
      "hemiSky": 2759242,
      "hemiGround": 655392,
      "ambient": 1706544,
      "dirColor": 12290303,
      "dirX": 0,
      "dirY": 30,
      "dirZ": 0,
      "accentLight": 11167487
    },
    "decoType": "cosmic",
    "coverPattern": "corridor",
    "decoDensity": 1.3,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "时空幽灵",
      "desc": "半透明的虚空幽灵，穿梭于裂缝之间",
      "colors": {
        "body": 2755146,
        "head": 13404415,
        "accent": 11167487
      },
      "speed": 3,
      "attackRange": 3,
      "damage": 100
    },
    "ranged": {
      "name": "星辰术士",
      "desc": "操控星辰之力的远程施法者",
      "colors": {
        "body": 1705264,
        "head": 14527231,
        "accent": 12290303
      },
      "speed": 1.8,
      "attackRange": 16,
      "damage": 120,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "裂隙行者",
      "desc": "能闪现到玩家身后的精英刺客",
      "colors": {
        "body": 2426176,
        "head": 15597823,
        "accent": 13395711
      },
      "speed": 4,
      "attackRange": 4,
      "damage": 170,
      "skill": "blink_strike",
      "skillName": "闪现打击",
      "skillCooldown": 7
    },
    "boss": {
      "name": "时间领主·克洛诺斯",
      "desc": "操控时间流动的时空之主",
      "colors": {
        "body": 2755152,
        "head": 14527231,
        "accent": 11167487
      },
      "speed": 4,
      "attackRange": 22,
      "damage": 160,
      "shootInterval": 1.3,
      "skills": [
        {
          "id": "sand_burst",
          "name": "沙暴喷射",
          "cooldown": 4
        },
        {
          "id": "burrow_strike",
          "name": "潜地突袭",
          "cooldown": 10
        },
        {
          "id": "summon_scarabs",
          "name": "召唤圣甲虫",
          "cooldown": 12
        }
      ],
      "passive": "sand_armor",
      "passiveName": "沙之护甲"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 4,
    "name": "机械坟场",
    "subtitle": "锈蚀金属的工业废墟",
    "chapter": 1,
    "chapterName": "异境试炼",
    "theme": {
      "sky": 1709317,
      "fog": 2760720,
      "fogNear": 35,
      "fogFar": 90,
      "ground": 2760709,
      "groundRough": 0.85,
      "groundMetal": 0.3,
      "wall": 1709315,
      "wallRough": 0.8,
      "wallOpacity": 1,
      "hemiSky": 3811856,
      "hemiGround": 1708549,
      "ambient": 2760720,
      "dirColor": 16755268,
      "dirX": 15,
      "dirY": 20,
      "dirZ": -10,
      "accentLight": 16746496
    },
    "decoType": "mechanical",
    "coverPattern": "maze",
    "decoDensity": 1.4,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "废铁机器人",
      "desc": "由废弃零件拼凑的战斗机器人",
      "colors": {
        "body": 9136949,
        "head": 14527061,
        "accent": 16746496
      },
      "speed": 2.2,
      "attackRange": 3,
      "damage": 110
    },
    "ranged": {
      "name": "炮台无人机",
      "desc": "悬浮的武装无人机，发射追踪弹",
      "colors": {
        "body": 7034149,
        "head": 16755268,
        "accent": 16746496
      },
      "speed": 1.6,
      "attackRange": 15,
      "damage": 130,
      "shootInterval": 1.2
    },
    "elite": {
      "name": "铁甲先锋",
      "desc": "重甲精英单位，冲锋盾击",
      "colors": {
        "body": 4864533,
        "head": 16764006,
        "accent": 16750848
      },
      "speed": 3.2,
      "attackRange": 4,
      "damage": 180,
      "skill": "charge_shield",
      "skillName": "冲锋盾击",
      "skillCooldown": 6
    },
    "boss": {
      "name": "机械暴君·零号",
      "desc": "统治机械坟场的终极战争机器",
      "colors": {
        "body": 4864533,
        "head": 16763972,
        "accent": 16746496
      },
      "speed": 3,
      "attackRange": 24,
      "damage": 180,
      "shootInterval": 1.2,
      "skills": [
        {
          "id": "ice_lance",
          "name": "冰枪",
          "cooldown": 3.5
        },
        {
          "id": "aurora_beam",
          "name": "极光束",
          "cooldown": 7
        },
        {
          "id": "frost_nova",
          "name": "寒冰新星",
          "cooldown": 8
        }
      ],
      "passive": "frozen_aura",
      "passiveName": "冰冻光环"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 5,
    "name": "毒雾沼泽",
    "subtitle": "瘴气弥漫的腐烂之地",
    "chapter": 1,
    "chapterName": "异境试炼",
    "theme": {
      "sky": 662021,
      "fog": 1714704,
      "fogNear": 25,
      "fogFar": 75,
      "ground": 1384464,
      "groundRough": 0.95,
      "groundMetal": 0,
      "wall": 660741,
      "wallRough": 0.9,
      "wallOpacity": 1,
      "hemiSky": 2767381,
      "hemiGround": 660741,
      "ambient": 1713424,
      "dirColor": 11206468,
      "dirX": 10,
      "dirY": 15,
      "dirZ": 5,
      "accentLight": 8978176
    },
    "decoType": "swamp",
    "coverPattern": "scattered",
    "decoDensity": 1.5,
    "boundsScale": 1.1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "毒孢行者",
      "desc": "身上长满毒孢的沼泽生物",
      "colors": {
        "body": 2771477,
        "head": 8978244,
        "accent": 11206400
      },
      "speed": 2,
      "attackRange": 3,
      "damage": 120
    },
    "ranged": {
      "name": "毒藤射手",
      "desc": "射出毒刺的藤蔓怪物",
      "colors": {
        "body": 1718800,
        "head": 6741299,
        "accent": 8978176
      },
      "speed": 1.4,
      "attackRange": 14,
      "damage": 140,
      "shootInterval": 1.6
    },
    "elite": {
      "name": "沼泽女巫",
      "desc": "施放诅咒毒云的精英法师",
      "colors": {
        "body": 1387013,
        "head": 11206502,
        "accent": 8978176
      },
      "speed": 2.8,
      "attackRange": 5,
      "damage": 190,
      "skill": "curse_cloud",
      "skillName": "诅咒毒云",
      "skillCooldown": 8
    },
    "boss": {
      "name": "腐化树灵·耶克",
      "desc": "被毒雾侵蚀的远古树灵",
      "colors": {
        "body": 2771477,
        "head": 8978244,
        "accent": 11206400
      },
      "speed": 3.2,
      "attackRange": 25,
      "damage": 220,
      "shootInterval": 1.1,
      "skills": [
        {
          "id": "rocket_barrage",
          "name": "火箭弹幕",
          "cooldown": 9
        },
        {
          "id": "laser_sweep",
          "name": "激光横扫",
          "cooldown": 11
        },
        {
          "id": "emp_burst",
          "name": "EMP爆发",
          "cooldown": 10
        }
      ],
      "passive": "shield_regen",
      "passiveName": "护盾再生"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 6,
    "name": "冰封王座",
    "subtitle": "永恒冰封的极寒之地",
    "chapter": 2,
    "chapterName": "元素试炼",
    "theme": {
      "sky": 662058,
      "fog": 2107957,
      "fogNear": 50,
      "fogFar": 110,
      "ground": 10537184,
      "groundRough": 0.2,
      "groundMetal": 0.1,
      "wall": 8960989,
      "wallRough": 0.15,
      "wallOpacity": 0.5,
      "hemiSky": 11193599,
      "hemiGround": 4482696,
      "ambient": 13426158,
      "dirColor": 14741759,
      "dirX": 10,
      "dirY": 30,
      "dirZ": 5,
      "accentLight": 8965375
    },
    "decoType": "ice",
    "coverPattern": "ring",
    "decoDensity": 1,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "冰晶战士",
      "desc": "由寒冰凝聚的骑士",
      "colors": {
        "body": 4491451,
        "head": 11202303,
        "accent": 8965375
      },
      "speed": 2.3,
      "attackRange": 3,
      "damage": 130
    },
    "ranged": {
      "name": "霜雪法师",
      "desc": "操控冰霜之力的远程施法者",
      "colors": {
        "body": 3368601,
        "head": 13434879,
        "accent": 8965375
      },
      "speed": 1.6,
      "attackRange": 16,
      "damage": 150,
      "shootInterval": 1.7
    },
    "elite": {
      "name": "寒冰刺客",
      "desc": "瞬间冲刺的冰系刺客",
      "colors": {
        "body": 2250103,
        "head": 14548991,
        "accent": 11197951
      },
      "speed": 4,
      "attackRange": 4,
      "damage": 200,
      "skill": "ice_dash",
      "skillName": "寒冰突刺",
      "skillCooldown": 5
    },
    "boss": {
      "name": "霜之哀伤·弗罗斯特",
      "desc": "冰封王座的守护者",
      "colors": {
        "body": 4491468,
        "head": 15663103,
        "accent": 8965375
      },
      "speed": 3.8,
      "attackRange": 22,
      "damage": 260,
      "shootInterval": 1.3,
      "skills": [
        {
          "id": "ink_cloud",
          "name": "墨汁云",
          "cooldown": 8
        },
        {
          "id": "tentacle_slam",
          "name": "触手拍击",
          "cooldown": 5
        },
        {
          "id": "tidal_wave",
          "name": "潮汐波",
          "cooldown": 9
        }
      ],
      "passive": "aquatic_healing",
      "passiveName": "深海治愈"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 7,
    "name": "雷暴高原",
    "subtitle": "雷霆交加的风暴之巅",
    "chapter": 2,
    "chapterName": "元素试炼",
    "theme": {
      "sky": 1706517,
      "fog": 2759205,
      "fogNear": 30,
      "fogFar": 85,
      "ground": 2757925,
      "groundRough": 0.6,
      "groundMetal": 0.3,
      "wall": 1706517,
      "wallRough": 0.5,
      "wallOpacity": 0.8,
      "hemiSky": 3810613,
      "hemiGround": 1706517,
      "ambient": 2757925,
      "dirColor": 16777028,
      "dirX": 5,
      "dirY": 25,
      "dirZ": -5,
      "accentLight": 16776960
    },
    "decoType": "storm",
    "coverPattern": "corridor",
    "decoDensity": 1.2,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "雷霆石巨人",
      "desc": "体内流淌雷电的石巨人",
      "colors": {
        "body": 3810629,
        "head": 16777062,
        "accent": 16776960
      },
      "speed": 2,
      "attackRange": 3,
      "damage": 140
    },
    "ranged": {
      "name": "闪电萨满",
      "desc": "召唤闪电的萨满祭司",
      "colors": {
        "body": 2757941,
        "head": 15658564,
        "accent": 16776960
      },
      "speed": 1.5,
      "attackRange": 15,
      "damage": 160,
      "shootInterval": 1.3
    },
    "elite": {
      "name": "风暴猎手",
      "desc": "跳跃落雷的精英猎手",
      "colors": {
        "body": 1705253,
        "head": 16777096,
        "accent": 16777028
      },
      "speed": 3.8,
      "attackRange": 5,
      "damage": 210,
      "skill": "thunder_leap",
      "skillName": "雷霆跳跃",
      "skillCooldown": 6
    },
    "boss": {
      "name": "雷霆之主·托尔",
      "desc": "掌控雷电的暴风之神",
      "colors": {
        "body": 3810629,
        "head": 16777062,
        "accent": 16776960
      },
      "speed": 4.5,
      "attackRange": 26,
      "damage": 300,
      "shootInterval": 1,
      "skills": [
        {
          "id": "time_slow",
          "name": "时间减速",
          "cooldown": 10
        },
        {
          "id": "phase_shift",
          "name": "相位转移",
          "cooldown": 8
        },
        {
          "id": "temporal_rift",
          "name": "时空裂隙",
          "cooldown": 11
        }
      ],
      "passive": "temporal_echo",
      "passiveName": "时间回响"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 8,
    "name": "亡灵墓园",
    "subtitle": "死者游荡的永恒墓地",
    "chapter": 2,
    "chapterName": "元素试炼",
    "theme": {
      "sky": 659210,
      "fog": 1712149,
      "fogNear": 35,
      "fogFar": 90,
      "ground": 1712144,
      "groundRough": 0.9,
      "groundMetal": 0,
      "wall": 659205,
      "wallRough": 0.85,
      "wallOpacity": 0.9,
      "hemiSky": 1714709,
      "hemiGround": 659205,
      "ambient": 1384469,
      "dirColor": 8978312,
      "dirX": 10,
      "dirY": 20,
      "dirZ": 0,
      "accentLight": 8978312
    },
    "decoType": "undead",
    "coverPattern": "maze",
    "decoDensity": 1.3,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "骷髅士兵",
      "desc": "从墓地苏醒的骷髅战士",
      "colors": {
        "body": 9079413,
        "head": 15658700,
        "accent": 8978312
      },
      "speed": 2.5,
      "attackRange": 3,
      "damage": 150
    },
    "ranged": {
      "name": "亡灵法师",
      "desc": "发射暗影箭的亡灵法师",
      "colors": {
        "body": 2763285,
        "head": 8969608,
        "accent": 8978312
      },
      "speed": 1.7,
      "attackRange": 16,
      "damage": 170,
      "shootInterval": 1.4
    },
    "elite": {
      "name": "黑暗骑士",
      "desc": "骑乘冲锋的黑暗骑士",
      "colors": {
        "body": 1381642,
        "head": 8978312,
        "accent": 4513092
      },
      "speed": 3.5,
      "attackRange": 5,
      "damage": 220,
      "skill": "death_charge",
      "skillName": "死亡冲锋",
      "skillCooldown": 7
    },
    "boss": {
      "name": "骸骨大帝·奥斯",
      "desc": "统御亡灵大军的骸骨君王",
      "colors": {
        "body": 4868661,
        "head": 15658700,
        "accent": 8978312
      },
      "speed": 3,
      "attackRange": 24,
      "damage": 360,
      "shootInterval": 1.2,
      "skills": [
        {
          "id": "plague_cloud",
          "name": "瘟疫云",
          "cooldown": 7
        },
        {
          "id": "bone_spear",
          "name": "骨矛",
          "cooldown": 4
        },
        {
          "id": "raise_dead",
          "name": "亡灵召唤",
          "cooldown": 12
        }
      ],
      "passive": "undying_will",
      "passiveName": "不死意志"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 9,
    "name": "炼金工坊",
    "subtitle": "药剂与炼金术的危险工坊",
    "chapter": 2,
    "chapterName": "元素试炼",
    "theme": {
      "sky": 985621,
      "fog": 1709354,
      "fogNear": 30,
      "fogFar": 85,
      "ground": 1380133,
      "groundRough": 0.5,
      "groundMetal": 0.4,
      "wall": 656664,
      "wallRough": 0.4,
      "wallOpacity": 0.7,
      "hemiSky": 2759237,
      "hemiGround": 656664,
      "ambient": 1707824,
      "dirColor": 65416,
      "dirX": 5,
      "dirY": 25,
      "dirZ": 5,
      "accentLight": 65416
    },
    "decoType": "alchemy",
    "coverPattern": "scattered",
    "decoDensity": 1.4,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "药剂魔像",
      "desc": "玻璃体内充满危险液体的魔像",
      "colors": {
        "body": 1419861,
        "head": 65450,
        "accent": 65416
      },
      "speed": 2.2,
      "attackRange": 3,
      "damage": 160
    },
    "ranged": {
      "name": "酸液喷射者",
      "desc": "喷射腐蚀酸液的远程怪物",
      "colors": {
        "body": 690741,
        "head": 4521881,
        "accent": 65416
      },
      "speed": 1.6,
      "attackRange": 15,
      "damage": 180,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "混沌炼金师",
      "desc": "能嬗变物质的精英炼金师",
      "colors": {
        "body": 349477,
        "head": 8978380,
        "accent": 65450
      },
      "speed": 3,
      "attackRange": 5,
      "damage": 230,
      "skill": "transmute",
      "skillName": "混沌嬗变",
      "skillCooldown": 8
    },
    "boss": {
      "name": "黄金贤者·赫尔墨斯",
      "desc": "掌握炼金终极秘密的贤者",
      "colors": {
        "body": 1419861,
        "head": 16768256,
        "accent": 65416
      },
      "speed": 4,
      "attackRange": 28,
      "damage": 420,
      "shootInterval": 1,
      "skills": [
        {
          "id": "void_bolt",
          "name": "虚空弹",
          "cooldown": 3
        },
        {
          "id": "gravity_well",
          "name": "重力井",
          "cooldown": 10
        },
        {
          "id": "dimensional_tear",
          "name": "维度撕裂",
          "cooldown": 13
        }
      ],
      "passive": "void_shield",
      "passiveName": "虚空护盾"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 10,
    "name": "虚空终焉",
    "subtitle": "万物归虚的终末之境",
    "chapter": 2,
    "chapterName": "元素试炼",
    "theme": {
      "sky": 327696,
      "fog": 1377573,
      "fogNear": 35,
      "fogFar": 95,
      "ground": 656661,
      "groundRough": 0.3,
      "groundMetal": 0.7,
      "wall": 328208,
      "wallRough": 0.3,
      "wallOpacity": 0.6,
      "hemiSky": 2755146,
      "hemiGround": 327696,
      "ambient": 1377573,
      "dirColor": 11141375,
      "dirX": 0,
      "dirY": 30,
      "dirZ": 0,
      "accentLight": 11141375
    },
    "decoType": "void",
    "coverPattern": "arena",
    "decoDensity": 1.1,
    "boundsScale": 1.1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "虚空潜伏者",
      "desc": "从虚空中显现的暗影生物",
      "colors": {
        "body": 2755141,
        "head": 13387007,
        "accent": 11141375
      },
      "speed": 3,
      "attackRange": 3,
      "damage": 180
    },
    "ranged": {
      "name": "虚空法师",
      "desc": "操纵虚空能量的远程施法者",
      "colors": {
        "body": 1705264,
        "head": 15623935,
        "accent": 11141375
      },
      "speed": 2,
      "attackRange": 18,
      "damage": 200,
      "shootInterval": 1.2
    },
    "elite": {
      "name": "湮灭使徒",
      "desc": "引发虚空爆裂的精英使徒",
      "colors": {
        "body": 1377573,
        "head": 16711935,
        "accent": 13387007
      },
      "speed": 4,
      "attackRange": 5,
      "damage": 250,
      "skill": "void_blast",
      "skillName": "虚空爆裂",
      "skillCooldown": 6
    },
    "boss": {
      "name": "万物终结者·奈特",
      "desc": "吞噬一切的虚空终极存在",
      "colors": {
        "body": 2755141,
        "head": 16711935,
        "accent": 11141375
      },
      "speed": 4.5,
      "attackRange": 30,
      "damage": 500,
      "shootInterval": 0.9,
      "skills": [
        {
          "id": "chaos_burst",
          "name": "混沌爆发",
          "cooldown": 8
        },
        {
          "id": "reality_fracture",
          "name": "现实断裂",
          "cooldown": 11
        },
        {
          "id": "entropy_wave",
          "name": "熵增之波",
          "cooldown": 9
        }
      ],
      "passive": "eternal_cycle",
      "passiveName": "永恒循环"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 11,
    "name": "凛冬哨站",
    "subtitle": "冰封荒原的前哨基地",
    "chapter": 3,
    "chapterName": "霜寂冰原",
    "theme": {
      "sky": 662058,
      "fog": 1714746,
      "fogNear": 50,
      "fogFar": 120,
      "ground": 10537184,
      "groundRough": 0.2,
      "groundMetal": 0.1,
      "wall": 8960989,
      "wallRough": 0.15,
      "wallOpacity": 0.5,
      "hemiSky": 11193599,
      "hemiGround": 4482696,
      "ambient": 13426158,
      "dirColor": 14741759,
      "dirX": 10,
      "dirY": 30,
      "dirZ": 5,
      "accentLight": 8965375
    },
    "decoType": "ice",
    "coverPattern": "ring",
    "decoDensity": 1.1,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "霜甲卫兵",
      "desc": "披挂寒霜铠甲的哨站卫兵",
      "colors": {
        "body": 4491451,
        "head": 11202303,
        "accent": 8965375
      },
      "speed": 2.4,
      "attackRange": 3,
      "damage": 200
    },
    "ranged": {
      "name": "寒霜术士",
      "desc": "操控冰霜之力的远程施法者",
      "colors": {
        "body": 3368601,
        "head": 13434879,
        "accent": 8965375
      },
      "speed": 1.7,
      "attackRange": 16,
      "damage": 220,
      "shootInterval": 1.6
    },
    "elite": {
      "name": "冰锥猎手",
      "desc": "以冰锥突刺见长的精英猎手",
      "colors": {
        "body": 2250103,
        "head": 14548991,
        "accent": 11197951
      },
      "speed": 4,
      "attackRange": 4,
      "damage": 260,
      "skill": "ice_dash",
      "skillName": "寒霜突刺",
      "skillCooldown": 5
    },
    "boss": {
      "name": "凛冬将军·布伦希",
      "desc": "霜寂冰原的先锋统帅",
      "colors": {
        "body": 4491468,
        "head": 15663103,
        "accent": 8965375
      },
      "speed": 3,
      "attackRange": 20,
      "damage": 240,
      "shootInterval": 1,
      "skills": [
        {
          "id": "ice_lance",
          "name": "冰枪",
          "cooldown": 3.5
        },
        {
          "id": "frost_nova",
          "name": "寒冰新星",
          "cooldown": 8
        },
        {
          "id": "aurora_beam",
          "name": "极光束",
          "cooldown": 7
        }
      ],
      "passive": "frozen_aura",
      "passiveName": "冰冻光环"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 12,
    "name": "冰晶回廊",
    "subtitle": "闪耀棱镜的寒冰长廊",
    "chapter": 3,
    "chapterName": "霜寂冰原",
    "theme": {
      "sky": 660518,
      "fog": 1583162,
      "fogNear": 45,
      "fogFar": 115,
      "ground": 12376300,
      "groundRough": 0.15,
      "groundMetal": 0.15,
      "wall": 10077408,
      "wallRough": 0.1,
      "wallOpacity": 0.45,
      "hemiSky": 12376319,
      "hemiGround": 5596808,
      "ambient": 14544639,
      "dirColor": 15400959,
      "dirX": 8,
      "dirY": 28,
      "dirZ": 6,
      "accentLight": 11197951
    },
    "decoType": "ice",
    "coverPattern": "corridor",
    "decoDensity": 1.2,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "冰晶铸匠",
      "desc": "以寒冰雕琢自身的工匠",
      "colors": {
        "body": 5609932,
        "head": 12316927,
        "accent": 10083839
      },
      "speed": 2.5,
      "attackRange": 3,
      "damage": 210
    },
    "ranged": {
      "name": "棱镜法师",
      "desc": "折射冰光的远程施法者",
      "colors": {
        "body": 4487082,
        "head": 14544639,
        "accent": 10083839
      },
      "speed": 1.8,
      "attackRange": 17,
      "damage": 230,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "碎晶刺客",
      "desc": "碎裂冰晶瞬移刺杀的精英",
      "colors": {
        "body": 3364215,
        "head": 15662335,
        "accent": 12316159
      },
      "speed": 4.2,
      "attackRange": 4,
      "damage": 270,
      "skill": "blink_strike",
      "skillName": "闪现突袭",
      "skillCooldown": 6
    },
    "boss": {
      "name": "冰晶女王·格蕾塔",
      "desc": "统御冰晶回廊的女王，以棱镜折射寒芒封锁整条长廊",
      "colors": {
        "body": 5609949,
        "head": 16777215,
        "accent": 10083839
      },
      "speed": 3.2,
      "attackRange": 22,
      "damage": 260,
      "shootInterval": 1,
      "skills": [
        {
          "id": "crystal_shards",
          "name": "水晶碎片",
          "cooldown": 3
        },
        {
          "id": "prism_beam",
          "name": "棱镜光束",
          "cooldown": 7
        },
        {
          "id": "web_entangle",
          "name": "蛛网束缚",
          "cooldown": 9
        }
      ],
      "passive": "crystal_resonance",
      "passiveName": "水晶共鸣"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 13,
    "name": "寒渊裂口",
    "subtitle": "深渊与寒冰交汇的裂缝",
    "chapter": 3,
    "chapterName": "霜寂冰原",
    "theme": {
      "sky": 397855,
      "fog": 991795,
      "fogNear": 40,
      "fogFar": 100,
      "ground": 2771546,
      "groundRough": 0.4,
      "groundMetal": 0.3,
      "wall": 1191999,
      "wallRough": 0.4,
      "wallOpacity": 0.7,
      "hemiSky": 1722982,
      "hemiGround": 397855,
      "ambient": 1454655,
      "dirColor": 6737151,
      "dirX": 6,
      "dirY": 26,
      "dirZ": 4,
      "accentLight": 6737151
    },
    "decoType": "ice",
    "coverPattern": "maze",
    "decoDensity": 1.3,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "深渊冰鬼",
      "desc": "从寒渊爬出的冰封怨灵",
      "colors": {
        "body": 2779786,
        "head": 10086143,
        "accent": 6737151
      },
      "speed": 2.6,
      "attackRange": 3,
      "damage": 220
    },
    "ranged": {
      "name": "潮汐术士",
      "desc": "引动寒潮的远程施法者",
      "colors": {
        "body": 1727098,
        "head": 12316927,
        "accent": 6737151
      },
      "speed": 1.6,
      "attackRange": 16,
      "damage": 240,
      "shootInterval": 1.6
    },
    "elite": {
      "name": "漩涡行者",
      "desc": "制造漩涡牵引敌人的精英",
      "colors": {
        "body": 1002086,
        "head": 10086143,
        "accent": 6737151
      },
      "speed": 3.8,
      "attackRange": 5,
      "damage": 280,
      "skill": "whirlpool_pull",
      "skillName": "漩涡牵引",
      "skillCooldown": 6
    },
    "boss": {
      "name": "寒渊领主·纳迦",
      "desc": "寒渊裂口的远古主宰",
      "colors": {
        "body": 2779802,
        "head": 12316927,
        "accent": 6737151
      },
      "speed": 3,
      "attackRange": 22,
      "damage": 280,
      "shootInterval": 1,
      "skills": [
        {
          "id": "tidal_wave",
          "name": "潮汐波",
          "cooldown": 9
        },
        {
          "id": "ink_cloud",
          "name": "墨汁云",
          "cooldown": 8
        },
        {
          "id": "tentacle_slam",
          "name": "触手拍击",
          "cooldown": 5
        }
      ],
      "passive": "aquatic_healing",
      "passiveName": "深海治愈"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 14,
    "name": "永冻祭坛",
    "subtitle": "冻结时光的神圣祭坛",
    "chapter": 3,
    "chapterName": "霜寂冰原",
    "theme": {
      "sky": 659488,
      "fog": 1713216,
      "fogNear": 48,
      "fogFar": 118,
      "ground": 13163756,
      "groundRough": 0.1,
      "groundMetal": 0.2,
      "wall": 8956637,
      "wallRough": 0.1,
      "wallOpacity": 0.4,
      "hemiSky": 12374271,
      "hemiGround": 4478344,
      "ambient": 14542591,
      "dirColor": 15659775,
      "dirX": 0,
      "dirY": 30,
      "dirZ": 0,
      "accentLight": 11189247
    },
    "decoType": "ice",
    "coverPattern": "scattered",
    "decoDensity": 1.2,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "永冻守卫",
      "desc": "守护祭坛的冰封卫士",
      "colors": {
        "body": 5929676,
        "head": 13426943,
        "accent": 11189247
      },
      "speed": 2.5,
      "attackRange": 3,
      "damage": 230
    },
    "ranged": {
      "name": "时霜贤者",
      "desc": "将时间凝霜的远程贤者",
      "colors": {
        "body": 4479146,
        "head": 14740735,
        "accent": 11189247
      },
      "speed": 1.7,
      "attackRange": 17,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "冻时刺客",
      "desc": "在冻结时空里刺杀的精英",
      "colors": {
        "body": 3358600,
        "head": 15659775,
        "accent": 12307711
      },
      "speed": 4.3,
      "attackRange": 4,
      "damage": 290,
      "skill": "blink_strike",
      "skillName": "相位突袭",
      "skillCooldown": 6
    },
    "boss": {
      "name": "永冻时守·克罗诺斯二世",
      "desc": "掌控冻结时光的守护者",
      "colors": {
        "body": 5929692,
        "head": 16777215,
        "accent": 11189247
      },
      "speed": 3.2,
      "attackRange": 24,
      "damage": 300,
      "shootInterval": 1,
      "skills": [
        {
          "id": "time_slow",
          "name": "时间减速",
          "cooldown": 10
        },
        {
          "id": "phase_shift",
          "name": "相位转移",
          "cooldown": 8
        },
        {
          "id": "temporal_rift",
          "name": "时空裂隙",
          "cooldown": 11
        }
      ],
      "passive": "temporal_echo",
      "passiveName": "时间回响"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 15,
    "name": "霜寂王座",
    "subtitle": "霜寂冰原统治者的冰封王座",
    "chapter": 3,
    "chapterName": "霜寂冰原",
    "theme": {
      "sky": 528412,
      "fog": 1451066,
      "fogNear": 55,
      "fogFar": 130,
      "ground": 14216447,
      "groundRough": 0.08,
      "groundMetal": 0.25,
      "wall": 10075101,
      "wallRough": 0.08,
      "wallOpacity": 0.4,
      "hemiSky": 13426175,
      "hemiGround": 4482696,
      "ambient": 15135487,
      "dirColor": 16777215,
      "dirX": 0,
      "dirY": 35,
      "dirZ": 0,
      "accentLight": 13434879
    },
    "decoType": "ice",
    "coverPattern": "arena",
    "decoDensity": 1.3,
    "boundsScale": 1.15,
    "waves": {
      "minion": [
        0,
        0
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "霜寂禁卫",
      "desc": "王座前的冰封禁卫军",
      "colors": {
        "body": 6724061,
        "head": 15400959,
        "accent": 13434879
      },
      "speed": 2.6,
      "attackRange": 3,
      "damage": 240
    },
    "ranged": {
      "name": "极光巫师",
      "desc": "召唤极光的远程巫师",
      "colors": {
        "body": 5605580,
        "head": 16777215,
        "accent": 13434879
      },
      "speed": 1.8,
      "attackRange": 18,
      "damage": 260,
      "shootInterval": 1.4
    },
    "elite": {
      "name": "冰狱骑士",
      "desc": "绝对零度冲锋的精英骑士",
      "colors": {
        "body": 4487099,
        "head": 15794175,
        "accent": 14548991
      },
      "speed": 4.4,
      "attackRange": 5,
      "damage": 300,
      "skill": "ice_dash",
      "skillName": "绝对零度突刺",
      "skillCooldown": 5
    },
    "boss": {
      "name": "霜寂主宰·瓦尔基里",
      "desc": "霜寂冰原的终极统治者，冰封万物的女皇",
      "colors": {
        "body": 6724078,
        "head": 16777215,
        "accent": 13434879
      },
      "speed": 3.4,
      "attackRange": 24,
      "damage": 360,
      "shootInterval": 0.9,
      "skills": [
        {
          "id": "ice_lance",
          "name": "冰枪",
          "cooldown": 3.5
        },
        {
          "id": "frost_nova",
          "name": "寒冰新星",
          "cooldown": 8
        },
        {
          "id": "rocket_barrage",
          "name": "火箭弹幕",
          "cooldown": 9
        }
      ],
      "passive": "frozen_aura",
      "passiveName": "冰冻光环"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 16,
    "name": "裂隙前厅",
    "subtitle": "通往虚空核心的入口大厅",
    "chapter": 4,
    "chapterName": "虚空核心",
    "theme": {
      "sky": 327696,
      "fog": 1313320,
      "fogNear": 38,
      "fogFar": 98,
      "ground": 1247778,
      "groundRough": 0.3,
      "groundMetal": 0.6,
      "wall": 656664,
      "wallRough": 0.3,
      "wallOpacity": 0.6,
      "hemiSky": 2625604,
      "hemiGround": 327696,
      "ambient": 1313318,
      "dirColor": 11167487,
      "dirX": 6,
      "dirY": 28,
      "dirZ": 4,
      "accentLight": 11141375
    },
    "decoType": "void",
    "coverPattern": "scattered",
    "decoDensity": 1.1,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "虚空爬虫",
      "desc": "从裂隙爬出的虚空造物",
      "colors": {
        "body": 3807829,
        "head": 13404415,
        "accent": 11141375
      },
      "speed": 3.1,
      "attackRange": 3,
      "damage": 260
    },
    "ranged": {
      "name": "虚空咏者",
      "desc": "咏唱虚空之力的远程存在",
      "colors": {
        "body": 2756420,
        "head": 14522879,
        "accent": 11141375
      },
      "speed": 2,
      "attackRange": 18,
      "damage": 280,
      "shootInterval": 1.3
    },
    "elite": {
      "name": "湮灭使徒",
      "desc": "引发虚空爆裂的精英使徒",
      "colors": {
        "body": 2034234,
        "head": 16738047,
        "accent": 13387007
      },
      "speed": 4.2,
      "attackRange": 5,
      "damage": 320,
      "skill": "void_blast",
      "skillName": "虚空爆裂",
      "skillCooldown": 6
    },
    "boss": {
      "name": "虚空游魂·厄瑞玻斯",
      "desc": "裂隙前厅的虚空守望者",
      "colors": {
        "body": 3807829,
        "head": 15632639,
        "accent": 11141375
      },
      "speed": 3.2,
      "attackRange": 24,
      "damage": 380,
      "shootInterval": 0.9,
      "skills": [
        {
          "id": "void_bolt",
          "name": "虚空弹",
          "cooldown": 3
        },
        {
          "id": "gravity_well",
          "name": "重力井",
          "cooldown": 10
        },
        {
          "id": "dimensional_tear",
          "name": "维度撕裂",
          "cooldown": 13
        }
      ],
      "passive": "void_shield",
      "passiveName": "虚空护盾"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 17,
    "name": "熵能回廊",
    "subtitle": "秩序崩解的混沌长廊",
    "chapter": 4,
    "chapterName": "虚空核心",
    "theme": {
      "sky": 524308,
      "fog": 1575470,
      "fogNear": 40,
      "fogFar": 100,
      "ground": 1444904,
      "groundRough": 0.35,
      "groundMetal": 0.55,
      "wall": 788000,
      "wallRough": 0.35,
      "wallOpacity": 0.6,
      "hemiSky": 2888264,
      "hemiGround": 524308,
      "ambient": 1575470,
      "dirColor": 12285951,
      "dirX": 4,
      "dirY": 28,
      "dirZ": 6,
      "accentLight": 13387007
    },
    "decoType": "void",
    "coverPattern": "corridor",
    "decoDensity": 1.2,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "熵能腐化体",
      "desc": "被熵增腐蚀的虚空肉块",
      "colors": {
        "body": 4856422,
        "head": 14522879,
        "accent": 13387007
      },
      "speed": 3.2,
      "attackRange": 3,
      "damage": 280
    },
    "ranged": {
      "name": "混沌术士",
      "desc": "操纵混沌的远程施法者",
      "colors": {
        "body": 3805013,
        "head": 15641343,
        "accent": 13387007
      },
      "speed": 2.1,
      "attackRange": 19,
      "damage": 300,
      "shootInterval": 1.2
    },
    "elite": {
      "name": "熵增使徒",
      "desc": "加速万物衰亡的精英",
      "colors": {
        "body": 2755146,
        "head": 16746751,
        "accent": 14509823
      },
      "speed": 4.3,
      "attackRange": 5,
      "damage": 340,
      "skill": "transmute",
      "skillName": "混沌嬗变",
      "skillCooldown": 8
    },
    "boss": {
      "name": "熵能使者·卡俄斯",
      "desc": "熵能回廊的混乱化身",
      "colors": {
        "body": 4856422,
        "head": 16755455,
        "accent": 13387007
      },
      "speed": 3.4,
      "attackRange": 26,
      "damage": 420,
      "shootInterval": 0.85,
      "skills": [
        {
          "id": "entropy_wave",
          "name": "熵增之波",
          "cooldown": 9
        },
        {
          "id": "chaos_burst",
          "name": "混沌爆发",
          "cooldown": 8
        },
        {
          "id": "reality_fracture",
          "name": "现实断裂",
          "cooldown": 11
        }
      ],
      "passive": "eternal_cycle",
      "passiveName": "永恒循环"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 18,
    "name": "虚无深渊",
    "subtitle": "吞噬光线的无尽虚渊",
    "chapter": 4,
    "chapterName": "虚空核心",
    "theme": {
      "sky": 262156,
      "fog": 1181732,
      "fogNear": 42,
      "fogFar": 102,
      "ground": 1050656,
      "groundRough": 0.4,
      "groundMetal": 0.6,
      "wall": 590872,
      "wallRough": 0.4,
      "wallOpacity": 0.7,
      "hemiSky": 2363456,
      "hemiGround": 262156,
      "ambient": 1181732,
      "dirColor": 10044671,
      "dirX": 8,
      "dirY": 26,
      "dirZ": 2,
      "accentLight": 10027263
    },
    "decoType": "void",
    "coverPattern": "maze",
    "decoDensity": 1.3,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "虚无吞噬者",
      "desc": "潜伏深渊的寄生造物",
      "colors": {
        "body": 3805264,
        "head": 12875775,
        "accent": 10027263
      },
      "speed": 3.3,
      "attackRange": 3,
      "damage": 300
    },
    "ranged": {
      "name": "深渊咏者",
      "desc": "自深渊咏唱的远程存在",
      "colors": {
        "body": 2754624,
        "head": 14192639,
        "accent": 10027263
      },
      "speed": 2.2,
      "attackRange": 19,
      "damage": 320,
      "shootInterval": 1.2
    },
    "elite": {
      "name": "虚空刺客",
      "desc": "自虚空中闪现的精英刺客",
      "colors": {
        "body": 2033216,
        "head": 15757311,
        "accent": 12277247
      },
      "speed": 4.5,
      "attackRange": 5,
      "damage": 360,
      "skill": "blink_strike",
      "skillName": "虚空闪现",
      "skillCooldown": 6
    },
    "boss": {
      "name": "虚空织影·尼克斯",
      "desc": "虚无深渊的暗影编织者",
      "colors": {
        "body": 3805264,
        "head": 15241215,
        "accent": 10027263
      },
      "speed": 3.6,
      "attackRange": 26,
      "damage": 460,
      "shootInterval": 0.85,
      "skills": [
        {
          "id": "void_bolt",
          "name": "虚空弹",
          "cooldown": 3
        },
        {
          "id": "phase_shift",
          "name": "相位转移",
          "cooldown": 8
        },
        {
          "id": "prism_beam",
          "name": "棱镜光束",
          "cooldown": 7
        }
      ],
      "passive": "void_shield",
      "passiveName": "虚空护盾"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 19,
    "name": "奇点之厅",
    "subtitle": "引力坍缩的末日殿堂",
    "chapter": 4,
    "chapterName": "虚空核心",
    "theme": {
      "sky": 393232,
      "fog": 1444394,
      "fogNear": 44,
      "fogFar": 105,
      "ground": 1313318,
      "groundRough": 0.3,
      "groundMetal": 0.7,
      "wall": 722208,
      "wallRough": 0.3,
      "wallOpacity": 0.55,
      "hemiSky": 2757190,
      "hemiGround": 393232,
      "ambient": 1444394,
      "dirColor": 12277247,
      "dirX": 0,
      "dirY": 30,
      "dirZ": 0,
      "accentLight": 12255487
    },
    "decoType": "void",
    "coverPattern": "ring",
    "decoDensity": 1.2,
    "boundsScale": 1.1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "奇点仆从",
      "desc": "环绕奇点旋转的仆从",
      "colors": {
        "body": 4856410,
        "head": 13928703,
        "accent": 12255487
      },
      "speed": 3.4,
      "attackRange": 3,
      "damage": 320
    },
    "ranged": {
      "name": "预言咏者",
      "desc": "吟诵末日预言的远程者",
      "colors": {
        "body": 3805002,
        "head": 15244031,
        "accent": 12255487
      },
      "speed": 2.3,
      "attackRange": 20,
      "damage": 340,
      "shootInterval": 1.1
    },
    "elite": {
      "name": "混沌先知卫",
      "desc": "护卫先知的精英卫士",
      "colors": {
        "body": 2755140,
        "head": 16093183,
        "accent": 13387007
      },
      "speed": 4.6,
      "attackRange": 5,
      "damage": 380,
      "skill": "void_blast",
      "skillName": "湮灭冲击",
      "skillCooldown": 6
    },
    "boss": {
      "name": "混沌先知·普罗米",
      "desc": "奇点之厅的末日预言者",
      "colors": {
        "body": 4856410,
        "head": 16423679,
        "accent": 12255487
      },
      "speed": 3.8,
      "attackRange": 28,
      "damage": 500,
      "shootInterval": 0.8,
      "skills": [
        {
          "id": "chaos_burst",
          "name": "混沌爆发",
          "cooldown": 8
        },
        {
          "id": "reality_fracture",
          "name": "现实断裂",
          "cooldown": 11
        },
        {
          "id": "temporal_rift",
          "name": "时空裂隙",
          "cooldown": 11
        }
      ],
      "passive": "eternal_cycle",
      "passiveName": "永恒循环"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 20,
    "name": "终焉核心",
    "subtitle": "万物归虚的终极奇点",
    "chapter": 4,
    "chapterName": "虚空核心",
    "theme": {
      "sky": 8,
      "fog": 1050654,
      "fogNear": 50,
      "fogFar": 120,
      "ground": 787992,
      "groundRough": 0.25,
      "groundMetal": 0.8,
      "wall": 393746,
      "wallRough": 0.25,
      "wallOpacity": 0.5,
      "hemiSky": 2099770,
      "hemiGround": 8,
      "ambient": 1050654,
      "dirColor": 13387007,
      "dirX": 0,
      "dirY": 36,
      "dirZ": 0,
      "accentLight": 16711935
    },
    "decoType": "void",
    "coverPattern": "arena",
    "decoDensity": 1.3,
    "boundsScale": 1.2,
    "waves": {
      "minion": [
        0,
        0
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "终焉守卫",
      "desc": "奇点周围的永恒守卫",
      "colors": {
        "body": 5904998,
        "head": 15241215,
        "accent": 16711935
      },
      "speed": 3.5,
      "attackRange": 3,
      "damage": 340
    },
    "ranged": {
      "name": "终焉咏者",
      "desc": "为终焉咏唱的远程存在",
      "colors": {
        "body": 4853589,
        "head": 16751103,
        "accent": 16711935
      },
      "speed": 2.4,
      "attackRange": 20,
      "damage": 360,
      "shootInterval": 1.1
    },
    "elite": {
      "name": "终焉使徒",
      "desc": "执行终焉意志的精英",
      "colors": {
        "body": 3803722,
        "head": 16738047,
        "accent": 16724991
      },
      "speed": 4.8,
      "attackRange": 5,
      "damage": 400,
      "skill": "void_blast",
      "skillName": "终焉爆裂",
      "skillCooldown": 5
    },
    "boss": {
      "name": "终焉奇点·阿撒托斯",
      "desc": "虚空核心的终极存在，吞噬一切的奇点",
      "colors": {
        "body": 5904998,
        "head": 16738047,
        "accent": 16711935
      },
      "speed": 4.2,
      "attackRange": 30,
      "damage": 600,
      "shootInterval": 0.8,
      "skills": [
        {
          "id": "void_bolt",
          "name": "虚空弹",
          "cooldown": 3
        },
        {
          "id": "gravity_well",
          "name": "重力井",
          "cooldown": 10
        },
        {
          "id": "entropy_wave",
          "name": "熵增之波",
          "cooldown": 9
        }
      ],
      "passive": "void_shield",
      "passiveName": "虚空护盾"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 21,
    "name": "曦光集市",
    "subtitle": "晨光倾洒的砂岩街市",
    "chapter": 5,
    "chapterName": "曦金古城",
    "theme": {
      "sky": 10475775,
      "fog": 15983810,
      "fogNear": 60,
      "fogFar": 170,
      "ground": 14203000,
      "groundRough": 0.9,
      "groundMetal": 0.05,
      "wall": 15127200,
      "wallRough": 0.85,
      "wallOpacity": 1,
      "hemiSky": 13625599,
      "hemiGround": 14203000,
      "ambient": 16115916,
      "dirColor": 16773320,
      "dirX": 22,
      "dirY": 42,
      "dirZ": 12,
      "accentLight": 16763989
    },
    "decoType": "radiant",
    "coverPattern": "alley",
    "decoDensity": 1.2,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "曦金卫兵",
      "desc": "披覆鎏金甲胄的街市卫兵",
      "colors": {
        "body": 13214286,
        "head": 16771488,
        "accent": 16766720
      },
      "speed": 3.6,
      "attackRange": 3,
      "damage": 360
    },
    "ranged": {
      "name": "日轮咏者",
      "desc": "操纵日轮光矢的远程祭祀",
      "colors": {
        "body": 11569726,
        "head": 16773824,
        "accent": 16763972
      },
      "speed": 2.4,
      "attackRange": 20,
      "damage": 380,
      "shootInterval": 1.1
    },
    "elite": {
      "name": "烈阳斗士",
      "desc": "烈阳灼身的精英突击手",
      "colors": {
        "body": 10122288,
        "head": 16768896,
        "accent": 16750848
      },
      "speed": 4.8,
      "attackRange": 5,
      "damage": 420,
      "skill": "radiant_lunge",
      "skillName": "曦光突刺",
      "skillCooldown": 6
    },
    "boss": {
      "name": "曦金守卫·赫利俄斯",
      "desc": "曦光集市的太阳守卫",
      "colors": {
        "body": 13936192,
        "head": 16773296,
        "accent": 16766720
      },
      "speed": 3.6,
      "attackRange": 26,
      "damage": 640,
      "shootInterval": 0.8,
      "skills": [
        {
          "id": "solar_lance",
          "name": "曦金长枪",
          "cooldown": 6
        },
        {
          "id": "gold_meteor",
          "name": "鎏金天陨",
          "cooldown": 10
        },
        {
          "id": "sunburst_barrage",
          "name": "烈日弹幕",
          "cooldown": 8
        }
      ],
      "passive": "solar_crown",
      "passiveName": "曦金王冠"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 22,
    "name": "鎏金回廊",
    "subtitle": "纵横交错的黄金长廊",
    "chapter": 5,
    "chapterName": "曦金古城",
    "theme": {
      "sky": 11197695,
      "fog": 16116176,
      "fogNear": 58,
      "fogFar": 165,
      "ground": 13544554,
      "groundRough": 0.85,
      "groundMetal": 0.1,
      "wall": 14468238,
      "wallRough": 0.8,
      "wallOpacity": 1,
      "hemiSky": 14085375,
      "hemiGround": 13544554,
      "ambient": 15917764,
      "dirColor": 16772538,
      "dirX": -18,
      "dirY": 40,
      "dirZ": 14,
      "accentLight": 16759603
    },
    "decoType": "radiant",
    "coverPattern": "cross",
    "decoDensity": 1.3,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "回廊武士",
      "desc": "巡弋金廊的持刃武士",
      "colors": {
        "body": 12424256,
        "head": 16769168,
        "accent": 16763955
      },
      "speed": 3.7,
      "attackRange": 3,
      "damage": 380
    },
    "ranged": {
      "name": "鎏金射手",
      "desc": "金弦长弓的精准射手",
      "colors": {
        "body": 11043386,
        "head": 16771760,
        "accent": 16759603
      },
      "speed": 2.4,
      "attackRange": 21,
      "damage": 400,
      "shootInterval": 1.05
    },
    "elite": {
      "name": "金辉游侠",
      "desc": "三连光矢的游猎精英",
      "colors": {
        "body": 9399852,
        "head": 16767088,
        "accent": 16755234
      },
      "speed": 4.9,
      "attackRange": 14,
      "damage": 440,
      "skill": "solar_volley",
      "skillName": "曦金三连矢",
      "skillCooldown": 6
    },
    "boss": {
      "name": "鎏金织匠·弥达斯",
      "desc": "点物成金的回廊主宰",
      "colors": {
        "body": 13081146,
        "head": 16771496,
        "accent": 16763955
      },
      "speed": 3.7,
      "attackRange": 26,
      "damage": 680,
      "shootInterval": 0.8,
      "skills": [
        {
          "id": "radiant_nova",
          "name": "圣辉新星",
          "cooldown": 9
        },
        {
          "id": "halo_prison",
          "name": "光环囚笼",
          "cooldown": 12
        },
        {
          "id": "solar_lance",
          "name": "曦金长枪",
          "cooldown": 6
        }
      ],
      "passive": "celestial_ward",
      "passiveName": "天穹守护"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 23,
    "name": "日冕水道",
    "subtitle": "金波流转的古城水街",
    "chapter": 5,
    "chapterName": "曦金古城",
    "theme": {
      "sky": 9426175,
      "fog": 15655624,
      "fogNear": 56,
      "fogFar": 160,
      "ground": 12756584,
      "groundRough": 0.75,
      "groundMetal": 0.15,
      "wall": 14205064,
      "wallRough": 0.75,
      "wallOpacity": 1,
      "hemiSky": 13428479,
      "hemiGround": 12756584,
      "ambient": 15654336,
      "dirColor": 16771248,
      "dirX": 16,
      "dirY": 38,
      "dirZ": -10,
      "accentLight": 16755268
    },
    "decoType": "radiant",
    "coverPattern": "bazaar",
    "decoDensity": 1.4,
    "boundsScale": 1.05,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "水道刻卫",
      "desc": "凿石而生的水道守卫",
      "colors": {
        "body": 11701316,
        "head": 16769952,
        "accent": 16755268
      },
      "speed": 3.8,
      "attackRange": 3,
      "damage": 400
    },
    "ranged": {
      "name": "日冕术士",
      "desc": "汲取日冕之焰的术士",
      "colors": {
        "body": 10254392,
        "head": 16773060,
        "accent": 16750899
      },
      "speed": 2.5,
      "attackRange": 21,
      "damage": 420,
      "shootInterval": 1
    },
    "elite": {
      "name": "金潮撼地者",
      "desc": "震裂大地的重装精英",
      "colors": {
        "body": 8807460,
        "head": 16765024,
        "accent": 16746530
      },
      "speed": 5,
      "attackRange": 5,
      "damage": 460,
      "skill": "gold_quake",
      "skillName": "鎏金震击",
      "skillCooldown": 6
    },
    "boss": {
      "name": "日冕祭司·阿顿",
      "desc": "日冕水道的光焰祭司",
      "colors": {
        "body": 12226356,
        "head": 16771512,
        "accent": 16755268
      },
      "speed": 3.8,
      "attackRange": 27,
      "damage": 720,
      "shootInterval": 0.78,
      "skills": [
        {
          "id": "judgment_beam",
          "name": "审判圣径",
          "cooldown": 10
        },
        {
          "id": "celestial_rain",
          "name": "天穹星雨",
          "cooldown": 9
        },
        {
          "id": "radiant_nova",
          "name": "圣辉新星",
          "cooldown": 9
        }
      ],
      "passive": "solar_crown",
      "passiveName": "曦金王冠"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 24,
    "name": "圣金天阶",
    "subtitle": "盘旋而上的黄金阶城",
    "chapter": 5,
    "chapterName": "曦金古城",
    "theme": {
      "sky": 11066623,
      "fog": 16182486,
      "fogNear": 60,
      "fogFar": 175,
      "ground": 13676656,
      "groundRough": 0.8,
      "groundMetal": 0.1,
      "wall": 14863510,
      "wallRough": 0.8,
      "wallOpacity": 1,
      "hemiSky": 14348543,
      "hemiGround": 13676656,
      "ambient": 16049866,
      "dirColor": 16773836,
      "dirX": -20,
      "dirY": 44,
      "dirZ": -8,
      "accentLight": 16760896
    },
    "decoType": "radiant",
    "coverPattern": "spiral",
    "decoDensity": 1.3,
    "boundsScale": 1.05,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "天阶执刃",
      "desc": "拾级而战的执刃卫士",
      "colors": {
        "body": 12622408,
        "head": 16771240,
        "accent": 16760896
      },
      "speed": 3.9,
      "attackRange": 3,
      "damage": 420
    },
    "ranged": {
      "name": "圣金颂者",
      "desc": "颂唱金辉的远程祭者",
      "colors": {
        "body": 11175488,
        "head": 16773320,
        "accent": 16759603
      },
      "speed": 2.5,
      "attackRange": 22,
      "damage": 440,
      "shootInterval": 1
    },
    "elite": {
      "name": "蜃金刺客",
      "desc": "金光幻影中的致命刺客",
      "colors": {
        "body": 9333288,
        "head": 16767608,
        "accent": 16752672
      },
      "speed": 5.2,
      "attackRange": 5,
      "damage": 480,
      "skill": "mirage_ambush",
      "skillName": "蜃光奇袭",
      "skillCooldown": 6
    },
    "boss": {
      "name": "圣金审判官·塞拉芬",
      "desc": "天阶之巅的裁决者",
      "colors": {
        "body": 13344316,
        "head": 16772800,
        "accent": 16760896
      },
      "speed": 3.9,
      "attackRange": 28,
      "damage": 760,
      "shootInterval": 0.76,
      "skills": [
        {
          "id": "blazing_pursuit",
          "name": "烈阳突袭",
          "cooldown": 8
        },
        {
          "id": "gold_meteor",
          "name": "鎏金天陨",
          "cooldown": 10
        },
        {
          "id": "aurora_curtain",
          "name": "极光帷幕",
          "cooldown": 9
        }
      ],
      "passive": "celestial_ward",
      "passiveName": "天穹守护"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 25,
    "name": "太阳王庭",
    "subtitle": "万丈金辉的太阳圣殿",
    "chapter": 5,
    "chapterName": "曦金古城",
    "theme": {
      "sky": 12575999,
      "fog": 16314588,
      "fogNear": 64,
      "fogFar": 185,
      "ground": 14466686,
      "groundRough": 0.7,
      "groundMetal": 0.2,
      "wall": 15521958,
      "wallRough": 0.7,
      "wallOpacity": 1,
      "hemiSky": 15135999,
      "hemiGround": 14466686,
      "ambient": 16313554,
      "dirColor": 16774872,
      "dirX": 0,
      "dirY": 48,
      "dirZ": 0,
      "accentLight": 16766720
    },
    "decoType": "radiant",
    "coverPattern": "sanctum",
    "decoDensity": 1.2,
    "boundsScale": 1.15,
    "waves": {
      "minion": [
        0,
        0
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "王庭近卫",
      "desc": "太阳王座的贴身近卫",
      "colors": {
        "body": 13674576,
        "head": 16773304,
        "accent": 16766720
      },
      "speed": 4,
      "attackRange": 3,
      "damage": 440
    },
    "ranged": {
      "name": "王庭祭司",
      "desc": "侍奉太阳的高阶祭司",
      "colors": {
        "body": 12227654,
        "head": 16774864,
        "accent": 16763955
      },
      "speed": 2.6,
      "attackRange": 22,
      "damage": 460,
      "shootInterval": 0.95
    },
    "elite": {
      "name": "金乌亲卫",
      "desc": "王庭最锋锐的亲卫精英",
      "colors": {
        "body": 10122800,
        "head": 16769160,
        "accent": 16756768
      },
      "speed": 5.3,
      "attackRange": 5,
      "damage": 500,
      "skill": "mirage_ambush",
      "skillName": "金乌掠影",
      "skillCooldown": 5
    },
    "boss": {
      "name": "太阳君王·赫利安",
      "desc": "曦金古城的太阳化身，光焰不熄的君王",
      "colors": {
        "body": 14462532,
        "head": 16774344,
        "accent": 16766720
      },
      "speed": 4,
      "attackRange": 29,
      "damage": 850,
      "shootInterval": 0.72,
      "skills": [
        {
          "id": "sunburst_barrage",
          "name": "烈日弹幕",
          "cooldown": 8
        },
        {
          "id": "divine_summon",
          "name": "圣辉召唤",
          "cooldown": 14
        },
        {
          "id": "judgment_beam",
          "name": "审判圣径",
          "cooldown": 10
        }
      ],
      "passive": "solar_crown",
      "passiveName": "曦金王冠"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 26,
    "name": "云端街衢",
    "subtitle": "白玉铺就的云上街巷",
    "chapter": 6,
    "chapterName": "苍穹圣域",
    "theme": {
      "sky": 12577279,
      "fog": 15398140,
      "fogNear": 60,
      "fogFar": 175,
      "ground": 15133938,
      "groundRough": 0.55,
      "groundMetal": 0.15,
      "wall": 14083312,
      "wallRough": 0.6,
      "wallOpacity": 1,
      "hemiSky": 15267583,
      "hemiGround": 15133938,
      "ambient": 15003898,
      "dirColor": 16777215,
      "dirX": 18,
      "dirY": 44,
      "dirZ": 10,
      "accentLight": 8969727
    },
    "decoType": "celestial",
    "coverPattern": "alley",
    "decoDensity": 1.2,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "云街巡卫",
      "desc": "穿行云巷的白玉巡卫",
      "colors": {
        "body": 11192030,
        "head": 15792895,
        "accent": 8969727
      },
      "speed": 4,
      "attackRange": 3,
      "damage": 460
    },
    "ranged": {
      "name": "苍穹咏者",
      "desc": "咏唱天风的远程行者",
      "colors": {
        "body": 9614546,
        "head": 16186623,
        "accent": 6737151
      },
      "speed": 2.6,
      "attackRange": 22,
      "damage": 480,
      "shootInterval": 0.95
    },
    "elite": {
      "name": "极光枪骑",
      "desc": "贯穿云层的极光骑士",
      "colors": {
        "body": 8036548,
        "head": 14743295,
        "accent": 4504575
      },
      "speed": 5.3,
      "attackRange": 15,
      "damage": 520,
      "skill": "aurora_lance",
      "skillName": "极光贯枪",
      "skillCooldown": 6
    },
    "boss": {
      "name": "苍穹哨卫·泽菲罗斯",
      "desc": "云端街衢的西风哨卫",
      "colors": {
        "body": 10272988,
        "head": 15923967,
        "accent": 8969727
      },
      "speed": 4,
      "attackRange": 27,
      "damage": 900,
      "shootInterval": 0.72,
      "skills": [
        {
          "id": "aurora_curtain",
          "name": "极光帷幕",
          "cooldown": 9
        },
        {
          "id": "solar_lance",
          "name": "曦金长枪",
          "cooldown": 6
        },
        {
          "id": "celestial_rain",
          "name": "天穹星雨",
          "cooldown": 9
        }
      ],
      "passive": "celestial_ward",
      "passiveName": "天穹守护"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 27,
    "name": "天穹十字廊",
    "subtitle": "贯通四方的天空廊桥",
    "chapter": 6,
    "chapterName": "苍穹圣域",
    "theme": {
      "sky": 13496063,
      "fog": 15660797,
      "fogNear": 58,
      "fogFar": 170,
      "ground": 14674160,
      "groundRough": 0.5,
      "groundMetal": 0.2,
      "wall": 13294828,
      "wallRough": 0.55,
      "wallOpacity": 1,
      "hemiSky": 15792639,
      "hemiGround": 14674160,
      "ambient": 15266554,
      "dirColor": 16711423,
      "dirX": -16,
      "dirY": 46,
      "dirZ": 12,
      "accentLight": 6737151
    },
    "decoType": "celestial",
    "coverPattern": "cross",
    "decoDensity": 1.3,
    "boundsScale": 1,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "廊桥重卫",
      "desc": "镇守廊桥的重甲卫士",
      "colors": {
        "body": 10271960,
        "head": 15530239,
        "accent": 6737151
      },
      "speed": 4.1,
      "attackRange": 3,
      "damage": 480
    },
    "ranged": {
      "name": "天雷祝者",
      "desc": "引落天雷的远程祝者",
      "colors": {
        "body": 8825548,
        "head": 15924223,
        "accent": 5618687
      },
      "speed": 2.7,
      "attackRange": 23,
      "damage": 500,
      "shootInterval": 0.9
    },
    "elite": {
      "name": "天罚骤袭者",
      "desc": "自天穹俯落的雷霆精英",
      "colors": {
        "body": 7379136,
        "head": 14480127,
        "accent": 3386111
      },
      "speed": 5.4,
      "attackRange": 5,
      "damage": 540,
      "skill": "sky_smite",
      "skillName": "天穹坠击",
      "skillCooldown": 6
    },
    "boss": {
      "name": "天穹执政官·乌拉诺斯",
      "desc": "十字天廊的秩序执政",
      "colors": {
        "body": 9352918,
        "head": 15792895,
        "accent": 6737151
      },
      "speed": 4.1,
      "attackRange": 28,
      "damage": 950,
      "shootInterval": 0.7,
      "skills": [
        {
          "id": "starfall_flash",
          "name": "星坠闪现",
          "cooldown": 11
        },
        {
          "id": "halo_prison",
          "name": "光环囚笼",
          "cooldown": 12
        },
        {
          "id": "radiant_nova",
          "name": "圣辉新星",
          "cooldown": 9
        }
      ],
      "passive": "solar_crown",
      "passiveName": "曦金王冠"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 28,
    "name": "极光庭园",
    "subtitle": "流光溢彩的悬空花园",
    "chapter": 6,
    "chapterName": "苍穹圣域",
    "theme": {
      "sky": 12117752,
      "fog": 15135988,
      "fogNear": 56,
      "fogFar": 168,
      "ground": 14214884,
      "groundRough": 0.5,
      "groundMetal": 0.2,
      "wall": 12901594,
      "wallRough": 0.55,
      "wallOpacity": 1,
      "hemiSky": 15005940,
      "hemiGround": 14214884,
      "ambient": 14742254,
      "dirColor": 16056314,
      "dirX": 14,
      "dirY": 42,
      "dirZ": -14,
      "accentLight": 6750156
    },
    "decoType": "celestial",
    "coverPattern": "bazaar",
    "decoDensity": 1.4,
    "boundsScale": 1.05,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "庭园剪守",
      "desc": "修剪光藤的庭园守卫",
      "colors": {
        "body": 9224372,
        "head": 15532024,
        "accent": 6750156
      },
      "speed": 4.2,
      "attackRange": 3,
      "damage": 500
    },
    "ranged": {
      "name": "虹光织者",
      "desc": "编织虹光的远程织者",
      "colors": {
        "body": 7909540,
        "head": 15925243,
        "accent": 4517563
      },
      "speed": 2.7,
      "attackRange": 23,
      "damage": 520,
      "shootInterval": 0.9
    },
    "elite": {
      "name": "光环缚灵",
      "desc": "禁锢猎物的光环精英",
      "colors": {
        "body": 6593680,
        "head": 14482672,
        "accent": 2284970
      },
      "speed": 5.5,
      "attackRange": 13,
      "damage": 560,
      "skill": "halo_bind",
      "skillName": "光环禁锢",
      "skillCooldown": 7
    },
    "boss": {
      "name": "极光女王·欧若拉",
      "desc": "极光庭园的虹彩女王",
      "colors": {
        "body": 8699054,
        "head": 15794169,
        "accent": 6750156
      },
      "speed": 4.2,
      "attackRange": 28,
      "damage": 1000,
      "shootInterval": 0.68,
      "skills": [
        {
          "id": "aurora_curtain",
          "name": "极光帷幕",
          "cooldown": 9
        },
        {
          "id": "prism_lattice",
          "name": "棱镜矩阵",
          "cooldown": 10
        },
        {
          "id": "celestial_rain",
          "name": "天穹星雨",
          "cooldown": 9
        }
      ],
      "passive": "celestial_ward",
      "passiveName": "天穹守护"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 29,
    "name": "星辉回环",
    "subtitle": "星光盘桓的螺旋圣路",
    "chapter": 6,
    "chapterName": "苍穹圣域",
    "theme": {
      "sky": 12903167,
      "fog": 15528700,
      "fogNear": 58,
      "fogFar": 172,
      "ground": 14476016,
      "groundRough": 0.5,
      "groundMetal": 0.25,
      "wall": 13161706,
      "wallRough": 0.5,
      "wallOpacity": 1,
      "hemiSky": 15397631,
      "hemiGround": 14476016,
      "ambient": 15133946,
      "dirColor": 16316671,
      "dirX": -12,
      "dirY": 46,
      "dirZ": -10,
      "accentLight": 10070783
    },
    "decoType": "celestial",
    "coverPattern": "spiral",
    "decoDensity": 1.3,
    "boundsScale": 1.05,
    "waves": {
      "minion": [
        100,
        100
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "星径卫从",
      "desc": "沿星径巡行的卫从",
      "colors": {
        "body": 9742552,
        "head": 15791359,
        "accent": 10070783
      },
      "speed": 4.3,
      "attackRange": 3,
      "damage": 520
    },
    "ranged": {
      "name": "星辉占者",
      "desc": "掷落星辉的远程占者",
      "colors": {
        "body": 8427212,
        "head": 16185599,
        "accent": 8952319
      },
      "speed": 2.8,
      "attackRange": 24,
      "damage": 540,
      "shootInterval": 0.85
    },
    "elite": {
      "name": "星屑舞者",
      "desc": "散射星屑的敏捷精英",
      "colors": {
        "body": 6979772,
        "head": 15002879,
        "accent": 6715391
      },
      "speed": 5.6,
      "attackRange": 12,
      "damage": 580,
      "skill": "astral_scatter",
      "skillName": "星屑散射",
      "skillCooldown": 6
    },
    "boss": {
      "name": "星辉领主·阿斯特赖俄斯",
      "desc": "星辉回环的群星领主",
      "colors": {
        "body": 8427724,
        "head": 15922943,
        "accent": 10070783
      },
      "speed": 4.3,
      "attackRange": 29,
      "damage": 1060,
      "shootInterval": 0.66,
      "skills": [
        {
          "id": "divine_summon",
          "name": "圣辉召唤",
          "cooldown": 14
        },
        {
          "id": "starfall_flash",
          "name": "星坠闪现",
          "cooldown": 11
        },
        {
          "id": "sunburst_barrage",
          "name": "烈日弹幕",
          "cooldown": 8
        }
      ],
      "passive": "solar_crown",
      "passiveName": "曦金王冠"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 30,
    "name": "苍穹圣座",
    "subtitle": "万光汇聚的至高圣座",
    "chapter": 6,
    "chapterName": "苍穹圣域",
    "theme": {
      "sky": 13955327,
      "fog": 16055039,
      "fogNear": 66,
      "fogFar": 190,
      "ground": 15265526,
      "groundRough": 0.45,
      "groundMetal": 0.3,
      "wall": 14214900,
      "wallRough": 0.5,
      "wallOpacity": 1,
      "hemiSky": 16055295,
      "hemiGround": 15265526,
      "ambient": 15792383,
      "dirColor": 16777215,
      "dirX": 0,
      "dirY": 52,
      "dirZ": 0,
      "accentLight": 11202303
    },
    "decoType": "celestial",
    "coverPattern": "sanctum",
    "decoDensity": 1.3,
    "boundsScale": 1.2,
    "waves": {
      "minion": [
        0,
        0
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "圣座近侍",
      "desc": "环侍圣座的光辉近卫",
      "colors": {
        "body": 10536164,
        "head": 16186623,
        "accent": 11202303
      },
      "speed": 4.4,
      "attackRange": 3,
      "damage": 560
    },
    "ranged": {
      "name": "圣光颂咏者",
      "desc": "颂咏至高之光的祭者",
      "colors": {
        "body": 9221338,
        "head": 16449023,
        "accent": 10086143
      },
      "speed": 2.8,
      "attackRange": 24,
      "damage": 580,
      "shootInterval": 0.85
    },
    "elite": {
      "name": "圣域炽卫",
      "desc": "圣域最强的炽光精英",
      "colors": {
        "body": 7905996,
        "head": 15530239,
        "accent": 7855615
      },
      "speed": 5.8,
      "attackRange": 12,
      "damage": 620,
      "skill": "astral_scatter",
      "skillName": "炽光散界",
      "skillCooldown": 5
    },
    "boss": {
      "name": "苍穹至高·海珀里昂",
      "desc": "苍穹圣域的至高神辉，光之尽头的终极存在",
      "colors": {
        "body": 9747680,
        "head": 16317951,
        "accent": 11202303
      },
      "speed": 4.5,
      "attackRange": 30,
      "damage": 1200,
      "shootInterval": 0.6,
      "skills": [
        {
          "id": "starfall_flash",
          "name": "星坠闪现",
          "cooldown": 11
        },
        {
          "id": "prism_lattice",
          "name": "棱镜矩阵",
          "cooldown": 10
        },
        {
          "id": "judgment_beam",
          "name": "审判圣径",
          "cooldown": 10
        }
      ],
      "passive": "celestial_ward",
      "passiveName": "天穹守护"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [],
    "pads": [],
    "buffs": [],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 31,
    "name": "塌陷峡谷",
    "subtitle": "地表在脚下崩解的裂隙战场",
    "chapter": 7,
    "chapterName": "裂隙纪元 · 崩塌之地",
    "theme": {
      "sky": 1970183,
      "fog": 4006158,
      "fogNear": 34,
      "fogFar": 98,
      "ground": 4991250,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 3677709,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 7487003,
      "hemiGround": 1641734,
      "ambient": 4991250,
      "dirColor": 16747068,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 8014354
    },
    "decoType": "mechanical",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.5,
    "waves": {
      "minion": [
        102,
        75
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "坠岩兽",
      "desc": "峡谷塌方凝成的碎岩块，靠近即发起撞击",
      "colors": {
        "body": 8340766,
        "head": 16747068,
        "accent": 8014354
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "飞砾手",
      "desc": "在断崖边缘架起弩机的虚空猎手，弹道越过深渊",
      "colors": {
        "body": 7026969,
        "head": 16750402,
        "accent": 8014354
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "崩岩卫",
      "desc": "统御塌陷地形的裂隙卫士，可撕开空间短距突进",
      "colors": {
        "body": 5976341,
        "head": 16747068,
        "accent": 9590805
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "lunge",
      "skillName": "猛冲突进",
      "skillCooldown": 5
    },
    "boss": {
      "name": "裂隙主宰",
      "desc": "盘踞塌陷峡谷中央的裂隙主宰，随塌方重塑战场",
      "colors": {
        "body": 9194273,
        "head": 16747068,
        "accent": 8014354
      },
      "speed": 3.8,
      "attackRange": 22,
      "damage": 170,
      "shootInterval": 1.3,
      "skills": [
        {
          "id": "sand_burst",
          "name": "沙暴喷射",
          "cooldown": 4
        },
        {
          "id": "burrow_strike",
          "name": "潜地突袭",
          "cooldown": 10
        },
        {
          "id": "flame_nova",
          "name": "烈焰新星",
          "cooldown": 6
        }
      ],
      "passive": "sand_armor",
      "passiveName": "沙之护甲"
    },
    "terrain": {
      "type": "canyon",
      "h": 7,
      "bw": 13
    },
    "voids": [
      {
        "minX": -52,
        "maxX": 20,
        "minZ": -30,
        "maxZ": 52
      }
    ],
    "hazards": [
      {
        "kind": "spike",
        "x": 26,
        "z": 10,
        "w": 6,
        "d": 4,
        "pct": 0.3,
        "cd": 2.2
      },
      {
        "kind": "laser",
        "x": -26,
        "z": -8,
        "w": 1,
        "d": 1,
        "pct": 0.35,
        "cd": 3,
        "path": 9
      }
    ],
    "pads": [
      {
        "x": 0,
        "z": 26,
        "r": 2.2,
        "power": 17,
        "tx": 0,
        "tz": 44
      }
    ],
    "buffs": [
      {
        "x": -34,
        "z": 20,
        "kind": "dmg"
      },
      {
        "x": 34,
        "z": -20,
        "kind": "speed"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 32,
    "name": "悬空回廊",
    "subtitle": "两侧无底、仅余窄廊的高空栈道",
    "chapter": 7,
    "chapterName": "裂隙纪元 · 崩塌之地",
    "theme": {
      "sky": 1054750,
      "fog": 2175293,
      "fogNear": 34,
      "fogFar": 104,
      "ground": 2702924,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 1977656,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 4087154,
      "hemiGround": 857113,
      "ambient": 2702924,
      "dirColor": 9097471,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 2775690
    },
    "decoType": "cosmic",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.6,
    "waves": {
      "minion": [
        78,
        84
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "廊桥游魂",
      "desc": "在窄廊两端游荡的廊桥游魂，扑向来犯者",
      "colors": {
        "body": 4548735,
        "head": 9097471,
        "accent": 2775690
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "棱光弩手",
      "desc": "悬于廊桥上方的虚空弩手，居高压制栈道",
      "colors": {
        "body": 3757931,
        "head": 9954559,
        "accent": 2775690
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "守望机兵",
      "desc": "掌控悬空结构的回廊行者，借相位闪避近身",
      "colors": {
        "body": 3230299,
        "head": 9097471,
        "accent": 3304613
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "frost_nova",
      "skillName": "寒冰新星",
      "skillCooldown": 5
    },
    "boss": {
      "name": "回廊守望者",
      "desc": "守望悬空回廊尽头的存在，以光束封锁整条栈道",
      "colors": {
        "body": 4944524,
        "head": 9097471,
        "accent": 2775690
      },
      "speed": 3.2,
      "attackRange": 24,
      "damage": 180,
      "shootInterval": 1.5,
      "skills": [
        {
          "id": "prism_beam",
          "name": "棱镜光束",
          "cooldown": 7
        },
        {
          "id": "emp_burst",
          "name": "EMP爆发",
          "cooldown": 10
        },
        {
          "id": "rocket_barrage",
          "name": "火箭弹幕",
          "cooldown": 9
        }
      ],
      "passive": "crystal_resonance",
      "passiveName": "水晶共鸣"
    },
    "terrain": {
      "type": "ramp",
      "h": 6,
      "w": 15
    },
    "voids": [
      {
        "minX": -54,
        "maxX": 54,
        "minZ": 22,
        "maxZ": 52
      },
      {
        "minX": -54,
        "maxX": 54,
        "minZ": -52,
        "maxZ": -22
      }
    ],
    "hazards": [
      {
        "kind": "door",
        "x": 0,
        "z": 16,
        "w": 2,
        "d": 10,
        "pct": 0.3,
        "cd": 6,
        "path": 5
      }
    ],
    "pads": [
      {
        "x": 0,
        "z": -30,
        "r": 2.2,
        "power": 18,
        "tx": 0,
        "tz": 30
      }
    ],
    "buffs": [
      {
        "x": -30,
        "z": 0,
        "kind": "shield"
      },
      {
        "x": 30,
        "z": 0,
        "kind": "crit"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 33,
    "name": "双生阶梯",
    "subtitle": "逐级抬升的阶梯竞技场",
    "chapter": 7,
    "chapterName": "裂隙纪元 · 崩塌之地",
    "theme": {
      "sky": 1448734,
      "fog": 2963261,
      "fogNear": 34,
      "fogFar": 92,
      "ground": 3753292,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 2765624,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 5597298,
      "hemiGround": 1251097,
      "ambient": 3753292,
      "dirColor": 12577023,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 3828362
    },
    "decoType": "ice",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.35,
    "waves": {
      "minion": [
        86,
        66
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "阶寒行者",
      "desc": "在阶梯间攀爬的阶寒行者，寒气随脚步蔓延",
      "colors": {
        "body": 6255743,
        "head": 12577023,
        "accent": 3828362
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "霜阶投手",
      "desc": "占据高阶的霜阶投手，俯射下方目标",
      "colors": {
        "body": 5267819,
        "head": 13828095,
        "accent": 3828362
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "双生侍从",
      "desc": "在阶梯间来回跃迁的双生侍从，闪现突袭",
      "colors": {
        "body": 4477787,
        "head": 12577023,
        "accent": 4554661
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "whirlpool_pull",
      "skillName": "漩涡牵引",
      "skillCooldown": 5
    },
    "boss": {
      "name": "阶梯双生",
      "desc": "统御整座阶梯竞技场的孪生存在，双线同时作战",
      "colors": {
        "body": 6913932,
        "head": 12577023,
        "accent": 3828362
      },
      "speed": 3,
      "attackRange": 23,
      "damage": 190,
      "shootInterval": 1.4,
      "skills": [
        {
          "id": "frost_nova",
          "name": "寒冰新星",
          "cooldown": 8
        },
        {
          "id": "tidal_wave",
          "name": "潮汐波",
          "cooldown": 9
        },
        {
          "id": "summon_scarabs",
          "name": "召唤圣甲虫",
          "cooldown": 12
        }
      ],
      "passive": "frozen_aura",
      "passiveName": "冰冻光环"
    },
    "terrain": {
      "type": "terraces",
      "steps": 5,
      "step": 2.6
    },
    "voids": [
      {
        "minX": 0,
        "maxX": 54,
        "minZ": 20,
        "maxZ": 54
      },
      {
        "minX": -54,
        "maxX": 0,
        "minZ": -54,
        "maxZ": -20
      }
    ],
    "hazards": [
      {
        "kind": "crusher",
        "x": 12,
        "z": -6,
        "w": 7,
        "d": 7,
        "pct": 0.45,
        "cd": 4.2,
        "path": 7
      },
      {
        "kind": "crusher",
        "x": -12,
        "z": 10,
        "w": 7,
        "d": 7,
        "pct": 0.45,
        "cd": 4,
        "path": 7
      }
    ],
    "pads": [
      {
        "x": 0,
        "z": 36,
        "r": 2.4,
        "power": 19,
        "tx": 0,
        "tz": 10
      }
    ],
    "buffs": [
      {
        "x": -28,
        "z": -28,
        "kind": "regen"
      },
      {
        "x": 28,
        "z": 28,
        "kind": "dmg"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 34,
    "name": "熔心深井",
    "subtitle": "向中心下沉的熔岩盆地",
    "chapter": 7,
    "chapterName": "裂隙纪元 · 崩塌之地",
    "theme": {
      "sky": 1968129,
      "fog": 4002051,
      "fogNear": 34,
      "fogFar": 98,
      "ground": 4986372,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 3674115,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 7479559,
      "hemiGround": 1640193,
      "ambient": 4986372,
      "dirColor": 16730640,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 16760896
    },
    "decoType": "lava",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.45,
    "waves": {
      "minion": [
        94,
        75
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "熔壳虫",
      "desc": "自熔岩盆地爬出的碎块，灼热且沉重",
      "colors": {
        "body": 8332552,
        "head": 16730640,
        "accent": 16760896
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "熔心喷口",
      "desc": "在井口环射的炎魔炮手，喷吐熔浆",
      "colors": {
        "body": 7020294,
        "head": 16732433,
        "accent": 16760896
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "灼核卫",
      "desc": "熔心母体的护卫，撕裂空间发动致命一击",
      "colors": {
        "body": 5970437,
        "head": 16730640,
        "accent": 16770636
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "flame_nova",
      "skillName": "烈焰新星",
      "skillCooldown": 5
    },
    "boss": {
      "name": "熔心母体",
      "desc": "沉于熔岩盆地中心、不断吸收周围熔浆的母体",
      "colors": {
        "body": 9185288,
        "head": 16730640,
        "accent": 16760896
      },
      "speed": 2.6,
      "attackRange": 24,
      "damage": 210,
      "shootInterval": 1.4,
      "skills": [
        {
          "id": "lava_pool",
          "name": "熔岩池",
          "cooldown": 8
        },
        {
          "id": "flame_nova",
          "name": "烈焰新星",
          "cooldown": 6
        },
        {
          "id": "solar_lance",
          "name": "曦金长枪",
          "cooldown": 6
        }
      ],
      "passive": "molten_armor",
      "passiveName": "熔岩护甲"
    },
    "terrain": {
      "type": "bowl",
      "h": 9,
      "r": 44
    },
    "voids": [
      {
        "minX": 0,
        "maxX": 54,
        "minZ": 44,
        "maxZ": 54
      }
    ],
    "hazards": [
      {
        "kind": "steam",
        "x": 14,
        "z": 14,
        "w": 0,
        "d": 0,
        "pct": 0.35,
        "cd": 3.4
      },
      {
        "kind": "steam",
        "x": -14,
        "z": -14,
        "w": 0,
        "d": 0,
        "pct": 0.35,
        "cd": 3
      },
      {
        "kind": "spike",
        "x": 0,
        "z": 26,
        "w": 8,
        "d": 3,
        "pct": 0.3,
        "cd": 2.6
      }
    ],
    "pads": [
      {
        "x": 0,
        "z": 40,
        "r": 2.4,
        "power": 20,
        "tx": 0,
        "tz": -8
      }
    ],
    "buffs": [
      {
        "x": -32,
        "z": 0,
        "kind": "dmg"
      },
      {
        "x": 32,
        "z": 0,
        "kind": "shield"
      },
      {
        "x": 0,
        "z": -34,
        "kind": "regen"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 35,
    "name": "崩解平台",
    "subtitle": "不断崩落的浮空方块群",
    "chapter": 7,
    "chapterName": "裂隙纪元 · 崩塌之地",
    "theme": {
      "sky": 1445918,
      "fog": 2892093,
      "fogNear": 34,
      "fogFar": 104,
      "ground": 3615052,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 2629176,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 5455474,
      "hemiGround": 1183001,
      "ambient": 3615052,
      "dirColor": 12159743,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 4860538
    },
    "decoType": "void",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.7,
    "waves": {
      "minion": [
        102,
        84
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "崩解碎块",
      "desc": "不断崩落的浮空方块，触碰即产生冲击",
      "colors": {
        "body": 6047103,
        "head": 12159743,
        "accent": 4860538
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "虚空弩手",
      "desc": "从残存平台上射击的虚空弩手",
      "colors": {
        "body": 5060971,
        "head": 13342719,
        "accent": 4860538
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "崩界卫",
      "desc": "在崩解的方块间穿梭的裂界卫，撕裂维度",
      "colors": {
        "body": 4338011,
        "head": 12159743,
        "accent": 5780114
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "dimensional_tear",
      "skillName": "维度撕裂",
      "skillCooldown": 5
    },
    "boss": {
      "name": "崩解之核",
      "desc": "维系崩解平台的核心，塌陷由它而起",
      "colors": {
        "body": 6638476,
        "head": 12159743,
        "accent": 4860538
      },
      "speed": 4.2,
      "attackRange": 26,
      "damage": 230,
      "shootInterval": 1.2,
      "skills": [
        {
          "id": "reality_fracture",
          "name": "现实断裂",
          "cooldown": 11
        },
        {
          "id": "chaos_burst",
          "name": "混沌爆发",
          "cooldown": 8
        },
        {
          "id": "entropy_wave",
          "name": "熵增之波",
          "cooldown": 9
        }
      ],
      "passive": "void_shield",
      "passiveName": "虚空护盾"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [
      {
        "minX": -54,
        "maxX": -20,
        "minZ": 20,
        "maxZ": 54
      },
      {
        "minX": 20,
        "maxX": 54,
        "minZ": 20,
        "maxZ": 54
      },
      {
        "minX": -54,
        "maxX": -20,
        "minZ": -54,
        "maxZ": -20
      },
      {
        "minX": 20,
        "maxX": 54,
        "minZ": -54,
        "maxZ": -20
      },
      {
        "minX": 0,
        "maxX": 54,
        "minZ": -14,
        "maxZ": 14
      }
    ],
    "hazards": [
      {
        "kind": "saw",
        "x": 0,
        "z": 0,
        "w": 0,
        "d": 0,
        "pct": 0.4,
        "cd": 5,
        "path": 16
      }
    ],
    "pads": [
      {
        "x": -38,
        "z": -38,
        "r": 2.4,
        "power": 19,
        "tx": 0,
        "tz": 38
      },
      {
        "x": 38,
        "z": 38,
        "r": 2.4,
        "power": 19,
        "tx": 0,
        "tz": -38
      }
    ],
    "buffs": [
      {
        "x": 0,
        "z": 0,
        "kind": "speed"
      },
      {
        "x": -44,
        "z": 44,
        "kind": "energy"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 36,
    "name": "风暴尖塔",
    "subtitle": "越往上风越烈的锥形塔顶",
    "chapter": 8,
    "chapterName": "裂隙纪元 · 机关回廊",
    "theme": {
      "sky": 793118,
      "fog": 1586493,
      "fogNear": 34,
      "fogFar": 92,
      "ground": 1983308,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 1454392,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 2974834,
      "hemiGround": 661017,
      "ambient": 1983308,
      "dirColor": 6742271,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 11197951
    },
    "decoType": "storm",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.5,
    "waves": {
      "minion": [
        78,
        66
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "风压猎手",
      "desc": "被上升气流托起的风压猎手，裹挟雷光撞击",
      "colors": {
        "body": 3371135,
        "head": 6742271,
        "accent": 11197951
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "雷云术士",
      "desc": "在塔身锚点上引雷的雷云术士",
      "colors": {
        "body": 2776683,
        "head": 7403263,
        "accent": 11197951
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "尖塔执刑",
      "desc": "借雷暴瞬移的尖塔执刑，释放雷爆",
      "colors": {
        "body": 2379867,
        "head": 6742271,
        "accent": 13434879
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "emp_burst",
      "skillName": "EMP爆发",
      "skillCooldown": 5
    },
    "boss": {
      "name": "尖塔暴君",
      "desc": "塔顶的风暴暴君，以雷光贯穿整座尖塔",
      "colors": {
        "body": 3701644,
        "head": 6742271,
        "accent": 11197951
      },
      "speed": 3.4,
      "attackRange": 26,
      "damage": 250,
      "shootInterval": 1.25,
      "skills": [
        {
          "id": "aurora_beam",
          "name": "极光束",
          "cooldown": 7
        },
        {
          "id": "celestial_rain",
          "name": "天穹星雨",
          "cooldown": 9
        },
        {
          "id": "starfall_flash",
          "name": "星坠闪现",
          "cooldown": 11
        }
      ],
      "passive": "celestial_ward",
      "passiveName": "天穹守护"
    },
    "terrain": {
      "type": "pyramid",
      "h": 13,
      "r": 36
    },
    "voids": [
      {
        "minX": 0,
        "maxX": 54,
        "minZ": 46,
        "maxZ": 54
      }
    ],
    "hazards": [
      {
        "kind": "laser",
        "x": 20,
        "z": 0,
        "w": 1,
        "d": 1,
        "pct": 0.4,
        "cd": 2.6,
        "path": 11
      },
      {
        "kind": "laser",
        "x": -20,
        "z": 0,
        "w": 1,
        "d": 1,
        "pct": 0.4,
        "cd": 2.4,
        "path": 11
      },
      {
        "kind": "saw",
        "x": 0,
        "z": 24,
        "w": 0,
        "d": 0,
        "pct": 0.4,
        "cd": 4.4,
        "path": 12
      }
    ],
    "pads": [
      {
        "x": 0,
        "z": 40,
        "r": 2.6,
        "power": 22,
        "tx": 0,
        "tz": 6
      }
    ],
    "buffs": [
      {
        "x": -30,
        "z": -30,
        "kind": "crit"
      },
      {
        "x": 30,
        "z": -30,
        "kind": "shield"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 37,
    "name": "锈蚀升降井",
    "subtitle": "机械升降平台与齿轮群",
    "chapter": 8,
    "chapterName": "裂隙纪元 · 机关回廊",
    "theme": {
      "sky": 1511432,
      "fog": 3023121,
      "fogNear": 34,
      "fogFar": 98,
      "ground": 3746070,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 2760208,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 5652001,
      "hemiGround": 1248519,
      "ambient": 3746070,
      "dirColor": 12618314,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 5913104
    },
    "decoType": "mechanical",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.4,
    "waves": {
      "minion": [
        86,
        75
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "锈甲兵",
      "desc": "由锈蚀齿轮拼成的役偶，撞击力惊人",
      "colors": {
        "body": 6309157,
        "head": 12618314,
        "accent": 5913104
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "铆钉射手",
      "desc": "守在升降平台上的锈蚀炮手",
      "colors": {
        "body": 5257503,
        "head": 13866833,
        "accent": 5913104
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "升降监工",
      "desc": "操纵升降机的监工，压缩空间发动重击",
      "colors": {
        "body": 4534554,
        "head": 12618314,
        "accent": 7095571
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "lunge",
      "skillName": "猛冲突进",
      "skillCooldown": 5
    },
    "boss": {
      "name": "锈蚀监工",
      "desc": "驱动整座升降井的锈蚀监工，机械臂可粉碎地面",
      "colors": {
        "body": 6900520,
        "head": 12618314,
        "accent": 5913104
      },
      "speed": 3.6,
      "attackRange": 24,
      "damage": 220,
      "shootInterval": 1.3,
      "skills": [
        {
          "id": "rocket_barrage",
          "name": "火箭弹幕",
          "cooldown": 9
        },
        {
          "id": "emp_burst",
          "name": "EMP爆发",
          "cooldown": 10
        },
        {
          "id": "laser_sweep",
          "name": "激光横扫",
          "cooldown": 11
        }
      ],
      "passive": "shield_regen",
      "passiveName": "护盾再生"
    },
    "terrain": {
      "type": "slope",
      "h": 8
    },
    "voids": [
      {
        "minX": -54,
        "maxX": 54,
        "minZ": -54,
        "maxZ": -34
      }
    ],
    "hazards": [
      {
        "kind": "door",
        "x": -18,
        "z": 8,
        "w": 2,
        "d": 12,
        "pct": 0.3,
        "cd": 7,
        "path": 6
      },
      {
        "kind": "door",
        "x": 18,
        "z": -8,
        "w": 2,
        "d": 12,
        "pct": 0.3,
        "cd": 7,
        "path": 6
      },
      {
        "kind": "crusher",
        "x": 0,
        "z": 20,
        "w": 8,
        "d": 8,
        "pct": 0.5,
        "cd": 4.6,
        "path": 8
      }
    ],
    "pads": [
      {
        "x": 0,
        "z": -40,
        "r": 2.4,
        "power": 20,
        "tx": 0,
        "tz": -6
      }
    ],
    "buffs": [
      {
        "x": -30,
        "z": 20,
        "kind": "energy"
      },
      {
        "x": 30,
        "z": 20,
        "kind": "dmg"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 38,
    "name": "镜面迷廊",
    "subtitle": "处处反射的棱镜回廊",
    "chapter": 8,
    "chapterName": "裂隙纪元 · 机关回廊",
    "theme": {
      "sky": 1710878,
      "fog": 3487549,
      "fogNear": 34,
      "fogFar": 104,
      "ground": 4343116,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 3224376,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 6580338,
      "hemiGround": 1447705,
      "ambient": 4343116,
      "dirColor": 14674175,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 8030975
    },
    "decoType": "cosmic",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.3,
    "waves": {
      "minion": [
        94,
        84
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "镜影卫",
      "desc": "在镜面走廊中折射出多个残影的造物",
      "colors": {
        "body": 7304319,
        "head": 14674175,
        "accent": 8030975
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "折光弩手",
      "desc": "借反射定位目标的棱镜射手",
      "colors": {
        "body": 6119787,
        "head": 16121855,
        "accent": 8030975
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "镜面裁判",
      "desc": "以棱镜光束贯穿走廊的镜面行者",
      "colors": {
        "body": 5264219,
        "head": 14674175,
        "accent": 9610751
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "prism_beam",
      "skillName": "棱镜光束",
      "skillCooldown": 5
    },
    "boss": {
      "name": "镜面之主",
      "desc": "镜面迷宫的主人，让战场处处都是倒影",
      "colors": {
        "body": 8028044,
        "head": 14674175,
        "accent": 8030975
      },
      "speed": 3,
      "attackRange": 25,
      "damage": 240,
      "shootInterval": 1.35,
      "skills": [
        {
          "id": "prism_beam",
          "name": "棱镜光束",
          "cooldown": 7
        },
        {
          "id": "prism_lattice",
          "name": "棱镜矩阵",
          "cooldown": 10
        },
        {
          "id": "dimensional_tear",
          "name": "维度撕裂",
          "cooldown": 13
        }
      ],
      "passive": "crystal_resonance",
      "passiveName": "水晶共鸣"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [
      {
        "kind": "laser",
        "x": -22,
        "z": -22,
        "w": 1,
        "d": 1,
        "pct": 0.4,
        "cd": 2.8,
        "path": 10
      },
      {
        "kind": "laser",
        "x": 22,
        "z": 22,
        "w": 1,
        "d": 1,
        "pct": 0.4,
        "cd": 2.6,
        "path": 10
      },
      {
        "kind": "laser",
        "x": -22,
        "z": 22,
        "w": 1,
        "d": 1,
        "pct": 0.4,
        "cd": 3,
        "path": 10
      },
      {
        "kind": "laser",
        "x": 22,
        "z": -22,
        "w": 1,
        "d": 1,
        "pct": 0.4,
        "cd": 2.4,
        "path": 10
      }
    ],
    "pads": [
      {
        "x": -30,
        "z": 0,
        "r": 2.4,
        "power": 20,
        "tx": 30,
        "tz": 0
      },
      {
        "x": 30,
        "z": 0,
        "r": 2.4,
        "power": 20,
        "tx": -30,
        "tz": 0
      }
    ],
    "buffs": [
      {
        "x": 0,
        "z": -36,
        "kind": "crit"
      },
      {
        "x": 0,
        "z": 36,
        "kind": "shield"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 39,
    "name": "噬骨裂谷",
    "subtitle": "遍布骸骨与尖刺的深谷",
    "chapter": 8,
    "chapterName": "裂隙纪元 · 机关回廊",
    "theme": {
      "sky": 1644565,
      "fog": 3354922,
      "fogNear": 34,
      "fogFar": 92,
      "ground": 4210228,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 3091750,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 6380879,
      "hemiGround": 1381393,
      "ambient": 4210228,
      "dirColor": 14209200,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 6967344
    },
    "decoType": "undead",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.55,
    "waves": {
      "minion": [
        102,
        66
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "噬骨虫",
      "desc": "啃噬骸骨的噬骨虫，成群扑向猎物",
      "colors": {
        "body": 7104600,
        "head": 14209200,
        "accent": 6967344
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "骨矛投手",
      "desc": "投掷骨矛的骨矛投手，寒芒贯穿深谷",
      "colors": {
        "body": 5920585,
        "head": 15590593,
        "accent": 6967344
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "骸骨祭司",
      "desc": "唤起骨刺贯穿战场的骸骨祭司",
      "colors": {
        "body": 5065279,
        "head": 14209200,
        "accent": 8347705
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "raise_dead",
      "skillName": "亡灵召唤",
      "skillCooldown": 5
    },
    "boss": {
      "name": "噬骨巨兽",
      "desc": "深谷中最大的骸骨巨兽，不断从骨堆中再生",
      "colors": {
        "body": 7762528,
        "head": 14209200,
        "accent": 6967344
      },
      "speed": 3.2,
      "attackRange": 25,
      "damage": 260,
      "shootInterval": 1.3,
      "skills": [
        {
          "id": "bone_spear",
          "name": "骨矛",
          "cooldown": 4
        },
        {
          "id": "raise_dead",
          "name": "亡灵召唤",
          "cooldown": 12
        },
        {
          "id": "plague_cloud",
          "name": "瘟疫云",
          "cooldown": 7
        }
      ],
      "passive": "undying_will",
      "passiveName": "不死意志"
    },
    "terrain": {
      "type": "canyon",
      "h": 8,
      "bw": 11
    },
    "voids": [
      {
        "minX": -54,
        "maxX": 26,
        "minZ": 54,
        "maxZ": 54
      }
    ],
    "hazards": [
      {
        "kind": "spike",
        "x": 0,
        "z": 10,
        "w": 10,
        "d": 4,
        "pct": 0.35,
        "cd": 2.4
      },
      {
        "kind": "spike",
        "x": 0,
        "z": -14,
        "w": 10,
        "d": 4,
        "pct": 0.35,
        "cd": 2.2
      },
      {
        "kind": "steam",
        "x": -26,
        "z": 0,
        "w": 0,
        "d": 0,
        "pct": 0.35,
        "cd": 3.6
      }
    ],
    "pads": [
      {
        "x": 0,
        "z": 34,
        "r": 2.4,
        "power": 21,
        "tx": 0,
        "tz": 8
      }
    ],
    "buffs": [
      {
        "x": -34,
        "z": -16,
        "kind": "dmg"
      },
      {
        "x": 34,
        "z": -16,
        "kind": "crit"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 40,
    "name": "洪流回旋",
    "subtitle": "被巨浪反复冲刷的环形盆地",
    "chapter": 8,
    "chapterName": "裂隙纪元 · 机关回廊",
    "theme": {
      "sky": 333850,
      "fog": 667957,
      "fogNear": 34,
      "fogFar": 98,
      "ground": 802371,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 601393,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 1203556,
      "hemiGround": 267286,
      "ambient": 802371,
      "dirColor": 2805984,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 678522
    },
    "decoType": "abyss",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.45,
    "waves": {
      "minion": [
        78,
        75
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "涌潮兵",
      "desc": "被洪流裹挟的残骸，冲撞即伤",
      "colors": {
        "body": 1402992,
        "head": 2805984,
        "accent": 678522
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "水压射手",
      "desc": "站在浪尖上的洪流弩手",
      "colors": {
        "body": 1136478,
        "head": 3073270,
        "accent": 678522
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "洪流祭卫",
      "desc": "操纵回旋水流的洪流卫士，拖拽猎物",
      "colors": {
        "body": 1002064,
        "head": 2805984,
        "accent": 814226
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "whirlpool_pull",
      "skillName": "漩涡牵引",
      "skillCooldown": 5
    },
    "boss": {
      "name": "洪流之主",
      "desc": "控制整个环形盆地水流的洪流之主",
      "colors": {
        "body": 1536635,
        "head": 2805984,
        "accent": 678522
      },
      "speed": 3,
      "attackRange": 26,
      "damage": 270,
      "shootInterval": 1.25,
      "skills": [
        {
          "id": "tidal_wave",
          "name": "潮汐波",
          "cooldown": 9
        },
        {
          "id": "tentacle_slam",
          "name": "触手拍击",
          "cooldown": 5
        },
        {
          "id": "ink_cloud",
          "name": "墨汁云",
          "cooldown": 8
        }
      ],
      "passive": "aquatic_healing",
      "passiveName": "深海治愈"
    },
    "terrain": {
      "type": "bowl",
      "h": 8,
      "r": 42
    },
    "voids": [
      {
        "minX": 0,
        "maxX": 54,
        "minZ": 44,
        "maxZ": 54
      }
    ],
    "hazards": [
      {
        "kind": "steam",
        "x": 18,
        "z": -18,
        "w": 0,
        "d": 0,
        "pct": 0.4,
        "cd": 3.2
      },
      {
        "kind": "steam",
        "x": -18,
        "z": 18,
        "w": 0,
        "d": 0,
        "pct": 0.4,
        "cd": 3
      },
      {
        "kind": "saw",
        "x": 0,
        "z": -16,
        "w": 0,
        "d": 0,
        "pct": 0.45,
        "cd": 4.6,
        "path": 14
      }
    ],
    "pads": [
      {
        "x": 0,
        "z": 36,
        "r": 2.6,
        "power": 22,
        "tx": 0,
        "tz": -6
      }
    ],
    "buffs": [
      {
        "x": -30,
        "z": 0,
        "kind": "regen"
      },
      {
        "x": 30,
        "z": 0,
        "kind": "speed"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 41,
    "name": "时间回廊",
    "subtitle": "加速与减速交错的时间场",
    "chapter": 9,
    "chapterName": "裂隙纪元 · 法则扭曲",
    "theme": {
      "sky": 1186078,
      "fog": 2372413,
      "fogNear": 34,
      "fogFar": 104,
      "ground": 3031116,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 2174776,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 4546930,
      "hemiGround": 988441,
      "ambient": 3031116,
      "dirColor": 10148095,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 3824282
    },
    "decoType": "cosmic",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.4,
    "waves": {
      "minion": [
        86,
        84
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "时序游魂",
      "desc": "在加速与减速之间错步的时之残影",
      "colors": {
        "body": 5074047,
        "head": 10148095,
        "accent": 3824282
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "逆流弩手",
      "desc": "用扭曲弹道射击的时间游猎者",
      "colors": {
        "body": 4217451,
        "head": 11136511,
        "accent": 3824282
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "织时卫",
      "desc": "减缓目标行动的时间行者，以时空裂隙突袭",
      "colors": {
        "body": 3624283,
        "head": 10148095,
        "accent": 4549816
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "time_slow",
      "skillName": "时间减速",
      "skillCooldown": 5
    },
    "boss": {
      "name": "时之织者",
      "desc": "编织局部时间流速的时之织者，让时间在战场上反复",
      "colors": {
        "body": 5535372,
        "head": 10148095,
        "accent": 3824282
      },
      "speed": 3.4,
      "attackRange": 26,
      "damage": 280,
      "shootInterval": 1.2,
      "skills": [
        {
          "id": "time_slow",
          "name": "时间减速",
          "cooldown": 10
        },
        {
          "id": "phase_shift",
          "name": "相位转移",
          "cooldown": 8
        },
        {
          "id": "temporal_rift",
          "name": "时空裂隙",
          "cooldown": 11
        }
      ],
      "passive": "temporal_echo",
      "passiveName": "时间回响"
    },
    "terrain": {
      "type": "terraces",
      "steps": 4,
      "step": 3
    },
    "voids": [
      {
        "minX": -54,
        "maxX": 54,
        "minZ": 30,
        "maxZ": 54
      }
    ],
    "hazards": [
      {
        "kind": "saw",
        "x": -20,
        "z": 0,
        "w": 0,
        "d": 0,
        "pct": 0.4,
        "cd": 5.2,
        "path": 18
      },
      {
        "kind": "saw",
        "x": 20,
        "z": 0,
        "w": 0,
        "d": 0,
        "pct": 0.4,
        "cd": 5,
        "path": 18
      }
    ],
    "pads": [
      {
        "x": 0,
        "z": 38,
        "r": 2.4,
        "power": 21,
        "tx": 0,
        "tz": 4
      }
    ],
    "buffs": [
      {
        "x": 0,
        "z": -34,
        "kind": "speed"
      },
      {
        "x": 0,
        "z": 34,
        "kind": "energy"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 42,
    "name": "虚空浮岛",
    "subtitle": "脚下即是无尽虚空的孤岛",
    "chapter": 9,
    "chapterName": "裂隙纪元 · 法则扭曲",
    "theme": {
      "sky": 1313822,
      "fog": 2627901,
      "fogNear": 34,
      "fogFar": 92,
      "ground": 3284812,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 2365240,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 4927346,
      "hemiGround": 1051161,
      "ambient": 3284812,
      "dirColor": 11037439,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 3807834
    },
    "decoType": "void",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.75,
    "waves": {
      "minion": [
        94,
        66
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "虚界游魂",
      "desc": "从虚空浮岛边缘扑下的虚空触须",
      "colors": {
        "body": 5518719,
        "head": 11037439,
        "accent": 3807834
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "虚空炮手",
      "desc": "悬浮于孤岛四周的虚空射手",
      "colors": {
        "body": 4598891,
        "head": 12088575,
        "accent": 3807834
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "吞噬侍从",
      "desc": "撕裂空间进行跳跃的虚空行者",
      "colors": {
        "body": 3941979,
        "head": 11037439,
        "accent": 4530028
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "gravity_well",
      "skillName": "重力井",
      "skillCooldown": 5
    },
    "boss": {
      "name": "虚空吞噬者",
      "desc": "吞噬整座浮岛的虚空吞噬者，边缘即是深渊",
      "colors": {
        "body": 6044300,
        "head": 11037439,
        "accent": 3807834
      },
      "speed": 3.6,
      "attackRange": 27,
      "damage": 300,
      "shootInterval": 1.15,
      "skills": [
        {
          "id": "void_bolt",
          "name": "虚空弹",
          "cooldown": 3
        },
        {
          "id": "gravity_well",
          "name": "重力井",
          "cooldown": 10
        },
        {
          "id": "dimensional_tear",
          "name": "维度撕裂",
          "cooldown": 13
        }
      ],
      "passive": "void_shield",
      "passiveName": "虚空护盾"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [
      {
        "minX": -54,
        "maxX": -24,
        "minZ": -54,
        "maxZ": 54
      },
      {
        "minX": 24,
        "maxX": 54,
        "minZ": -54,
        "maxZ": 54
      },
      {
        "minX": -54,
        "maxX": 54,
        "minZ": -54,
        "maxZ": -24
      },
      {
        "minX": -54,
        "maxX": 54,
        "minZ": 24,
        "maxZ": 54
      }
    ],
    "hazards": [
      {
        "kind": "laser",
        "x": 0,
        "z": 0,
        "w": 1,
        "d": 1,
        "pct": 0.45,
        "cd": 2.6,
        "path": 12
      }
    ],
    "pads": [
      {
        "x": -34,
        "z": -34,
        "r": 2.6,
        "power": 22,
        "tx": 34,
        "tz": 34
      },
      {
        "x": 34,
        "z": -34,
        "r": 2.6,
        "power": 22,
        "tx": -34,
        "tz": 34
      }
    ],
    "buffs": [
      {
        "x": 0,
        "z": 0,
        "kind": "shield"
      },
      {
        "x": 0,
        "z": -40,
        "kind": "dmg"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 43,
    "name": "炽阳审判庭",
    "subtitle": "光柱贯穿的圆形审判场",
    "chapter": 9,
    "chapterName": "裂隙纪元 · 法则扭曲",
    "theme": {
      "sky": 1972488,
      "fog": 4010513,
      "fogNear": 34,
      "fogFar": 98,
      "ground": 4996886,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 3681808,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 7495201,
      "hemiGround": 1643783,
      "ambient": 4996886,
      "dirColor": 16765514,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 16747024
    },
    "decoType": "cosmic",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.45,
    "waves": {
      "minion": [
        102,
        75
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "炽阳执事",
      "desc": "被光柱炙烤成焦炭却仍在突进的裁决者",
      "colors": {
        "body": 8349989,
        "head": 16765514,
        "accent": 16747024
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "光矢手",
      "desc": "从审判庭高台射下的圣裁射手",
      "colors": {
        "body": 7034911,
        "head": 16770897,
        "accent": 16747024
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "审判侍从",
      "desc": "释放烈日弹幕的炽阳裁决官",
      "colors": {
        "body": 5983002,
        "head": 16765514,
        "accent": 16753939
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "sunburst_barrage",
      "skillName": "烈日弹幕",
      "skillCooldown": 5
    },
    "boss": {
      "name": "炽阳审判者",
      "desc": "主持审判庭的炽阳审判者，以光柱锁定并处刑",
      "colors": {
        "body": 9204520,
        "head": 16765514,
        "accent": 16747024
      },
      "speed": 3.4,
      "attackRange": 27,
      "damage": 320,
      "shootInterval": 1.15,
      "skills": [
        {
          "id": "judgment_beam",
          "name": "审判圣径",
          "cooldown": 10
        },
        {
          "id": "sunburst_barrage",
          "name": "烈日弹幕",
          "cooldown": 8
        },
        {
          "id": "halo_prison",
          "name": "光环囚笼",
          "cooldown": 12
        }
      ],
      "passive": "solar_crown",
      "passiveName": "曦金王冠"
    },
    "terrain": {
      "type": "pyramid",
      "h": 11,
      "r": 34
    },
    "voids": [],
    "hazards": [
      {
        "kind": "laser",
        "x": 14,
        "z": 0,
        "w": 1,
        "d": 1,
        "pct": 0.45,
        "cd": 2.4,
        "path": 13
      },
      {
        "kind": "laser",
        "x": -14,
        "z": 0,
        "w": 1,
        "d": 1,
        "pct": 0.45,
        "cd": 2.6,
        "path": 13
      },
      {
        "kind": "laser",
        "x": 0,
        "z": 14,
        "w": 1,
        "d": 1,
        "pct": 0.45,
        "cd": 2.2,
        "path": 13
      },
      {
        "kind": "laser",
        "x": 0,
        "z": -14,
        "w": 1,
        "d": 1,
        "pct": 0.45,
        "cd": 2.8,
        "path": 13
      }
    ],
    "pads": [
      {
        "x": 0,
        "z": 38,
        "r": 2.6,
        "power": 23,
        "tx": 0,
        "tz": 8
      }
    ],
    "buffs": [
      {
        "x": 0,
        "z": -36,
        "kind": "crit"
      },
      {
        "x": 0,
        "z": 36,
        "kind": "dmg"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 44,
    "name": "坍缩天梯",
    "subtitle": "越走越窄的陡峭阶梯",
    "chapter": 9,
    "chapterName": "裂隙纪元 · 法则扭曲",
    "theme": {
      "sky": 1971467,
      "fog": 4008471,
      "fogNear": 34,
      "fogFar": 104,
      "ground": 4994076,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 3679765,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 7491371,
      "hemiGround": 1642761,
      "ambient": 4994076,
      "dirColor": 16756832,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 8014352
    },
    "decoType": "mechanical",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.4,
    "waves": {
      "minion": [
        78,
        84
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "阶坠卫",
      "desc": "守在天梯中段的阶梯守卫，撞击逼退",
      "colors": {
        "body": 8345648,
        "head": 16756832,
        "accent": 8014352
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "坍塌射手",
      "desc": "从高处台阶射击的坍缩射手",
      "colors": {
        "body": 7031080,
        "head": 16761193,
        "accent": 8014352
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "天梯守门",
      "desc": "以陨石轰击天梯的坠星卫士",
      "colors": {
        "body": 5979938,
        "head": 16756832,
        "accent": 9590803
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "gold_meteor",
      "skillName": "鎏金天陨",
      "skillCooldown": 5
    },
    "boss": {
      "name": "天梯守门人",
      "desc": "把守天梯尽头的门神，让阶梯持续收窄",
      "colors": {
        "body": 9199668,
        "head": 16756832,
        "accent": 8014352
      },
      "speed": 3.2,
      "attackRange": 26,
      "damage": 340,
      "shootInterval": 1.2,
      "skills": [
        {
          "id": "solar_lance",
          "name": "曦金长枪",
          "cooldown": 6
        },
        {
          "id": "radiant_nova",
          "name": "圣辉新星",
          "cooldown": 9
        },
        {
          "id": "gold_meteor",
          "name": "鎏金天陨",
          "cooldown": 10
        }
      ],
      "passive": "solar_crown",
      "passiveName": "曦金王冠"
    },
    "terrain": {
      "type": "slope",
      "h": 12
    },
    "voids": [
      {
        "minX": 0,
        "maxX": 54,
        "minZ": 44,
        "maxZ": 54
      }
    ],
    "hazards": [
      {
        "kind": "crusher",
        "x": -16,
        "z": 4,
        "w": 8,
        "d": 8,
        "pct": 0.5,
        "cd": 4.4,
        "path": 9
      },
      {
        "kind": "crusher",
        "x": 16,
        "z": -4,
        "w": 8,
        "d": 8,
        "pct": 0.5,
        "cd": 4.2,
        "path": 9
      },
      {
        "kind": "spike",
        "x": 0,
        "z": 26,
        "w": 10,
        "d": 4,
        "pct": 0.35,
        "cd": 2.4
      }
    ],
    "pads": [
      {
        "x": 0,
        "z": 40,
        "r": 2.6,
        "power": 24,
        "tx": 0,
        "tz": -4
      }
    ],
    "buffs": [
      {
        "x": -30,
        "z": 20,
        "kind": "regen"
      },
      {
        "x": 30,
        "z": 20,
        "kind": "shield"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 45,
    "name": "终末冰锯矿",
    "subtitle": "锯齿穿梭的寒冰矿脉",
    "chapter": 9,
    "chapterName": "裂隙纪元 · 法则扭曲",
    "theme": {
      "sky": 1252126,
      "fog": 2504509,
      "fogNear": 34,
      "fogFar": 92,
      "ground": 3097932,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 2241336,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 4679794,
      "hemiGround": 988953,
      "ambient": 3097932,
      "dirColor": 10479871,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 2779802
    },
    "decoType": "ice",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.5,
    "waves": {
      "minion": [
        86,
        66
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "冰锯虫",
      "desc": "由冰锯组成的切割体，缓慢而致命",
      "colors": {
        "body": 5207167,
        "head": 10479871,
        "accent": 2779802
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "寒矿炮手",
      "desc": "在矿脉间穿行的冰锯射手",
      "colors": {
        "body": 4350315,
        "head": 11468799,
        "accent": 2779802
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "锯刃卫",
      "desc": "释放寒冰新星的矿脉裁决者",
      "colors": {
        "body": 3756891,
        "head": 10479871,
        "accent": 3309496
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "frost_nova",
      "skillName": "寒冰新星",
      "skillCooldown": 5
    },
    "boss": {
      "name": "冰锯巨像",
      "desc": "矿脉中最大的冰锯巨像，以锯齿横扫一切",
      "colors": {
        "body": 5734284,
        "head": 10479871,
        "accent": 2779802
      },
      "speed": 3,
      "attackRange": 27,
      "damage": 360,
      "shootInterval": 1.2,
      "skills": [
        {
          "id": "ice_lance",
          "name": "冰枪",
          "cooldown": 3.5
        },
        {
          "id": "frost_nova",
          "name": "寒冰新星",
          "cooldown": 8
        },
        {
          "id": "aurora_curtain",
          "name": "极光帷幕",
          "cooldown": 9
        }
      ],
      "passive": "frozen_aura",
      "passiveName": "冰冻光环"
    },
    "terrain": {
      "type": "hills",
      "h": 5,
      "f": 0.075
    },
    "voids": [
      {
        "minX": -54,
        "maxX": 54,
        "minZ": -54,
        "maxZ": -36
      }
    ],
    "hazards": [
      {
        "kind": "saw",
        "x": -22,
        "z": 0,
        "w": 0,
        "d": 0,
        "pct": 0.45,
        "cd": 5.4,
        "path": 20
      },
      {
        "kind": "saw",
        "x": 22,
        "z": 0,
        "w": 0,
        "d": 0,
        "pct": 0.45,
        "cd": 5.2,
        "path": 20
      },
      {
        "kind": "saw",
        "x": 0,
        "z": 0,
        "w": 0,
        "d": 0,
        "pct": 0.45,
        "cd": 5,
        "path": 20
      }
    ],
    "pads": [
      {
        "x": 0,
        "z": 40,
        "r": 2.6,
        "power": 23,
        "tx": 0,
        "tz": 10
      }
    ],
    "buffs": [
      {
        "x": -34,
        "z": -10,
        "kind": "speed"
      },
      {
        "x": 34,
        "z": -10,
        "kind": "crit"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 46,
    "name": "炼狱熔炉",
    "subtitle": "多点喷发的熔炉车间",
    "chapter": 10,
    "chapterName": "裂隙纪元 · 终焉王座",
    "theme": {
      "sky": 1969155,
      "fog": 4004103,
      "fogNear": 34,
      "fogFar": 98,
      "ground": 4988681,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 3675911,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 7483150,
      "hemiGround": 1640963,
      "ambient": 4988681,
      "dirColor": 16738848,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 16763968
    },
    "decoType": "lava",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.55,
    "waves": {
      "minion": [
        94,
        75
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "炉渣虫",
      "desc": "熔炉车间溢出的熔渣块，温度极高",
      "colors": {
        "body": 8336656,
        "head": 16738848,
        "accent": 16763968
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "熔炉炮手",
      "desc": "操作喷发装置的炉膛炮手",
      "colors": {
        "body": 7023629,
        "head": 16741411,
        "accent": 16763968
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "炉心卫",
      "desc": "喷发烈焰的熔炉护卫，突袭不留余地",
      "colors": {
        "body": 5973515,
        "head": 16738848,
        "accent": 16774220
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "blazing_pursuit",
      "skillName": "烈阳突袭",
      "skillCooldown": 5
    },
    "boss": {
      "name": "熔炉主宰",
      "desc": "统御多点喷发熔炉的熔炉主宰，地面持续熔化",
      "colors": {
        "body": 9189905,
        "head": 16738848,
        "accent": 16763968
      },
      "speed": 3.4,
      "attackRange": 28,
      "damage": 380,
      "shootInterval": 1.15,
      "skills": [
        {
          "id": "blazing_pursuit",
          "name": "烈阳突袭",
          "cooldown": 8
        },
        {
          "id": "flame_nova",
          "name": "烈焰新星",
          "cooldown": 6
        },
        {
          "id": "lava_pool",
          "name": "熔岩池",
          "cooldown": 8
        }
      ],
      "passive": "molten_armor",
      "passiveName": "熔岩护甲"
    },
    "terrain": {
      "type": "flat"
    },
    "voids": [],
    "hazards": [
      {
        "kind": "steam",
        "x": -20,
        "z": -20,
        "w": 0,
        "d": 0,
        "pct": 0.45,
        "cd": 3
      },
      {
        "kind": "steam",
        "x": 20,
        "z": 20,
        "w": 0,
        "d": 0,
        "pct": 0.45,
        "cd": 3.2
      },
      {
        "kind": "steam",
        "x": -20,
        "z": 20,
        "w": 0,
        "d": 0,
        "pct": 0.45,
        "cd": 2.8
      },
      {
        "kind": "steam",
        "x": 20,
        "z": -20,
        "w": 0,
        "d": 0,
        "pct": 0.45,
        "cd": 3.4
      },
      {
        "kind": "spike",
        "x": 0,
        "z": 0,
        "w": 9,
        "d": 9,
        "pct": 0.4,
        "cd": 2.4
      }
    ],
    "pads": [
      {
        "x": -38,
        "z": 0,
        "r": 2.6,
        "power": 23,
        "tx": 38,
        "tz": 0
      }
    ],
    "buffs": [
      {
        "x": 0,
        "z": -38,
        "kind": "dmg"
      },
      {
        "x": 0,
        "z": 38,
        "kind": "regen"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 47,
    "name": "深渊钟摆",
    "subtitle": "巨型摆锤扫过的深坑",
    "chapter": 10,
    "chapterName": "裂隙纪元 · 终焉王座",
    "theme": {
      "sky": 793118,
      "fog": 1652029,
      "fogNear": 34,
      "fogFar": 104,
      "ground": 2048588,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 1519928,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 3105906,
      "hemiGround": 661017,
      "ambient": 2048588,
      "dirColor": 7004159,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 1063530
    },
    "decoType": "abyss",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.5,
    "waves": {
      "minion": [
        102,
        84
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "渊底游魂",
      "desc": "被摆锤扫飞后重新聚拢的深渊残影",
      "colors": {
        "body": 3501951,
        "head": 7004159,
        "accent": 1063530
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "墨汁射手",
      "desc": "站在钟摆死角射击的深渊弩手",
      "colors": {
        "body": 2907499,
        "head": 7665151,
        "accent": 1063530
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "钟摆祭司",
      "desc": "以触手拍击震开目标的钟摆守卫",
      "colors": {
        "body": 2510939,
        "head": 7004159,
        "accent": 1262975
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "tentacle_slam",
      "skillName": "触手拍击",
      "skillCooldown": 5
    },
    "boss": {
      "name": "钟摆守望者",
      "desc": "驱动巨型摆锤的钟摆守望者，每一次摆动都是一次横扫",
      "colors": {
        "body": 3832460,
        "head": 7004159,
        "accent": 1063530
      },
      "speed": 3.2,
      "attackRange": 28,
      "damage": 400,
      "shootInterval": 1.1,
      "skills": [
        {
          "id": "tentacle_slam",
          "name": "触手拍击",
          "cooldown": 5
        },
        {
          "id": "ink_cloud",
          "name": "墨汁云",
          "cooldown": 8
        },
        {
          "id": "tidal_wave",
          "name": "潮汐波",
          "cooldown": 9
        }
      ],
      "passive": "aquatic_healing",
      "passiveName": "深海治愈"
    },
    "terrain": {
      "type": "bowl",
      "h": 7,
      "r": 40
    },
    "voids": [
      {
        "minX": 0,
        "maxX": 54,
        "minZ": 42,
        "maxZ": 54
      }
    ],
    "hazards": [
      {
        "kind": "saw",
        "x": 0,
        "z": 0,
        "w": 0,
        "d": 0,
        "pct": 0.45,
        "cd": 4,
        "path": 34
      },
      {
        "kind": "saw",
        "x": 0,
        "z": 0,
        "w": 0,
        "d": 0,
        "pct": 0.45,
        "cd": 4.6,
        "path": 34
      },
      {
        "kind": "steam",
        "x": 0,
        "z": 0,
        "w": 0,
        "d": 0,
        "pct": 0.4,
        "cd": 3.2
      }
    ],
    "pads": [
      {
        "x": 0,
        "z": 38,
        "r": 2.6,
        "power": 24,
        "tx": 0,
        "tz": -6
      }
    ],
    "buffs": [
      {
        "x": -32,
        "z": 0,
        "kind": "speed"
      },
      {
        "x": 32,
        "z": 0,
        "kind": "shield"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 48,
    "name": "星骸回廊",
    "subtitle": "漂浮着星骸巨构的回廊",
    "chapter": 10,
    "chapterName": "裂隙纪元 · 终焉王座",
    "theme": {
      "sky": 1447966,
      "fog": 2895933,
      "fogNear": 34,
      "fogFar": 92,
      "ground": 3619916,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 2632760,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 5397106,
      "hemiGround": 1184793,
      "ambient": 3619916,
      "dirColor": 12110079,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 4864666
    },
    "decoType": "cosmic",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.6,
    "waves": {
      "minion": [
        78,
        66
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "星骸碎影",
      "desc": "由星骸残片构成的游荡体，撞击带星尘",
      "colors": {
        "body": 6055039,
        "head": 12110079,
        "accent": 4864666
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "星辉炮手",
      "desc": "在回廊星骸间狙击的虚空射手",
      "colors": {
        "body": 5067883,
        "head": 13294847,
        "accent": 4864666
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "骸光卫",
      "desc": "以星坠闪现切入战场的星骸行者",
      "colors": {
        "body": 4343899,
        "head": 12110079,
        "accent": 5785016
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "starfall_flash",
      "skillName": "星坠闪现",
      "skillCooldown": 5
    },
    "boss": {
      "name": "星骸游魂",
      "desc": "在回廊中飘荡的星骸游魂，战场本身就是它的躯体",
      "colors": {
        "body": 6647436,
        "head": 12110079,
        "accent": 4864666
      },
      "speed": 3.6,
      "attackRange": 28,
      "damage": 430,
      "shootInterval": 1.1,
      "skills": [
        {
          "id": "celestial_rain",
          "name": "天穹星雨",
          "cooldown": 9
        },
        {
          "id": "starfall_flash",
          "name": "星坠闪现",
          "cooldown": 11
        },
        {
          "id": "chaos_burst",
          "name": "混沌爆发",
          "cooldown": 8
        }
      ],
      "passive": "celestial_ward",
      "passiveName": "天穹守护"
    },
    "terrain": {
      "type": "slope",
      "h": 10
    },
    "voids": [
      {
        "minX": -54,
        "maxX": -30,
        "minZ": -54,
        "maxZ": 54
      },
      {
        "minX": 30,
        "maxX": 54,
        "minZ": -54,
        "maxZ": 54
      }
    ],
    "hazards": [
      {
        "kind": "laser",
        "x": 0,
        "z": -20,
        "w": 1,
        "d": 1,
        "pct": 0.45,
        "cd": 2.8,
        "path": 13
      },
      {
        "kind": "laser",
        "x": 0,
        "z": 20,
        "w": 1,
        "d": 1,
        "pct": 0.45,
        "cd": 2.6,
        "path": 13
      },
      {
        "kind": "crusher",
        "x": 0,
        "z": 0,
        "w": 10,
        "d": 10,
        "pct": 0.5,
        "cd": 4.8,
        "path": 10
      }
    ],
    "pads": [
      {
        "x": -36,
        "z": 0,
        "r": 2.6,
        "power": 24,
        "tx": 36,
        "tz": 0
      },
      {
        "x": 36,
        "z": 0,
        "r": 2.6,
        "power": 24,
        "tx": -36,
        "tz": 0
      }
    ],
    "buffs": [
      {
        "x": 0,
        "z": -38,
        "kind": "crit"
      },
      {
        "x": 0,
        "z": 38,
        "kind": "energy"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 49,
    "name": "秩序断崖",
    "subtitle": "规则被具象化为断崖的领域",
    "chapter": 10,
    "chapterName": "裂隙纪元 · 终焉王座",
    "theme": {
      "sky": 1972751,
      "fog": 4011294,
      "fogNear": 34,
      "fogFar": 98,
      "ground": 4997926,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 3682588,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 7496761,
      "hemiGround": 1644044,
      "ambient": 4997926,
      "dirColor": 16769152,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 9071120
    },
    "decoType": "mechanical",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.6,
    "waves": {
      "minion": [
        86,
        75
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "秩序卫",
      "desc": "被规则具象化的断崖残片，撞击成规",
      "colors": {
        "body": 8351808,
        "head": 16769152,
        "accent": 9071120
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "断崖射手",
      "desc": "依据断崖法则射击的秩序弓手",
      "colors": {
        "body": 7036469,
        "head": 16774796,
        "accent": 9071120
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "裁判侍从",
      "desc": "以鎏金天陨轰击的断崖裁决者",
      "colors": {
        "body": 5984302,
        "head": 16769152,
        "accent": 10845971
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "judgment_beam",
      "skillName": "审判圣径",
      "skillCooldown": 5
    },
    "boss": {
      "name": "断崖裁判",
      "desc": "将规则塑造成断崖的裁判，战场的法则由它裁定",
      "colors": {
        "body": 9206598,
        "head": 16769152,
        "accent": 9071120
      },
      "speed": 3.6,
      "attackRange": 29,
      "damage": 470,
      "shootInterval": 1.05,
      "skills": [
        {
          "id": "judgment_beam",
          "name": "审判圣径",
          "cooldown": 10
        },
        {
          "id": "halo_prison",
          "name": "光环囚笼",
          "cooldown": 12
        },
        {
          "id": "reality_fracture",
          "name": "现实断裂",
          "cooldown": 11
        }
      ],
      "passive": "temporal_echo",
      "passiveName": "时间回响"
    },
    "terrain": {
      "type": "canyon",
      "h": 10,
      "bw": 10
    },
    "voids": [
      {
        "minX": 0,
        "maxX": 54,
        "minZ": 44,
        "maxZ": 54
      }
    ],
    "hazards": [
      {
        "kind": "door",
        "x": 0,
        "z": 12,
        "w": 2,
        "d": 12,
        "pct": 0.35,
        "cd": 6.5,
        "path": 6
      },
      {
        "kind": "laser",
        "x": -24,
        "z": -10,
        "w": 1,
        "d": 1,
        "pct": 0.45,
        "cd": 2.6,
        "path": 13
      },
      {
        "kind": "laser",
        "x": 24,
        "z": 10,
        "w": 1,
        "d": 1,
        "pct": 0.45,
        "cd": 2.8,
        "path": 13
      },
      {
        "kind": "saw",
        "x": 0,
        "z": -18,
        "w": 0,
        "d": 0,
        "pct": 0.45,
        "cd": 5,
        "path": 16
      }
    ],
    "pads": [
      {
        "x": 0,
        "z": 36,
        "r": 2.6,
        "power": 25,
        "tx": 0,
        "tz": 6
      }
    ],
    "buffs": [
      {
        "x": -34,
        "z": -20,
        "kind": "dmg"
      },
      {
        "x": 34,
        "z": -20,
        "kind": "crit"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  },
  {
    "id": 50,
    "name": "终焉王座",
    "subtitle": "一切法则的终点，王之座前",
    "chapter": 10,
    "chapterName": "裂隙纪元 · 终焉王座",
    "theme": {
      "sky": 1973790,
      "fog": 4013373,
      "fogNear": 34,
      "fogFar": 104,
      "ground": 5000268,
      "groundRough": 0.82,
      "groundMetal": 0.22,
      "wall": 3684408,
      "wallRough": 0.72,
      "wallOpacity": 1,
      "hemiSky": 7500402,
      "hemiGround": 1644825,
      "ambient": 5000268,
      "dirColor": 16777215,
      "dirX": 14,
      "dirY": 30,
      "dirZ": -8,
      "accentLight": 16730698
    },
    "decoType": "void",
    "coverPattern": "scattered",
    "decoDensity": 1.15,
    "boundsScale": 1.8,
    "waves": {
      "minion": [
        94,
        84
      ],
      "bossWaveMinions": 0
    },
    "melee": {
      "name": "终焉残响",
      "desc": "法则崩解后诞生的终焉造物",
      "colors": {
        "body": 8355711,
        "head": 16777215,
        "accent": 16730698
      },
      "speed": 2.6,
      "attackRange": 3.6,
      "damage": 210
    },
    "ranged": {
      "name": "终末炮手",
      "desc": "在王座前集结的终焉射手",
      "colors": {
        "body": 7039851,
        "head": 16777215,
        "accent": 16730698
      },
      "speed": 2,
      "attackRange": 19,
      "damage": 250,
      "shootInterval": 1.5
    },
    "elite": {
      "name": "王座侍从",
      "desc": "以现实断裂撕裂战场的终焉执行者",
      "colors": {
        "body": 5987163,
        "head": 16777215,
        "accent": 16734296
      },
      "speed": 3.6,
      "attackRange": 5.5,
      "damage": 330,
      "skill": "reality_fracture",
      "skillName": "现实断裂",
      "skillCooldown": 5
    },
    "boss": {
      "name": "终焉·原初之座",
      "desc": "一切法则的终点，统御全局的终焉原初之座",
      "colors": {
        "body": 9211020,
        "head": 16777215,
        "accent": 16730698
      },
      "speed": 3.8,
      "attackRange": 30,
      "damage": 520,
      "shootInterval": 1,
      "skills": [
        {
          "id": "reality_fracture",
          "name": "现实断裂",
          "cooldown": 11
        },
        {
          "id": "entropy_wave",
          "name": "熵增之波",
          "cooldown": 9
        },
        {
          "id": "judgment_beam",
          "name": "审判圣径",
          "cooldown": 10
        }
      ],
      "passive": "undying_will",
      "passiveName": "不死意志"
    },
    "terrain": {
      "type": "pyramid",
      "h": 14,
      "r": 38
    },
    "voids": [
      {
        "minX": -54,
        "maxX": -26,
        "minZ": 26,
        "maxZ": 54
      },
      {
        "minX": 26,
        "maxX": 54,
        "minZ": 26,
        "maxZ": 54
      },
      {
        "minX": -54,
        "maxX": -26,
        "minZ": -54,
        "maxZ": -26
      },
      {
        "minX": 26,
        "maxX": 54,
        "minZ": -54,
        "maxZ": -26
      }
    ],
    "hazards": [
      {
        "kind": "spike",
        "x": 0,
        "z": 20,
        "w": 12,
        "d": 5,
        "pct": 0.4,
        "cd": 2.2
      },
      {
        "kind": "laser",
        "x": -26,
        "z": 0,
        "w": 1,
        "d": 1,
        "pct": 0.5,
        "cd": 2.4,
        "path": 14
      },
      {
        "kind": "laser",
        "x": 26,
        "z": 0,
        "w": 1,
        "d": 1,
        "pct": 0.5,
        "cd": 2.4,
        "path": 14
      },
      {
        "kind": "crusher",
        "x": 0,
        "z": -14,
        "w": 11,
        "d": 11,
        "pct": 0.55,
        "cd": 4.6,
        "path": 11
      },
      {
        "kind": "saw",
        "x": 0,
        "z": 0,
        "w": 0,
        "d": 0,
        "pct": 0.5,
        "cd": 4.4,
        "path": 36
      }
    ],
    "pads": [
      {
        "x": 0,
        "z": 42,
        "r": 2.8,
        "power": 26,
        "tx": 0,
        "tz": -2
      },
      {
        "x": 0,
        "z": -42,
        "r": 2.8,
        "power": 26,
        "tx": 0,
        "tz": 2
      }
    ],
    "buffs": [
      {
        "x": -40,
        "z": 0,
        "kind": "dmg"
      },
      {
        "x": 40,
        "z": 0,
        "kind": "shield"
      },
      {
        "x": 0,
        "z": 40,
        "kind": "crit"
      },
      {
        "x": 0,
        "z": -40,
        "kind": "regen"
      }
    ],
    "shapes": {
      "archetype": "golem"
    }
  }
];
