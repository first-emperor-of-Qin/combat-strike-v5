// Content import: transforms the audited legacy baseline into the typed content
// pack consumed by @combat-strike/content.
//
// Inputs (all produced by tools/legacy-audit/*):
//   out/deep.json                 levels, weapons, boss blueprints, boss skills
//   out/legacy-snapshot.json      wave counts, difficulty, terrain tables
//   out/legacy-constants.json     runtime numeric constants
//   out/weapon-display-data.json  weapon display table
//   out/weapon-full-desc.json     weapon long-form copy
//
// Outputs:
//   packages/content/src/generated/levels.ts
//   packages/content/src/generated/weapons.ts
//   packages/content/src/generated/difficulty.ts
//   packages/content/src/generated/boss-skills.ts
//   packages/content/src/generated/manifest.ts
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const outDir = resolve(root, 'tools/out');
const genDir = resolve(root, 'packages/content/src/generated');
mkdirSync(genDir, { recursive: true });

const read = (f) => JSON.parse(readFileSync(resolve(outDir, f), 'utf8'));
const deep = read('deep.json');
const snapshot = read('legacy-snapshot.json');
const constants = read('legacy-constants.json').constants;
const wdd = read('weapon-display-data.json').data;
const wfd = read('weapon-full-desc.json').data;

const COPY = JSON.parse(readFileSync(resolve(root, 'packages/content/src/curated/copy.json'), 'utf8'));
const RUNTIME = JSON.parse(readFileSync(resolve(root, 'packages/content/src/curated/weapon-runtime.json'), 'utf8'));
const CATALOG = read('legacy-constants.json').weaponCatalog;

/**
 * Elite-only abilities that live outside the BOSS_SKILLS registry. The legacy
 * shipped per-level authored names for them in levels 1-30 (寒霜突刺,
 * 绝对零度突刺, ...) and the placeholder "精英技" in the generated levels.
 */
const ELITE_SKILL_NAMES = JSON.parse(
  readFileSync(resolve(root, 'packages/content/src/curated/elite-skills.json'), 'utf8')
);
const isPlaceholderName = (text) => !text || text === '精英技';

// ---------------------------------------------------------------- weapons
const SLOT_BY_TYPE = {
  primary: 'primary',
  secondary: 'secondary',
  melee: 'melee',
  grenade: 'grenade',
  tactical: 'tactical',
};

const weapons = Object.keys(wdd)
  .map((id) => {
    const d = wdd[id];
    const f = wfd[id] || {};
    const cat = CATALOG[id] || {};
    const rt = RUNTIME[id] || {};
    const extras = { ...(rt.extras || {}) };
    for (const [k, v] of Object.entries(cat)) {
      if (k === 'unit' || k === 'label' || k === 'baseDmg') continue;
      extras[k] = v;
    }
    // The legacy catalogue names the primary damage field differently per
    // weapon archetype (baseDmgLight/baseDmgHeavy, baseDmgFirst/baseDmgSecond).
    const baseDamage =
      cat.baseDmg ??
      cat.baseDmgLight ??
      cat.baseDmgFirst ??
      cat.baseDmgHeavy ??
      0;
    return {
      id,
      name: d.name,
      slot: SLOT_BY_TYPE[d.slotType] || 'primary',
      category: d.category,
      quality: d.quality ?? 1,
      qualityLabel: d.qualityLabel ?? '',
      icon: d.icon ?? '',
      price: f.price ?? 0,
      tagline: f.tagline ?? '',
      typeLabel: f.typeLabel ?? d.category,
      passives: Array.isArray(f.passives) ? f.passives : f.passives ? [f.passives] : [],
      actives: Array.isArray(f.actives) ? f.actives : f.actives ? [f.actives] : [],
      isDefault: !!f.isDefault,
      stats: {
        baseDamage,
        unit: cat.unit ?? '',
        label: cat.label ?? '基础伤害',
        fireInterval: rt.fireInterval ?? null,
        magazine: rt.magazine ?? null,
        reserve: rt.reserve ?? null,
        reloadTime: rt.reloadTime ?? null,
        extras: Object.keys(extras).length ? extras : undefined,
      },
    };
  })
  .sort((a, b) => a.slot.localeCompare(b.slot) || a.quality - b.quality || a.name.localeCompare(b.name));

const weaponsWithoutRuntime = weapons.filter((w) => w.stats.baseDamage === 0 && w.slot !== 'tactical').map((w) => w.id);


// ---------------------------------------------------------------- chapters
const CHAPTERS = [
  { index: 1, name: '异境试炼', from: 1, to: 5 },
  { index: 2, name: '元素试炼', from: 6, to: 10 },
  { index: 3, name: '霜寂冰原', from: 11, to: 15 },
  { index: 4, name: '虚空核心', from: 16, to: 20 },
  { index: 5, name: '曦金古城', from: 21, to: 25 },
  { index: 6, name: '苍穹圣域', from: 26, to: 30 },
  { index: 7, name: '裂隙纪元 · 崩塌之地', from: 31, to: 35 },
  { index: 8, name: '裂隙纪元 · 机关回廊', from: 36, to: 40 },
  { index: 9, name: '裂隙纪元 · 法则扭曲', from: 41, to: 45 },
  { index: 10, name: '裂隙纪元 · 终焉王座', from: 46, to: 50 },
];
const chapterOf = (lv) => CHAPTERS.find((c) => lv >= c.from && lv <= c.to);

// ---------------------------------------------------------------- boss tables
const bossSkills = deep.BOSS_SKILLS;
const bossPassives = deep.BOSS_PASSIVES;
const blueprints = deep.BOSS_BP_SUMMARY;

// ---------------------------------------------------------------- levels
const legacyWaveCounts = snapshot.LEVEL_WAVE_COUNTS;
const levels = [];
const manifestRows = [];

for (const entry of deep.LEVEL_SUMMARY) {
  if (!entry.raw) continue;
  const lv = entry.raw;
  const id = entry.index;
  const bp = blueprints[id - 1] || {};
  const chap = chapterOf(id);
  const copy = COPY[String(id)];

  const rawWaves = legacyWaveCounts[String(id)] || [100, 100, 0];
  const effectiveBossWave = 0; // startNextWave() overwrote wave 3 to 0.

  const rawBlueprint = deep.BOSS_BP_RAW ? deep.BOSS_BP_RAW[String(id)] : null;

  // The legacy shipped two inverted cliff rectangles (levels 31 and 39:
  // minX > maxX) which rendered a visible pit but could never be walked into.
  // Normalising the bounds makes the geometry match what the level depicts.
  const rawVoids = snapshot.LEVEL_VOID[String(id)] || [];
  const voids = rawVoids.map((v) => ({
    minX: Math.min(v.minX, v.maxX),
    maxX: Math.max(v.minX, v.maxX),
    minZ: Math.min(v.minZ, v.maxZ),
    maxZ: Math.max(v.minZ, v.maxZ),
  }));
  const voidBoundsFixed = rawVoids.some(
    (v) => v.minX > v.maxX || v.minZ > v.maxZ
  );

  // Boss: display name from the authored LEVELS entry (theme-correct and what
  // the level-select card shows); mechanics from the blueprint (the only path
  // the runtime actually instantiates); skill/passive names + cooldowns from
  // the BOSS_SKILLS / BOSS_PASSIVES registries.
  const skillIds = (bp.skills || []).filter((s) => bossSkills[s]);
  const bossSkillsOut = skillIds.map((sid) => ({
    id: sid,
    name: bossSkills[sid].name,
    cooldown: bossSkills[sid].cooldown,
  }));
  const passiveId = bp.passive && bossPassives[bp.passive] ? bp.passive : null;

  // Template detection is per-entity: level 12 has a hand-written melee
  // description but still ships the generated boss blurb.
  const isTemplated = (text) => /的(近战单位|远程单位|精英单位|统治者)$/.test(text || '');
  const templatedMelee = isTemplated(lv.melee.desc);
  const templatedRanged = isTemplated(lv.ranged.desc);
  const templatedElite = isTemplated(lv.elite.desc);
  const templatedBoss = isTemplated(lv.boss.desc);
  const templated = templatedMelee || templatedRanged || templatedElite || templatedBoss;
  if (templated && !copy) {
    throw new Error(
      `level ${id} (${lv.name}) ships templated copy but has no entry in packages/content/src/curated/copy.json`
    );
  }

  levels.push({
    id,
    name: lv.name,
    subtitle: lv.subtitle || '',
    chapter: chap.index,
    chapterName: chap.name,
    theme: lv.theme,
    decoType: lv.decoType,
    coverPattern: lv.coverPattern,
    decoDensity: lv.decoDensity,
    boundsScale: lv.boundsScale,
    waves: { minion: rawWaves.slice(0, 2), bossWaveMinions: effectiveBossWave },
    melee: {
      name: lv.melee.name,
      desc: templatedMelee ? copy.melee : lv.melee.desc,
      colors: lv.melee.colors,
      speed: lv.melee.speed,
      attackRange: lv.melee.attackRange,
      damage: lv.melee.damage,
    },
    ranged: {
      name: lv.ranged.name,
      desc: templatedRanged ? copy.ranged : lv.ranged.desc,
      colors: lv.ranged.colors,
      speed: lv.ranged.speed,
      attackRange: lv.ranged.attackRange,
      damage: lv.ranged.damage,
      shootInterval: lv.ranged.shootInterval,
    },
    elite: {
      name: lv.elite.name,
      desc: templatedElite ? copy.elite : lv.elite.desc,
      colors: lv.elite.colors,
      speed: lv.elite.speed,
      attackRange: lv.elite.attackRange,
      damage: lv.elite.damage,
      skill: lv.elite.skill,
      skillName: bossSkills[lv.elite.skill]?.name
        || (isPlaceholderName(lv.elite.skillName) ? ELITE_SKILL_NAMES[lv.elite.skill] : lv.elite.skillName),
      skillCooldown: lv.elite.skillCooldown,
    },
    boss: {
      name: lv.boss.name,
      desc: templatedBoss ? copy.boss : lv.boss.desc,
      colors: lv.boss.colors,
      speed: bp.speed ?? lv.boss.speed,
      attackRange: bp.attackRange ?? lv.boss.attackRange,
      damage: bp.damage ?? lv.boss.damage,
      shootInterval: bp.shootInterval,
      skills: bossSkillsOut,
      passive: passiveId,
      passiveName: passiveId ? bossPassives[passiveId].name : '无',
    },
    terrain: snapshot.LEVEL_TERRAIN[String(id)] || { type: 'flat' },
    voids,
    hazards: snapshot.LEVEL_HAZARDS[String(id)] || [],
    pads: snapshot.LEVEL_PADS[String(id)] || [],
    buffs: snapshot.LEVEL_BUFFS[String(id)] || [],
    shapes: { archetype: deep.ENEMY_SHAPES?.[id - 1] ?? 'golem' },
  });

  manifestRows.push({
    level: id,
    name: lv.name,
    chapter: chap.index,
    bossName: lv.boss.name,
    blueprintBossName: bp.name,
    nameDiverged: bp.name !== lv.boss.name,
    legacyWaveCounts: rawWaves,
    effectiveWaveCounts: [rawWaves[0], rawWaves[1], effectiveBossWave],
    droppedThirdWaveCount: rawWaves[2] !== effectiveBossWave ? rawWaves[2] : null,
    templatedCopy: templated,
    hasTerrain: !!snapshot.LEVEL_TERRAIN[String(id)],
    hazardCount: (snapshot.LEVEL_HAZARDS[String(id)] || []).length,
    voidCount: voids.length,
    voidBoundsFixed,
  });
}

// ---------------------------------------------------------------- difficulty
const difficulty = Object.entries(snapshot.DIFFICULTY_CONFIG)
  .map(([tier, d]) => ({
    tier: Number(tier),
    label: d.label,
    multiplier: d.multiplier,
    color: d.color,
    speedMul: d.speedMul,
    fireRateMul: d.fireRateMul,
    eliteBonus: d.eliteBonus,
    affix: d.affix,
    affixName: d.affixName,
  }))
  .sort((a, b) => a.tier - b.tier);

// ---------------------------------------------------------------- boss skills
const SKILL_BEHAVIOUR = JSON.parse(
  readFileSync(resolve(root, 'packages/content/src/curated/boss-skills.json'), 'utf8')
);
const PASSIVE_BEHAVIOUR = JSON.parse(
  readFileSync(resolve(root, 'packages/content/src/curated/boss-passives.json'), 'utf8')
);

const bossSkillDefs = Object.values(bossSkills).map((s) => ({
  id: s.id,
  name: s.name,
  cooldown: s.cooldown,
  ...SKILL_BEHAVIOUR[s.id],
}));
const bossPassiveDefs = Object.values(bossPassives).map((p) => ({
  id: p.id,
  name: p.name,
  ...PASSIVE_BEHAVIOUR[p.id],
}));

// ---------------------------------------------------------------- writers
const banner = `/**
 * GENERATED FILE — do not edit by hand.
 * Source: tools/legacy-audit/out/* (audited legacy baseline)
 * Regenerate: npm run content:import
 */
`;

const ts = (value) => JSON.stringify(value, null, 2);

writeFileSync(
  resolve(genDir, 'levels.ts'),
  `${banner}\nimport type { LevelDef } from '../types.js';\n\nexport const LEVELS: LevelDef[] = ${ts(levels)};\n`
);
writeFileSync(
  resolve(genDir, 'difficulty.ts'),
  `${banner}\nimport type { DifficultyDef } from '../types.js';\n\nexport const DIFFICULTIES: DifficultyDef[] = ${ts(difficulty)};\n`
);
writeFileSync(
  resolve(genDir, 'boss-skills.ts'),
  `${banner}\nimport type { BossSkillDef, BossPassiveDef } from '../types.js';\n\nexport const BOSS_SKILLS: BossSkillDef[] = ${ts(
    bossSkillDefs
  )};\n\nexport const BOSS_PASSIVES: BossPassiveDef[] = ${ts(bossPassiveDefs)};\n`
);
writeFileSync(
  resolve(genDir, 'boss-hp.ts'),
  `${banner}\n/** Transcribed verbatim from the legacy window.__BOSS_HP_TABLE__ (baseline index.html:6375). */\nexport const BOSS_HP_TABLE: readonly number[] = ${ts(
    read('boss-hp-table.json').data
  )};\n`
);

writeFileSync(
  resolve(genDir, 'weapons.ts'),
  `${banner}\nimport type { WeaponDef } from '../types.js';\n\nexport const WEAPONS: WeaponDef[] = ${ts(weapons)};\n`
);
writeFileSync(
  resolve(genDir, 'manifest.ts'),
  `${banner}\nexport interface MigrationRow {\n${''}\x20 level: number;\n  name: string;\n  chapter: number;\n  bossName: string;\n  blueprintBossName: string;\n  nameDiverged: boolean;\n  legacyWaveCounts: number[];\n  effectiveWaveCounts: number[];\n  droppedThirdWaveCount: number | null;\n  templatedCopy: boolean;\n  hasTerrain: boolean;\n  hazardCount: number;\n  voidCount: number;\n  voidBoundsFixed: boolean;\n}\n\nexport const LEVEL_MANIFEST: MigrationRow[] = ${ts(manifestRows)};\n`
);

console.log('levels generated          :', levels.length);
console.log('difficulty tiers generated:', difficulty.length);
console.log('boss skills               :', bossSkillDefs.length);
console.log('boss passives             :', bossPassiveDefs.length);
console.log('levels with templated copy:', manifestRows.filter((r) => r.templatedCopy).length);
console.log('levels with name divergence:', manifestRows.filter((r) => r.nameDiverged).map((r) => r.level).join(', '));
console.log('levels with terrain       :', manifestRows.filter((r) => r.hasTerrain).length);
console.log('boss skills missing from registry:', levels.flatMap((l) => l.boss.skills.map((s) => s.id)).filter((id) => !bossSkills[id]).length);
console.log('levels whose elite skill is unresolvable:', levels.filter((l) => l.elite.skill && !l.elite.skillName).map((l) => l.id).join(', ') || 'none');
console.log('weapons generated         :', weapons.length);
console.log('weapons missing runtime   :', weaponsWithoutRuntime.join(', ') || 'none');
console.log('default weapons           :', weapons.filter((w) => w.isDefault).map((w) => `${w.id}(${w.slot})`).join(', '));
