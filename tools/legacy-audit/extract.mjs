// Legacy baseline extractor.
// Opens the frozen legacy prototype in a real browser and dumps the authoritative
// runtime state (data tables, globals, save keys) as JSON for the migration.
// Functions are preserved as source text so behavioral contracts survive the port.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../out');
mkdirSync(outDir, { recursive: true });

const LEGACY = 'file://' + resolve(here, '../../baseline/index.html');

// Serialize with function bodies intact.
const SERIALIZER = `(value) => {
  const seen = new WeakSet();
  const fnSrc = (f) => {
    try { return '__FN__' + Function.prototype.toString.call(f); } catch (e) { return '__FN_ERR__'; }
  };
  const walk = (v, depth) => {
    if (depth > 14) return '__DEPTH__';
    if (v === null) return null;
    const t = typeof v;
    if (t === 'function') return fnSrc(v);
    if (t === 'undefined') return '__UNDEF__';
    if (t === 'number' && !Number.isFinite(v)) return '__' + String(v) + '__';
    if (t !== 'object') return v;
    if (seen.has(v)) return '__CIRC__';
    seen.add(v);
    if (Array.isArray(v)) return v.map((x) => walk(x, depth + 1));
    const o = {};
    for (const k of Object.keys(v)) {
      try { o[k] = walk(v[k], depth + 1); } catch (e) { o[k] = '__ERR__'; }
    }
    return o;
  };
  return walk(value, 0);
}`;

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
const page = await context.newPage();

const consoleErrors = [];
const pageErrors = [];
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') {
    consoleErrors.push({ type: m.type(), text: m.text().slice(0, 400) });
  }
});
page.on('pageerror', (e) => pageErrors.push(String(e.message || e).slice(0, 400)));

await page.goto(LEGACY, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(6000);

const dump = async (name, expr) => {
  const raw = await page.evaluate(
    ({ code, ser }) => {
      const serFn = eval('(' + ser + ')');
      try {
        const v = eval(code);
        if (v === undefined) return { ok: false, reason: 'undefined' };
        return { ok: true, data: serFn(v) };
      } catch (e) {
        return { ok: false, reason: String(e && e.message ? e.message : e) };
      }
    },
    { code: expr, ser: SERIALIZER }
  );
  writeFileSync(resolve(outDir, name + '.json'), JSON.stringify(raw, null, 2));
  const size = JSON.stringify(raw).length;
  console.log(`${name.padEnd(28)} ${raw.ok ? 'OK' : 'FAIL(' + raw.reason + ')'}  ${(size / 1024).toFixed(1)} KB`);
  return raw;
};

const TABLES = {
  'levels': 'window.LEVELS',
  'level-wave-counts': 'window.LEVEL_WAVE_COUNTS',
  'boss-blueprints': 'window.BOSS_BLUEPRINTS',
  'weapon-display-data': 'window.WEAPON_DISPLAY_DATA',
  'weapon-full-desc': 'window.WEAPON_FULL_DESC',
  'dragoons': 'window.DRAGOONS',
  'boss-hp-table': 'window.__BOSS_HP_TABLE__',
  'tier-bonus': 'window.TIER_BONUS',
  'quality-level-colors': 'window.QUALITY_LEVEL_COLORS',
  'companions': 'window.COMPANIONS || window.COMPANION_DATA || null',
  'monsters': 'window.MONSTERS || window.MONSTER_TYPES || null',
  'items': 'window.ITEMS || window.ITEM_DATA || null',
  'enemies': 'window.ENEMIES || window.ENEMY_TYPES || null',
  'weapon-base-dmg': 'window.WEAPON_BASE_DMG || window.WEAPON_BASE_DAMAGE || null',
  'global-registry': `(() => {
    const out = {};
    for (const k of Object.keys(window)) {
      if (k.startsWith('__') || k === 'webkitStorageInfo') continue;
      const t = typeof window[k];
      if (t === 'function' || t === 'object') out[k] = t;
    }
    return out;
  })()`,
  'localstorage-keys': `(() => {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k);
      out[k] = v.length > 20000 ? v.slice(0, 20000) + '__TRUNC__' : v;
    }
    return out;
  })()`,
  'save-fn-sources': `(() => {
    const names = ['loadSave','saveGame','saveData','loadData','exportSave','importSave','getOwnedWeapons',
      'getWeaponBaseDmg','applyDifficulty','getDifficulty','updateDifficulty','startLevel','spawnWave',
      'spawnEnemy','endLevel','levelComplete','gameOver','restartLevel','calcReward'];
    const out = {};
    for (const n of names) { if (typeof window[n] === 'function') out[n] = String(window[n]); }
    return out;
  })()`,
};

for (const [name, expr] of Object.entries(TABLES)) {
  await dump(name, expr);
}

writeFileSync(
  resolve(outDir, 'runtime-errors.json'),
  JSON.stringify({ consoleErrors: consoleErrors.slice(0, 200), pageErrors: pageErrors.slice(0, 200) }, null, 2)
);
console.log('\nconsole errors/warnings:', consoleErrors.length, ' page errors:', pageErrors.length);
for (const e of pageErrors.slice(0, 10)) console.log('  PAGEERROR:', e);
for (const e of consoleErrors.slice(0, 10)) console.log(`  ${e.type}:`, e.text.slice(0, 200));

await browser.close();
