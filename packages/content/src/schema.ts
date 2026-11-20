/**
 * Runtime schema validation for the content pack.
 *
 * The legacy build shipped every data table as a bare object literal with no
 * validation, which is how placeholder names and inverted cliff rectangles
 * reached production. The content pack is validated at load time so a broken
 * entry fails fast and loudly instead of silently degrading in-game.
 */
import { z } from 'zod';

const hexColor = z.number().int().min(0).max(0xffffff);

const enemySchema = z.object({
  name: z.string().min(1),
  desc: z.string(),
  colors: z.object({ body: hexColor, head: hexColor, accent: hexColor }),
  speed: z.number().positive(),
  attackRange: z.number().positive(),
  damage: z.number().nonnegative(),
  shootInterval: z.number().positive().optional(),
  skill: z.string().optional(),
  skillName: z.string().optional(),
  skillCooldown: z.number().positive().optional(),
});

const bossSkillSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cooldown: z.number().positive(),
});

const bossSchema = z.object({
  name: z.string().min(1),
  desc: z.string(),
  colors: z.object({ body: hexColor, head: hexColor, accent: hexColor }),
  speed: z.number().positive(),
  attackRange: z.number().positive(),
  damage: z.number().nonnegative(),
  shootInterval: z.number().positive().optional(),
  skills: z.array(bossSkillSchema).min(1),
  passive: z.string().nullable(),
  passiveName: z.string(),
});

const themeSchema = z.object({
  sky: hexColor,
  fog: hexColor,
  fogNear: z.number(),
  fogFar: z.number().positive(),
  ground: hexColor,
  groundRough: z.number().min(0).max(1),
  groundMetal: z.number().min(0).max(1),
  wall: hexColor,
  wallRough: z.number().min(0).max(1),
  wallOpacity: z.number().min(0).max(1),
  hemiSky: hexColor,
  hemiGround: hexColor,
  ambient: hexColor,
  dirColor: hexColor,
  dirX: z.number(),
  dirY: z.number(),
  dirZ: z.number(),
  accentLight: hexColor,
});

const voidSchema = z.object({
  minX: z.number(),
  maxX: z.number(),
  minZ: z.number(),
  maxZ: z.number(),
});

const hazardSchema = z.object({
  kind: z.enum(['spike', 'laser', 'door', 'crusher', 'steam', 'saw']),
  x: z.number(),
  z: z.number(),
  w: z.number().nonnegative(),
  d: z.number().nonnegative(),
  pct: z.number().min(0).max(1),
  cd: z.number().positive(),
  path: z.number().nonnegative().optional(),
});

const padSchema = z.object({
  x: z.number(),
  z: z.number(),
  r: z.number().positive(),
  power: z.number().positive(),
  tx: z.number(),
  tz: z.number(),
});

const buffSchema = z.object({
  x: z.number(),
  z: z.number(),
  kind: z.enum(['dmg', 'speed', 'regen', 'shield', 'energy', 'crit']),
});

export const levelSchema = z.object({
  id: z.number().int().min(1).max(50),
  name: z.string().min(1),
  subtitle: z.string(),
  chapter: z.number().int().min(1).max(10),
  chapterName: z.string().min(1),
  theme: themeSchema,
  decoType: z.string().min(1),
  coverPattern: z.string().min(1),
  decoDensity: z.number().positive(),
  boundsScale: z.number().positive(),
  waves: z.object({
    minion: z.array(z.number().int().nonnegative()),
    bossWaveMinions: z.number().int().nonnegative(),
  }),
  melee: enemySchema,
  ranged: enemySchema,
  elite: enemySchema,
  boss: bossSchema,
  terrain: z.object({
    type: z.enum(['flat', 'slope', 'ramp', 'terraces', 'bowl', 'hills', 'pyramid', 'canyon']),
    h: z.number().optional(),
    bw: z.number().optional(),
    w: z.number().optional(),
    steps: z.number().optional(),
    step: z.number().optional(),
    r: z.number().optional(),
    f: z.number().optional(),
  }),
  voids: z.array(voidSchema),
  hazards: z.array(hazardSchema),
  pads: z.array(padSchema),
  buffs: z.array(buffSchema),
  shapes: z.object({ archetype: z.string().min(1) }),
});

const weaponStatsSchema = z.object({
  baseDamage: z.number().nonnegative(),
  unit: z.string(),
  label: z.string(),
  fireInterval: z.number().positive().nullable(),
  magazine: z.number().int().positive().nullable(),
  reserve: z.number().int().nonnegative().nullable(),
  reloadTime: z.number().positive().nullable(),
  extras: z.record(z.union([z.number(), z.boolean()])).optional(),
});

export const weaponSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slot: z.enum(['primary', 'secondary', 'melee', 'grenade', 'tactical']),
  category: z.string().min(1),
  quality: z.number().int().min(1).max(9),
  qualityLabel: z.string(),
  icon: z.string(),
  price: z.number().int().nonnegative(),
  tagline: z.string(),
  typeLabel: z.string().min(1),
  passives: z.array(z.string()),
  actives: z.array(z.string()),
  isDefault: z.boolean(),
  stats: weaponStatsSchema,
});

export const difficultySchema = z.object({
  tier: z.number().int().min(1).max(10),
  label: z.string().min(1),
  multiplier: z.number().positive(),
  color: z.string(),
  speedMul: z.number().positive(),
  fireRateMul: z.number().positive(),
  eliteBonus: z.number().min(0).max(1),
  affix: z.enum(['armored', 'swift', 'regen']).nullable(),
  affixName: z.string().min(1),
});

/** Placeholder copy that must never survive into the shipping content pack. */
const PLACEHOLDER_PATTERNS = [
  /技能[一二三四五六]$/,
  /专属被动$/,
  /的(近战单位|远程单位|精英单位|统治者)$/,
  /^精英技$/,
];

export function findPlaceholderCopy(level: {
  name: string;
  melee: { name: string; desc: string };
  ranged: { name: string; desc: string };
  elite: { name: string; desc: string };
  boss: { name: string; desc: string };
}): string[] {
  const problems: string[] = [];
  const check = (label: string, text: string) => {
    for (const re of PLACEHOLDER_PATTERNS) {
      if (re.test(text)) problems.push(`${label}: "${text}"`);
    }
  };
  for (const key of ['melee', 'ranged', 'elite', 'boss'] as const) {
    const e = level[key];
    check(`${level.name}.${key}.name`, e.name);
    check(`${level.name}.${key}.desc`, e.desc);
  }
  return problems;
}
