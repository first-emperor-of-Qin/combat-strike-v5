/**
 * Content pack type definitions.
 *
 * Every field that the game rules actually consume lives here, so the codex,
 * shop, HUD and settlement screens can all be rendered from one source of
 * truth instead of from hard-coded display strings.
 */

export type WeaponSlot = 'primary' | 'secondary' | 'melee' | 'grenade' | 'tactical';

export const WEAPON_SLOTS: readonly WeaponSlot[] = ['primary', 'secondary', 'melee', 'grenade', 'tactical'];

export const SLOT_LABELS: Record<WeaponSlot, string> = {
  primary: '主武器',
  secondary: '副武器',
  melee: '近战武器',
  grenade: '投掷武器',
  tactical: '战术装备',
};

/** Numeric combat profile for a weapon, sourced from the runtime rule table. */
export interface WeaponStats {
  /** Base damage per damage event. */
  baseDamage: number;
  /** Unit the damage is counted in ("/发", "/次", "/跳", ...). */
  unit: string;
  /** Label shown next to the number, e.g. "基础伤害". */
  label: string;
  /** Seconds between shots. Null = not a repeating shooter (melee/throw). */
  fireInterval: number | null;
  /** Rounds per magazine. Null = unlimited ammunition. */
  magazine: number | null;
  /** Reserve rounds carried outside the magazine. Null = unlimited. */
  reserve: number | null;
  /** Seconds to reload. Null = weapon does not reload. */
  reloadTime: number | null;
  /** Extra weapon traits (pellet counts, auto-reload, reserve regen, ...). */
  extras?: Record<string, number | boolean>;
}

export interface WeaponDef {
  id: string;
  name: string;
  slot: WeaponSlot;
  /** Display category, e.g. "主武器（黄金冲锋枪）". */
  category: string;
  /** 1..6, drives the codex colour ramp. */
  quality: number;
  qualityLabel: string;
  icon: string;
  price: number;
  /** One line, used by the shop. */
  tagline: string;
  /** Full category label used in the codex. */
  typeLabel: string;
  /** Passive effects, one line each. */
  passives: string[];
  /** Active abilities, one line each. */
  actives: string[];
  /** True when the weapon is granted to every new profile. */
  isDefault: boolean;
  stats: WeaponStats;
}

/**
 * An elite ability.
 *
 * The legacy implemented 18 of the 33 configured elite abilities and silently
 * did nothing for the other 15. These 18 are ported here with their original
 * numbers; the remaining 15 reuse the boss skill registry.
 */
export interface EliteSkillDef {
  id: string;
  /** Display name. */
  name: string;
  /** Behaviour archetype. */
  kind:
    | 'dash'
    | 'pull'
    | 'blink'
    | 'cloud'
    | 'leap'
    | 'transmute'
    | 'blast'
    | 'volley'
    | 'quake'
    | 'bind'
    | 'scatter';
  /** Distance covered by a dash, in world units. */
  dash?: number;
  /** Distance the player is pulled, in world units. */
  pull?: number;
  /** Radius the elite teleports to, in world units. */
  blink?: number;
  /** Radius of the created cloud or blast, in world units. */
  radius?: number;
  /** Lifetime of the created cloud, in seconds. */
  duration?: number;
  /** Distance within which the hit lands. */
  hitRange?: number;
  /** Damage multiplier applied to the elite's damage. */
  damageMult: number;
  /** Slow applied to the player. */
  slow?: { duration: number; amount: number };
  /** Root applied to the player. */
  root?: { duration: number };
  /** Burn applied to the player. */
  burn?: { duration: number };
  /** Number of projectiles. */
  projectiles?: number;
  /** Half-angle spread between projectiles, in radians. */
  spread?: number;
  /** Projectile speed, in world units per second. */
  speed?: number;
  /** Projectile lifetime, in seconds. */
  life?: number;
  /** Projectile hit radius, in world units. */
  radius2?: number;
  /** Distance within which the slow lands. */
  slowRange?: number;
}

export interface EnemyDef {
  name: string;
  desc: string;
  colors: { body: number; head: number; accent: number };
  speed: number;
  attackRange: number;
  damage: number;
  /** Seconds between ranged shots (ranged archetype only). */
  shootInterval?: number;
  /** Elite ability id. */
  skill?: string;
  /** Elite ability display name (curated, never a placeholder). */
  skillName?: string;
  skillCooldown?: number;
}

export interface BossSkillRef {
  /** Skill id, matches the BOSS_SKILLS registry. */
  id: string;
  /** Display name, resolved from the BOSS_SKILLS registry. */
  name: string;
  /** Cooldown in seconds, from the BOSS_SKILLS registry. */
  cooldown: number;
}

export interface BossDef {
  name: string;
  desc: string;
  colors: { body: number; head: number; accent: number };
  speed: number;
  attackRange: number;
  damage: number;
  shootInterval?: number;
  /** Skill ids, resolved against the boss skill table. */
  skills: BossSkillRef[];
  /** Passive id, resolved against the boss passive table. */
  passive: string | null;
  /** Display name for `passive`, curated — never "专属被动". */
  passiveName: string;
}

export type TerrainType = 'flat' | 'slope' | 'ramp' | 'terraces' | 'bowl' | 'hills' | 'pyramid' | 'canyon';

export interface LevelTheme {
  sky: number;
  fog: number;
  fogNear: number;
  fogFar: number;
  ground: number;
  groundRough: number;
  groundMetal: number;
  wall: number;
  wallRough: number;
  wallOpacity: number;
  hemiSky: number;
  hemiGround: number;
  ambient: number;
  dirColor: number;
  dirX: number;
  dirY: number;
  dirZ: number;
  accentLight: number;
}

/** A hole in the floor — walking in means falling out of the arena. */
export interface VoidRegion {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export type HazardKind = 'spike' | 'laser' | 'door' | 'crusher' | 'steam' | 'saw';

export interface HazardDef {
  kind: HazardKind;
  x: number;
  z: number;
  /** Footprint width (x) and depth (z). 0 means a point hazard. */
  w: number;
  d: number;
  /** Fraction of the cycle the hazard is lethal/active. */
  pct: number;
  /** Full cycle length in seconds. */
  cd: number;
  /** Travel distance for moving hazards. */
  path?: number;
}

export interface BouncePad {
  x: number;
  z: number;
  /** Activation radius. */
  r: number;
  /** Launch speed. */
  power: number;
  /** Landing point. */
  tx: number;
  tz: number;
}

export type BuffKind = 'dmg' | 'speed' | 'regen' | 'shield' | 'energy' | 'crit';

export interface BuffPickup {
  x: number;
  z: number;
  kind: BuffKind;
}

export interface LevelTerrain {
  type: TerrainType;
  h?: number;
  bw?: number;
  w?: number;
  steps?: number;
  step?: number;
  r?: number;
  f?: number;
}

export interface LevelDef {
  id: number;
  name: string;
  subtitle: string;
  /** 1..10 — chapter index. */
  chapter: number;
  /** Chapter display name. */
  chapterName: string;
  theme: LevelTheme;
  decoType: string;
  coverPattern: string;
  decoDensity: number;
  boundsScale: number;
  /**
   * Wave layout. `minion` holds the enemy count of each non-boss wave; the
   * final wave is always the boss wave.
   *
   * Legacy levels 31-50 stored a third non-zero count (48-64) in
   * LEVEL_WAVE_COUNTS, but `startNextWave()` overwrote it to 0, so boss waves
   * never spawn minions. `bossWaveMinions` therefore reflects the effective
   * runtime behaviour, and the discarded legacy value is recorded in the
   * migration manifest.
   */
  waves: { minion: number[]; bossWaveMinions: number };
  melee: EnemyDef;
  ranged: EnemyDef;
  elite: EnemyDef;
  boss: BossDef;
  /** Terrain heightfield; absent for the flat early chapters. */
  terrain?: LevelTerrain;
  /** Cliff / pit regions. */
  voids: VoidRegion[];
  hazards: HazardDef[];
  pads: BouncePad[];
  buffs: BuffPickup[];
  /** Visual archetype for the enemy meshes, driven by the legacy ENEMY_SHAPES table. */
  shapes: { archetype: string };
}

export interface DifficultyDef {
  /** 1..10 */
  tier: number;
  label: string;
  /** HP and damage multiplier. */
  multiplier: number;
  color: string;
  speedMul: number;
  fireRateMul: number;
  /** Extra chance of spawning an elite instead of a normal enemy. */
  eliteBonus: number;
  /** Enemy affix id, null for the standard affix. */
  affix: 'armored' | 'swift' | 'regen' | null;
  affixName: string;
}

export interface BossSkillDef {
  id: string;
  /** Curated display name. */
  name: string;
  /** What the skill does, one line. */
  desc: string;
  /** Cooldown in seconds, from the legacy BOSS_SKILLS registry. */
  cooldown: number;
  /** Behaviour archetype — decides how the skill is executed and telegraphed. */
  archetype: BossSkillArchetype;
  /** Damage coefficient applied on hit (multiplied by the boss damage). */
  damage: number;
  /** Radius of the danger zone, in world units. */
  radius: number;
  /** Wind-up before the attack resolves, in seconds. */
  windup: number;
  /** Recovery after the attack resolves, in seconds. */
  recovery: number;
  /** Number of projectiles / hits / summons. */
  count: number;
  /** Projectile speed in world units per second (projectile archetypes). */
  speed: number;
  /** Duration of the lingering effect, in seconds (zone / summon archetypes). */
  duration: number;
}

export type BossSkillArchetype =
  /** A burst of travelling projectiles aimed at the player. */
  | 'projectile'
  /** A damaging circle that appears after a wind-up. */
  | 'ground-aoe'
  /** A lingering hazard zone (pool, cloud, rift). */
  | 'zone'
  /** A continuous beam/sweep that tracks the player. */
  | 'beam'
  /** Summons minions. */
  | 'summon'
  /** A movement / utility effect with no direct damage. */
  | 'utility';

export interface BossPassiveDef {
  id: string;
  name: string;
  desc: string;
  /** Damage reduction fraction, 0..1. */
  damageReduction: number;
  /** Passive effects are applied every tick; this is the tick period in seconds. */
  tickPeriod: number;
  /** Health restored per tick, as a fraction of max health. */
  regenPerTick: number;
}

export interface CharacterDef {
  id: string;
  name: string;
  desc: string;
  /** Star tier 0..8, drives TIER_BONUS. */
  star: number;
  price: number;
}

export interface CompanionDef {
  id: string;
  name: string;
  desc: string;
}

export interface DragoonDef {
  id: string;
  name: string;
  desc: string;
  level: number;
  price: number;
}
