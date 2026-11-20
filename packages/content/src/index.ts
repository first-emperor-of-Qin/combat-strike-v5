/**
 * @combat-strike/content — the single data source for campaign and equipment.
 *
 * Everything the game shows (codex, shop, HUD, settlement) and everything the
 * simulation consumes (damage, waves, boss skills, difficulty) is derived from
 * this package, so a value can never drift between the panel and the rules.
 */
import { z } from 'zod';
import { LEVELS } from './generated/levels.js';
import { WEAPONS } from './generated/weapons.js';
import { DIFFICULTIES } from './generated/difficulty.js';
import { BOSS_SKILLS, BOSS_PASSIVES } from './generated/boss-skills.js';
import { BOSS_HP_TABLE } from './generated/boss-hp.js';
import { ELITE_SKILLS } from './generated/elite-skills.js';
import { LEVEL_MANIFEST } from './generated/manifest.js';
import { CHAPTERS, GENERATED_LEVEL_COPY, chapterOfLevel } from './curated/copy.js';
import recoilWeights from './curated/recoil.json' with { type: 'json' };
import { levelSchema, weaponSchema, difficultySchema, findPlaceholderCopy } from './schema.js';
import type {
  LevelDef,
  WeaponDef,
  DifficultyDef,
  BossSkillDef,
  BossPassiveDef,
  WeaponSlot,
  CharacterDef,
  CompanionDef,
} from './types.js';

export * from './types.js';
export { CHAPTERS, GENERATED_LEVEL_COPY, chapterOfLevel };
export { LEVEL_MANIFEST };
export { LEVELS };
export { WEAPONS };
export { DIFFICULTIES };
export { BOSS_SKILLS, BOSS_PASSIVES };
export { ELITE_SKILLS };

/**
 * Boss HP table, transcribed verbatim from the legacy
 * `window.__BOSS_HP_TABLE__` (baseline index.html:6375): level 1 starts at
 * 40,000,000 and each level multiplies by 1.28.
 */
export { BOSS_HP_TABLE };

/**
 * Quality tier bonuses: hit points, soul power, crit, regen.
 * Values are transcribed verbatim from the legacy `TIER_BONUS` table
 * (baseline index.html:10823-10833). `critRate` is a percentage.
 */
export const TIER_BONUS: Record<number, {
  hp: number;
  soulPower: number;
  moveSpeed: number;
  energy: number;
  critRate: number;
  hpRegen: number;
  energyRegen: number;
}> = {
  1: { hp: 8_000, soulPower: 2_000, moveSpeed: 0.5, energy: 20, critRate: 1, hpRegen: 80, energyRegen: 1 },
  2: { hp: 15_000, soulPower: 3_500, moveSpeed: 0.8, energy: 30, critRate: 2, hpRegen: 150, energyRegen: 2 },
  3: { hp: 25_000, soulPower: 5_500, moveSpeed: 1.1, energy: 45, critRate: 3, hpRegen: 280, energyRegen: 3 },
  4: { hp: 40_000, soulPower: 8_000, moveSpeed: 1.4, energy: 60, critRate: 4, hpRegen: 450, energyRegen: 4 },
  5: { hp: 60_000, soulPower: 12_000, moveSpeed: 1.7, energy: 80, critRate: 5, hpRegen: 700, energyRegen: 6 },
  6: { hp: 90_000, soulPower: 17_000, moveSpeed: 2.0, energy: 110, critRate: 6, hpRegen: 1_100, energyRegen: 8 },
  7: { hp: 130_000, soulPower: 24_000, moveSpeed: 2.3, energy: 150, critRate: 7, hpRegen: 1_600, energyRegen: 11 },
  8: { hp: 180_000, soulPower: 32_000, moveSpeed: 2.6, energy: 200, critRate: 8, hpRegen: 2_300, energyRegen: 15 },
  9: { hp: 250_000, soulPower: 45_000, moveSpeed: 3.0, energy: 280, critRate: 10, hpRegen: 3_200, energyRegen: 20 },
};

/**
 * Damage reduction by quality tier, in percent. The legacy took the highest
 * equipped tier only — reductions never stack (baseline index.html:10835).
 */
export const TIER_DR: Record<number, number> = {
  1: 0, 2: 0, 3: 0.5, 4: 1, 5: 1.5, 6: 2, 7: 3, 8: 4, 9: 5,
};

/** Base crit chance before equipment bonuses. */
export const CRIT_CHANCE = 0.01;
/** Crit damage multiplier. */
export const CRIT_MULTIPLIER = 2;
/** Seconds a kill streak survives without a kill. */
export const KILL_STREAK_TIMEOUT = 5;

/** Weapon weight: 1 = very light (pistol/energy), 10 = very heavy (sniper/cannon). */
export const WEAPON_WEIGHTS: Record<string, number> = recoilWeights;
export const DEFAULT_WEAPON_WEIGHT = 3.0;

export function getWeaponWeight(weaponId: string): number {
  return WEAPON_WEIGHTS[weaponId] ?? DEFAULT_WEAPON_WEIGHT;
}

export const MAX_LEVEL = 50;
export const MAX_WEAPON_LEVEL = 10;

/** Headshot height thresholds, in world units above the enemy origin. */
export const HEAD_Y_NORMAL = 1.6;
export const HEAD_Y_BOSS = 2.6;
export const HEADSHOT_MULTIPLIER = 2.0;

export const CHARACTERS: CharacterDef[] = [
  { id: 'initiate', name: '初心者', desc: '新兵的基础训练，没有任何额外加成', star: 0, price: 0 },
  { id: 'rookie', name: '新兵', desc: '完成基础训练的新人，属性略有提升', star: 1, price: 50_000 },
  { id: 'militia', name: '民兵', desc: '地方武装的骨干，兼顾生存与输出', star: 2, price: 120_000 },
  { id: 'scout', name: '侦察兵', desc: '擅长战场侦察，移动迅捷', star: 2, price: 180_000 },
  { id: 'breaker', name: '爆破手', desc: '以火力覆盖压制成群敌人', star: 3, price: 260_000 },
  { id: 'captain', name: '突击队长', desc: '带队冲锋，攻守均衡', star: 4, price: 400_000 },
  { id: 'medic', name: '医疗兵', desc: '持续恢复小队生命', star: 4, price: 460_000 },
  { id: 'sniper', name: '幽灵狙击', desc: '远处一击必杀，暴击能力出众', star: 5, price: 620_000 },
  { id: 'titan', name: '机甲战士', desc: '重装机体，生命与护盾极高', star: 6, price: 820_000 },
  { id: 'phoenix', name: '王牌指挥官', desc: '全属性均衡的战场核心', star: 7, price: 1_100_000 },
  { id: 'emperor', name: '暗影君主', desc: '统御暗影的最高存在', star: 8, price: 1_600_000 },
];

export const COMPANIONS: CompanionDef[] = [
  { id: 'myriad', name: '万相之主', desc: '万相化形，同时施加多种战场效果' },
  { id: 'poseidon', name: '波塞西', desc: '潮汐之力，持续压制与清场' },
];

// ---------------------------------------------------------------- accessors

const levelById = new Map(LEVELS.map((l) => [l.id, l]));
const weaponById = new Map(WEAPONS.map((w) => [w.id, w]));

export function getLevel(level: number): LevelDef {
  const found = levelById.get(level);
  if (!found) throw new Error(`unknown level: ${level}`);
  return found;
}

export function getWeapon(id: string): WeaponDef {
  const found = weaponById.get(id);
  if (!found) throw new Error(`unknown weapon: ${id}`);
  return found;
}

export function findWeapon(id: string): WeaponDef | undefined {
  return weaponById.get(id);
}

export function weaponsBySlot(slot: WeaponSlot): WeaponDef[] {
  return WEAPONS.filter((w) => w.slot === slot);
}

export function getDifficulty(tier: number): DifficultyDef {
  const found = DIFFICULTIES.find((d) => d.tier === tier);
  if (!found) throw new Error(`unknown difficulty tier: ${tier}`);
  return found;
}

export function getBossSkill(id: string): BossSkillDef | undefined {
  return BOSS_SKILLS.find((s) => s.id === id);
}

export function getBossPassive(id: string): BossPassiveDef | undefined {
  return BOSS_PASSIVES.find((p) => p.id === id);
}

/** True for the four pure-boss levels (15 / 20 / 25 / 30). */
export function isPureBossLevel(level: number): boolean {
  const def = levelById.get(level);
  if (!def) return false;
  return def.waves.minion.every((n) => n === 0);
}

/** The four levels that end their chapter with a pure boss fight. */
export const PURE_BOSS_LEVELS: readonly number[] = LEVELS.filter((l) => isPureBossLevel(l.id)).map((l) => l.id);

/** Boss HP for a level at a given difficulty tier. */
export function bossHpFor(level: number, tier: number): number {
  const base = BOSS_HP_TABLE[level] ?? BOSS_HP_TABLE[1]!;
  return Math.round(base * getDifficulty(tier).multiplier);
}

/**
 * Minion HP for a level and wave.
 * Wave 1 minions have 1% of the boss HP, wave 2 elites have 2%.
 */
export function minionHpFor(level: number, wave: number, tier: number): number {
  const base = BOSS_HP_TABLE[level] ?? BOSS_HP_TABLE[1]!;
  const ratio = wave === 2 ? 0.02 : 0.01;
  return Math.round(Math.round(base * ratio) * getDifficulty(tier).multiplier);
}

// ---------------------------------------------------------------- validation

export interface ContentValidationReport {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

/** Validates the whole pack. Called by the content test suite and at boot. */
export function validateContent(): ContentValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (LEVELS.length !== MAX_LEVEL) {
    errors.push(`expected ${MAX_LEVEL} levels, got ${LEVELS.length}`);
  }
  for (const level of LEVELS) {
    const parsed = levelSchema.safeParse(level);
    if (!parsed.success) {
      errors.push(`level ${level.id} failed schema: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
    }
    errors.push(...findPlaceholderCopy(level));
    for (const s of level.boss.skills) {
      if (!BOSS_SKILLS.some((b) => b.id === s.id)) {
        errors.push(`level ${level.id}: boss skill "${s.id}" is not in the skill registry`);
      }
    }
    if (level.boss.passive && !BOSS_PASSIVES.some((p) => p.id === level.boss.passive)) {
      errors.push(`level ${level.id}: boss passive "${level.boss.passive}" is not in the passive registry`);
    }
    for (const v of level.voids) {
      // The legacy shipped two inverted rectangles (levels 31 and 39) that could
      // never trigger; the importer normalises them, so this must always pass.
      if (v.minX > v.maxX || v.minZ > v.maxZ) {
        errors.push(`level ${level.id}: void rectangle is inverted (minX=${v.minX} maxX=${v.maxX})`);
      }
    }
  }

  if (WEAPONS.length !== 44) {
    errors.push(`expected 44 weapons, got ${WEAPONS.length}`);
  }
  for (const weapon of WEAPONS) {
    const parsed = weaponSchema.safeParse(weapon);
    if (!parsed.success) {
      errors.push(`weapon ${weapon.id} failed schema: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
    }
    if (weapon.slot !== 'tactical' && weapon.stats.baseDamage <= 0) {
      errors.push(`weapon ${weapon.id} has no base damage`);
    }
    if (weapon.slot !== 'tactical' && weapon.stats.fireInterval === null) {
      warnings.push(`weapon ${weapon.id} (${weapon.slot}) has no fire interval`);
    }
    if (weapon.slot === 'tactical') {
      // Tactical gear has no damage by design; it must still carry a passive.
      if (weapon.passives.length === 0 && weapon.actives.length === 0) {
        errors.push(`weapon ${weapon.id} (tactical) declares no effects`);
      }
    }
  }

  if (DIFFICULTIES.length !== 10) {
    errors.push(`expected 10 difficulty tiers, got ${DIFFICULTIES.length}`);
  }
  for (const d of DIFFICULTIES) {
    const parsed = difficultySchema.safeParse(d);
    if (!parsed.success) {
      errors.push(`difficulty ${d.tier} failed schema: ${parsed.error.issues.map((i) => `${i.path.join('.')} ${i.message}`).join('; ')}`);
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}
