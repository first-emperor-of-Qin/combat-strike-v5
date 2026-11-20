/**
 * Progression rules that both the client and the server must agree on.
 */

/**
 * Returns the difficulty tier unlocked by clearing a level.
 * The legacy unlocked one tier at a time, capped at 10
 * (baseline index.html:7621-7624).
 */
export function calculateUnlockedDifficulty(
  unlockedDifficulties: Record<string, number>,
  level: number,
): number {
  const current = unlockedDifficulties[String(level)] ?? 1;
  return Math.min(10, current + 1);
}

/** Returns the highest difficulty tier the player may select for a level. */
export function maxUnlockedDifficulty(
  unlockedDifficulties: Record<string, number>,
  level: number,
): number {
  const current = unlockedDifficulties[String(level)] ?? 1;
  return Math.min(10, Math.max(1, current));
}

/**
 * XP required to go from `level` to `level + 1`.
 * The legacy used 100 × level (baseline index.html:16575).
 */
export function weaponXpForNextLevel(level: number): number {
  return 100 * level;
}

/**
 * Applies a kill's XP to a weapon and returns the new level and leftover XP.
 * The legacy capped the weapon level at 10 and zeroed the XP bank on cap.
 */
export function applyWeaponXp(
  currentLevel: number,
  currentXp: number,
  gained: number,
): { level: number; xp: number; levelsGained: number } {
  const MAX = 10;
  let level = Math.min(MAX, Math.max(1, currentLevel));
  let xp = Math.max(0, currentXp) + Math.max(0, gained);
  let levelsGained = 0;

  while (level < MAX && xp >= weaponXpForNextLevel(level)) {
    xp -= weaponXpForNextLevel(level);
    level += 1;
    levelsGained += 1;
  }
  if (level >= MAX) xp = 0;
  return { level, xp, levelsGained };
}
