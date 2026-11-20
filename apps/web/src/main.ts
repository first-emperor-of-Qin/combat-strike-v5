/**
 * Application bootstrap.
 *
 * Wires the simulation, the renderer, the audio mixer, the input controller
 * and the screen manager together, and owns the single animation loop.
 *
 * The loop runs the simulation at a fixed 60 Hz and renders once per frame,
 * so the rules never depend on the display refresh rate.
 */
import './ui/styles.css';
import {
  CHAPTERS,
  WEAPONS,
  getLevel,
  getWeapon,
  type WeaponSlot,
} from '@combat-strike/content';
import {
  EMPTY_INPUT,
  FixedStepClock,
  Simulation,
  applyWeaponXp,
  calculateUnlockedDifficulty,
  migrateLegacySave,
  readLegacySnapshot,
  type PlayerProfile,
  type SettlementResult,
} from '@combat-strike/game-core';
import { AudioMixer } from './audio/audio.js';
import { ApiClient } from './core/api.js';
import { ProfileStore } from './core/profile.js';
import { InputController } from './input/input.js';
import { GameRenderer, QUALITY_PROFILES, type QualityTier } from './render/renderer.js';
import { byId, clear, el, formatDuration, formatGold, show } from './ui/dom.js';
import { Hud } from './ui/hud.js';
import { ScreenManager, prettyKey } from './ui/screens.js';

const gameRoot = byId('game-root');
const canvasHost = byId('canvas-host');
const screenRoot = byId('screen-root');
const toastHost = byId('toast-host');

const profileStore = new ProfileStore();
const audio = new AudioMixer();
const api = new ApiClient();
const hud = new Hud();
const clock = new FixedStepClock();

let renderer: GameRenderer | null = null;
let input: InputController | null = null;
let simulation: Simulation | null = null;
let running = false;
let paused = false;
let lastFrame = performance.now();
let fpsAccumulator = 0;
let fpsFrames = 0;
let fpsValue = 60;
let pendingDifficultyLevel = 1;
let rebindAction: string | null = null;

/** Screen manager for everything outside the 3D view. */
const screens = new ScreenManager(screenRoot, {
  get profile() {
    return profileStore.current;
  },
  onStartLevel: (level, difficulty) => startLevel(level, difficulty),
  onOpenLevel: (level) => openDifficultyPanel(level),
  onEquip: (slot, weaponId) => equipWeapon(slot, weaponId),
  onBuy: (weaponId) => buyWeapon(weaponId),
  onSelectCharacter: () => undefined,
  onSelectCompanion: () => undefined,
  onSettingChanged: () => applySettings(),
  onRebind: (action) => startRebind(action),
  onResetKeymap: () => resetKeymap(),
  onExportProfile: () => exportProfile(),
  onImportProfile: () => openLegacyImport(),
});

// ---------------------------------------------------------------- settings

function applySettings(): void {
  const settings = profileStore.current.settings;
  audio.setMasterVolume(settings.masterVolume);
  audio.setMusicVolume(settings.musicVolume);
  audio.setSfxMuted(settings.sfxMuted);
  audio.setMusicMuted(settings.musicMuted);
  renderer?.setFov(settings.fov);
  renderer?.setShakeIntensity(settings.shakeIntensity);
  renderer?.setReduceFlashing(settings.reduceFlashing);
  hud.setFps(fpsValue, settings.showFps);
  input?.updateSettings({
    keymap: settings.keymap as never,
    mouseSensitivity: settings.mouseSensitivity,
  });
}

/** Applies the quality tier, recreating the renderer only when required. */
function applyQuality(tier: QualityTier): void {
  const profile = QUALITY_PROFILES[tier];
  if (!renderer) return;
  renderer.applyQuality(profile);
}

// ---------------------------------------------------------------- toasts

function toast(message: string, kind: 'info' | 'error' | 'success' = 'info'): void {
  const node = el('div', { class: `toast toast--${kind}`, text: message });
  toastHost.appendChild(node);
  window.setTimeout(() => node.remove(), 3600);
}

// ---------------------------------------------------------------- game flow

function openDifficultyPanel(level: number): void {
  pendingDifficultyLevel = level;
  screens.selectedLevel = level;
  const panel = screens.buildDifficultyPanel(level);

  const overlay = el('div', { class: 'overlay is-active' });
  const modal = el('div', { class: 'modal' }, [
    el('div', { class: 'modal__head' }, [
      el('h2', { text: '选择难度' }),
      el('button', { class: 'modal__close', type: 'button', text: '×', 'aria-label': '关闭' }),
    ]),
    el('div', { class: 'modal__body' }, [panel]),
  ]);
  overlay.appendChild(modal);
  screenRoot.appendChild(overlay);

  const close = () => overlay.remove();
  modal.querySelector('.modal__close')?.addEventListener('click', close);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
}

function startLevel(level: number, difficulty: number): void {
  audio.unlock();

  const profile = profileStore.current;
  const loadout: Partial<Record<WeaponSlot, string>> = {
    primary: profile.loadout.primary,
    secondary: profile.loadout.secondary,
    melee: profile.loadout.melee,
    grenade: profile.loadout.grenade,
    tactical: profile.loadout.tactical,
  };

  simulation = new Simulation({
    level,
    difficulty,
    seed: (Date.now() ^ (level * 2654435761)) >>> 0,
    loadout,
    weaponLevels: profile.progression.weaponLevels,
    companion: profile.progression.equippedCompanion || null,
    character: profile.progression.selectedCharacter,
  });

  if (!renderer) {
    renderer = new GameRenderer(canvasHost, QUALITY_PROFILES[profile.settings.qualityLevel as QualityTier], profile.settings.fov);
  }
  renderer.buildLevel(getLevel(level));
  renderer.setWeaponModel(simulation.activeWeaponDef);
  renderer.applyQuality(QUALITY_PROFILES[profile.settings.qualityLevel as QualityTier]);
  renderer.setFov(profile.settings.fov);
  renderer.setShakeIntensity(profile.settings.shakeIntensity);
  renderer.setReduceFlashing(profile.settings.reduceFlashing);

  hud.reset();
  hud.setWeaponSlots(loadout, simulation.currentSlot);

  screenRoot.innerHTML = '';
  show(gameRoot, true);
  document.body.classList.add('playing');
  paused = false;

  if (!input) {
    input = new InputController(
      renderer.renderer.domElement,
      {
        keymap: profileStore.current.settings.keymap as never,
        mouseSensitivity: profileStore.current.settings.mouseSensitivity,
      },
      {
        onPause: () => togglePause(),
        onPanel: () => undefined,
        onSkipBoss: () => undefined,
        onFireHeldChange: () => undefined,
      },
    );
  }
  input.requestPointerLock();

  running = true;
  lastFrame = performance.now();
  clock.reset();
  requestAnimationFrame(frame);
}

function endRun(result: SettlementResult): void {
  running = false;
  input?.exitPointerLock();

  const profile = profileStore.current;
  profileStore.update((draft) => {
    if (result.outcome === 'victory') {
      const next = calculateUnlockedDifficulty(draft.progression.unlockedDifficulties, result.level);
      draft.progression.unlockedDifficulties[String(result.level)] = next;
      draft.progression.highestClearedLevel = Math.max(
        draft.progression.highestClearedLevel,
        result.level,
      );
    }
    for (const [weaponId, xp] of Object.entries(result.weaponXp)) {
      const current = draft.progression.weaponLevels[weaponId] ?? 1;
      const currentXp = draft.progression.weaponXp[weaponId] ?? 0;
      const applied = applyWeaponXp(current, currentXp, xp);
      draft.progression.weaponLevels[weaponId] = applied.level;
      draft.progression.weaponXp[weaponId] = applied.xp;
    }
  });

  const title = byId('result-title');
  const score = byId('result-score');
  const stats = byId('result-stats');
  const nextBtn = byId('result-next');

  title.textContent = result.outcome === 'victory' ? '任务完成' : '任务失败';
  score.textContent = String(result.score);

  clear(stats);
  const rows: [string, string][] = [
    ['关卡', `${result.level} · ${getLevel(result.level).name}`],
    ['难度', `${result.difficulty} 级`],
    ['击杀', `${result.kills}（BOSS ${result.bossKills}）`],
    ['总伤害', String(result.damageDealt)],
    ['用时', formatDuration(result.durationSeconds)],
  ];
  if (result.outcome === 'victory') {
    rows.push(['解锁难度', result.unlockedDifficulty ? `${result.unlockedDifficulty} 级` : '已满级']);
  }
  for (const [label, value] of rows) {
    stats.appendChild(
      el('div', { class: 'stat-row' }, [
        el('span', { class: 'stat-row__label', text: label }),
        el('span', { class: 'stat-row__value', text: value }),
      ]),
    );
  }

  show(nextBtn, result.outcome === 'victory' && result.level < 50);
  show(byId('result-overlay'), true);

  if (result.outcome === 'victory') audio.victory();
  else audio.defeat();

  void pushToCloud();
}

function togglePause(): void {
  if (!running) return;
  paused = !paused;
  // Release the pointer BEFORE the overlay appears, otherwise the browser
  // keeps routing mouse events to the locked canvas and the menu is
  // unclickable.
  if (paused) input?.exitPointerLock();
  show(byId('pause-overlay'), paused);
  if (!paused) input?.requestPointerLock();
}

function returnHome(): void {
  running = false;
  paused = false;
  simulation = null;
  renderer?.clearLevel();
  renderer?.setWeaponModel(undefined);
  show(byId('pause-overlay'), false);
  show(byId('result-overlay'), false);
  show(gameRoot, false);
  document.body.classList.remove('playing');
  input?.exitPointerLock();
  screens.show('home');
  screens.render();
}

// ---------------------------------------------------------------- economy

function equipWeapon(slot: WeaponSlot, weaponId: string): void {
  profileStore.update((draft) => {
    (draft.loadout as Record<string, string>)[slot] = weaponId;
  });
  screens.render();
}

function buyWeapon(weaponId: string): void {
  const weapon = getWeapon(weaponId);
  const profile = profileStore.current;
  if (profile.progression.ownedWeapons[weaponId]) {
    toast('已拥有该装备');
    return;
  }
  if (profile.progression.gold < weapon.price) {
    toast('金币不足', 'error');
    return;
  }
  profileStore.update((draft) => {
    draft.progression.gold -= weapon.price;
    draft.progression.ownedWeapons[weaponId] = true;
  });
  toast(`已购买 ${weapon.name}`, 'success');
  screens.render();
}

// ---------------------------------------------------------------- keymap

function startRebind(action: string): void {
  rebindAction = action;
  toast('请按下新的按键（Esc 取消）');
  input?.captureNextKey();
}

function resetKeymap(): void {
  profileStore.update((draft) => {
    draft.settings.keymap = { ...defaultKeymap() };
  });
  applySettings();
  screens.render();
}

function defaultKeymap() {
  return {
    moveForward: 'KeyW',
    moveBackward: 'KeyS',
    moveLeft: 'KeyA',
    moveRight: 'KeyD',
    jump: 'Space',
    reload: 'KeyR',
    weaponSkill: 'Mouse2',
    weaponSpecial: 'KeyX',
    pause: 'Escape',
    panel: 'KeyQ',
    skipBoss: 'KeyM',
    holdFire: 'KeyK',
  };
}

// ---------------------------------------------------------------- save i/o

function exportProfile(): void {
  const payload = JSON.stringify(profileStore.current, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = el('a', { href: url, download: 'cs_profile_v5.json' }) as HTMLAnchorElement;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast('存档已导出', 'success');
}

function openLegacyImport(): void {
  const body = byId('legacy-import-body');
  clear(body);
  body.appendChild(
    el('p', { text: '把旧版浏览器导出的 localStorage 内容粘贴到下面的输入框，或直接选择导出的 JSON 文件。导入前会先校验并预览，原档会保留为备份。' }),
  );

  const textarea = el('textarea', { class: 'settings__textarea', rows: '10', placeholder: '{"cs_save_v2": "...", "cs_characters_v1": "..."}' }) as HTMLTextAreaElement;
  body.appendChild(textarea);

  const fileInput = el('input', { type: 'file', accept: 'application/json,.json', class: 'settings__file' }) as HTMLInputElement;
  body.appendChild(fileInput);

  const preview = el('div', { class: 'legacy-preview' });
  body.appendChild(preview);

  const apply = el('button', { class: 'btn btn--primary', type: 'button', text: '导入' });
  body.appendChild(apply);

  const parseInput = (): Record<string, string | null> => {
    const raw = textarea.value.trim();
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      // Accept either the raw localStorage map or a wrapper object.
      if (parsed && typeof parsed === 'object' && 'legacy' in parsed) {
        return parsed.legacy as Record<string, string | null>;
      }
      return parsed as Record<string, string | null>;
    } catch {
      return {};
    }
  };

  const renderPreview = (): void => {
    clear(preview);
    const snapshot = parseInput();
    const report = migrateLegacySave(snapshot);
    preview.appendChild(
      el('p', {
        text: report.migrated
          ? `检测到旧存档：读取 ${report.keysRead.length} 项，金币 ${formatGold(report.profile.progression.gold)}，已购武器 ${Object.keys(report.profile.progression.ownedWeapons).length} 件。`
          : '未检测到可迁移的旧存档数据。',
      }),
    );
    for (const warning of report.warnings) {
      preview.appendChild(el('p', { class: 'toast toast--error', text: warning }));
    }
  };

  textarea.addEventListener('input', renderPreview);
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    textarea.value = await file.text();
    renderPreview();
  });

  apply.addEventListener('click', () => {
    const snapshot = parseInput();
    const report = migrateLegacySave(snapshot);
    if (!report.migrated) {
      toast('没有可迁移的旧存档', 'error');
      return;
    }
    // Keep a backup of the current profile before overwriting it.
    window.localStorage.setItem('cs_profile_v5_pre_legacy_import', JSON.stringify(profileStore.current));
    profileStore.replace({
      ...report.profile,
      // An imported save has NOT been confirmed by the server yet.
      syncState: 'imported',
    });
    byId('legacy-import-modal').classList.add('is-hidden');
    screens.render();
    toast(`已导入旧存档（读取 ${report.keysRead.length} 项）`, 'success');
  });

  show(byId('legacy-import-modal'), true);
}

// ---------------------------------------------------------------- loop

function frame(now: number): void {
  if (!running) return;
  requestAnimationFrame(frame);

  const realDelta = Math.min((now - lastFrame) / 1000, 0.25);
  lastFrame = now;

  // FPS sampling.
  fpsAccumulator += realDelta;
  fpsFrames += 1;
  if (fpsAccumulator >= 0.5) {
    fpsValue = fpsFrames / fpsAccumulator;
    fpsAccumulator = 0;
    fpsFrames = 0;
    hud.setFps(fpsValue, profileStore.current.settings.showFps);
  }

  if (!paused && simulation) {
    const look = input?.consumeLook();
    const wheel = input?.consumeWheel();
    if (wheel !== 0) simulation.cycleSlot(wheel === 1 ? 1 : -1);

    const steps = clock.advance(realDelta);
    for (let i = 0; i < steps; i++) {
      const snapshot = input?.buildInput() ?? EMPTY_INPUT;
      const yaw = look?.yaw ?? snapshot.yaw;
      const pitch = look?.pitch ?? snapshot.pitch;
      simulation.step(1 / 60, { ...snapshot, yaw, pitch });
      if (simulation.phase !== 'playing') break;
    }

    const events = simulation.drainEvents();
    for (const event of events) {
      hud.handleEvent(event);
      handleGameEvent(event);
    }

    if (simulation.phase !== 'playing' && simulation.phase !== 'defeat') {
      // Victory is handled through the settlement event.
    }
  }

  if (simulation && renderer) {
    const weapon = simulation.activeWeapon;
    hud.update(
      simulation.player,
      weapon ? { current: weapon.ammo.current, reserve: weapon.ammo.reserve, magazine: weapon.ammo.magazine } : null,
      simulation.activeWeaponDef?.name ?? '—',
    );
    if (simulation.boss) {
      hud.setBoss(simulation.boss.name, simulation.boss.health, simulation.boss.maxHealth);
    }
    renderer.render(realDelta, simulation.player, simulation.enemies, simulation.boss, []);
    hud.updateTimers(realDelta);
  }
}

function handleGameEvent(event: Parameters<typeof hud.handleEvent>[0]): void {
  switch (event.type) {
    case 'shoot':
      renderer?.kick(1);
      audio.shoot(event.weaponId);
      break;
    case 'hit': {
      if (event.damage.amount <= 0) break;
      if (event.damage.crit) audio.crit();
      else if (event.damage.headshot) audio.headshot();
      else audio.hit();
      break;
    }
    case 'enemy-killed':
      audio.enemyDeath();
      break;
    case 'boss-killed':
      audio.bossDeath();
      renderer?.addShake(1.2);
      break;
    case 'player-hurt':
      audio.playerHurt();
      renderer?.addShake(0.7);
      break;
    case 'player-died':
      audio.playerHurt();
      break;
    case 'reload-started':
      audio.reload();
      break;
    case 'dry-fire':
      audio.dryFire();
      break;
    case 'boss-telegraph':
      audio.bossTelegraph();
      renderer?.showTelegraph(event.x, event.z, event.radius);
      break;
    case 'boss-skill':
      audio.bossAttack();
      break;
    case 'hazard-hit':
      audio.hazard();
      break;
    case 'buff-taken':
    case 'bounce':
      audio.pickup();
      break;
    case 'weapon-switched':
      renderer?.setWeaponModel(simulation?.activeWeaponDef);
      hud.setWeaponSlots(
        {
          primary: profileStore.current.loadout.primary,
          secondary: profileStore.current.loadout.secondary,
          melee: profileStore.current.loadout.melee,
          grenade: profileStore.current.loadout.grenade,
          tactical: profileStore.current.loadout.tactical,
        },
        event.slot,
      );
      break;
    case 'settled':
      endRun(event.result);
      break;
    default:
      break;
  }
}

/**
 * Pushes the local profile to the cloud.
 *
 * The server answers 409 when another device already wrote a newer revision;
 * in that case the local copy is NOT overwritten, and the profile stays
 * marked as unconfirmed until the player resolves the conflict.
 */
async function pushToCloud(): Promise<void> {
  if (!api.signedIn) return;
  const local = profileStore.current;
  try {
    const result = await api.pushProfile(local, local.revision);
    if ('conflict' in result) {
      profileStore.update((draft) => {
        draft.syncState = 'imported';
      });
      toast('云端存档有更新，本地改动暂未同步', 'error');
      return;
    }
    profileStore.update((draft) => {
      draft.revision = result.revision;
      draft.syncState = 'synced';
    });
  } catch {
    // Offline or the API is unavailable: the local save stays authoritative.
  }
}

// ---------------------------------------------------------------- boot

function bindGlobalButtons(): void {
  byId('pause-resume').addEventListener('click', () => togglePause());
  byId('pause-restart').addEventListener('click', () => {
    if (!simulation) return;
    const level = simulation.level.id;
    const difficulty = simulation.difficulty.tier;
    show(byId('pause-overlay'), false);
    startLevel(level, difficulty);
  });
  byId('pause-home').addEventListener('click', () => returnHome());
  byId('pause-settings').addEventListener('click', () => {
    show(byId('pause-overlay'), false);
    screens.show('settings');
  });
  byId('result-retry').addEventListener('click', () => {
    if (!simulation) return;
    const level = simulation.level.id;
    const difficulty = simulation.difficulty.tier;
    show(byId('result-overlay'), false);
    startLevel(level, difficulty);
  });
  byId('result-next').addEventListener('click', () => {
    if (!simulation) return;
    const next = Math.min(50, simulation.level.id + 1);
    show(byId('result-overlay'), false);
    startLevel(next, simulation.difficulty.tier);
  });
  byId('result-home').addEventListener('click', () => returnHome());
  byId('settings-close').addEventListener('click', () => {
    byId('settings-modal').classList.add('is-hidden');
  });
  byId('legacy-import-close').addEventListener('click', () => {
    byId('legacy-import-modal').classList.add('is-hidden');
  });

  // The canvas click re-acquires the pointer lock.
  canvasHost.addEventListener('click', () => {
    audio.unlock();
    if (running && !paused) input?.requestPointerLock();
  });
}

function boot(): void {
  bindGlobalButtons();
  applySettings();

  // The key capture for rebinding is handled by the input controller.
  window.addEventListener('keydown', (event) => {
    if (!rebindAction) return;
    if (event.code === 'Escape') {
      rebindAction = null;
      return;
    }
    profileStore.update((draft) => {
      (draft.settings.keymap as Record<string, string>)[rebindAction!] = event.code;
    });
    rebindAction = null;
    applySettings();
    screens.render();
  });

  screens.show('home');

  // Restore a cloud session if one exists; failures are silent by design.
  api.restoreSession();
  if (api.signedIn) {
    void api
      .fetchProfile()
      .then(async (result) => {
        if (!result) return;
        const local = profileStore.current;
        // The server copy wins only when the local one was never confirmed.
        if (local.syncState === 'synced' && local.revision > result.revision) {
          await pushToCloud();
          return;
        }
        profileStore.replace({ ...result.profile, syncState: 'synced' });
      })
      .catch(() => undefined);
  }

  // Release every resource when the page goes away.
  const teardown = () => {
    profileStore.dispose();
    input?.dispose();
    audio.dispose();
    renderer?.dispose();
  };
  window.addEventListener('pagehide', teardown);
  window.addEventListener('beforeunload', teardown);
}

boot();

// Expose a small surface for the end-to-end tests.
declare global {
  interface Window {
    __combatStrike?: {
      screens: ScreenManager;
      profileStore: ProfileStore;
      startLevel: (level: number, difficulty: number) => void;
      getSimulation: () => Simulation | null;
      getRenderer: () => GameRenderer | null;
      /** Test hook: finishes the current run immediately. */
      forceVictory: () => void;
      chapterCount: number;
      weaponCount: number;
    };
  }
}

window.__combatStrike = {
  screens,
  profileStore,
  startLevel,
  getSimulation: () => simulation,
  getRenderer: () => renderer,
  forceVictory: () => {
    simulation?.forceVictory();
  },
  chapterCount: CHAPTERS.length,
  weaponCount: WEAPONS.length,
};

export { prettyKey };
