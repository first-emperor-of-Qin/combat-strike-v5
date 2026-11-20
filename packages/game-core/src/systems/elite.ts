/**
 * Elite abilities.
 *
 * The legacy build implemented 18 of the 33 configured elite abilities in
 * `executeEliteSkill` (baseline index.html:23953-24078) and silently did
 * nothing for the other 15, which fell through a `switch` with no `default`.
 * The rewrite restores the 18 with their original numbers and routes the
 * remaining 15 through the boss skill registry, so every configured elite
 * ability now does something.
 */
import { ELITE_SKILLS, type EliteSkillDef } from '@combat-strike/content';
import type { Rng } from '../util/rng.js';

export interface EliteSkillContext {
  /** Current elite position; may be mutated by a dash or a blink. */
  x: number;
  z: number;
  /** Player position. */
  playerX: number;
  playerZ: number;
  /** Arena bounds. */
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  /** Distance between the elite and the player. */
  distance: number;
  /** The elite's damage stat. */
  damage: number;
  rng: Rng;
  /** Applies damage to the player. */
  damagePlayer: (amount: number) => void;
  /** Spawns a projectile travelling from the elite toward the player. */
  spawnProjectile: (opts: {
    x: number;
    z: number;
    angle: number;
    speed: number;
    damage: number;
    radius: number;
    life: number;
  }) => void;
  /** Drags the player by the given offset, if the destination is legal. */
  pullPlayer: (dx: number, dz: number) => void;
  /** Slows the player: `amount` is the fraction of speed removed. */
  slowPlayer: (duration: number, amount: number) => void;
  /** Roots the player in place. */
  rootPlayer: (duration: number) => void;
  /** Sets the player on fire. */
  burnPlayer: (duration: number) => void;
  /** Creates a lingering hazard at a position. */
  spawnCloud: (x: number, z: number, radius: number, duration: number) => void;
  /** Creates a one-off explosion at a position. */
  spawnBlast: (x: number, z: number, radius: number) => void;
  /** Reports a melee hit for audio feedback. */
  onMeleeHit: () => void;
}

const BY_ID = new Map(ELITE_SKILLS.map((s) => [s.id, s]));

export function getEliteSkill(id: string): EliteSkillDef | undefined {
  return BY_ID.get(id);
}

/** True when the ability is one of the legacy-implemented 18. */
export function isLegacyEliteSkill(id: string): boolean {
  return BY_ID.has(id);
}

/**
 * Executes an elite ability.
 *
 * The behaviour of each archetype mirrors the legacy implementation exactly,
 * including the damage multipliers and the status durations.
 */
export function executeEliteAbility(skillId: string, ctx: EliteSkillContext): void {
  const skill = BY_ID.get(skillId);
  if (!skill) return;

  const damage = ctx.damage * skill.damageMult;
  const dx = ctx.playerX - ctx.x;
  const dz = ctx.playerZ - ctx.z;

  switch (skill.kind) {
    case 'dash': {
      const dist = Math.hypot(dx, dz) || 1;
      const nx = ctx.x + (dx / dist) * (skill.dash ?? 0);
      const nz = ctx.z + (dz / dist) * (skill.dash ?? 0);
      if (isInsideBounds(nx, nz, ctx.bounds)) {
        ctx.x = nx;
        ctx.z = nz;
      }
      if (ctx.distance <= (skill.hitRange ?? 0)) {
        ctx.damagePlayer(damage);
        ctx.onMeleeHit();
        if (skill.slow) ctx.slowPlayer(skill.slow.duration, skill.slow.amount);
      }
      if (skill.burn) ctx.burnPlayer(skill.burn.duration);
      break;
    }

    case 'pull': {
      // The legacy pulled the PLAYER towards the elite, then dealt damage.
      const dist = Math.hypot(dx, dz) || 1;
      const pull = skill.pull ?? 0;
      ctx.pullPlayer(-(dx / dist) * pull, -(dz / dist) * pull);
      ctx.damagePlayer(damage);
      break;
    }

    case 'blink': {
      const angle = ctx.rng.range(0, Math.PI * 2);
      const bx = ctx.playerX + Math.cos(angle) * (skill.blink ?? 0);
      const bz = ctx.playerZ + Math.sin(angle) * (skill.blink ?? 0);
      if (isInsideBounds(bx, bz, ctx.bounds)) {
        ctx.x = bx;
        ctx.z = bz;
      }
      ctx.damagePlayer(damage);
      ctx.onMeleeHit();
      break;
    }

    case 'cloud': {
      ctx.spawnCloud(ctx.playerX, ctx.playerZ, skill.radius ?? 3, skill.duration ?? 5);
      ctx.damagePlayer(damage);
      break;
    }

    case 'leap': {
      // The legacy teleported the elite ONTO the player and exploded.
      ctx.x = ctx.playerX;
      ctx.z = ctx.playerZ;
      ctx.spawnBlast(ctx.x, ctx.z, skill.radius ?? 4);
      if (ctx.distance <= (skill.hitRange ?? 0)) ctx.damagePlayer(damage);
      break;
    }

    case 'transmute': {
      if (ctx.rng.chance(0.5)) {
        if (skill.slow) ctx.slowPlayer(skill.slow.duration, skill.slow.amount);
      } else if (skill.burn) {
        ctx.burnPlayer(skill.burn.duration);
      }
      ctx.damagePlayer(damage);
      break;
    }

    case 'blast': {
      ctx.spawnBlast(ctx.playerX, ctx.playerZ, skill.radius ?? 5);
      if (ctx.distance <= (skill.hitRange ?? 0)) ctx.damagePlayer(damage);
      break;
    }

    case 'volley': {
      const base = Math.atan2(dx, dz);
      const count = skill.projectiles ?? 1;
      const spread = skill.spread ?? 0;
      for (let i = 0; i < count; i++) {
        const offset = count > 1 ? (i - (count - 1) / 2) * spread : 0;
        ctx.spawnProjectile({
          x: ctx.x,
          z: ctx.z,
          angle: base + offset,
          speed: skill.speed ?? 20,
          damage,
          radius: skill.radius ?? 0.2,
          life: skill.life ?? 2.5,
        });
      }
      if (skill.slow && ctx.distance <= (skill.slowRange ?? skill.hitRange ?? 0)) {
        ctx.slowPlayer(skill.slow.duration, skill.slow.amount);
      }
      break;
    }

    case 'quake': {
      ctx.spawnBlast(ctx.playerX, ctx.playerZ, skill.radius ?? 4);
      if (ctx.distance <= (skill.hitRange ?? 0)) {
        ctx.damagePlayer(damage);
        if (skill.slow) ctx.slowPlayer(skill.slow.duration, skill.slow.amount);
      }
      break;
    }

    case 'bind': {
      if (ctx.distance <= (skill.hitRange ?? 0)) {
        if (skill.root) ctx.rootPlayer(skill.root.duration);
        ctx.damagePlayer(damage);
      }
      break;
    }

    case 'scatter': {
      const count = skill.projectiles ?? 8;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        ctx.spawnProjectile({
          x: ctx.x,
          z: ctx.z,
          angle,
          speed: skill.speed ?? 16,
          damage,
          radius: skill.radius ?? 0.16,
          life: skill.life ?? 2,
        });
      }
      break;
    }

    default:
      break;
  }
}

function isInsideBounds(
  x: number,
  z: number,
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
): boolean {
  return x > bounds.minX + 1 && x < bounds.maxX - 1 && z > bounds.minZ + 1 && z < bounds.maxZ - 1;
}
