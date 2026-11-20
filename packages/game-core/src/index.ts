/**
 * @combat-strike/game-core — deterministic campaign simulation.
 *
 * No DOM, no WebGL, no timers: the rules live here so they can be tested in
 * isolation and replayed from a seed.
 */
export * from './types.js';
export * from './util/rng.js';
export * from './util/clock.js';
export * from './systems/damage.js';
export * from './systems/weapon.js';
export * from './systems/progression.js';
export * from './systems/elite.js';
export * from './sim/combat.js';
export * from './save/schema.js';
export * from './save/legacy-migration.js';
export * from './save/local-store.js';
