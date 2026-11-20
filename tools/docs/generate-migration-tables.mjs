/**
 * Regenerates the level and weapon tables in docs/MIGRATION.md from the
 * content pack, so the manifest can never drift from the shipped data.
 *
 * Usage: node tools/docs/generate-migration-tables.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '../..');

const levelsRaw = readFileSync(resolve(repoRoot, 'packages/content/src/generated/levels.ts'), 'utf8');
const weaponsRaw = readFileSync(resolve(repoRoot, 'packages/content/src/generated/weapons.ts'), 'utf8');

const LEVELS = JSON.parse(levelsRaw.match(/= (\[[\s\S]*\]);\n/)[1]);
const WEAPONS = JSON.parse(weaponsRaw.match(/= (\[[\s\S]*\]);\n/)[1]);

/** Finds the source line of an entry inside a generated file. */
function lineOf(source, idKey, id) {
  const needle = `"${idKey}": ${JSON.stringify(id)}`;
  const index = source.indexOf(needle);
  if (index < 0) return null;
  return source.slice(0, index).split('\n').length;
}

const levelsFile = 'packages/content/src/generated/levels.ts';
const weaponsFile = 'packages/content/src/generated/weapons.ts';

const levelRows = LEVELS.map((level) => {
  const line = lineOf(levelsRaw, 'id', level.id);
  const terrain = [];
  terrain.push(`地形 ${level.terrain?.type ?? 'flat'}`);
  if (level.voids.length) terrain.push(`悬崖 ${level.voids.length}`);
  if (level.hazards.length) {
    terrain.push(`机关 ${level.hazards.length}（${level.hazards.map((h) => h.kind).join('、')}）`);
  }
  if (level.pads.length) terrain.push(`弹跳台 ${level.pads.length}`);
  if (level.buffs.length) terrain.push(`增益 ${level.buffs.length}`);

  const boss = level.boss;
  const skillNames = boss.skills.map((s) => `${s.name}（${s.id}）`).join('、');
  const passive = boss.passive ? `${boss.passiveName}（${boss.passive}）` : '无';

  const notes = [];
  if (level.waves.minion.every((n) => n === 0)) notes.push('纯 BOSS');
  if (level.elite.skill) notes.push(`精英技 ${level.elite.skillName}`);
  notes.push('通过');

  return `| ${level.id} | ${level.name} | ${level.chapter} ${level.chapterName} | \`${levelsFile}:${line}\` | ${terrain.join('；')} | ${boss.name}（技能 ${skillNames}；被动 ${passive}） | ${notes.join('；')} |`;
});

const weaponRows = WEAPONS.map((weapon) => {
  const line = lineOf(weaponsRaw, 'id', weapon.id);
  const stats = weapon.stats;
  const parts = [];
  parts.push(`${stats.baseDamage}${stats.unit || ''}`);
  if (stats.fireInterval) parts.push(`${(1 / stats.fireInterval).toFixed(1)} 发/秒`);
  else parts.push('—');
  if (stats.magazine === null) parts.push('无限');
  else parts.push(`${stats.magazine}${stats.reserve ? ` / ${stats.reserve}` : ''}`);
  if (stats.reloadTime) parts.push(`${stats.reloadTime.toFixed(1)} 秒`);
  else parts.push('—');

  const notes = [];
  if (weapon.isDefault) notes.push('初始装备');
  notes.push('通过');
  return `| \`${weapon.id}\` | ${weapon.name} | ${weapon.slot} | ${weapon.qualityLabel} | ${parts.join(' / ')} | \`${weaponsFile}:${line}\` | ${notes.join('；')} |`;
});

/** Replaces the body of the table that follows a heading. */
function replaceTableAfterHeading(markdown, heading, rows) {
  const headingIndex = markdown.indexOf(heading);
  if (headingIndex < 0) throw new Error(`heading not found: ${heading}`);

  const tableStart = markdown.indexOf('\n|', headingIndex);
  if (tableStart < 0) throw new Error(`table not found after: ${heading}`);

  // The header row and the separator stay; the body rows are replaced.
  const separatorEnd = markdown.indexOf('\n', markdown.indexOf('\n', tableStart) + 1);
  const bodyStart = separatorEnd + 1;

  let cursor = bodyStart;
  let rowCount = 0;
  while (cursor < markdown.length) {
    const lineEnd = markdown.indexOf('\n', cursor);
    const line = markdown.slice(cursor, lineEnd < 0 ? markdown.length : lineEnd);
    if (!line.startsWith('|')) break;
    cursor = lineEnd < 0 ? markdown.length : lineEnd + 1;
    rowCount += 1;
  }

  return (
    markdown.slice(0, bodyStart) + rows.join('\n') + '\n' + markdown.slice(cursor).replace(/^\n/, '')
  );
}

const docPath = resolve(repoRoot, 'docs/MIGRATION.md');
let doc = readFileSync(docPath, 'utf8');

doc = replaceTableAfterHeading(doc, '## 1. 关卡迁移表（50 关）', levelRows);
doc = replaceTableAfterHeading(doc, '## 2. 武器迁移表（44 武器）', weaponRows);

writeFileSync(docPath, doc, 'utf8');
console.log(`level rows written : ${levelRows.length}`);
console.log(`weapon rows written: ${weaponRows.length}`);
console.log('docs/MIGRATION.md updated');
