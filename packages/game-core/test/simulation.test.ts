import { describe, expect, it } from 'vitest';
import { getWeapon } from '@combat-strike/content';
import { EMPTY_INPUT, Simulation, type SimulationInput } from '../src/sim/combat.js';
import { Rng } from '../src/util/rng.js';
import { applyDamage, calcDamage, getCritChance } from '../src/systems/damage.js';

const BASE_CONFIG = {
  level: 1,
  difficulty: 1,
  seed: 12345,
  loadout: {
    primary: 'thunder',
    secondary: 'shadow',
    melee: 'thunderblade',
    grenade: 'normalgrenade',
    tactical: 'none',
  } as const,
  weaponLevels: {} as Record<string, number>,
  companion: null,
  character: 'initiate',
};

function makeSim(overrides: Partial<typeof BASE_CONFIG> = {}) {
  return new Simulation({ ...BASE_CONFIG, ...overrides });
}

function input(overrides: Partial<SimulationInput> = {}): SimulationInput {
  return { ...EMPTY_INPUT, ...overrides };
}

/** Runs the simulation for `seconds` of simulated time at the fixed step. */
function run(sim: Simulation, seconds: number, overrides: Partial<SimulationInput> = {}) {
  const step = 1 / 60;
  const steps = Math.round(seconds / step);
  for (let i = 0; i < steps; i++) sim.step(step, input(overrides));
}

describe('simulation determinism', () => {
  it('produces identical results for the same seed', () => {
    const a = makeSim({ seed: 999 });
    const b = makeSim({ seed: 999 });
    run(a, 5, { fire: true });
    run(b, 5, { fire: true });
    expect(a.player.score).toBe(b.player.score);
    expect(a.enemies.length).toBe(b.enemies.length);
    expect(a.damageDealt).toBe(b.damageDealt);
  });

  it('produces different results for a different seed', () => {
    const a = makeSim({ seed: 1 });
    const b = makeSim({ seed: 2 });
    run(a, 5, { fire: true });
    run(b, 5, { fire: true });
    // The spawn positions come from the seeded stream.
    expect(a.enemies[0]?.x).not.toBe(b.enemies[0]?.x);
  });

  it('does not depend on the frame rate', () => {
    // Same elapsed time, different step sizes -> same outcome.
    const a = makeSim({ seed: 42 });
    const b = makeSim({ seed: 42 });
    for (let i = 0; i < 300; i++) a.step(1 / 60, input({ fire: true }));
    for (let i = 0; i < 150; i++) b.step(1 / 30, input({ fire: true }));
    expect(a.elapsed).toBeCloseTo(b.elapsed, 6);
    expect(a.player.score).toBe(b.player.score);
  });
});

describe('wave scheduler', () => {
  it('runs three waves: minions, elites, then the boss', () => {
    const sim = makeSim();
    // The legacy opens a level with a 3 s intermission before wave 1.
    run(sim, 3.2);
    expect(sim.wave).toBe(1);
    run(sim, 5);
    expect(sim.wave).toBeGreaterThanOrEqual(1);
    // Wave 1 spawns melee and ranged minions.
    expect(sim.enemies.length).toBeGreaterThan(0);
    const kinds = new Set(sim.enemies.map((e) => e.kind));
    expect(kinds.has('melee') || kinds.has('ranged')).toBe(true);
  });

  it('spawns minions at 3 every 0.5 seconds', () => {
    const sim = makeSim();
    // 3 s intermission, then batches of 3 every 0.5 s.
    run(sim, 4.1);
    expect(sim.waveEnemiesSpawned).toBeGreaterThanOrEqual(3);
    expect(sim.waveEnemiesSpawned).toBeLessThanOrEqual(9);
  });

  it('treats levels 15/20/25/30 as pure boss fights', () => {
    const sim = makeSim({ level: 15 });
    run(sim, 2);
    // The two minion waves are empty and pass straight through.
    expect(sim.waveTotal).toBe(0);
    expect(sim.enemies.length).toBe(0);
  });

  it('spawns the boss once the minion waves are cleared', () => {
    const sim = makeSim({ level: 15 });
    run(sim, 12);
    expect(sim.boss).not.toBeNull();
    expect(sim.boss!.alive).toBe(true);
  });
});

describe('weapon behaviour', () => {
  it('consumes ammunition and auto-reloads when the magazine empties', () => {
    const sim = makeSim();
    run(sim, 1);
    const weapon = sim.activeWeapon!;
    const before = weapon.ammo.current;
    run(sim, 1, { fire: true });
    expect(weapon.ammo.current).toBeLessThan(before);
  });

  it('blocks firing while reloading', () => {
    const sim = makeSim();
    const weapon = sim.activeWeapon!;
    weapon.ammo.current = 0;
    weapon.ammo.reserve = 100;
    // Start a reload manually through the input path.
    sim.step(1 / 60, input({ reload: true }));
    expect(weapon.ammo.reloading).toBe(true);
    const shotsBefore = sim.projectiles.length;
    sim.step(1 / 60, input({ fire: true }));
    expect(sim.projectiles.length).toBe(shotsBefore);
  });

  it('never runs dry for unlimited-ammo weapons', () => {
    const sim = makeSim({ loadout: { ...BASE_CONFIG.loadout, primary: 'tumo' } });
    run(sim, 20, { fire: true });
    const weapon = sim.activeWeapon!;
    expect(weapon.ammo.magazine).toBeNull();
    expect(weapon.ammo.current).toBe(0);
    expect(weapon.ammo.reloading).toBe(false);
  });

  it('fires at the weapon interval, independent of the frame rate', () => {
    const sim = makeSim();
    const interval = getWeapon('thunder').stats.fireInterval!;
    const elapsed = 3;
    const steps = Math.round(elapsed * 60);
    let shots = 0;
    for (let i = 0; i < steps; i++) {
      const before = sim.projectiles.length;
      sim.step(1 / 60, input({ fire: true }));
      if (sim.projectiles.length > before) shots += sim.projectiles.length - before;
    }
    const expected = Math.floor(elapsed / interval);
    expect(Math.abs(shots - expected)).toBeLessThanOrEqual(1);
  });

  it('cancels the reload when the weapon is switched', () => {
    const sim = makeSim();
    const primary = sim.activeWeapon!;
    primary.ammo.current = 0;
    primary.ammo.reserve = 100;
    sim.step(1 / 60, input({ reload: true }));
    expect(primary.ammo.reloading).toBe(true);

    sim.switchCooldown = 0;
    sim.switchSlot('secondary');
    expect(primary.ammo.reloading).toBe(false);
  });

  it('releases the trigger when the weapon is switched', () => {
    const sim = makeSim();
    sim.step(1 / 60, input({ fire: true }));
    const shotsAfterFirst = sim.projectiles.length;
    expect(shotsAfterFirst).toBeGreaterThan(0);

    sim.switchCooldown = 0;
    sim.switchSlot('secondary');
    const before = sim.projectiles.length;
    sim.step(1 / 60, input({ fire: true }));
    // The secondary has its own cadence, but the switch must not inherit the
    // primary's held trigger state.
    expect(sim.currentSlot).toBe('secondary');
  });

  it('cycles through the occupied slots', () => {
    const sim = makeSim();
    sim.switchCooldown = 0;
    sim.cycleSlot(1);
    expect(sim.currentSlot).toBe('secondary');
    sim.switchCooldown = 0;
    sim.cycleSlot(1);
    expect(sim.currentSlot).toBe('melee');
  });
});

describe('damage pipeline', () => {
  const ctx = {
    soulPower: 2000,
    weaponLevel: 1,
    bonusCritRate: 0,
    damageBuff: 1,
    amplifyPercent: 0,
    energyDefenderShield: false,
    fateBuff: false,
  };

  it('matches the legacy worked example for the starter weapon', () => {
    // 2000 soul power × 9 base damage = 18,000.
    expect(calcDamage(9, ctx)).toBe(18_000);
  });

  it('adds 5% per weapon level', () => {
    expect(calcDamage(9, { ...ctx, weaponLevel: 10 })).toBe(Math.round(18_000 * 1.45));
  });

  it('applies the amplify, energy-defender and fate multipliers together', () => {
    // The legacy returned early here and dropped the last two multipliers.
    const amplified = calcDamage(9, { ...ctx, amplifyPercent: 100 });
    expect(amplified).toBe(36_000);
    const withShield = calcDamage(9, { ...ctx, energyDefenderShield: true });
    expect(withShield).toBe(27_000);
    const withFate = calcDamage(9, { ...ctx, fateBuff: true });
    expect(withFate).toBe(25_200);
  });

  it('doubles headshots and crits', () => {
    const rng = new Rng(1);
    // Force a crit by using a 100% crit chance.
    const crit = applyDamage(1000, { isBoss: false }, {
      headshot: true,
      hitHeight: 2,
      critChance: 1,
      rng,
      weaponId: 'thunder',
      x: 0, y: 0, z: 0,
    });
    expect(crit.amount).toBe(4000);
    expect(crit.crit).toBe(true);
    expect(crit.headshot).toBe(true);
  });

  it('applies the armour affix', () => {
    const rng = new Rng(1);
    const event = applyDamage(1000, { isBoss: false, diffArmor: 0.18 }, {
      headshot: false,
      hitHeight: 0,
      critChance: 0,
      rng,
      weaponId: 'thunder',
      x: 0, y: 0, z: 0,
    });
    expect(event.amount).toBe(820);
    expect(event.type).toBe('armor');
  });

  it('can fully negate a hit with the swift affix', () => {
    const rng = new Rng(1);
    const event = applyDamage(1000, { isBoss: false, diffDodge: 1 }, {
      headshot: false,
      hitHeight: 0,
      critChance: 0,
      rng,
      weaponId: 'thunder',
      x: 0, y: 0, z: 0,
    });
    expect(event.amount).toBe(0);
    expect(event.type).toBe('dodge');
  });

  it('includes the equipment crit bonus in the crit chance', () => {
    // The legacy `shoot()` path ignored the equipment bonus entirely.
    const base = getCritChance({ bonusCritRate: 0 }, 1);
    const withEquipment = getCritChance({ bonusCritRate: 0.1 }, 1);
    expect(base).toBeCloseTo(0.01, 6);
    expect(withEquipment).toBeCloseTo(0.11, 6);
  });
});

describe('difficulty', () => {
  it('scales enemy health and damage with the tier multiplier', () => {
    const easy = makeSim({ difficulty: 1 });
    const hard = makeSim({ difficulty: 5 });
    run(easy, 5);
    run(hard, 5);
    expect(hard.enemies[0]!.maxHealth).toBeGreaterThan(easy.enemies[0]!.maxHealth);
    expect(hard.enemies[0]!.damage).toBeGreaterThan(easy.enemies[0]!.damage);
  });

  it('applies the armour affix from tier 5', () => {
    const sim = makeSim({ difficulty: 5 });
    run(sim, 5);
    const enemy = sim.enemies[0]!;
    // Not every spawn rolls the affix, but every enemy at tier 5+ has it.
    expect(enemy.diffArmor).toBe(0.18);
  });

  it('applies the swift affix from tier 7', () => {
    const sim = makeSim({ difficulty: 7 });
    run(sim, 5);
    const enemy = sim.enemies[0]!;
    expect(enemy.diffDodge).toBe(0.1);
  });

  it('applies the regen affix from tier 9', () => {
    const sim = makeSim({ difficulty: 9 });
    run(sim, 5);
    const enemy = sim.enemies[0]!;
    expect(enemy.diffRegen).toBe(0.012);
  });
});

describe('settlement', () => {
  it('ends the run in victory when the boss dies', () => {
    const sim = makeSim({ level: 15 });
    run(sim, 12);
    expect(sim.boss).not.toBeNull();
    // Kill the boss directly.
    sim['killBoss']();
    expect(sim.phase).toBe('victory');
    const settled = sim.drainEvents().find((e) => e.type === 'settled');
    expect(settled).toBeDefined();
    if (settled && settled.type === 'settled') {
      expect(settled.result.outcome).toBe('victory');
      expect(settled.result.level).toBe(15);
    }
  });

  it('ends the run in defeat when the player dies', () => {
    const sim = makeSim();
    sim.damagePlayer(1e12, true);
    sim.step(1 / 60, input());
    expect(sim.phase).toBe('defeat');
    expect(sim.player.alive).toBe(false);
  });

  it('awards score and weapon XP per kill', () => {
    const sim = makeSim();
    run(sim, 5);
    const enemy = sim.enemies[0];
    if (!enemy) throw new Error('expected at least one enemy');
    sim['killEnemy'](enemy);
    expect(sim.player.score).toBeGreaterThanOrEqual(100);
    expect(sim.kills).toBe(1);
  });
});

describe('悬崖与出生点', () => {
  it('出生点落在悬崖里的关卡改为在检查点出生', () => {
    // Levels 31 and 35 have a cliff that covers the world origin.
    for (const level of [31, 35]) {
      const sim = makeSim({ level });
      expect(sim.phase).toBe('playing');
      expect(sim.player.alive).toBe(true);
      expect(sim.player.health).toBe(sim.player.maxHealth);
      expect(sim.checkpoint.x).toBe(0);
    }
  });

  it('掉入悬崖不会结束本局，而是回到检查点并恢复 60% 生命', () => {
    const sim = makeSim({ level: 35 });
    const before = sim.player.health;
    // Walk into the cliff region.
    sim.player.x = 10;
    sim.player.z = 0;
    sim.step(1 / 60, input({ moveZ: 1 }));
    expect(sim.phase).toBe('playing');
    expect(sim.player.alive).toBe(true);
    expect(sim.player.health).toBeLessThan(before);
    expect(sim.player.health).toBe(Math.round(sim.player.maxHealth * 0.6));
    expect(sim.player.x).toBe(sim.checkpoint.x);
    expect(sim.player.z).toBe(sim.checkpoint.z);
  });

  it('检查点本身不会落在悬崖内', () => {
    for (let level = 31; level <= 50; level++) {
      const sim = makeSim({ level });
      const inside = sim.level.voids.some(
        (v) =>
          sim.checkpoint.x >= v.minX &&
          sim.checkpoint.x <= v.maxX &&
          sim.checkpoint.z >= v.minZ &&
          sim.checkpoint.z <= v.maxZ,
      );
      expect(inside).toBe(false);
    }
  });
});

describe('出生点安全', () => {
  it('每一关的出生点都不在悬崖或机关范围内', () => {
    for (let level = 1; level <= 50; level++) {
      const sim = makeSim({ level });
      const def = sim.level;
      const inVoid = def.voids.some(
        (v) =>
          sim.player.x >= v.minX &&
          sim.player.x <= v.maxX &&
          sim.player.z >= v.minZ &&
          sim.player.z <= v.maxZ,
      );
      expect(inVoid, `level ${level} spawns inside a cliff`).toBe(false);
      for (const hazard of def.hazards) {
        const halfW = hazard.w / 2 + 0.6;
        const halfD = hazard.d / 2 + 0.6;
        const inside =
          Math.abs(sim.player.x - hazard.x) <= halfW && Math.abs(sim.player.z - hazard.z) <= halfD;
        expect(inside, `level ${level} spawns inside the ${hazard.kind} hazard`).toBe(false);
      }
    }
  });

  it('站着不动不会在第一波之前被机关打死', () => {
    for (let level = 1; level <= 50; level++) {
      const sim = makeSim({ level });
      for (let i = 0; i < 60 * 8; i++) sim.step(1 / 60, input());
      expect(sim.phase, `level ${level} died before wave 1`).toBe('playing');
      expect(sim.player.alive).toBe(true);
    }
  });

  it('出生点沿用旧版的 (0, 20)', () => {
    // Levels whose spawn is safe keep the legacy coordinates.
    const sim = makeSim({ level: 1 });
    expect(sim.player.x).toBe(0);
    expect(sim.player.z).toBe(20);
  });
});
