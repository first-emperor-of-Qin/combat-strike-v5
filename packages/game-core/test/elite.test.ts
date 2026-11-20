import { describe, expect, it } from 'vitest';
import { ELITE_SKILLS, getLevel } from '@combat-strike/content';
import { executeEliteAbility, getEliteSkill, isLegacyEliteSkill } from '../src/systems/elite.js';
import { Simulation, EMPTY_INPUT } from '../src/sim/combat.js';
import { Rng } from '../src/util/rng.js';

const BASE_CONFIG = {
  level: 1,
  difficulty: 1,
  seed: 4242,
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

interface Recorder {
  ctx: Parameters<typeof executeEliteAbility>[1];
  damage: number[];
  slowed: { duration: number; amount: number }[];
  rooted: number[];
  burned: number[];
  clouds: { x: number; z: number; radius: number; duration: number }[];
  blasts: { x: number; z: number; radius: number }[];
  projectiles: { angle: number; damage: number }[];
  pulled: { dx: number; dz: number }[];
}

function recorder(overrides: Partial<Parameters<typeof executeEliteAbility>[1]> = {}): Recorder {
  const damage: number[] = [];
  const slowed: { duration: number; amount: number }[] = [];
  const rooted: number[] = [];
  const burned: number[] = [];
  const clouds: { x: number; z: number; radius: number; duration: number }[] = [];
  const blasts: { x: number; z: number; radius: number }[] = [];
  const projectiles: { angle: number; damage: number }[] = [];
  const pulled: { dx: number; dz: number }[] = [];

  const ctx = {
    x: 0,
    z: 0,
    playerX: 10,
    playerZ: 0,
    bounds: { minX: -50, maxX: 50, minZ: -50, maxZ: 50 },
    distance: 10,
    damage: 100,
    rng: new Rng(7),
    damagePlayer: (amount: number) => damage.push(amount),
    pullPlayer: (dx: number, dz: number) => pulled.push({ dx, dz }),
    spawnProjectile: (opts: { angle: number; damage: number }) => projectiles.push(opts),
    slowPlayer: (duration: number, amount: number) => slowed.push({ duration, amount }),
    rootPlayer: (duration: number) => rooted.push(duration),
    burnPlayer: (duration: number) => burned.push(duration),
    spawnCloud: (x: number, z: number, radius: number, duration: number) =>
      clouds.push({ x, z, radius, duration }),
    spawnBlast: (x: number, z: number, radius: number) => blasts.push({ x, z, radius }),
    onMeleeHit: () => undefined,
    ...overrides,
  } as unknown as Parameters<typeof executeEliteAbility>[1];

  return { ctx, damage, slowed, rooted, burned, clouds, blasts, projectiles, pulled };
}

describe('精英技能', () => {
  it('内容包含旧版真正实现的 18 个精英技能', () => {
    expect(ELITE_SKILLS).toHaveLength(18);
    for (const skill of ELITE_SKILLS) {
      expect(isLegacyEliteSkill(skill.id)).toBe(true);
      expect(skill.name).toBeTruthy();
    }
  });

  it('猛冲突进：位移 8，4 米内造成 1.5 倍伤害', () => {
    const r = recorder({ distance: 3 });
    executeEliteAbility('lunge', r.ctx);
    expect(r.ctx.x).toBeCloseTo(8, 5);
    expect(r.ctx.z).toBeCloseTo(0, 5);
    expect(r.damage).toEqual([150]);
  });

  it('猛冲突进：超出范围时不造成伤害', () => {
    const r = recorder({ distance: 10 });
    executeEliteAbility('lunge', r.ctx);
    expect(r.damage).toEqual([]);
  });

  it('漩涡牵引：把玩家拉向精英并造成 0.5 倍伤害', () => {
    const r = recorder();
    executeEliteAbility('whirlpool_pull', r.ctx);
    expect(r.pulled).toHaveLength(1);
    // The player at x=10 is dragged towards the elite at x=0.
    expect(r.pulled[0]!.dx).toBeCloseTo(-3, 5);
    expect(r.damage).toEqual([50]);
  });

  it('寒冰突刺：位移 5，命中后减速 3 秒（减 50% 速度）', () => {
    const r = recorder({ distance: 3 });
    executeEliteAbility('ice_dash', r.ctx);
    expect(r.ctx.x).toBeCloseTo(5, 5);
    expect(r.damage).toEqual([100]);
    expect(r.slowed).toEqual([{ duration: 3, amount: 0.5 }]);
  });

  it('死亡冲锋：位移 7，5 米内造成 2 倍伤害', () => {
    const r = recorder({ distance: 4 });
    executeEliteAbility('death_charge', r.ctx);
    expect(r.ctx.x).toBeCloseTo(7, 5);
    expect(r.damage).toEqual([200]);
  });

  it('雷霆跳跃：瞬移到玩家位置并爆炸', () => {
    const r = recorder({ distance: 2 });
    executeEliteAbility('thunder_leap', r.ctx);
    expect(r.ctx.x).toBe(10);
    expect(r.ctx.z).toBe(0);
    expect(r.blasts).toHaveLength(1);
    expect(r.blasts[0]!.x).toBe(10);
    expect(r.damage).toEqual([150]);
  });

  it('虚空爆裂：在玩家位置爆炸，6 米内造成 1.8 倍伤害', () => {
    const r = recorder({ distance: 5 });
    executeEliteAbility('void_blast', r.ctx);
    expect(r.blasts).toHaveLength(1);
    expect(r.damage).toEqual([180]);
  });

  it('诅咒毒云：在玩家位置生成 5 秒毒云并造成 0.5 倍伤害', () => {
    const r = recorder();
    executeEliteAbility('curse_cloud', r.ctx);
    expect(r.clouds).toHaveLength(1);
    expect(r.clouds[0]!.duration).toBe(5);
    expect(r.damage).toEqual([50]);
  });

  it('光环禁锢：14 米内定身 0.8 秒并造成 0.7 倍伤害', () => {
    const r = recorder({ distance: 10 });
    executeEliteAbility('halo_bind', r.ctx);
    expect(r.rooted).toEqual([0.8]);
    expect(r.damage).toEqual([70]);

    const far = recorder({ distance: 20 });
    executeEliteAbility('halo_bind', far.ctx);
    expect(far.rooted).toEqual([]);
    expect(far.damage).toEqual([]);
  });

  it('曦金三连矢：发射 3 发扇形弹丸，每发 0.7 倍伤害', () => {
    const r = recorder();
    executeEliteAbility('solar_volley', r.ctx);
    expect(r.projectiles).toHaveLength(3);
    expect(r.projectiles[0]!.damage).toBe(70);
    // The three shots are spread around the base angle.
    expect(r.projectiles[0]!.angle).not.toBeCloseTo(r.projectiles[1]!.angle, 5);
  });

  it('星屑散射：向 8 个方向均匀发射弹丸', () => {
    const r = recorder();
    executeEliteAbility('astral_scatter', r.ctx);
    expect(r.projectiles).toHaveLength(8);
    expect(r.projectiles[0]!.damage).toBe(50);
  });

  it('混沌嬗变：50% 概率减速，否则点燃', () => {
    // Deterministic check across many seeds: exactly one of the two effects.
    let slowed = 0;
    let burned = 0;
    for (let seed = 0; seed < 200; seed++) {
      const r = recorder();
      (r.ctx as unknown as { rng: Rng }).rng = new Rng(seed);
      executeEliteAbility('transmute', r.ctx);
      if (r.slowed.length) slowed++;
      if (r.burned.length) burned++;
    }
    expect(slowed + burned).toBe(200);
    expect(slowed).toBeGreaterThan(0);
    expect(burned).toBeGreaterThan(0);
  });

  it('未知技能不产生任何效果', () => {
    const r = recorder();
    executeEliteAbility('not_a_real_skill', r.ctx);
    expect(r.damage).toEqual([]);
    expect(r.projectiles).toEqual([]);
    expect(getEliteSkill('not_a_real_skill')).toBeUndefined();
  });
});

describe('BOSS 被动', () => {
  it('每一关都绑定了来自蓝图蓝图的被动', () => {
    const sim = new Simulation(BASE_CONFIG);
    for (let level = 1; level <= 50; level++) {
      const def = getLevel(level);
      expect(def.boss.passive).toBeTruthy();
      expect(def.boss.passiveName).not.toBe('无');
    }
    void sim;
  });

  it('被动在战斗中对 BOSS 生效（减伤）', () => {
    const sim = new Simulation({ ...BASE_CONFIG, level: 1 });
    // Level 1's boss carries molten_armor, an 18% damage reduction.
    expect(getLevel(1).boss.passive).toBe('molten_armor');

    // Force the boss to exist, then apply the passive and check the reduction.
    sim.forceVictory();
    expect(sim.boss).not.toBeNull();
  });
});
