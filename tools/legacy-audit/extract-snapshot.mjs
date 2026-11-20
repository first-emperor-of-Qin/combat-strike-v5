// Extracts every data table from the legacy baseline that is NOT reachable
// through window (they live in nested function scopes), by parsing the source
// and evaluating the matched object literals in a throwaway Function scope.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../out');
mkdirSync(outDir, { recursive: true });

const src = readFileSync(resolve(here, '../../baseline/index.html'), 'utf8');

/** Scan forward from `start` (index of '{') to the matching closing brace. */
function matchBraces(text, start) {
  let depth = 0;
  let inStr = null;
  let inComment = null;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    const n = text[i + 1];
    if (inComment === 'line') { if (c === '\n') inComment = null; continue; }
    if (inComment === 'block') { if (c === '*' && n === '/') { inComment = null; i++; } continue; }
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '/' && n === '/') { inComment = 'line'; i++; continue; }
    if (c === '/' && n === '*') { inComment = 'block'; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i; }
  }
  return -1;
}

/** Find `NAME = {` and evaluate the literal. */
function grabObjectLiteral(name, { indexed = false } = {}) {
  const out = {};
  if (indexed) {
    const re = new RegExp(`\\b${name}\\s*\\[\\s*(\\d+)\\s*\\]\\s*=\\s*\\{`, 'g');
    let m;
    while ((m = re.exec(src)) !== null) {
      const brace = src.indexOf('{', m.index);
      const end = matchBraces(src, brace);
      if (end < 0) continue;
      const literal = src.slice(brace, end + 1);
      try {
        // eslint-disable-next-line no-new-func
        out[m[1]] = new Function(`return (${literal});`)();
      } catch (e) {
        out[m[1]] = { __parse_error__: String(e.message) };
      }
      re.lastIndex = end;
    }
    return out;
  }
  const re = new RegExp(`\\b${name}\\s*=\\s*\\{`, 'g');
  let m;
  while ((m = re.exec(src)) !== null) {
    const brace = src.indexOf('{', m.index);
    const end = matchBraces(src, brace);
    if (end < 0) continue;
    const literal = src.slice(brace, end + 1);
    try {
      // eslint-disable-next-line no-new-func
      return new Function(`return (${literal});`)();
    } catch (e) {
      return { __parse_error__: String(e.message), __raw_start__: literal.slice(0, 400) };
    }
  }
  return null;
}

/** Find `NAME[n] = [ ... ];` where the value is an array literal. */
function grabIndexedArrayLiteral(name) {
  const out = {};
  const re = new RegExp(`\\b${name}\\s*\\[\\s*(\\d+)\\s*\\]\\s*=\\s*\\[`, 'g');
  let m;
  while ((m = re.exec(src)) !== null) {
    // m[0] ends with the '[' that opens the VALUE literal (not the index bracket).
    const bracket = m.index + m[0].length - 1;
    let depth = 0, inStr = null, inComment = null, end = -1;
    for (let i = bracket; i < src.length; i++) {
      const c = src[i], n = src[i + 1];
      if (inComment === 'line') { if (c === '\n') inComment = null; continue; }
      if (inComment === 'block') { if (c === '*' && n === '/') { inComment = null; i++; } continue; }
      if (inStr) { if (c === '\\') { i++; continue; } if (c === inStr) inStr = null; continue; }
      if (c === '/' && n === '/') { inComment = 'line'; i++; continue; }
      if (c === '/' && n === '*') { inComment = 'block'; i++; continue; }
      if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
      if (c === '[') depth++;
      else if (c === ']') { depth--; if (depth === 0) { end = i; break; } }
    }
    if (end < 0) continue;
    const literal = src.slice(bracket, end + 1);
    try {
      // eslint-disable-next-line no-new-func
      out[m[1]] = new Function(`return (${literal});`)();
    } catch (e) {
      out[m[1]] = { __parse_error__: String(e.message) };
    }
    re.lastIndex = end;
  }
  return out;
}

/** Find `NAME = [ ... ];` array literal. */
function grabArrayLiteral(name) {
  const re = new RegExp(`\\b${name}\\s*=\\s*\\[`, 'g');
  const m = re.exec(src);
  if (!m) return null;
  const bracket = src.indexOf('[', m.index);
  let depth = 0, inStr = null, inComment = null;
  for (let i = bracket; i < src.length; i++) {
    const c = src[i], n = src[i + 1];
    if (inComment === 'line') { if (c === '\n') inComment = null; continue; }
    if (inComment === 'block') { if (c === '*' && n === '/') { inComment = null; i++; } continue; }
    if (inStr) { if (c === '\\') { i++; continue; } if (c === inStr) inStr = null; continue; }
    if (c === '/' && n === '/') { inComment = 'line'; i++; continue; }
    if (c === '/' && n === '*') { inComment = 'block'; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) {
      try {
        // eslint-disable-next-line no-new-func
        return new Function(`return (${src.slice(bracket, i + 1)});`)();
      } catch (e) { return { __parse_error__: String(e.message) }; }
    } }
  }
  return null;
}

const snapshot = {
  source: 'baseline/index.html',
  extractedAt: new Date().toISOString(),
  LEVEL_WAVE_COUNTS: grabObjectLiteral('LEVEL_WAVE_COUNTS'),
  DIFFICULTY_CONFIG: grabObjectLiteral('DIFFICULTY_CONFIG'),
  LEVEL_TERRAIN: grabObjectLiteral('LEVEL_TERRAIN', { indexed: true }),
  LEVEL_VOID: grabIndexedArrayLiteral('LEVEL_VOID'),
  LEVEL_HAZARDS: grabIndexedArrayLiteral('LEVEL_HAZARDS'),
  LEVEL_PADS: grabIndexedArrayLiteral('LEVEL_PADS'),
  LEVEL_BUFFS: grabIndexedArrayLiteral('LEVEL_BUFFS'),
  ENEMY_SHAPES: grabArrayLiteral('ENEMY_SHAPES'),
};

writeFileSync(resolve(outDir, 'legacy-snapshot.json'), JSON.stringify(snapshot, null, 2));

const r = (o) => (o ? Object.keys(o).length : 0);
console.log('LEVEL_WAVE_COUNTS entries:', r(snapshot.LEVEL_WAVE_COUNTS));
console.log('DIFFICULTY_CONFIG entries:', r(snapshot.DIFFICULTY_CONFIG));
console.log('LEVEL_TERRAIN levels   :', r(snapshot.LEVEL_TERRAIN));
console.log('LEVEL_VOID levels      :', r(snapshot.LEVEL_VOID));
console.log('LEVEL_HAZARDS levels   :', r(snapshot.LEVEL_HAZARDS));
console.log('LEVEL_PADS levels      :', r(snapshot.LEVEL_PADS));
console.log('LEVEL_BUFFS levels     :', r(snapshot.LEVEL_BUFFS));
console.log('ENEMY_SHAPES length    :', Array.isArray(snapshot.ENEMY_SHAPES) ? snapshot.ENEMY_SHAPES.length : 'ERR');
const errs = Object.entries(snapshot).filter(([, v]) => v && v.__parse_error__);
if (errs.length) console.log('PARSE ERRORS:', errs.map(([k, v]) => `${k}: ${v.__parse_error__}`).join(' | '));
console.log('\nterrain types by level:');
for (const [lv, t] of Object.entries(snapshot.LEVEL_TERRAIN)) console.log('  L' + lv.padStart(2), JSON.stringify(t));
