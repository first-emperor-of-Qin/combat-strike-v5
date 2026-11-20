import { describe, expect, it } from 'vitest';
import {
  BOSS_HP_TABLE,
  DIFFICULTIES,
  LEVELS,
  PURE_BOSS_LEVELS,
  WEAPONS,
  bossHpFor,
  getDifficulty,
  getLevel,
  getWeapon,
  minionHpFor,
  validateContent,
} from '../src/index.js';

describe('内容包校验', () => {
  it('整体校验通过且无错误', () => {
    const report = validateContent();
    expect(report.errors).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it('覆盖 50 关、10 章节与 44 件装备', () => {
    expect(LEVELS).toHaveLength(50);
    expect(WEAPONS).toHaveLength(44);
    expect(DIFFICULTIES).toHaveLength(10);
    expect(new Set(LEVELS.map((l) => l.chapter)).size).toBe(10);
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(50);
    expect(new Set(WEAPONS.map((w) => w.id)).size).toBe(44);
  });

  it('四个纯 BOSS 关保持在 15/20/25/30', () => {
    expect(PURE_BOSS_LEVELS).toEqual([15, 20, 25, 30]);
  });

  it('难度倍率阶梯与旧版一致', () => {
    expect(DIFFICULTIES.map((d) => d.multiplier)).toEqual([1, 3, 6, 16, 39, 98, 244, 610, 1526, 3815]);
    expect(getDifficulty(5).affix).toBe('armored');
    expect(getDifficulty(7).affix).toBe('swift');
    expect(getDifficulty(9).affix).toBe('regen');
  });

  it('BOSS 血量表与旧版逐值一致', () => {
    expect(BOSS_HP_TABLE[1]).toBe(40_000_000);
    expect(BOSS_HP_TABLE[50]).toBe(7_167_183_174_936);
    expect(bossHpFor(50, 1)).toBe(7_167_183_174_936);
    expect(bossHpFor(1, 10)).toBe(Math.round(40_000_000 * 3815));
  });

  it('小怪血量按 BOSS 血量的 1% / 2% 推导', () => {
    expect(minionHpFor(1, 1, 1)).toBe(400_000);
    expect(minionHpFor(1, 2, 1)).toBe(800_000);
  });

  it('每关都有三个可解析的 BOSS 技能与一个被动', () => {
    for (const level of LEVELS) {
      expect(level.boss.skills.length).toBe(3);
      for (const skill of level.boss.skills) {
        expect(skill.cooldown).toBeGreaterThan(0);
        expect(skill.name).not.toMatch(/技能[一二三四五六]$/);
      }
      expect(level.boss.passiveName).not.toBe('专属被动');
    }
  });

  it('精英技能名不是占位符', () => {
    for (const level of LEVELS) {
      if (!level.elite.skill) continue;
      expect(level.elite.skillName).toBeTruthy();
      expect(level.elite.skillName).not.toBe('精英技');
    }
  });

  it('31-50 关带有地形、机关与增益数据', () => {
    const terrainLevels = LEVELS.filter((l) => l.id >= 31);
    expect(terrainLevels).toHaveLength(20);
    for (const level of terrainLevels) {
      expect(level.terrain).toBeDefined();
      expect(level.hazards.length).toBeGreaterThan(0);
      expect(level.pads.length).toBeGreaterThan(0);
      expect(level.buffs.length).toBeGreaterThan(0);
      // 悬崖矩形必须是非反转的，否则玩家永远走不进去。
      for (const v of level.voids) {
        expect(v.minX).toBeLessThanOrEqual(v.maxX);
        expect(v.minZ).toBeLessThanOrEqual(v.maxZ);
      }
    }
  });

  it('初始装备与旧版一致', () => {
    expect(getWeapon('thunder').name).toBe('雷霆之怒');
    expect(getWeapon('thunder').stats.fireInterval).toBeCloseTo(0.1, 6);
    expect(getWeapon('thunder').stats.magazine).toBe(150);
    expect(getWeapon('shadow').stats.magazine).toBe(30);
    expect(getWeapon('tumo').stats.magazine).toBeNull();
    expect(getLevel(1).name).toBe('熔岩炼狱');
    expect(getLevel(50).name).toBe('终焉王座');
  });
});
