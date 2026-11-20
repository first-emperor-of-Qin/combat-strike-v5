// Extracts every numeric constant from the legacy baseline (in source order) and
// resolves the WEAPON_CATALOG getter table against them, yielding the real
// runtime weapon stats that the legacy codex merely mirrors as display strings.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../out');
mkdirSync(outDir, { recursive: true });
const src = readFileSync(resolve(here, '../../baseline/index.html'), 'utf8');

function matchBraces(text, start) {
  let depth = 0, inStr = null, inComment = null;
  for (let i = start; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (inComment === 'line') { if (c === '\n') inComment = null; continue; }
    if (inComment === 'block') { if (c === '*' && n === '/') { inComment = null; i++; } continue; }
    if (inStr) { if (c === '\\') { i++; continue; } if (c === inStr) inStr = null; continue; }
    if (c === '/' && n === '/') { inComment = 'line'; i++; continue; }
    if (c === '/' && n === '*') { inComment = 'block'; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i; }
  }
  return -1;
}

// 1) Collect numeric constants in source order.
const constants = [];
const constRe = /(?:^|\n)\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(-?\d+(?:\.\d+)?)\s*;/g;
let m;
while ((m = constRe.exec(src)) !== null) {
  constants.push({ name: m[1], value: Number(m[2]), index: m.index });
}
const constMap = Object.fromEntries(constants.map((c) => [c.name, c.value]));
console.log('numeric constants captured:', constants.length);

// 2) Extract WEAPON_CATALOG literal and resolve it with the constants in scope.
const catRe = /\bconst WEAPON_CATALOG\s*=\s*\{/;
const cm = catRe.exec(src);
let catalog = null;
let catalogError = null;
if (cm) {
  const brace = src.indexOf('{', cm.index);
  const end = matchBraces(src, brace);
  const literal = src.slice(brace, end + 1);
  try {
    const scope = Object.entries(constMap).map(([k, v]) => `const ${k}=${v};`).join('\n');
    // eslint-disable-next-line no-new-func
    catalog = new Function(`${scope}\nreturn (${literal});`)();
  } catch (e) {
    catalogError = String(e.message);
    console.log('WEAPON_CATALOG eval error:', catalogError);
  }
} else {
  console.log('WEAPON_CATALOG not found');
}

// 3) Resolve the catalog's getter values into plain numbers.
const resolved = {};
if (catalog) {
  for (const [key, def] of Object.entries(catalog)) {
    const entry = {};
    for (const [prop, val] of Object.entries(def)) {
      try {
        entry[prop] = typeof val === 'function' ? val.call(def) : val;
      } catch (e) {
        entry[prop] = `__ERR__:${e.message}`;
      }
    }
    resolved[key] = entry;
  }
}

const out = { source: 'baseline/index.html', constantCount: constants.length, constants: constMap, weaponCatalog: resolved };
writeFileSync(resolve(outDir, 'legacy-constants.json'), JSON.stringify(out, null, 2));

console.log('WEAPON_CATALOG entries resolved:', Object.keys(resolved).length);
const sample = Object.entries(resolved).slice(0, 5);
for (const [k, v] of sample) console.log(' ', k, JSON.stringify(v));
const errs = Object.entries(resolved).filter(([, v]) => Object.values(v).some((x) => typeof x === 'string' && x.startsWith('__ERR__')));
if (errs.length) console.log('ERRORS in', errs.map(([k]) => k).join(', '));
