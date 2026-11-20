/**
 * GENERATED FILE — do not edit by hand.
 * Source: tools/legacy-audit/out/* (audited legacy baseline)
 * Regenerate: npm run content:import
 */

import type { EliteSkillDef } from '../types.js';

/**
 * The 18 elite abilities the legacy build actually implemented, ported with their
 * original numbers. The other 15 configured abilities reuse the BOSS_SKILLS
 * registry and are resolved at runtime.
 */
export const ELITE_SKILLS: EliteSkillDef[] = [
  {
    "id": "lunge",
    "name": "猛冲突进",
    "kind": "dash",
    "dash": 8,
    "hitRange": 4,
    "damageMult": 1.5
  },
  {
    "id": "whirlpool_pull",
    "name": "漩涡牵引",
    "kind": "pull",
    "pull": 3,
    "damageMult": 0.5
  },
  {
    "id": "blink_strike",
    "name": "闪现打击",
    "kind": "blink",
    "blink": 3,
    "damageMult": 1.2
  },
  {
    "id": "charge_shield",
    "name": "冲锋盾击",
    "kind": "dash",
    "dash": 6,
    "hitRange": 5,
    "damageMult": 1.5
  },
  {
    "id": "curse_cloud",
    "name": "诅咒毒云",
    "kind": "cloud",
    "radius": 3,
    "duration": 5,
    "damageMult": 0.5
  },
  {
    "id": "ice_dash",
    "name": "寒冰突刺",
    "kind": "dash",
    "dash": 5,
    "hitRange": 4,
    "damageMult": 1,
    "slow": {
      "duration": 3,
      "amount": 0.5
    }
  },
  {
    "id": "thunder_leap",
    "name": "雷霆跳跃",
    "kind": "leap",
    "hitRange": 6,
    "damageMult": 1.5
  },
  {
    "id": "death_charge",
    "name": "死亡冲锋",
    "kind": "dash",
    "dash": 7,
    "hitRange": 5,
    "damageMult": 2
  },
  {
    "id": "transmute",
    "name": "混沌嬗变",
    "kind": "transmute",
    "damageMult": 0.8,
    "slow": {
      "duration": 4,
      "amount": 0.6
    },
    "burn": {
      "duration": 4
    }
  },
  {
    "id": "void_blast",
    "name": "虚空爆裂",
    "kind": "blast",
    "radius": 5,
    "hitRange": 6,
    "damageMult": 1.8
  },
  {
    "id": "radiant_lunge",
    "name": "曦光突刺",
    "kind": "dash",
    "dash": 8,
    "hitRange": 4,
    "damageMult": 1.5,
    "burn": {
      "duration": 3
    }
  },
  {
    "id": "solar_volley",
    "name": "曦金三连矢",
    "kind": "volley",
    "radius": 0.18,
    "damageMult": 0.7,
    "projectiles": 3,
    "spread": 0.18,
    "speed": 22,
    "life": 2.5
  },
  {
    "id": "gold_quake",
    "name": "鎏金震击",
    "kind": "quake",
    "hitRange": 6,
    "damageMult": 1.6,
    "slow": {
      "duration": 2.5,
      "amount": 0.6
    }
  },
  {
    "id": "mirage_ambush",
    "name": "蜃光奇袭",
    "kind": "blink",
    "blink": 2.5,
    "damageMult": 1.4
  },
  {
    "id": "aurora_lance",
    "name": "极光贯枪",
    "kind": "volley",
    "radius": 0.22,
    "damageMult": 0.9,
    "slow": {
      "duration": 2,
      "amount": 0.7
    },
    "projectiles": 1,
    "spread": 0,
    "speed": 28,
    "life": 2.2,
    "slowRange": 12
  },
  {
    "id": "sky_smite",
    "name": "天穹坠击",
    "kind": "leap",
    "hitRange": 6,
    "damageMult": 1.6
  },
  {
    "id": "halo_bind",
    "name": "光环禁锢",
    "kind": "bind",
    "hitRange": 14,
    "damageMult": 0.7,
    "root": {
      "duration": 0.8
    }
  },
  {
    "id": "astral_scatter",
    "name": "星屑散射",
    "kind": "scatter",
    "radius": 0.16,
    "damageMult": 0.5,
    "projectiles": 8,
    "speed": 16,
    "life": 2
  }
];
