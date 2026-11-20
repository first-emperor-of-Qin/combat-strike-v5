/**
 * Simulation state types.
 *
 * The simulation is deliberately free of any DOM or WebGL dependency: the web
 * runtime owns rendering and input, this package owns the rules. Every value
 * here is plain data so a run can be serialised, replayed and asserted on.
 */
import type { DifficultyDef, LevelDef, WeaponDef } from '@combat-strike/content';

export type WeaponSlot = 'primary' | 'secondary' | 'melee' | 'grenade' | 'tactical';

export const SLOT_ORDER: readonly WeaponSlot[] = ['primary', 'secondary', 'melee', 'grenade', 'tactical'];

export type EnemyKind = 'melee' | 'ranged' | 'elite';

export type DamageType = 'normal' | 'headshot' | 'crit' | 'armor' | 'dodge' | 'immune';

export interface DamageEvent {
  /** Final damage applied (0 for a dodge or an immune hit). */
  amount: number;
  type: DamageType;
  /** True when the hit was a critical. */
  crit: boolean;
  /** True when the hit landed on the head. */
  headshot: boolean;
  /** Weapon that produced the hit, for XP attribution. */
  weaponId: string | null;
  /** Position of the hit in world space. */
  x: number;
  y: number;
  z: number;
}

export interface EnemyState {
  id: number;
  kind: EnemyKind;
  archetype: string;
  name: string;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  attackRange: number;
  shootInterval: number;
  /** Seconds until the next ranged shot. */
  shotTimer: number;
  /** Seconds until the next melee swing. */
  meleeTimer: number;
  /** Elite ability id. */
  skill: string | null;
  skillName: string | null;
  skillCooldown: number;
  skillTimer: number;
  x: number;
  z: number;
  /** Facing angle, radians. */
  angle: number;
  alive: boolean;
  /** Difficulty affix: armour damage reduction. */
  diffArmor: number;
  /** Difficulty affix: dodge chance. */
  diffDodge: number;
  /** Difficulty affix: health regenerated per second (fraction of max). */
  diffRegen: number;
  /** True when the enemy was promoted to elite by the difficulty bonus roll. */
  eliteFromDifficulty: boolean;
  /** Distance to the player, refreshed each step. */
  distanceToPlayer: number;
}

export type BossSkillPhase = 'idle' | 'windup' | 'active' | 'recovery';

export interface BossSkillState {
  id: string;
  /** Cooldown remaining before the skill may fire again. */
  cooldown: number;
  phase: BossSkillPhase;
  /** Seconds remaining in the current phase. */
  phaseTimer: number;
  /** Damage coefficient from the content pack. */
  damage: number;
  radius: number;
  speed: number;
  duration: number;
  count: number;
}

export interface BossState {
  id: number;
  name: string;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  attackRange: number;
  shootInterval: number;
  x: number;
  z: number;
  angle: number;
  alive: boolean;
  /** Passive id from the content pack. */
  passive: string | null;
  /** Passive damage reduction. */
  damageReduction: number;
  /** Seconds until the passive ticks again. */
  passiveTimer: number;
  /** True once the passive has enraged the boss (undying_will). */
  enraged: boolean;
  skills: BossSkillState[];
  /** Melee swing timer. */
  meleeTimer: number;
  /** Ranged shot timer. */
  shotTimer: number;
}

export interface ProjectileState {
  id: number;
  owner: 'player' | 'enemy';
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  damage: number;
  /** Seconds before the projectile expires. */
  life: number;
  /** Radius for hit detection. */
  radius: number;
  /** Applies a slow effect on hit. */
  slow: boolean;
  /** Applies a burn effect on hit. */
  burn: boolean;
  /** Armour-piercing (ignores the enemy armour affix). */
  piercing: boolean;
}

export interface HazardInstance {
  id: number;
  kind: string;
  x: number;
  z: number;
  w: number;
  d: number;
  /** Fraction of the cycle the hazard is active. */
  pct: number;
  /** Cycle length in seconds. */
  cd: number;
  path: number;
  /** Elapsed time within the current cycle. */
  timer: number;
  /** True while the hazard is currently dangerous. */
  active: boolean;
  /** Seconds until the player can be hit again. */
  invuln: number;
}

export interface BouncePadInstance {
  id: number;
  x: number;
  z: number;
  r: number;
  power: number;
  tx: number;
  tz: number;
  cooldown: number;
}

export interface BuffInstance {
  id: number;
  x: number;
  z: number;
  kind: 'dmg' | 'speed' | 'regen' | 'shield' | 'energy' | 'crit';
  taken: boolean;
}

export interface AmmoState {
  /** Rounds in the magazine. 0 for weapons with unlimited ammunition. */
  current: number;
  /** Magazine capacity, null when the weapon never runs dry. */
  magazine: number | null;
  /** Reserve rounds, null when the weapon never runs dry. */
  reserve: number | null;
  reloading: boolean;
  reloadTimer: number;
  /** Seconds until the next shot is allowed. */
  cooldown: number;
}

export type WeaponFireMode = 'fire' | 'melee-light' | 'melee-heavy' | 'throw' | 'tactical' | 'none';

export interface WeaponRuntimeState {
  weaponId: string;
  slot: WeaponSlot;
  /** Weapon level, 1..10. Drives the damage, crit and reload multipliers. */
  weaponLevel: number;
  mode: WeaponFireMode;
  ammo: AmmoState;
  /** Seconds remaining on the weapon-skill (middle mouse) cooldown. */
  skillCooldown: number;
  /** True while the weapon skill is active. */
  skillActive: boolean;
  /** Seconds remaining on the weapon-special (X) cooldown. */
  specialCooldown: number;
  specialActive: boolean;
  /** Form-change state for transformation weapons. */
  form: string | null;
  /** Remaining duration of the current form. */
  formTimer: number;
}

export interface PlayerState {
  x: number;
  z: number;
  y: number;
  yaw: number;
  pitch: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  energy: number;
  maxEnergy: number;
  soulPower: number;
  /** Crit chance including equipment and weapon level. */
  critRate: number;
  /** Damage reduction from equipment. */
  damageReduction: number;
  healthRegen: number;
  energyRegen: number;
  moveSpeed: number;
  alive: boolean;
  /** Invulnerability window, seconds. */
  invuln: number;
  /** Active status effects. */
  slowed: number;
  burning: number;
  rooted: number;
  /** Kill streak counter. */
  killStreak: number;
  killStreakTimer: number;
  /** Total score. */
  score: number;
  /** In-arena damage buff multiplier. */
  damageBuff: number;
}

export type RunPhase = 'loading' | 'playing' | 'paused' | 'victory' | 'defeat';

export interface SettlementResult {
  outcome: 'victory' | 'defeat';
  level: number;
  difficulty: number;
  score: number;
  kills: number;
  bossKills: number;
  durationSeconds: number;
  /** Difficulty tier unlocked by this clear (null when already maxed). */
  unlockedDifficulty: number | null;
  /** Weapon XP gained per weapon id. */
  weaponXp: Record<string, number>;
  /** Total damage dealt. */
  damageDealt: number;
}

export interface RunConfig {
  level: number;
  difficulty: number;
  seed: number;
  /** Weapon ids equipped per slot. */
  loadout: Partial<Record<WeaponSlot, string>>;
  /** Weapon level per weapon id (1..10). */
  weaponLevels: Record<string, number>;
  /** Companion id, or null. */
  companion: string | null;
  /** Hero id from the character roster. */
  character: string;
}

export interface LevelRuntime {
  def: LevelDef;
  difficulty: DifficultyDef;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}
