/**
 * Simulation clock.
 *
 * The legacy build advanced the whole game with a variable `requestAnimationFrame`
 * delta clamped to 50 ms, which made fire rate frame-rate dependent (a 76.9 ms
 * weapon fired 10/s at 60 FPS instead of 13/s). The rewrite runs a fixed-step
 * simulation at 60 Hz and interpolates only for rendering, so behaviour is
 * identical at 30, 60 and 144 FPS.
 */

export const FIXED_STEP_SECONDS = 1 / 60;

/** Never simulate more than this many seconds in one frame (spiral-of-death guard). */
export const MAX_FRAME_SECONDS = 0.25;

export interface ClockSnapshot {
  /** Total simulated time in seconds. */
  elapsed: number;
  /** Number of fixed steps executed. */
  steps: number;
  /** Fraction of a step already accumulated (for render interpolation). */
  alpha: number;
}

export class FixedStepClock {
  private accumulator = 0;
  private elapsedSeconds = 0;
  private stepCount = 0;

  /** Advances the clock and returns how many fixed steps to run. */
  advance(realDeltaSeconds: number): number {
    const clamped = Math.min(Math.max(realDeltaSeconds, 0), MAX_FRAME_SECONDS);
    this.accumulator += clamped;
    let steps = 0;
    while (this.accumulator >= FIXED_STEP_SECONDS) {
      this.accumulator -= FIXED_STEP_SECONDS;
      this.elapsedSeconds += FIXED_STEP_SECONDS;
      this.stepCount++;
      steps++;
    }
    return steps;
  }

  /** Remainder of the current step, in [0, 1). */
  get alpha(): number {
    return this.accumulator / FIXED_STEP_SECONDS;
  }

  get elapsed(): number {
    return this.elapsedSeconds;
  }

  get steps(): number {
    return this.stepCount;
  }

  snapshot(): ClockSnapshot {
    return { elapsed: this.elapsedSeconds, steps: this.stepCount, alpha: this.alpha };
  }

  reset(): void {
    this.accumulator = 0;
    this.elapsedSeconds = 0;
    this.stepCount = 0;
  }
}

/**
 * A controllable clock used by tests: time only moves when the caller says so.
 */
export class ManualClock {
  private t = 0;

  now(): number {
    return this.t;
  }

  advance(seconds: number): void {
    this.t += seconds;
  }
}
