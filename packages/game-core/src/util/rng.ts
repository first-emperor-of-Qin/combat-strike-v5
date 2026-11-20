/**
 * Deterministic pseudo-random source.
 *
 * The legacy build called `Math.random()` directly in the damage pipeline, the
 * enemy spawner and the crit roll, which made every run unreproducible. The
 * rewrite keeps every random decision inside a seeded stream so a run can be
 * replayed exactly from `(seed, level, difficulty, loadout)`.
 */
export class Rng {
  private state: number;

  constructor(seed: number) {
    // xorshift32 requires a non-zero state.
    this.state = (seed >>> 0) || 0x9e3779b9;
  }

  /** Uniform in [0, 1). */
  next(): number {
    let x = this.state;
    x ^= x << 13;
    x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    this.state = x;
    return x / 0x100000000;
  }

  /** Uniform in [min, max). */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /** Uniform integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /** True with probability `p`. */
  chance(p: number): boolean {
    return this.next() < p;
  }

  /** Picks one element; returns undefined for an empty list. */
  pick<T>(items: readonly T[]): T | undefined {
    if (items.length === 0) return undefined;
    return items[this.int(0, items.length - 1)];
  }

  /** Returns a shuffled copy (Fisher-Yates). */
  shuffle<T>(items: readonly T[]): T[] {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      const tmp = out[i]!;
      out[i] = out[j]!;
      out[j] = tmp;
    }
    return out;
  }

  /** Restores the stream to a known state (for save/replay). */
  getState(): number {
    return this.state;
  }

  setState(state: number): void {
    this.state = (state >>> 0) || 0x9e3779b9;
  }
}
