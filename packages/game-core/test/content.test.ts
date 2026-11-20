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
} from '@combat-strike/content';
import {
  calculateUnlockedDifficulty,
} from '../src/systems/progression.js';

describe('content pack', () => {
  it('validates without errors', () => {
    const report = validateContent();
    expect(report.errors).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it('contains all 50 levels with unique ids and 10 chapters', () => {
    expect(LEVELS).toHaveLength(50);
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(50);
    expect(new Set(LEVELS.map((l) => l.chapter))).toEqual(new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
  });

  it('keeps the four pure-boss levels at 15/20/25/30', () => {
    expect(PURE_BOSS_LEVELS).toEqual([15, 20, 25, 30]);
    for (const id of PURE_BOSS_LEVELS) {
      expect(getLevel(id).waves.minion.every((n) => n === 0)).toBe(true);
    }
  });

  it('ships 44 weapons covering all five slots', () => {
    expect(WEAPONS).toHaveLength(44);
    const slots = new Set(WEAPONS.map((w) => w.slot));
    expect(slots).toEqual(new Set(['primary', 'secondary', 'melee', 'grenade', 'tactical']));
    // Every weapon must resolve a real base damage (tactical gear excepted).
    for (const w of WEAPONS) {
      if (w.slot !== 'tactical') expect(w.stats.baseDamage).toBeGreaterThan(0);
    }
  });

  it('exposes the ten difficulty tiers with the legacy multiplier ladder', () => {
    expect(DIFFICULTIES).toHaveLength(10);
    expect(DIFFICULTIES.map((d) => d.multiplier)).toEqual([
      1, 3, 6, 16, 39, 98, 244, 610, 1526, 3815,
    ]);
    expect(getDifficulty(5).affix).toBe('armored');
    expect(getDifficulty(7).affix).toBe('swift');
    expect(getDifficulty(9).affix).toBe('regen');
  });

  it('reproduces the legacy boss HP table exactly', () => {
    expect(BOSS_HP_TABLE[1]).toBe(40_000_000);
    expect(BOSS_HP_TABLE[50]).toBe(7_167_183_174_936);
    expect(bossHpFor(1, 1)).toBe(40_000_000);
    expect(bossHpFor(50, 1)).toBe(7_167_183_174_936);
    // The difficulty multiplier scales the table.
    expect(bossHpFor(1, 10)).toBe(Math.round(40_000_000 * 3815));
  });

  it('derives minion health from 1% / 2% of the boss health', () => {
    expect(minionHpFor(1, 1, 1)).toBe(400_000);
    expect(minionHpFor(1, 2, 1)).toBe(800_000);
  });

  it('gives every boss three resolvable skills and one passive', () => {
    for (const level of LEVELS) {
      expect(level.boss.skills.length).toBe(3);
      for (const skill of level.boss.skills) {
        expect(skill.name).not.toMatch(/技能[一二三四五六]$/);
        expect(skill.cooldown).toBeGreaterThan(0);
      }
      expect(level.boss.passiveName).not.toBe('专属被动');
    }
  });

  it('keeps every elite skill name real', () => {
    for (const level of LEVELS) {
      if (!level.elite.skill) continue;
      expect(level.elite.skillName).toBeTruthy();
      expect(level.elite.skillName).not.toBe('精英技');
    }
  });

  it('keeps the legacy starter weapons', () => {
    expect(getWeapon('thunder').name).toBe('雷霆之怒');
    expect(getWeapon('thunder').stats.fireInterval).toBeCloseTo(0.1, 6);
    expect(getWeapon('thunder').stats.magazine).toBe(150);
    expect(getWeapon('shadow').stats.magazine).toBe(30);
    expect(getWeapon('tumo').stats.magazine).toBeNull();
  });
});

describe('progression', () => {
  it('unlocks the next difficulty tier on clear, capped at 10', () => {
    expect(calculateUnlockedDifficulty({ 5: 1 }, 5)).toBe(2);
    expect(calculateUnlockedDifficulty({ 5: 9 }, 5)).toBe(10);
    expect(calculateUnlockedDifficulty({ 5: 10 }, 5)).toBe(10);
    expect(calculateUnlockedDifficulty({}, 7)).toBe(2);
  });
});
