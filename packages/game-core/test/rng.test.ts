import { describe, expect, it } from 'vitest';
import { Rng } from '../src/util/rng.js';

describe('随机源', () => {
  it('同样的种子产生同样的序列', () => {
    const a = new Rng(12345);
    const b = new Rng(12345);
    for (let i = 0; i < 100; i++) expect(a.next()).toBe(b.next());
  });

  it('不同的种子产生不同的序列', () => {
    const a = new Rng(1);
    const b = new Rng(2);
    const first = Array.from({ length: 20 }, () => a.next());
    const second = Array.from({ length: 20 }, () => b.next());
    expect(first).not.toEqual(second);
  });

  it('首个输出就已经分布均匀（暴击率不会被开局偏置）', () => {
    // A raw xorshift32 seeded with small values produced a first output near
    // zero, which biased the first crit roll of every run.
    const buckets = [0, 0, 0, 0];
    for (let seed = 0; seed < 4000; seed++) {
      const value = new Rng(seed).next();
      buckets[Math.min(3, Math.floor(value * 4))]! += 1;
    }
    // Each quarter should receive roughly a quarter of the draws.
    for (const count of buckets) {
      expect(count).toBeGreaterThan(800);
      expect(count).toBeLessThan(1200);
    }
  });

  it('chance() 的频率接近设定值', () => {
    const rng = new Rng(99);
    let hits = 0;
    const trials = 20000;
    for (let i = 0; i < trials; i++) if (rng.chance(0.1)) hits++;
    expect(hits / trials).toBeGreaterThan(0.09);
    expect(hits / trials).toBeLessThan(0.11);
  });

  it('取值落在 [0, 1) 区间内', () => {
    const rng = new Rng(7);
    for (let i = 0; i < 5000; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('int() 覆盖闭区间两端', () => {
    const rng = new Rng(3);
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) seen.add(rng.int(0, 3));
    expect([...seen].sort()).toEqual([0, 1, 2, 3]);
  });
});
