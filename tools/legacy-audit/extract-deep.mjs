// Second-pass extraction: reaches script-scoped `let` bindings (not on window)
// and produces per-entry summaries used to drive the content port.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../out');
mkdirSync(outDir, { recursive: true });
const LEGACY = 'file://' + resolve(here, '../../baseline/index.html');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto(LEGACY, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(5000);

// Indirect eval runs in global scope, so script-scoped `let` bindings ARE visible.
const res = await page.evaluate(() => {
  const g = (0, eval);
  const out = {};

  const grab = (name, expr) => {
    try {
      const v = g(expr);
      out[name] = v === undefined ? { __missing__: true } : JSON.parse(JSON.stringify(v, (k, val) => (typeof val === 'function' ? '__FN__' : val)));
    } catch (e) {
      out[name] = { __error__: String(e && e.message ? e.message : e) };
    }
  };

  grab('LEVEL_WAVE_COUNTS', 'LEVEL_WAVE_COUNTS');
  grab('BOSS_SKILLS', 'BOSS_SKILLS');
  grab('BOSS_PASSIVES', 'BOSS_PASSIVES');
  grab('TIER_DR', 'TIER_DR');
  grab('characterBonuses', 'characterBonuses');

  // Per-level summary straight off the live LEVELS array.
  const L = g('LEVELS');
  out.LEVEL_SUMMARY = [];
  for (let i = 1; i < (L || []).length; i++) {
    const lv = L[i];
    if (!lv) { out.LEVEL_SUMMARY.push({ index: i, missing: true }); continue; }
    out.LEVEL_SUMMARY.push({
      index: i,
      keys: Object.keys(lv),
      name: lv.name,
      chapter: lv.chapter,
      chapterName: lv.chapterName,
      waves: lv.waves,
      boss: lv.boss,
      bossName: lv.bossName,
      terrain: lv.terrain,
      hazards: lv.hazards,
      theme: lv.theme,
      enemyTypes: lv.enemyTypes || lv.enemies || lv.mobs,
      unlockLevel: lv.unlockLevel,
      unlock: lv.unlock,
      melee: lv.melee,
      ranged: lv.ranged,
      elite: lv.elite,
      reward: lv.reward,
      rewardGold: lv.rewardGold,
      difficultyCount: lv.difficulties ? lv.difficulties.length : undefined,
      difficultyIds: lv.difficulties ? lv.difficulties.map((d) => d.id ?? d.level ?? d.name) : undefined,
      raw: lv,
    });
  }

  // Weapon catalogue summary.
  const WD = g('WEAPON_DISPLAY_DATA') || {};
  const WF = g('WEAPON_FULL_DESC') || {};
  out.WEAPON_SUMMARY = Object.keys(WD).map((k) => {
    const d = WD[k] || {};
    const f = WF[k] || {};
    return {
      id: k,
      name: d.name,
      category: d.category,
      slotType: d.slotType,
      quality: d.quality,
      baseDmg: d.baseDmg,
      fireRate: d.fireRate,
      magazine: d.magazine,
      reloadTime: d.reloadTime,
      spread: d.spread,
      pellets: d.pellets,
      price: f.price,
      tagline: f.tagline,
      typeLabel: f.typeLabel,
      bonus: f.bonus,
      passives: f.passives,
      actives: f.actives,
      isDefault: f.isDefault,
      skill: d.skill,
      descKeys: Object.keys(f),
      dispKeys: Object.keys(d),
    };
  });
  out.WEAPON_COUNT = out.WEAPON_SUMMARY.length;
  out.FULL_DESC_COUNT = Object.keys(WF).length;

  // Slot distribution.
  const slots = {};
  for (const w of out.WEAPON_SUMMARY) slots[w.slotType || 'unknown'] = (slots[w.slotType || 'unknown'] || 0) + 1;
  out.SLOT_DISTRIBUTION = slots;

  // Boss blueprint summary.
  const BP = g('BOSS_BLUEPRINTS') || {};
  out.BOSS_BP_SUMMARY = Object.keys(BP).map((k) => ({
    id: k,
    name: BP[k].name,
    title: BP[k].title,
    hp: BP[k].hp,
    damage: BP[k].damage,
    speed: BP[k].speed,
    skills: BP[k].skills,
    phases: BP[k].phases,
    keys: Object.keys(BP[k]),
  }));
  out.BOSS_BP_COUNT = out.BOSS_BP_SUMMARY.length;

  return out;
});

writeFileSync(resolve(outDir, 'deep.json'), JSON.stringify(res, null, 2));

console.log('LEVEL_WAVE_COUNTS:', res.LEVEL_WAVE_COUNTS?.__error__ || (res.LEVEL_WAVE_COUNTS?.__missing__ ? 'MISSING' : 'OK'));
console.log('levels:', res.LEVEL_SUMMARY?.length, 'weapon count:', res.WEAPON_COUNT, 'fullDesc:', res.FULL_DESC_COUNT);
console.log('boss blueprints:', res.BOSS_BP_COUNT);
console.log('slot distribution:', JSON.stringify(res.SLOT_DISTRIBUTION));
console.log('level keys (lvl1):', res.LEVEL_SUMMARY?.[1]?.keys);
console.log('level keys (lvl35):', res.LEVEL_SUMMARY?.[35]?.keys);
console.log('level keys (lvl50):', res.LEVEL_SUMMARY?.[50]?.keys);
console.log('BOSS_SKILLS keys:', Object.keys(res.BOSS_SKILLS || {}));
console.log('BOSS_PASSIVES keys:', Object.keys(res.BOSS_PASSIVES || {}));

await browser.close();
