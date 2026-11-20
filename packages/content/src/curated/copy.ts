/**
 * Curated copy for the levels that the legacy build generated from a template.
 *
 * Legacy levels 31-50 shipped with placeholder copy ("<level> 的近战单位",
 * "技能一", "专属被动"). The entity NAMES in that range are good and are kept
 * verbatim from the baseline; only the descriptions are rewritten here, plus
 * the chapter names (the legacy runtime grouped levels into ten unnamed
 * chapters of five).
 *
 * Boss skill / passive / elite skill display names are NOT written here: they
 * are resolved from the legacy BOSS_SKILLS / BOSS_PASSIVES tables, which
 * already carried authoritative names (炎弹齐射, 熔岩护甲, ...).
 */

import copyData from './copy.json' with { type: 'json' };

export interface GeneratedLevelCopy {
  melee: string;
  ranged: string;
  elite: string;
  boss: string;
}

export const GENERATED_LEVEL_COPY: Record<string, GeneratedLevelCopy> = copyData as unknown as Record<
  string,
  GeneratedLevelCopy
>;

export interface ChapterDef {
  index: number;
  name: string;
  /** Short line shown under the chapter header. */
  tagline: string;
  /** Inclusive level range. */
  from: number;
  to: number;
}

/**
 * The legacy runtime grouped levels into ten chapters of five and rendered the
 * header as a bare "第 N 章" with no name (baseline index.html:46360-46364).
 * The names below are authored for the rewrite; chapters 3-6 keep the names the
 * legacy in-game guide already used, because those match the actual themes.
 */
export const CHAPTERS: ChapterDef[] = [
  { index: 1, name: '异境试炼', tagline: '五种地貌，五场不同的挑战', from: 1, to: 5 },
  { index: 2, name: '元素试炼', tagline: '冰封、雷霆、亡灵与虚空的轮转', from: 6, to: 10 },
  { index: 3, name: '霜寂冰原', tagline: '极寒之地的永冻五关', from: 11, to: 15 },
  { index: 4, name: '虚空核心', tagline: '万物归虚的终末五关', from: 16, to: 20 },
  { index: 5, name: '曦金古城', tagline: '砂岩街巷与黄金阶城', from: 21, to: 25 },
  { index: 6, name: '苍穹圣域', tagline: '天空之城的至高一战', from: 26, to: 30 },
  { index: 7, name: '裂隙纪元 · 崩塌之地', tagline: '地形起伏、悬崖与弹跳台', from: 31, to: 35 },
  { index: 8, name: '裂隙纪元 · 机关回廊', tagline: '机关密布的折跃战场', from: 36, to: 40 },
  { index: 9, name: '裂隙纪元 · 法则扭曲', tagline: '时间与虚空开始失序', from: 41, to: 45 },
  { index: 10, name: '裂隙纪元 · 终焉王座', tagline: '一切法则的终点', from: 46, to: 50 },
];

export function chapterOfLevel(level: number): ChapterDef {
  const found = CHAPTERS.find((c) => level >= c.from && level <= c.to);
  return found ?? CHAPTERS[CHAPTERS.length - 1]!;
}
