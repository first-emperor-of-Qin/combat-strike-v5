/**
 * HUD binding.
 *
 * Reads the simulation state and writes it into the DOM. The HUD never owns
 * state and never mutates the simulation.
 */
import { getWeapon, SLOT_LABELS, type WeaponSlot } from '@combat-strike/content';
import type { PlayerState, SimulationEvent } from '@combat-strike/game-core';
import { SLOT_ORDER } from '@combat-strike/game-core';
import { byId, clear, formatNumber, show } from './dom.js';

export interface HudElements {
  healthFill: HTMLElement;
  healthValue: HTMLElement;
  energyFill: HTMLElement;
  energyValue: HTMLElement;
  shieldBar: HTMLElement;
  shieldFill: HTMLElement;
  shieldValue: HTMLElement;
  bossBar: HTMLElement;
  bossName: HTMLElement;
  bossFill: HTMLElement;
  bossValue: HTMLElement;
  scoreValue: HTMLElement;
  ammoCurrent: HTMLElement;
  ammoReserve: HTMLElement;
  weaponName: HTMLElement;
  weaponSlots: HTMLElement;
  skillIcons: HTMLElement;
  crosshair: HTMLElement;
  waveBanner: HTMLElement;
  waveBannerTitle: HTMLElement;
  waveBannerSub: HTMLElement;
  bossWarning: HTMLElement;
  damageNumbers: HTMLElement;
  fpsCounter: HTMLElement;
}

export class Hud {
  private elements: HudElements;
  private waveBannerTimer = 0;

  constructor() {
    this.elements = {
      healthFill: byId('health-fill'),
      healthValue: byId('health-value'),
      energyFill: byId('energy-fill'),
      energyValue: byId('energy-value'),
      shieldBar: byId('shield-bar'),
      shieldFill: byId('shield-fill'),
      shieldValue: byId('shield-value'),
      bossBar: byId('boss-bar'),
      bossName: byId('boss-name'),
      bossFill: byId('boss-fill'),
      bossValue: byId('boss-value'),
      scoreValue: byId('score-value'),
      ammoCurrent: byId('ammo-current'),
      ammoReserve: byId('ammo-reserve'),
      weaponName: byId('current-weapon-name'),
      weaponSlots: byId('weapon-slots'),
      skillIcons: byId('skill-icons'),
      crosshair: byId('crosshair'),
      waveBanner: byId('wave-banner'),
      waveBannerTitle: byId('wave-banner-title'),
      waveBannerSub: byId('wave-banner-sub'),
      bossWarning: byId('boss-warning'),
      damageNumbers: byId('damage-numbers'),
      fpsCounter: byId('fps-counter'),
    };
  }

  /** Rebuilds the weapon slot strip. */
  setWeaponSlots(loadout: Partial<Record<WeaponSlot, string>>, active: WeaponSlot): void {
    const strip = this.elements.weaponSlots;
    clear(strip);
    for (const slot of SLOT_ORDER) {
      const id = loadout[slot];
      const weapon = id && id !== 'none' ? getWeapon(id) : undefined;
      const cell = document.createElement('div');
      cell.className = `weapon-slot${slot === active ? ' is-active' : ''}`;
      cell.dataset.slot = slot;
      cell.textContent = weapon ? weapon.icon : '—';
      cell.title = weapon ? `${SLOT_LABELS[slot]}：${weapon.name}` : `${SLOT_LABELS[slot]}：未装备`;
      strip.appendChild(cell);
    }
  }

  /** Updates the player bars, ammo and score. */
  update(player: PlayerState, ammo: { current: number; reserve: number | null; magazine: number | null } | null, weaponName: string): void {
    const healthPct = Math.max(0, Math.min(1, player.health / Math.max(1, player.maxHealth)));
    this.elements.healthFill.style.width = `${healthPct * 100}%`;
    this.elements.healthValue.textContent = formatNumber(player.health);

    const energyPct = Math.max(0, Math.min(1, player.energy / Math.max(1, player.maxEnergy)));
    this.elements.energyFill.style.width = `${energyPct * 100}%`;
    this.elements.energyValue.textContent = formatNumber(player.energy);

    show(this.elements.shieldBar, player.shield > 0);
    if (player.shield > 0) {
      this.elements.shieldFill.style.width = `${Math.min(1, player.shield / Math.max(1, player.maxHealth)) * 100}%`;
      this.elements.shieldValue.textContent = formatNumber(player.shield);
    }

    this.elements.scoreValue.textContent = formatNumber(player.score);
    this.elements.weaponName.textContent = weaponName;

    if (ammo) {
      if (ammo.magazine === null) {
        this.elements.ammoCurrent.textContent = '∞';
        this.elements.ammoReserve.textContent = '';
      } else {
        this.elements.ammoCurrent.textContent = String(ammo.current);
        this.elements.ammoReserve.textContent = String(ammo.reserve ?? 0);
      }
    }
  }

  /** Shows the boss bar. */
  setBoss(name: string | null, health: number, maxHealth: number): void {
    show(this.elements.bossBar, name !== null);
    if (name === null) return;
    this.elements.bossName.textContent = name;
    this.elements.bossFill.style.width = `${Math.max(0, Math.min(1, health / Math.max(1, maxHealth))) * 100}%`;
    this.elements.bossValue.textContent = `${formatNumber(health)} / ${formatNumber(maxHealth)}`;
  }

  /** Shows a wave banner for a couple of seconds. */
  announceWave(title: string, sub: string): void {
    this.elements.waveBannerTitle.textContent = title;
    this.elements.waveBannerSub.textContent = sub;
    show(this.elements.waveBanner, true);
    this.waveBannerTimer = 2.2;
  }

  /** Shows a boss telegraph warning. */
  warnBoss(text: string): void {
    this.elements.bossWarning.textContent = text;
    show(this.elements.bossWarning, true);
  }

  clearBossWarning(): void {
    show(this.elements.bossWarning, false);
  }

  flashCrosshair(): void {
    const crosshair = this.elements.crosshair;
    crosshair.classList.add('is-hit');
    window.setTimeout(() => crosshair.classList.remove('is-hit'), 90);
  }

  setFps(value: number, visible: boolean): void {
    show(this.elements.fpsCounter, visible);
    if (visible) this.elements.fpsCounter.textContent = `${Math.round(value)} FPS`;
  }

  /** Advances the transient HUD timers. */
  updateTimers(dt: number): void {
    if (this.waveBannerTimer > 0) {
      this.waveBannerTimer -= dt;
      if (this.waveBannerTimer <= 0) show(this.elements.waveBanner, false);
    }
  }

  /** Reflects a simulation event in the HUD. */
  handleEvent(event: SimulationEvent): void {
    switch (event.type) {
      case 'wave-started':
        this.announceWave(
          event.wave === 3 ? 'BOSS 战' : `第 ${event.wave} 波`,
          event.wave === 1 ? '小怪来袭' : event.wave === 2 ? '精英来袭' : '击败 BOSS 完成关卡',
        );
        break;
      case 'boss-telegraph':
        this.warnBoss(`⚠ ${event.skillId}`);
        break;
      case 'boss-skill':
        this.clearBossWarning();
        break;
      case 'hit':
        this.flashCrosshair();
        break;
      default:
        break;
    }
  }

  reset(): void {
    this.clearBossWarning();
    show(this.elements.waveBanner, false);
    this.setBoss(null, 0, 0);
  }
}
