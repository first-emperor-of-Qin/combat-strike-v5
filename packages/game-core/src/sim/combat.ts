/**
 * The campaign simulation.
 *
 * Owns the rules; owns no rendering, no DOM and no timers. It advances in
 * fixed 60 Hz steps so a run is reproducible from `(seed, level, difficulty,
 * loadout)` and behaves identically at any frame rate.
 *
 * Ported mechanics (all traced against the legacy baseline):
 *  - Three waves per level: minion wave, elite wave, boss wave.
 *    Pure-boss levels (15 / 20 / 25 / 30) skip the first two.
 *  - Spawn pacing: 3 enemies every 0.5 s.
 *  - Intermission between waves: 3.0 s, no heal, no ammo refill.
 *  - Minion HP: 1% of the level boss HP (wave 1) and 2% (wave 2), scaled by
 *    the difficulty multiplier.
 *  - Victory is the boss dying, not the wave counter.
 *  - Score: 100 per kill, 5000 for the boss, plus (streak - 1) × 50.
 *  - Weapon XP: 10 per kill, 50 for the boss; 100 × level per level-up.
 */
import {
  BOSS_SKILLS,
  PURE_BOSS_LEVELS,
  TIER_BONUS,
  getDifficulty,
  getLevel,
  getWeapon,
  minionHpFor,
  bossHpFor,
  type LevelDef,
  type WeaponDef,
} from '@combat-strike/content';
import { Rng } from '../util/rng.js';
import {
  applyDamage,
  calcDamage,
  getCritChance,
  getWeaponDamageMult,
  isHeadshot,
  sumCritRate,
  sumSoulPower,
  type DamageContext,
} from '../systems/damage.js';
import {
  cancelReload,
  canFire,
  consumeAmmo,
  createWeaponState,
  refillAmmo,
  resetForSwitch,
  shotInterval,
  startReload,
  updateWeaponTimers,
} from '../systems/weapon.js';
import type {
  BossState,
  BossSkillState,
  BuffInstance,
  BouncePadInstance,
  DamageEvent,
  EnemyState,
  HazardInstance,
  PlayerState,
  ProjectileState,
  RunConfig,
  RunPhase,
  SettlementResult,
  WeaponRuntimeState,
  WeaponSlot,
} from '../types.js';
import { SLOT_ORDER } from '../types.js';

export const ENEMY_HIT_RADIUS = { boss: 3, normal: 1.5 };
export const SPAWN_INTERVAL = 0.5;
export const SPAWN_BATCH = 3;
export const WAVE_INTERMISSION = 3.0;
export const KILL_STREAK_BONUS = 50;
export const SCORE_PER_KILL = 100;
export const SCORE_FOR_BOSS = 5000;
export const WEAPON_XP_PER_KILL = 10;
export const WEAPON_XP_PER_BOSS = 50;
export const MAX_WEAPON_LEVEL = 10;

export interface SimulationInput {
  moveX: number;
  moveZ: number;
  yaw: number;
  pitch: number;
  fire: boolean;
  altFire: boolean;
  skill: boolean;
  special: boolean;
  jump: boolean;
  reload: boolean;
  switchTo: WeaponSlot | null;
}

export const EMPTY_INPUT: SimulationInput = {
  moveX: 0, moveZ: 0, yaw: 0, pitch: 0,
  fire: false, altFire: false, skill: false, special: false,
  jump: false, reload: false, switchTo: null,
};

export type SimulationEvent =
  | { type: 'shoot'; weaponId: string; x: number; y: number; z: number }
  | { type: 'hit'; damage: DamageEvent; enemyId: number | null; isBoss: boolean }
  | { type: 'enemy-killed'; enemyId: number; x: number; z: number; kind: string }
  | { type: 'boss-killed'; x: number; z: number }
  | { type: 'player-hurt'; amount: number }
  | { type: 'player-died' }
  | { type: 'wave-started'; wave: number }
  | { type: 'wave-cleared'; wave: number }
  | { type: 'boss-telegraph'; skillId: string; x: number; z: number; radius: number; windup: number }
  | { type: 'boss-skill'; skillId: string; x: number; z: number; radius: number }
  | { type: 'reload-started'; weaponId: string }
  | { type: 'reload-finished'; weaponId: string }
  | { type: 'dry-fire'; weaponId: string }
  | { type: 'weapon-switched'; slot: WeaponSlot; weaponId: string }
  | { type: 'buff-taken'; kind: string }
  | { type: 'hazard-hit'; kind: string }
  | { type: 'bounce'; x: number; z: number }
  | { type: 'settled'; result: SettlementResult };

interface SpawnPoint { x: number; z: number }

export class Simulation {
  readonly config: RunConfig;
  readonly rng: Rng;

  phase: RunPhase = 'loading';
  level: LevelDef;
  difficulty = getDifficulty(1);

  player: PlayerState;
  enemies: EnemyState[] = [];
  boss: BossState | null = null;
  projectiles: ProjectileState[] = [];
  hazards: HazardInstance[] = [];
  pads: BouncePadInstance[] = [];
  buffs: BuffInstance[] = [];

  /** Runtime state for every equipped slot. */
  weapons = new Map<WeaponSlot, WeaponRuntimeState>();
  currentSlot: WeaponSlot = 'primary';
  /** Seconds until the next weapon switch is allowed. */
  switchCooldown = 0;
  /** True while the trigger is held, used to detect a released trigger. */
  private triggerWasHeld = false;

  /** Wave bookkeeping. */
  wave = 0;
  waveEnemiesSpawned = 0;
  waveEnemiesKilled = 0;
  waveTotal = 0;
  waveDelay = WAVE_INTERMISSION;
  waveSpawning = false;
  spawnTimer = 0;
  bossSpawned = false;

  kills = 0;
  bossKills = 0;
  damageDealt = 0;
  elapsed = 0;

  /** Events for the renderer and the audio mixer to consume. */
  events: SimulationEvent[] = [];

  private nextId = 1;
  private weaponXpGained: Record<string, number> = {};
  private damageCtx: DamageContext;
  private playerHeight = 1.7;

  constructor(config: RunConfig) {
    this.config = config;
    this.rng = new Rng(config.seed);
    this.level = getLevel(config.level);
    this.difficulty = getDifficulty(config.difficulty);

    this.player = this.createPlayer();
    this.damageCtx = this.buildDamageContext();

    for (const slot of SLOT_ORDER) {
      const weaponId = config.loadout[slot];
      if (!weaponId || weaponId === 'none') continue;
      this.weapons.set(slot, createWeaponState({
        weaponId,
        slot,
        weaponLevel: config.weaponLevels[weaponId] ?? 1,
      }));
    }
    if (!this.weapons.has('primary') && this.weapons.size > 0) {
      this.currentSlot = this.weapons.keys().next().value as WeaponSlot;
    }
    for (const state of this.weapons.values()) refillAmmo(state);

    this.buildTerrain();
    this.phase = 'playing';
  }

  // ---------------------------------------------------------------- setup

  private createPlayer(): PlayerState {
    const cfg = this.config;
    const loadout = cfg.loadout;
    const qualities: number[] = [];
    for (const slot of SLOT_ORDER) {
      const id = loadout[slot];
      if (!id || id === 'none') continue;
      qualities.push(getWeapon(id).quality);
    }
    const best = qualities.length ? Math.max(...qualities) : 1;
    const bonus = TIER_BONUS[best]!;
    const charBonus = TIER_BONUS[1]!;

    const maxHp = bonus.hp + charBonus.hp;
    return {
      x: 0,
      z: 0,
      y: 0,
      yaw: 0,
      pitch: 0,
      health: maxHp,
      maxHealth: maxHp,
      shield: 0,
      maxShield: 0,
      energy: bonus.energy,
      maxEnergy: bonus.energy,
      soulPower: sumSoulPower(qualities),
      critRate: sumCritRate(qualities),
      damageReduction: 0,
      healthRegen: bonus.hpRegen + charBonus.hpRegen,
      energyRegen: bonus.energyRegen + charBonus.energyRegen,
      moveSpeed: 6 + bonus.moveSpeed,
      alive: true,
      invuln: 0,
      slowed: 0,
      burning: 0,
      rooted: 0,
      killStreak: 0,
      killStreakTimer: 0,
      score: 0,
      damageBuff: 1,
    };
  }

  private buildDamageContext(): DamageContext {
    const cfg = this.config;
    const qualities: number[] = [];
    for (const slot of SLOT_ORDER) {
      const id = cfg.loadout[slot];
      if (!id || id === 'none') continue;
      qualities.push(getWeapon(id).quality);
    }
    const weaponId = cfg.loadout[this.currentSlot] ?? 'thunder';
    const weaponLevel = cfg.weaponLevels[weaponId] ?? 1;
    return {
      soulPower: sumSoulPower(qualities),
      weaponLevel,
      bonusCritRate: sumCritRate(qualities),
      damageBuff: 1,
      amplifyPercent: 0,
      energyDefenderShield: false,
      fateBuff: false,
    };
  }

  private buildTerrain(): void {
    const def = this.level;
    this.hazards = def.hazards.map((h, i) => ({
      id: this.nextId++,
      kind: h.kind,
      x: h.x,
      z: h.z,
      w: h.w,
      d: h.d,
      pct: h.pct,
      cd: h.cd,
      path: h.path ?? 0,
      timer: 0,
      active: false,
      invuln: 0,
    }));
    this.pads = def.pads.map((p) => ({
      id: this.nextId++,
      x: p.x, z: p.z, r: p.r, power: p.power, tx: p.tx, tz: p.tz, cooldown: 0,
    }));
    this.buffs = def.buffs.map((b) => ({
      id: this.nextId++,
      x: b.x, z: b.z, kind: b.kind, taken: false,
    }));
  }

  get bounds() {
    const scale = this.level.boundsScale || 1;
    const half = Math.round(48 * scale);
    return { minX: -half, maxX: half, minZ: -half, maxZ: half };
  }

  get activeWeapon(): WeaponRuntimeState | undefined {
    return this.weapons.get(this.currentSlot);
  }

  get activeWeaponDef(): WeaponDef | undefined {
    const state = this.activeWeapon;
    return state ? getWeapon(state.weaponId) : undefined;
  }

  get totalWaves(): number {
    return this.level.waves.minion.length + 1;
  }

  get isPureBoss(): boolean {
    return PURE_BOSS_LEVELS.includes(this.level.id);
  }

  // ---------------------------------------------------------------- step

  step(dt: number, input: SimulationInput): void {
    if (this.phase !== 'playing') return;
    this.elapsed += dt;

    this.player.yaw = input.yaw;
    this.player.pitch = input.pitch;

    this.updatePlayer(dt, input);
    this.updateWeapons(dt, input);
    this.updateWaves(dt);
    this.updateEnemies(dt);
    this.updateBoss(dt);
    this.updateProjectiles(dt);
    this.updateHazards(dt);
    this.updatePadsAndBuffs(dt);
    this.updateStatusEffects(dt);

    if (!this.player.alive) {
      this.phase = 'defeat';
      this.settle('defeat');
    }
  }

  // ---------------------------------------------------------------- player

  private updatePlayer(dt: number, input: SimulationInput): void {
    const p = this.player;
    if (!p.alive) return;

    p.invuln = Math.max(0, p.invuln - dt);
    p.health = Math.min(p.maxHealth, p.health + (this.healthRegenPerSecond() * dt));
    p.energy = Math.min(p.maxEnergy, p.energy + (p.energyRegen * dt));

    if (p.killStreakTimer > 0) {
      p.killStreakTimer -= dt;
      if (p.killStreakTimer <= 0) p.killStreak = 0;
    }

    const speed = p.moveSpeed * (p.slowed > 0 ? 0.5 : 1) * (p.rooted > 0 ? 0 : 1);
    const sin = Math.sin(p.yaw);
    const cos = Math.cos(p.yaw);
    // Forward is -Z in the legacy camera basis.
    const forwardX = -sin;
    const forwardZ = -cos;
    const rightX = cos;
    const rightZ = -sin;

    let dx = input.moveX * rightX + input.moveZ * forwardX;
    let dz = input.moveX * rightZ + input.moveZ * forwardZ;
    const len = Math.hypot(dx, dz);
    if (len > 1) {
      dx /= len;
      dz /= len;
    }

    const nextX = p.x + dx * speed * dt;
    const nextZ = p.z + dz * speed * dt;
    const bounds = this.bounds;
    if (!this.isVoidAt(nextX, nextZ)) {
      p.x = Math.min(bounds.maxX, Math.max(bounds.minX, nextX));
      p.z = Math.min(bounds.maxZ, Math.max(bounds.minZ, nextZ));
    } else {
      // The legacy killed the player for falling into a void region.
      this.damagePlayer(p.maxHealth, true);
    }
  }

  private healthRegenPerSecond(): number {
    return this.player.healthRegen;
  }

  // ---------------------------------------------------------------- weapons

  private updateWeapons(dt: number, input: SimulationInput): void {
    for (const state of this.weapons.values()) {
      updateWeaponTimers(state, dt);
    }
    this.switchCooldown = Math.max(0, this.switchCooldown - dt);

    if (input.switchTo && input.switchTo !== this.currentSlot) {
      this.switchSlot(input.switchTo);
    }

    const state = this.activeWeapon;
    if (!state) return;

    if (input.reload) {
      if (startReload(state)) {
        this.events.push({ type: 'reload-started', weaponId: state.weaponId });
      }
    }

    const triggerHeld = input.fire;
    const dryFired = !triggerHeld && this.triggerWasHeld;
    this.triggerWasHeld = triggerHeld;

    if (state.mode === 'fire') {
      if (triggerHeld) {
        if (canFire(state, true)) {
          const weapon = getWeapon(state.weaponId);
          this.fireWeapon(weapon, state);
        } else if (state.ammo.current <= 0 && state.ammo.cooldown <= 0 && !state.ammo.reloading) {
          state.ammo.cooldown = 0.25;
          this.events.push({ type: 'dry-fire', weaponId: state.weaponId });
        }
      }
    } else if (state.mode === 'melee-light') {
      if (triggerHeld && state.ammo.cooldown <= 0) {
        this.meleeAttack(state, false);
      } else if (input.altFire && state.ammo.cooldown <= 0) {
        this.meleeAttack(state, true);
      }
    } else if (state.mode === 'throw') {
      if (triggerHeld && state.ammo.cooldown <= 0) {
        this.throwGrenade(state);
      }
    }

    void dryFired;
  }

  /** Switches the active slot, cancelling the reload and releasing the trigger. */
  switchSlot(slot: WeaponSlot): void {
    if (!this.weapons.has(slot)) return;
    if (this.switchCooldown > 0) return;
    this.switchCooldown = 0.35;
    const previous = this.activeWeapon;
    if (previous) resetForSwitch(previous);
    this.currentSlot = slot;
    this.triggerWasHeld = false;
    const state = this.activeWeapon;
    if (state) {
      this.damageCtx = this.buildDamageContext();
      this.events.push({ type: 'weapon-switched', slot, weaponId: state.weaponId });
    }
  }

  /** Cycles to the next occupied slot (mouse wheel). */
  cycleSlot(direction: 1 | -1): void {
    const occupied = SLOT_ORDER.filter((s) => this.weapons.has(s));
    if (occupied.length === 0) return;
    const index = occupied.indexOf(this.currentSlot);
    const next = occupied[(index + direction + occupied.length) % occupied.length]!;
    this.switchSlot(next);
  }

  private fireWeapon(weapon: WeaponDef, state: WeaponRuntimeState): void {
    const interval = shotInterval(weapon);
    state.ammo.cooldown = interval ?? 0.25;
    consumeAmmo(state);

    const dir = this.aimDirection();
    const pellets = typeof weapon.stats.extras?.pellets === 'number' ? (weapon.stats.extras.pellets as number) : 1;
    for (let i = 0; i < pellets; i++) {
      const spread = pellets > 1 ? (i - (pellets - 1) / 2) * 0.03 : 0;
      this.spawnProjectile({
        x: this.player.x,
        y: this.playerHeight,
        z: this.player.z,
        vx: dir.x * 120 + spread * dir.z,
        vy: dir.y * 120,
        vz: dir.z * 120 - spread * dir.x,
        damage: weapon.stats.baseDamage,
        owner: 'player',
      });
    }

    this.events.push({
      type: 'shoot',
      weaponId: weapon.id,
      x: this.player.x,
      y: this.playerHeight,
      z: this.player.z,
    });

    // Auto-reload on the shot that empties the magazine.
    if (!state.ammo.reloading && state.ammo.current <= 0 && state.ammo.reserve !== null && state.ammo.reserve > 0) {
      if (startReload(state)) {
        this.events.push({ type: 'reload-started', weaponId: state.weaponId });
      }
    }
  }

  private meleeAttack(state: WeaponRuntimeState, heavy: boolean): void {
    const weapon = getWeapon(state.weaponId);
    const extras = weapon.stats.extras ?? {};
    const interval = heavy
      ? (typeof extras.heavyInterval === 'number' ? extras.heavyInterval : 0.8)
      : (weapon.stats.fireInterval ?? 0.4);
    state.ammo.cooldown = interval;

    const damage = heavy
      ? (typeof extras.heavyDamage === 'number' ? extras.heavyDamage : weapon.stats.baseDamage * 3)
      : weapon.stats.baseDamage;

    const range = 3.2;
    const dir = this.aimDirection();
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - this.player.x;
      const dz = enemy.z - this.player.z;
      const dist = Math.hypot(dx, dz);
      if (dist > range) continue;
      const dot = (dx * dir.x + dz * dir.z) / (dist || 1);
      if (dot < 0.4) continue;
      this.dealDamageToEnemy(enemy, damage, 1.2, heavy);
    }
    if (this.boss && this.boss.alive) {
      const dx = this.boss.x - this.player.x;
      const dz = this.boss.z - this.player.z;
      const dist = Math.hypot(dx, dz);
      if (dist <= range) {
        const dot = (dx * dir.x + dz * dir.z) / (dist || 1);
        if (dot >= 0.4) this.dealDamageToBoss(damage, 1.2);
      }
    }
  }

  private throwGrenade(state: WeaponRuntimeState): void {
    const weapon = getWeapon(state.weaponId);
    state.ammo.cooldown = weapon.stats.fireInterval ?? 2;
    const dir = this.aimDirection();
    this.spawnProjectile({
      x: this.player.x,
      y: this.playerHeight,
      z: this.player.z,
      vx: dir.x * 22,
      vy: dir.y * 22 + 6,
      vz: dir.z * 22,
      damage: weapon.stats.baseDamage,
      owner: 'player',
      radius: 3,
    });
  }

  private aimDirection(): { x: number; y: number; z: number } {
    const cp = Math.cos(this.player.pitch);
    return {
      x: -Math.sin(this.player.yaw) * cp,
      y: Math.sin(this.player.pitch),
      z: -Math.cos(this.player.yaw) * cp,
    };
  }

  // ---------------------------------------------------------------- waves

  private updateWaves(dt: number): void {
    if (this.wave === 0) {
      this.waveDelay -= dt;
      if (this.waveDelay <= 0) this.startNextWave();
      return;
    }

    if (this.waveSpawning) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        const batch = Math.min(SPAWN_BATCH, this.waveTotal - this.waveEnemiesSpawned);
        for (let i = 0; i < batch; i++) this.spawnEnemy();
        this.spawnTimer = SPAWN_INTERVAL;
      }
    }

    // The boss appears once the wave is cleared.
    if (this.wave === this.totalWaves && !this.bossSpawned && !this.boss && this.enemies.length === 0) {
      this.spawnBoss();
    }

    this.checkWaveComplete();

    if (!this.waveSpawning && this.wave > 0 && this.wave < this.totalWaves) {
      this.waveDelay -= dt;
      if (this.waveDelay <= 0) this.startNextWave();
    }
  }

  private startNextWave(): void {
    if (this.wave >= this.totalWaves) return;
    this.wave += 1;

    const isBossWave = this.wave === this.totalWaves;
    const counts = this.level.waves.minion;
    this.waveTotal = isBossWave ? 0 : (counts[this.wave - 1] ?? 0);
    this.waveEnemiesSpawned = 0;
    this.waveEnemiesKilled = 0;
    this.waveSpawning = this.waveTotal > 0;
    this.spawnTimer = 0;
    this.events.push({ type: 'wave-started', wave: this.wave });

    if (!this.waveSpawning) {
      // Pure-boss levels still walk through the empty wave slots.
      this.waveDelay = WAVE_INTERMISSION;
    }
  }

  private checkWaveComplete(): void {
    if (!this.waveSpawning) return;
    const spawnedAll = this.waveEnemiesSpawned >= this.waveTotal;
    const noneAlive = this.enemies.length === 0;
    if ((spawnedAll && this.waveEnemiesKilled >= this.waveTotal) || (spawnedAll && noneAlive)) {
      this.waveSpawning = false;
      this.waveDelay = WAVE_INTERMISSION;
      this.events.push({ type: 'wave-cleared', wave: this.wave });
    }
  }

  private spawnEnemy(): void {
    if (this.waveEnemiesSpawned >= this.waveTotal) return;
    const isWave1 = this.wave === 1;
    // The legacy alternated melee/ranged by spawn index, so the split is
    // ceil/floor of the wave size rather than a flat 50/50.
    const isMelee = this.waveEnemiesSpawned % 2 === 0;
    const def = isWave1
      ? (isMelee ? this.level.melee : this.level.ranged)
      : this.level.elite;
    const kind = isWave1 ? (isMelee ? 'melee' : 'ranged') : 'elite';

    const point = this.pickSpawnPoint();
    const hp = minionHpFor(this.level.id, this.wave, this.difficulty.tier);
    const diff = this.difficulty;

    const enemy: EnemyState = {
      id: this.nextId++,
      kind,
      archetype: this.level.shapes.archetype,
      name: def.name,
      health: hp,
      maxHealth: hp,
      damage: Math.round(def.damage * diff.multiplier),
      speed: def.speed * (1 + this.rng.range(-0.5, 0.5) / 10),
      attackRange: def.attackRange,
      shootInterval: def.shootInterval ?? 999,
      shotTimer: this.rng.range(0, 1),
      meleeTimer: 0,
      skill: def.skill ?? null,
      skillName: def.skillName ?? null,
      skillCooldown: def.skillCooldown ?? 5,
      skillTimer: def.skillCooldown ?? 5,
      x: point.x,
      z: point.z,
      angle: 0,
      alive: true,
      diffArmor: 0,
      diffDodge: 0,
      diffRegen: 0,
      eliteFromDifficulty: false,
      distanceToPlayer: 0,
    };

    // Difficulty affects more than health: speed, fire rate, elite chance and
    // the three affixes (baseline index.html:23663-23682).
    {
      if (diff.speedMul !== 1) enemy.speed *= diff.speedMul;
      if (diff.fireRateMul !== 1) {
        enemy.shootInterval = Math.max(0.18, enemy.shootInterval / diff.fireRateMul);
        enemy.skillCooldown = Math.max(0.6, enemy.skillCooldown / diff.fireRateMul);
      }
      if (diff.eliteBonus > 0 && kind !== 'elite' && this.rng.chance(diff.eliteBonus)) {
        enemy.eliteFromDifficulty = true;
        enemy.health = Math.round(enemy.health * 1.6);
        enemy.maxHealth = Math.round(enemy.maxHealth * 1.6);
        enemy.damage = Math.round(enemy.damage * 1.35);
      }
      if (diff.affix === 'armored') enemy.diffArmor = 0.18;
      else if (diff.affix === 'swift') {
        enemy.speed *= 1.18;
        enemy.diffDodge = 0.1;
      } else if (diff.affix === 'regen') enemy.diffRegen = 0.012;
    }

    this.enemies.push(enemy);
    this.waveEnemiesSpawned += 1;
  }

  private pickSpawnPoint(): SpawnPoint {
    const bounds = this.bounds;
    for (let attempt = 0; attempt < 40; attempt++) {
      const x = this.rng.range(bounds.minX + 4, bounds.maxX - 4);
      const z = this.rng.range(bounds.minZ + 4, bounds.maxZ - 4);
      if (Math.hypot(x - this.player.x, z - this.player.z) < 18) continue;
      if (this.isVoidAt(x, z)) continue;
      return { x, z };
    }
    return { x: this.rng.range(bounds.minX, bounds.maxX), z: this.rng.range(bounds.minZ, bounds.maxZ) };
  }

  // ---------------------------------------------------------------- enemies

  private updateEnemies(dt: number): void {
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const dx = this.player.x - enemy.x;
      const dz = this.player.z - enemy.z;
      const dist = Math.hypot(dx, dz);
      enemy.distanceToPlayer = dist;
      enemy.angle = Math.atan2(dx, dz);

      if (enemy.diffRegen > 0 && enemy.health < enemy.maxHealth) {
        enemy.health = Math.min(enemy.maxHealth, enemy.health + enemy.maxHealth * enemy.diffRegen * dt);
      }

      // Approach until the attack range is reached.
      if (dist > enemy.attackRange) {
        const step = enemy.speed * dt;
        enemy.x += (dx / dist) * step;
        enemy.z += (dz / dist) * step;
      } else {
        // Face the player and attack.
        if (enemy.kind === 'ranged') {
          enemy.shotTimer -= dt;
          if (enemy.shotTimer <= 0) {
            enemy.shotTimer = enemy.shootInterval;
            this.spawnEnemyProjectile(enemy);
          }
        } else {
          enemy.meleeTimer -= dt;
          if (enemy.meleeTimer <= 0) {
            enemy.meleeTimer = 1;
            this.damagePlayer(enemy.damage, false);
          }
        }
      }

      // Elite ability.
      if (enemy.skill) {
        enemy.skillTimer -= dt;
        if (enemy.skillTimer <= 0 && dist < enemy.attackRange + 6) {
          enemy.skillTimer = enemy.skillCooldown;
          this.executeEliteSkill(enemy);
        }
      }
    }
  }

  /**
   * Executes an elite ability.
   *
   * The legacy dispatcher implemented only 10 of the 33 configured skills and
   * silently did nothing for the other 23. Here every configured skill runs,
   * mapped onto the boss skill behaviour table.
   */
  private executeEliteSkill(enemy: EnemyState): void {
    const skill = BOSS_SKILLS.find((s) => s.id === enemy.skill);
    if (!skill) return;

    switch (skill.archetype) {
      case 'ground-aoe': {
        this.events.push({
          type: 'boss-telegraph',
          skillId: skill.id,
          x: enemy.x,
          z: enemy.z,
          radius: skill.radius,
          windup: skill.windup,
        });
        this.spawnProjectile({
          x: enemy.x, y: 1, z: enemy.z,
          vx: 0, vy: 0, vz: 0,
          damage: enemy.damage * skill.damage,
          owner: 'enemy',
          radius: skill.radius,
          life: skill.windup,
        });
        break;
      }
      case 'zone': {
        this.events.push({
          type: 'boss-skill',
          skillId: skill.id,
          x: enemy.x,
          z: enemy.z,
          radius: skill.radius,
        });
        this.spawnProjectile({
          x: enemy.x, y: 1, z: enemy.z,
          vx: 0, vy: 0, vz: 0,
          damage: enemy.damage * skill.damage,
          owner: 'enemy',
          radius: skill.radius,
          life: skill.duration,
          slow: true,
        });
        break;
      }
      case 'projectile':
      case 'beam':
      case 'summon':
      case 'utility':
      default: {
        this.events.push({
          type: 'boss-skill',
          skillId: skill.id,
          x: enemy.x,
          z: enemy.z,
          radius: skill.radius,
        });
        const dx = this.player.x - enemy.x;
        const dz = this.player.z - enemy.z;
        const dist = Math.hypot(dx, dz) || 1;
        for (let i = 0; i < Math.max(1, skill.count); i++) {
          this.spawnProjectile({
            x: enemy.x, y: 1.2, z: enemy.z,
            vx: (dx / dist) * skill.speed,
            vy: 0,
            vz: (dz / dist) * skill.speed,
            damage: enemy.damage * skill.damage,
            owner: 'enemy',
            radius: 0.6,
          });
        }
        break;
      }
    }
  }

  private spawnEnemyProjectile(enemy: EnemyState): void {
    const dx = this.player.x - enemy.x;
    const dz = this.player.z - enemy.z;
    const dist = Math.hypot(dx, dz) || 1;
    this.spawnProjectile({
      x: enemy.x, y: 1.2, z: enemy.z,
      vx: (dx / dist) * 18,
      vy: 0,
      vz: (dz / dist) * 18,
      damage: enemy.damage,
      owner: 'enemy',
      radius: 0.5,
    });
  }

  // ---------------------------------------------------------------- boss

  private spawnBoss(): void {
    const def = this.level.boss;
    const hp = bossHpFor(this.level.id, this.difficulty.tier);
    const skills: BossSkillState[] = def.skills.map((s) => ({
      id: s.id,
      cooldown: s.cooldown / 2,
      phase: 'idle',
      phaseTimer: 0,
      damage: BOSS_SKILLS.find((b) => b.id === s.id)?.damage ?? 1,
      radius: BOSS_SKILLS.find((b) => b.id === s.id)?.radius ?? 4,
      speed: BOSS_SKILLS.find((b) => b.id === s.id)?.speed ?? 20,
      duration: BOSS_SKILLS.find((b) => b.id === s.id)?.duration ?? 0,
      count: BOSS_SKILLS.find((b) => b.id === s.id)?.count ?? 1,
    }));

    const point = this.pickSpawnPoint();
    this.boss = {
      id: this.nextId++,
      name: def.name,
      health: hp,
      maxHealth: hp,
      damage: Math.round(def.damage * this.difficulty.multiplier),
      speed: def.speed,
      attackRange: def.attackRange,
      shootInterval: def.shootInterval ?? 2,
      x: point.x,
      z: point.z,
      angle: 0,
      alive: true,
      passive: def.passive,
      damageReduction: 0,
      passiveTimer: 0,
      enraged: false,
      skills,
      meleeTimer: 0,
      shotTimer: 1,
    };
    this.bossSpawned = true;
    this.events.push({ type: 'wave-started', wave: this.wave });
  }

  private updateBoss(dt: number): void {
    const boss = this.boss;
    if (!boss || !boss.alive) return;

    const dx = this.player.x - boss.x;
    const dz = this.player.z - boss.z;
    const dist = Math.hypot(dx, dz);
    boss.angle = Math.atan2(dx, dz);

    if (dist > boss.attackRange) {
      const step = boss.speed * dt;
      boss.x += (dx / dist) * step;
      boss.z += (dz / dist) * step;
    } else {
      boss.meleeTimer -= dt;
      if (boss.meleeTimer <= 0) {
        boss.meleeTimer = 1;
        this.damagePlayer(boss.damage, false);
      }
    }

    // Skills.
    for (const skill of boss.skills) {
      skill.cooldown = Math.max(0, skill.cooldown - dt);

      if (skill.phase === 'windup') {
        skill.phaseTimer -= dt;
        if (skill.phaseTimer <= 0) {
          skill.phase = 'active';
          skill.phaseTimer = skill.duration > 0 ? skill.duration : 0.1;
          this.resolveBossSkill(boss, skill);
        }
        continue;
      }

      if (skill.phase === 'active') {
        skill.phaseTimer -= dt;
        if (skill.phaseTimer <= 0) skill.phase = 'idle';
        continue;
      }

      if (skill.cooldown <= 0 && dist < 35) {
        const def = BOSS_SKILLS.find((b) => b.id === skill.id);
        const windup = def?.windup ?? 0.8;
        skill.phase = 'windup';
        skill.phaseTimer = windup;
        skill.cooldown = def?.cooldown ?? 8;
        this.events.push({
          type: 'boss-telegraph',
          skillId: skill.id,
          x: boss.x,
          z: boss.z,
          radius: skill.radius,
          windup,
        });
      }
    }

    // Passive.
    boss.passiveTimer -= dt;
    if (boss.passiveTimer <= 0) {
      boss.passiveTimer = 1;
      this.applyBossPassive(boss);
    }
  }

  private resolveBossSkill(boss: BossState, skill: BossSkillState): void {
    const def = BOSS_SKILLS.find((b) => b.id === skill.id);
    if (!def) return;

    this.events.push({ type: 'boss-skill', skillId: skill.id, x: boss.x, z: boss.z, radius: skill.radius });

    switch (def.archetype) {
      case 'ground-aoe':
        this.spawnProjectile({
          x: boss.x, y: 0.5, z: boss.z,
          vx: 0, vy: 0, vz: 0,
          damage: boss.damage * skill.damage,
          owner: 'enemy',
          radius: skill.radius,
          life: 0.2,
        });
        break;
      case 'zone':
        this.spawnProjectile({
          x: boss.x, y: 0.5, z: boss.z,
          vx: 0, vy: 0, vz: 0,
          damage: boss.damage * skill.damage,
          owner: 'enemy',
          radius: skill.radius,
          life: skill.duration,
          slow: true,
        });
        break;
      case 'beam':
        this.spawnProjectile({
          x: boss.x, y: 1.2, z: boss.z,
          vx: 0, vy: 0, vz: 0,
          damage: boss.damage * skill.damage,
          owner: 'enemy',
          radius: skill.radius,
          life: skill.duration,
        });
        break;
      case 'summon':
      case 'projectile':
      case 'utility':
      default: {
        const dx = this.player.x - boss.x;
        const dz = this.player.z - boss.z;
        const dist = Math.hypot(dx, dz) || 1;
        for (let i = 0; i < Math.max(1, skill.count); i++) {
          this.spawnProjectile({
            x: boss.x, y: 1.4, z: boss.z,
            vx: (dx / dist) * skill.speed,
            vy: 0,
            vz: (dz / dist) * skill.speed,
            damage: boss.damage * skill.damage,
            owner: 'enemy',
            radius: 0.7,
          });
        }
        break;
      }
    }
  }

  private applyBossPassive(boss: BossState): void {
    switch (boss.passive) {
      case 'molten_armor':
      case 'sand_armor':
      case 'temporal_echo':
      case 'undying_will':
      case 'void_shield':
      case 'solar_crown':
      case 'celestial_ward':
        boss.damageReduction = PASSIVE_DAMAGE_REDUCTION[boss.passive] ?? 0;
        break;
      case 'crystal_resonance':
      case 'frozen_aura':
      case 'aquatic_healing':
      case 'eternal_cycle':
        boss.health = Math.min(boss.maxHealth, boss.health + boss.maxHealth * PASSIVE_REGEN[boss.passive]!);
        break;
      case 'shield_regen':
        boss.health = Math.min(boss.maxHealth, boss.health + boss.maxHealth * 0.1);
        break;
      default:
        break;
    }

    // undying_will enrages the boss below 30% health (baseline index.html:24933).
    if (boss.passive === 'undying_will' && !boss.enraged && boss.health < boss.maxHealth * 0.3) {
      boss.enraged = true;
      boss.speed *= 1.5;
      boss.damage = Math.round(boss.damage * 1.5);
    }
  }

  // ---------------------------------------------------------------- projectiles

  private spawnProjectile(opts: {
    x: number; y: number; z: number;
    vx: number; vy: number; vz: number;
    damage: number;
    owner: 'player' | 'enemy';
    radius?: number;
    life?: number;
    slow?: boolean;
    burn?: boolean;
    piercing?: boolean;
  }): void {
    this.projectiles.push({
      id: this.nextId++,
      owner: opts.owner,
      x: opts.x, y: opts.y, z: opts.z,
      vx: opts.vx, vy: opts.vy, vz: opts.vz,
      damage: opts.damage,
      life: opts.life ?? 3,
      radius: opts.radius ?? 0.4,
      slow: opts.slow ?? false,
      burn: opts.burn ?? false,
      piercing: opts.piercing ?? false,
    });
  }

  private updateProjectiles(dt: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i]!;
      p.life -= dt;
      if (p.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      if (p.vy !== 0) p.vy -= 9.8 * dt;
      if (p.y < 0.1 && p.vy !== 0) {
        p.y = 0.1;
        p.vy = 0;
        p.vx *= 0.6;
        p.vz *= 0.6;
      }

      if (p.owner === 'player') {
        this.checkProjectileHitEnemies(p);
      } else {
        this.checkProjectileHitPlayer(p);
      }
    }
  }

  private checkProjectileHitEnemies(p: ProjectileState): void {
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - p.x;
      const dz = enemy.z - p.z;
      const radius = ENEMY_HIT_RADIUS.normal + p.radius;
      if (dx * dx + dz * dz > radius * radius) continue;
      this.dealDamageToEnemy(enemy, p.damage, p.y, false, p.piercing);
      if (!p.piercing) {
        p.life = 0;
        return;
      }
    }
    if (this.boss && this.boss.alive) {
      const dx = this.boss.x - p.x;
      const dz = this.boss.z - p.z;
      const radius = ENEMY_HIT_RADIUS.boss + p.radius;
      if (dx * dx + dz * dz <= radius * radius) {
        this.dealDamageToBoss(p.damage, p.y);
        p.life = 0;
      }
    }
  }

  private checkProjectileHitPlayer(p: ProjectileState): void {
    if (!this.player.alive) return;
    const dx = this.player.x - p.x;
    const dz = this.player.z - p.z;
    const radius = 0.6 + p.radius;
    if (dx * dx + dz * dz > radius * radius) return;

    this.damagePlayer(p.damage, false);
    if (p.slow) this.player.slowed = Math.max(this.player.slowed, 2);
    if (p.burn) this.player.burning = Math.max(this.player.burning, 3);
    p.life = 0;
  }

  // ---------------------------------------------------------------- damage

  private dealDamageToEnemy(enemy: EnemyState, baseDamage: number, hitHeight: number, isMelee: boolean, piercing = false): void {
    const weapon = this.activeWeaponDef;
    const ctx = { ...this.damageCtx };
    if (weapon) ctx.weaponLevel = this.config.weaponLevels[weapon.id] ?? 1;

    const amount = calcDamage(baseDamage, ctx);
    const critChance = getCritChance(ctx, ctx.weaponLevel);
    const headshot = !isMelee && isHeadshot(hitHeight, false);

    const event = applyDamage(amount, {
      isBoss: false,
      diffArmor: piercing ? 0 : enemy.diffArmor,
      diffDodge: piercing ? 0 : enemy.diffDodge,
    }, {
      headshot,
      hitHeight,
      critChance,
      rng: this.rng,
      weaponId: weapon?.id ?? null,
      x: enemy.x,
      y: hitHeight,
      z: enemy.z,
    });

    enemy.health -= event.amount;
    this.damageDealt += event.amount;
    this.events.push({ type: 'hit', damage: event, enemyId: enemy.id, isBoss: false });

    if (enemy.health <= 0) this.killEnemy(enemy);
  }

  private dealDamageToBoss(baseDamage: number, hitHeight: number): void {
    const boss = this.boss;
    if (!boss || !boss.alive) return;
    const weapon = this.activeWeaponDef;
    const ctx = { ...this.damageCtx };
    if (weapon) ctx.weaponLevel = this.config.weaponLevels[weapon.id] ?? 1;

    const amount = calcDamage(baseDamage, ctx);
    const critChance = getCritChance(ctx, ctx.weaponLevel);
    const headshot = isHeadshot(hitHeight, true);

    const event = applyDamage(amount, {
      isBoss: true,
      damageReduction: boss.damageReduction,
    }, {
      headshot,
      hitHeight,
      critChance,
      rng: this.rng,
      weaponId: weapon?.id ?? null,
      x: boss.x,
      y: hitHeight,
      z: boss.z,
    });

    boss.health -= event.amount;
    this.damageDealt += event.amount;
    this.events.push({ type: 'hit', damage: event, enemyId: boss.id, isBoss: true });

    if (boss.health <= 0) this.killBoss();
  }

  private killEnemy(enemy: EnemyState): void {
    if (!enemy.alive) return;
    enemy.alive = false;
    this.enemies = this.enemies.filter((e) => e !== enemy);
    this.waveEnemiesKilled += 1;
    this.kills += 1;

    this.player.killStreak += 1;
    this.player.killStreakTimer = 5;
    const streakBonus = (this.player.killStreak - 1) * KILL_STREAK_BONUS;
    this.player.score += SCORE_PER_KILL + streakBonus;

    this.grantWeaponXp(enemy.name, false);
    this.events.push({ type: 'enemy-killed', enemyId: enemy.id, x: enemy.x, z: enemy.z, kind: enemy.kind });
  }

  private killBoss(): void {
    const boss = this.boss;
    if (!boss || !boss.alive) return;
    boss.alive = false;
    this.bossKills += 1;
    this.player.score += SCORE_FOR_BOSS + (this.player.killStreak - 1) * KILL_STREAK_BONUS;
    this.grantWeaponXp(boss.name, true);
    this.events.push({ type: 'boss-killed', x: boss.x, z: boss.z });
    this.phase = 'victory';
    this.settle('victory');
  }

  private grantWeaponXp(_source: string, isBoss: boolean): void {
    const weapon = this.activeWeaponDef;
    if (!weapon) return;
    const gain = isBoss ? WEAPON_XP_PER_BOSS : WEAPON_XP_PER_KILL;
    this.weaponXpGained[weapon.id] = (this.weaponXpGained[weapon.id] ?? 0) + gain;
  }

  damagePlayer(amount: number, ignoreInvuln: boolean): void {
    const p = this.player;
    if (!p.alive) return;
    if (!ignoreInvuln && p.invuln > 0) return;
    const dealt = Math.max(0, Math.round(amount * (1 - p.damageReduction)));
    p.health -= dealt;
    this.events.push({ type: 'player-hurt', amount: dealt });
    if (p.health <= 0) {
      p.health = 0;
      p.alive = false;
      this.events.push({ type: 'player-died' });
    }
  }

  // ---------------------------------------------------------------- terrain

  private isVoidAt(x: number, z: number): boolean {
    for (const v of this.level.voids) {
      if (x >= v.minX && x <= v.maxX && z >= v.minZ && z <= v.maxZ) return true;
    }
    return false;
  }

  private updateHazards(dt: number): void {
    for (const hazard of this.hazards) {
      hazard.timer += dt;
      hazard.invuln = Math.max(0, hazard.invuln - dt);
      if (hazard.timer >= hazard.cd) hazard.timer -= hazard.cd;
      const phase = hazard.cd > 0 ? hazard.timer / hazard.cd : 0;
      hazard.active = phase < hazard.pct;

      if (!hazard.active || hazard.invuln > 0) continue;
      const dx = Math.abs(this.player.x - hazard.x);
      const dz = Math.abs(this.player.z - hazard.z);
      const halfW = hazard.w / 2 + 0.6;
      const halfD = hazard.d / 2 + 0.6;
      if (dx > halfW || dz > halfD) continue;

      hazard.invuln = 0.9;
      // The legacy applied a percentage of max health and never killed.
      const damage = Math.round(this.player.maxHealth * hazard.pct);
      this.damagePlayer(damage, false);
      this.events.push({ type: 'hazard-hit', kind: hazard.kind });
    }
  }

  private updatePadsAndBuffs(dt: number): void {
    for (const pad of this.pads) {
      pad.cooldown = Math.max(0, pad.cooldown - dt);
      if (pad.cooldown > 0) continue;
      const dist = Math.hypot(this.player.x - pad.x, this.player.z - pad.z);
      if (dist > pad.r) continue;
      pad.cooldown = 1;
      this.events.push({ type: 'bounce', x: pad.x, z: pad.z });
    }

    for (const buff of this.buffs) {
      if (buff.taken) continue;
      const dist = Math.hypot(this.player.x - buff.x, this.player.z - buff.z);
      if (dist > 2) continue;
      buff.taken = true;
      switch (buff.kind) {
        case 'dmg':
          this.player.damageBuff *= 1.35;
          this.damageCtx.damageBuff = this.player.damageBuff;
          break;
        case 'speed':
          this.player.moveSpeed *= 1.45;
          break;
        case 'regen':
          this.player.healthRegen *= 1.5;
          break;
        case 'shield':
          this.player.shield = Math.max(this.player.shield, this.player.maxHealth * 0.3);
          break;
        case 'energy':
          this.player.energy = this.player.maxEnergy;
          break;
        case 'crit':
          this.damageCtx.bonusCritRate += 0.1;
          break;
      }
      this.events.push({ type: 'buff-taken', kind: buff.kind });
    }
  }

  private updateStatusEffects(dt: number): void {
    const p = this.player;
    p.slowed = Math.max(0, p.slowed - dt);
    p.rooted = Math.max(0, p.rooted - dt);
    if (p.burning > 0) {
      p.burning -= dt;
      this.damagePlayer(p.maxHealth * 0.01 * dt, false);
    }
  }

  // ---------------------------------------------------------------- settlement

  private settle(outcome: 'victory' | 'defeat'): void {
    const result: SettlementResult = {
      outcome,
      level: this.level.id,
      difficulty: this.difficulty.tier,
      score: Math.round(this.player.score),
      kills: this.kills,
      bossKills: this.bossKills,
      durationSeconds: Math.round(this.elapsed),
      unlockedDifficulty: null,
      weaponXp: { ...this.weaponXpGained },
      damageDealt: Math.round(this.damageDealt),
    };
    this.events.push({ type: 'settled', result });
  }

  /**
   * Forces the run to the boss phase and resolves the fight.
   *
   * Used by the level-select "skip to boss" affordance and by the end-to-end
   * tests, so both exercise the same settlement path as a real clear.
   */
  forceVictory(): void {
    if (!this.boss) {
      this.spawnBoss();
    }
    const boss = this.boss;
    if (!boss) return;
    boss.health = 1;
    this.dealDamageToBoss(999_999_999, 1);
  }

  /** Consumes and returns the queued events. */
  drainEvents(): SimulationEvent[] {
    const events = this.events;
    this.events = [];
    return events;
  }
}

const PASSIVE_DAMAGE_REDUCTION: Record<string, number> = {
  molten_armor: 0.18,
  sand_armor: 0.12,
  temporal_echo: 0.15,
  undying_will: 0.05,
  void_shield: 0.9,
  solar_crown: 0.15,
  celestial_ward: 0.2,
  frozen_aura: 0.08,
};

const PASSIVE_REGEN: Record<string, number> = {
  crystal_resonance: 0.015,
  frozen_aura: 0.015,
  aquatic_healing: 0.02,
  eternal_cycle: 0.03,
};

export { getWeaponDamageMult };
