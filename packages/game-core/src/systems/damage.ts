/**
 * Damage pipeline.
 *
 * Ported from the legacy build and deliberately unified. The legacy had two
 * separate damage paths — `shoot()` and `damageEnemy()` — that disagreed with
 * each other, which produced four documented defects (see docs/MIGRATION.md):
 *
 *  C6  `shoot()` rolled crit against `CRIT_CHANCE` alone, ignoring the
 *      equipment and weapon-level crit bonuses that `damageEnemy()` used.
 *  C7  `HEADSHOT_MULTIPLIER` was never applied inside `damageEnemy()`, so
 *      every weapon other than the starter gun got no headshot bonus.
 *  C8  The `armored` / `swift` difficulty affixes were only read inside
 *      `damageEnemy()`, so they had no effect on the raw path.
 *  C10 `calcDamage()` returned early when a damage-amplify weapon was
 *      equipped, silently dropping the ×1.5 and ×1.4 multipliers.
 *
 * The rewrite routes every point of damage through `applyDamage` below, so
 * the codex, the HUD and the rules always agree.
 */
import {
  CRIT_CHANCE,
  CRIT_MULTIPLIER,
  HEADSHOT_MULTIPLIER,
  HEAD_Y_BOSS,
  HEAD_Y_NORMAL,
  TIER_BONUS,
} from '@combat-strike/content';
import type { DamageEvent, DamageType } from '../types.js';
import type { Rng } from '../util/rng.js';

export interface DamageTargetState {
  isBoss: boolean;
  /** Boss damage reduction fraction, 0..1. */
  damageReduction?: number;
  /** True while the boss shield is up. */
  shieldActive?: boolean;
  /** Difficulty affix: flat damage reduction, 0..1. */
  diffArmor?: number;
  /** Difficulty affix: chance to take no damage at all. */
  diffDodge?: number;
  /** True when the hit is blocked entirely. */
  shieldWall?: boolean;
  /** True when the target is immune. */
  immune?: boolean;
  /** Health added after the hit (legacy `fireDamageBonus`). */
  fireDamageBonus?: number;
}

export interface DamageContext {
  /** Effective soul power — the multiplier applied to raw weapon damage. */
  soulPower: number;
  /** Weapon level, 1..10. Each level adds +5% damage. */
  weaponLevel: number;
  /** Total crit chance from equipment and weapon level, in 0..1. */
  bonusCritRate: number;
  /** In-arena damage buff multiplier (1 = none). */
  damageBuff: number;
  /** Damage amplify percentage from the equipped tactical slot. */
  amplifyPercent: number;
  /** True while the energy-defender shield is up (×1.5 damage). */
  energyDefenderShield: boolean;
  /** True while the fate buff is up (×1.4 damage). */
  fateBuff: boolean;
}

/**
 * Converts a raw weapon damage value into the final amount before any
 * hit-resolution modifiers.
 *
 * Legacy order (baseline index.html:16411-16439):
 *   baseDmg → × in-arena buff → × soul power → × weapon level → × amplify
 *           → × 1.5 (energy defender) → × 1.4 (fate)
 */
export function calcDamage(baseDmg: number, ctx: DamageContext): number {
  let dmg = baseDmg;

  if (ctx.damageBuff !== 1) dmg = dmg * ctx.damageBuff;

  let calc = Math.round(ctx.soulPower * dmg);
  calc = Math.round(calc * getWeaponDamageMult(ctx.weaponLevel));

  // The legacy returned early here, dropping the two multipliers below.
  // The rewrite applies them all, in the same order.
  if (ctx.amplifyPercent > 0) calc = Math.round(calc * (1 + ctx.amplifyPercent / 100));
  if (ctx.energyDefenderShield) calc = Math.round(calc * 1.5);
  if (ctx.fateBuff) calc = Math.round(calc * 1.4);

  return calc;
}

/** +5% damage per weapon level above 1. */
export function getWeaponDamageMult(weaponLevel: number): number {
  return 1 + 0.05 * (Math.max(1, weaponLevel) - 1);
}

/** Reload time scales down 3% per weapon level, floored at 0.5×. */
export function getWeaponReloadMult(weaponLevel: number): number {
  return Math.max(0.5, 1 - 0.03 * (Math.max(1, weaponLevel) - 1));
}

/** Total crit chance: base + equipment + weapon level (+1% per level above 1). */
export function getCritChance(ctx: Pick<DamageContext, 'bonusCritRate'>, weaponLevel: number): number {
  const levelBonus = 0.01 * (Math.max(1, weaponLevel) - 1);
  return Math.min(1, CRIT_CHANCE + ctx.bonusCritRate + levelBonus);
}

/**
 * Resolves a hit against a target.
 *
 * Modifier order (matching the legacy `shoot()` path, which was the most
 * complete of the two):
 *   headshot ×2 → crit ×2 → boss damage reduction → boss shield → armour
 *   affix → dodge → additive fire bonus
 */
export function applyDamage(
  amount: number,
  target: DamageTargetState,
  options: {
    headshot: boolean;
    /** Height of the hit above the target origin, in world units. */
    hitHeight: number;
    critChance: number;
    rng: Rng;
    weaponId: string | null;
    x: number;
    y: number;
    z: number;
  }
): DamageEvent {
  let damage = amount;
  let crit = false;
  let headshot = options.headshot;
  let type: DamageType = 'normal';

  if (target.immune) {
    return { amount: 0, type: 'immune', crit: false, headshot, weaponId: options.weaponId, x: options.x, y: options.y, z: options.z };
  }

  if (target.shieldWall) {
    return { amount: 0, type: 'immune', crit: false, headshot, weaponId: options.weaponId, x: options.x, y: options.y, z: options.z };
  }

  if (headshot) {
    damage = Math.round(damage * HEADSHOT_MULTIPLIER);
    type = 'headshot';
  }

  if (options.rng.chance(options.critChance)) {
    damage = Math.round(damage * CRIT_MULTIPLIER);
    crit = true;
    type = 'crit';
  }

  if (target.isBoss) {
    if (target.damageReduction && target.damageReduction > 0) {
      damage = Math.round(damage * (1 - target.damageReduction));
    }
    if (target.shieldActive) {
      damage = Math.round(damage * 0.1);
    }
  }

  // Difficulty affix: armour. Legacy applied this only inside damageEnemy().
  if (target.diffArmor && target.diffArmor > 0) {
    damage = Math.round(damage * (1 - target.diffArmor));
    type = 'armor';
  }

  // Difficulty affix: swift — a flat chance to take no damage at all.
  if (target.diffDodge && target.diffDodge > 0 && options.rng.chance(target.diffDodge)) {
    return { amount: 0, type: 'dodge', crit, headshot, weaponId: options.weaponId, x: options.x, y: options.y, z: options.z };
  }

  if (target.fireDamageBonus && target.fireDamageBonus > 0) {
    damage += target.fireDamageBonus;
  }

  return { amount: Math.max(0, damage), type, crit, headshot, weaponId: options.weaponId, x: options.x, y: options.y, z: options.z };
}

/** Height threshold above which a hit counts as a headshot. */
export function isHeadshot(hitHeight: number, isBoss: boolean): boolean {
  return hitHeight >= (isBoss ? HEAD_Y_BOSS : HEAD_Y_NORMAL);
}

/**
 * Sums the crit rate contributed by every equipped slot.
 * The legacy summed the `TIER_BONUS.critRate` of all five equipped slots plus
 * the dragoon and the hero (baseline index.html:11150-11174).
 */
export function sumCritRate(qualities: number[]): number {
  let total = 0;
  for (const q of qualities) {
    total += (TIER_BONUS[q]?.critRate ?? 0) / 100;
  }
  return total;
}

/**
 * Sums soul power the same way: the legacy used the equipped weapon's tier
 * bonus plus every other equipped slot's contribution.
 */
export function sumSoulPower(qualities: number[]): number {
  let total = 0;
  for (const q of qualities) {
    total += TIER_BONUS[q]?.soulPower ?? 0;
  }
  return total;
}
