/**
 * Non-game screens: home, level select, loadout, codex, shop and settings.
 *
 * Every screen is rendered from the content pack, so the numbers shown in a
 * panel and the numbers the simulation uses come from the same source.
 */
import {
  BOSS_SKILLS,
  CHARACTERS,
  CHAPTERS,
  COMPANIONS,
  DIFFICULTIES,
  LEVELS,
  WEAPONS,
  bossHpFor,
  getDifficulty,
  getLevel,
  getWeapon,
  minionHpFor,
  weaponsBySlot,
  type DifficultyDef,
  type LevelDef,
  type WeaponDef,
  type WeaponSlot,
} from '@combat-strike/content';
import { maxUnlockedDifficulty, type PlayerProfile } from '@combat-strike/game-core';
import { clear, el, formatGold, formatNumber, show } from './dom.js';

export type ScreenName = 'home' | 'level-select' | 'loadout' | 'codex' | 'shop' | 'settings';

export interface ScreenContext {
  profile: PlayerProfile;
  onStartLevel: (level: number, difficulty: number) => void;
  onOpenLevel: (level: number) => void;
  onEquip: (slot: WeaponSlot, weaponId: string) => void;
  onBuy: (weaponId: string) => void;
  onSelectCharacter: (id: string) => void;
  onSelectCompanion: (id: string) => void;
  onSettingChanged: () => void;
  onRebind: (action: string) => void;
  onResetKeymap: () => void;
  onExportProfile: () => void;
  onImportProfile: () => void;
}

export class ScreenManager {
  private root: HTMLElement;
  private ctx: ScreenContext;
  private current: ScreenName = 'home';
  private previous: ScreenName = 'home';

  /** Level currently being inspected in the level select screen. */
  selectedLevel = 1;
  /** Difficulty currently highlighted. */
  selectedDifficulty = 1;
  /** Weapon slot highlighted in the loadout screen. */
  selectedSlot: WeaponSlot = 'primary';
  /** Weapon highlighted in the codex. */
  selectedCodexWeapon = 'thunder';
  /** Codex tab: 'equipment' or 'monsters'. */
  codexTab: 'equipment' | 'monsters' = 'equipment';

  constructor(root: HTMLElement, ctx: ScreenContext) {
    this.root = root;
    this.ctx = ctx;
  }

  get active(): ScreenName {
    return this.current;
  }

  show(screen: ScreenName): void {
    if (screen !== this.current) this.previous = this.current;
    this.current = screen;
    this.render();
  }

  back(): void {
    this.show(this.previous);
  }

  render(): void {
    clear(this.root);
    const node = this.buildScreen(this.current);
    this.root.appendChild(node);
  }

  private buildScreen(screen: ScreenName): HTMLElement {
    switch (screen) {
      case 'level-select':
        return this.buildLevelSelect();
      case 'loadout':
        return this.buildLoadout();
      case 'codex':
        return this.buildCodex();
      case 'shop':
        return this.buildShop();
      case 'settings':
        return this.buildSettings();
      case 'home':
      default:
        return this.buildHome();
    }
  }

  // ------------------------------------------------------------ home

  private buildHome(): HTMLElement {
    const profile = this.ctx.profile;
    const cleared = profile.progression.highestClearedLevel;

    const screen = el('div', { class: 'screen screen--home is-active', 'data-screen': 'home' });
    screen.appendChild(
      el('div', { class: 'home__hero' }, [
        el('div', { class: 'home__eyebrow screen__eyebrow' }, ['COMBAT STRIKE v5.1']),
        el('h1', { class: 'home__title' }, ['枪战突击']),
        el('p', { class: 'home__subtitle' }, [
          '单人 PvE 战术射击战役 · 50 关 / 10 章节 / 44 件装备',
        ]),
      ]),
    );

    screen.appendChild(
      el('div', { class: 'home__topbar' }, [
        el('span', { class: 'topbar__gold', text: `金币 ${formatGold(profile.progression.gold)}` }),
        el('span', { class: 'topbar__user', text: `最高通关 ${cleared} 关` }),
        el('span', { class: 'topbar__sync', text: syncLabel(profile.syncState) }),
      ]),
    );

    const actions = el('div', { class: 'home__actions' });
    const campaign = el('button', { class: 'mode-card', type: 'button' }, [
      el('span', { class: 'mode-card__icon', text: '◈' }),
      el('span', { class: 'mode-card__name', text: '战役模式' }),
      el('span', { class: 'mode-card__desc', text: '进入关卡选择，挑战 50 关的完整战役' }),
    ]);
    campaign.addEventListener('click', () => this.show('level-select'));
    actions.appendChild(campaign);
    screen.appendChild(actions);

    const dock = el('div', { class: 'home__dock' });
    const dockItems: { id: string; icon: string; label: string; target: ScreenName }[] = [
      { id: 'loadout', icon: '⚔', label: '装备', target: 'loadout' },
      { id: 'shop', icon: '◈', label: '商店', target: 'shop' },
      { id: 'codex', icon: '✦', label: '图鉴', target: 'codex' },
      { id: 'settings', icon: '⚙', label: '设置', target: 'settings' },
    ];
    for (const item of dockItems) {
      const button = el('button', { class: 'dock-btn', type: 'button', 'data-dock': item.id }, [
        el('span', { class: 'dock-btn__ico', text: item.icon }),
        el('span', { class: 'dock-btn__label', text: item.label }),
      ]);
      button.addEventListener('click', () => this.show(item.target));
      dock.appendChild(button);
    }
    screen.appendChild(dock);
    return screen;
  }

  // ------------------------------------------------------------ level select

  private buildLevelSelect(): HTMLElement {
    const screen = el('div', { class: 'screen screen--level-select is-active', 'data-screen': 'level-select' });
    const profile = this.ctx.profile;

    screen.appendChild(
      el('div', { class: 'screen__head' }, [
        el('div', { class: 'screen__lead' }, [
          el('span', { class: 'screen__eyebrow', text: 'LEVEL SELECT' }),
          el('span', { class: 'screen__title', text: '关卡选择' }),
        ]),
        el('div', { class: 'screen__meta' }, [
          el('span', { class: 'ui3-pill', text: '共 50 关 · 每关 3 波：小怪 → 精英 → BOSS' }),
        ]),
      ]),
    );

    const body = el('div', { class: 'screen__body' });

    for (const chapter of CHAPTERS) {
      const head = el('div', { class: 'chapter-head' }, [
        el('span', { class: 'chapter-head__name', text: `第 ${chapter.index} 章 · ${chapter.name}` }),
        el('span', { class: 'chapter-head__tagline', text: chapter.tagline }),
        el('span', { class: 'chapter-head__arrow', text: '▼' }),
      ]);
      const grid = el('div', { class: 'level-grid' });

      for (const level of LEVELS.filter((l) => l.chapter === chapter.index)) {
        grid.appendChild(this.buildLevelCard(level));
      }

      head.addEventListener('click', () => {
        const collapsed = grid.classList.toggle('is-hidden');
        const arrow = head.querySelector('.chapter-head__arrow');
        if (arrow) arrow.textContent = collapsed ? '▶' : '▼';
      });
      body.appendChild(head);
      body.appendChild(grid);
    }

    screen.appendChild(body);

    const foot = el('div', { class: 'screen__foot' }, [
      el('button', { class: 'btn', type: 'button', text: '返回主菜单', 'data-action': 'back-home' }),
    ]);
    foot.querySelector('button')?.addEventListener('click', () => this.show('home'));
    screen.appendChild(foot);
    void profile;
    return screen;
  }

  private buildLevelCard(level: LevelDef): HTMLElement {
    const pureBoss = level.waves.minion.every((n) => n === 0);
    const card = el('button', {
      class: `level-card${pureBoss ? ' is-pure-boss' : ''}`,
      type: 'button',
      'data-level': String(level.id),
    }, [
      el('div', { class: 'level-card__num', text: String(level.id) }),
      el('div', { class: 'level-card__name', text: level.name }),
      el('div', { class: 'level-card__desc', text: level.subtitle }),
      el('div', { class: 'level-card__boss', text: `BOSS：${level.boss.name}` }),
    ]);
    card.addEventListener('click', () => this.ctx.onOpenLevel(level.id));
    return card;
  }

  /** The difficulty picker, shown as an overlay panel. */
  buildDifficultyPanel(level: number): HTMLElement {
    const profile = this.ctx.profile;
    const maxUnlocked = maxUnlockedDifficulty(profile.progression.unlockedDifficulties, level);
    const panel = el('div', { class: 'difficulty-panel' });

    panel.appendChild(
      el('div', { class: 'difficulty-panel__title', text: `${level} · ${getLevel(level).name}` }),
    );

    const grid = el('div', { class: 'difficulty-grid' });
    for (const difficulty of DIFFICULTIES) {
      const locked = difficulty.tier > maxUnlocked;
      const button = el('button', {
        class: `difficulty-btn${locked ? ' is-locked' : ''}${difficulty.tier === this.selectedDifficulty ? ' is-selected' : ''}`,
        type: 'button',
        'data-difficulty': String(difficulty.tier),
      }, [
        el('span', { class: 'difficulty-btn__label', text: difficulty.label }),
        el('span', { class: 'difficulty-btn__mult', text: `×${formatNumber(difficulty.multiplier)}` }),
        el('span', { class: 'difficulty-btn__affix', text: locked ? '未解锁' : difficulty.affixName }),
      ]);
      if (!locked) {
        button.addEventListener('click', () => {
          this.selectedDifficulty = difficulty.tier;
          this.ctx.onStartLevel(level, difficulty.tier);
        });
      }
      grid.appendChild(button);
    }
    panel.appendChild(grid);
    panel.appendChild(this.buildDifficultyDetail(level, this.selectedDifficulty));
    return panel;
  }

  private buildDifficultyDetail(level: number, tier: number): HTMLElement {
    const difficulty = getDifficulty(tier);
    const list = el('div', { class: 'stat-table' });
    const rows: [string, string][] = [
      ['BOSS 生命', formatNumber(bossHpFor(level, tier))],
      ['第 1 波小怪生命', formatNumber(minionHpFor(level, 1, tier))],
      ['第 2 波精英生命', formatNumber(minionHpFor(level, 2, tier))],
      ['敌人移速', `×${difficulty.speedMul.toFixed(2)}`],
      ['攻击频率', `×${difficulty.fireRateMul.toFixed(2)}`],
      ['精英比例', `+${Math.round(difficulty.eliteBonus * 100)}%`],
      ['词缀', difficulty.affixName],
    ];
    for (const [label, value] of rows) {
      list.appendChild(
        el('div', { class: 'stat-row' }, [
          el('span', { class: 'stat-row__label', text: label }),
          el('span', { class: 'stat-row__value', text: value }),
        ]),
      );
    }
    return list;
  }

  // ------------------------------------------------------------ loadout

  private buildLoadout(): HTMLElement {
    const screen = el('div', { class: 'screen screen--loadout is-active', 'data-screen': 'loadout' });
    const profile = this.ctx.profile;

    screen.appendChild(
      el('div', { class: 'screen__head' }, [
        el('div', { class: 'screen__lead' }, [
          el('span', { class: 'screen__eyebrow', text: 'LOADOUT' }),
          el('span', { class: 'screen__title', text: '装备' }),
        ]),
        el('div', { class: 'screen__meta' }, [
          el('span', { class: 'ui3-pill', text: `金币 ${formatGold(profile.progression.gold)}` }),
        ]),
      ]),
    );

    const body = el('div', { class: 'screen__body' });

    const tabs = el('div', { class: 'slot-tabs' });
    const slotLabels: Record<WeaponSlot, string> = {
      primary: '主武器',
      secondary: '副武器',
      melee: '近战',
      grenade: '投掷',
      tactical: '战术',
    };
    for (const slot of ['primary', 'secondary', 'melee', 'grenade', 'tactical'] as WeaponSlot[]) {
      const equippedId = (profile.loadout as Record<string, string>)[slot];
      const equipped = equippedId && equippedId !== 'none' ? getWeapon(equippedId) : null;
      const tab = el('button', {
        class: `slot-tab${slot === this.selectedSlot ? ' is-active' : ''}`,
        type: 'button',
        'data-slot': slot,
      }, [
        el('span', { class: 'slot-tab__icon', text: equipped?.icon ?? '—' }),
        el('span', { class: 'slot-tab__name', text: slotLabels[slot] }),
      ]);
      tab.addEventListener('click', () => {
        this.selectedSlot = slot;
        this.render();
      });
      tabs.appendChild(tab);
    }
    body.appendChild(tabs);

    const grid = el('div', { class: 'weapon-grid' });
    const owned = profile.progression.ownedWeapons;
    for (const weapon of weaponsBySlot(this.selectedSlot)) {
      const isOwned = !!owned[weapon.id];
      const isEquipped = (profile.loadout as Record<string, string>)[this.selectedSlot] === weapon.id;
      const card = el('button', {
        class: `weapon-card${isEquipped ? ' is-equipped' : ''}${isOwned ? ' is-owned' : ' is-locked'}`,
        type: 'button',
        'data-weapon': weapon.id,
      }, [
        el('div', { class: 'weapon-card__name' }, [`${weapon.icon} ${weapon.name}`]),
        el('div', { class: 'weapon-card__tag', text: `${weapon.qualityLabel} · ${weapon.typeLabel}` }),
        el('div', { class: 'weapon-card__stats', text: weaponStatsLine(weapon) }),
      ]);
      card.addEventListener('click', () => {
        if (isOwned) this.ctx.onEquip(this.selectedSlot, weapon.id);
        else this.ctx.onBuy(weapon.id);
      });
      grid.appendChild(card);
    }
    body.appendChild(grid);
    screen.appendChild(body);

    const foot = el('div', { class: 'screen__foot' }, [
      el('button', { class: 'btn', type: 'button', text: '返回主菜单', 'data-action': 'back-home' }),
    ]);
    foot.querySelector('button')?.addEventListener('click', () => this.show('home'));
    screen.appendChild(foot);
    return screen;
  }

  // ------------------------------------------------------------ codex

  private buildCodex(): HTMLElement {
    const screen = el('div', { class: 'screen screen--codex is-active', 'data-screen': 'codex' });
    screen.appendChild(
      el('div', { class: 'screen__head' }, [
        el('div', { class: 'screen__lead' }, [
          el('span', { class: 'screen__eyebrow', text: 'CODEX' }),
          el('span', { class: 'screen__title', text: '图鉴' }),
        ]),
      ]),
    );

    const body = el('div', { class: 'screen__body' });
    const tabs = el('div', { class: 'codex-tabs' });
    for (const [id, label] of [['equipment', '装备图鉴'], ['monsters', '怪物图鉴']] as const) {
      const tab = el('button', {
        class: `codex-tab${this.codexTab === id ? ' is-active' : ''}`,
        type: 'button',
        'data-codex-tab': id,
      }, [label]);
      tab.addEventListener('click', () => {
        this.codexTab = id;
        this.render();
      });
      tabs.appendChild(tab);
    }
    body.appendChild(tabs);

    const split = el('div', { class: 'codex-split' });
    const list = el('div', { class: 'codex-list' });
    const detail = el('div', { class: 'codex-detail' });

    if (this.codexTab === 'equipment') {
      for (const weapon of WEAPONS) {
        const item = el('button', {
          class: `codex-item${weapon.id === this.selectedCodexWeapon ? ' is-selected' : ''}`,
          type: 'button',
          'data-codex-weapon': weapon.id,
        }, [`${weapon.icon} ${weapon.name}`]);
        item.addEventListener('click', () => {
          this.selectedCodexWeapon = weapon.id;
          this.render();
        });
        list.appendChild(item);
      }
      detail.appendChild(this.buildWeaponDetail(getWeapon(this.selectedCodexWeapon)));
    } else {
      for (const level of LEVELS) {
        const item = el('button', {
          class: 'codex-item',
          type: 'button',
          'data-codex-level': String(level.id),
        }, [`${level.id} · ${level.name}`]);
        item.addEventListener('click', () => {
          detail.innerHTML = '';
          detail.appendChild(this.buildBossDetail(level));
        });
        list.appendChild(item);
      }
      detail.appendChild(this.buildBossDetail(getLevel(1)));
    }

    split.appendChild(list);
    split.appendChild(detail);
    body.appendChild(split);
    screen.appendChild(body);

    const foot = el('div', { class: 'screen__foot' }, [
      el('button', { class: 'btn', type: 'button', text: '返回主菜单', 'data-action': 'back-home' }),
    ]);
    foot.querySelector('button')?.addEventListener('click', () => this.show('home'));
    screen.appendChild(foot);
    return screen;
  }

  private buildWeaponDetail(weapon: WeaponDef): HTMLElement {
    const wrap = el('div', { class: 'codex-detail__inner' });
    wrap.appendChild(el('h3', { class: 'codex-detail__title', text: `${weapon.icon} ${weapon.name}` }));
    wrap.appendChild(el('p', { class: 'codex-detail__tagline', text: weapon.tagline }));

    const stats = el('div', { class: 'stat-table' });
    const rows: [string, string][] = [
      ['品质', weapon.qualityLabel],
      ['类型', weapon.typeLabel],
      ['基础伤害', `${formatNumber(weapon.stats.baseDamage)}${weapon.stats.unit}`],
    ];
    if (weapon.stats.fireInterval) {
      rows.push(['射速', `${(1 / weapon.stats.fireInterval).toFixed(1)} 发/秒`]);
    }
    if (weapon.stats.magazine === null) {
      rows.push(['弹药', '无限']);
    } else {
      rows.push(['弹匣', `${weapon.stats.magazine} / ${weapon.stats.reserve ?? '—'}`]);
      if (weapon.stats.reloadTime) rows.push(['换弹', `${weapon.stats.reloadTime.toFixed(1)} 秒`]);
    }
    rows.push(['价格', weapon.price > 0 ? `${formatGold(weapon.price)} 金币` : '初始装备']);
    for (const [label, value] of rows) {
      stats.appendChild(
        el('div', { class: 'stat-row' }, [
          el('span', { class: 'stat-row__label', text: label }),
          el('span', { class: 'stat-row__value', text: value }),
        ]),
      );
    }
    wrap.appendChild(stats);

    for (const passive of weapon.passives) {
      wrap.appendChild(
        el('div', { class: 'skill-line' }, [
          el('span', { class: 'skill-line__kind', text: '被动' }),
          el('span', { class: 'skill-line__text', text: passive }),
        ]),
      );
    }
    for (const active of weapon.actives) {
      wrap.appendChild(
        el('div', { class: 'skill-line' }, [
          el('span', { class: 'skill-line__kind', text: '主动' }),
          el('span', { class: 'skill-line__text', text: active }),
        ]),
      );
    }
    return wrap;
  }

  private buildBossDetail(level: LevelDef): HTMLElement {
    const wrap = el('div', { class: 'codex-detail__inner' });
    wrap.appendChild(el('h3', { class: 'boss-detail__name', text: `${level.id} · ${level.name}` }));
    wrap.appendChild(el('p', { class: 'boss-detail__desc', text: level.subtitle }));
    wrap.appendChild(el('p', { class: 'boss-detail__desc', text: level.boss.desc }));

    const card = el('div', { class: 'boss-detail' });
    card.appendChild(el('div', { class: 'boss-detail__name', text: level.boss.name }));
    card.appendChild(
      el('div', { class: 'boss-detail__hp', text: `第 1 难度生命 ${formatNumber(bossHpFor(level.id, 1))}` }),
    );
    for (const skill of level.boss.skills) {
      const def = BOSS_SKILLS.find((s) => s.id === skill.id);
      card.appendChild(
        el('div', { class: 'skill-card' }, [
          el('span', { class: 'skill-card__name', text: skill.name }),
          el('span', { class: 'skill-card__cooldown', text: `${skill.cooldown} 秒` }),
          el('span', { class: 'skill-card__desc', text: def?.desc ?? '' }),
        ]),
      );
    }
    wrap.appendChild(card);
    return wrap;
  }

  // ------------------------------------------------------------ shop

  private buildShop(): HTMLElement {
    const screen = el('div', { class: 'screen screen--shop is-active', 'data-screen': 'shop' });
    const profile = this.ctx.profile;
    const owned = profile.progression.ownedWeapons;

    screen.appendChild(
      el('div', { class: 'screen__head' }, [
        el('div', { class: 'screen__lead' }, [
          el('span', { class: 'screen__eyebrow', text: 'SHOP' }),
          el('span', { class: 'screen__title', text: '商店' }),
        ]),
        el('div', { class: 'screen__meta' }, [
          el('span', { class: 'ui3-pill', text: `金币 ${formatGold(profile.progression.gold)}` }),
        ]),
      ]),
    );

    const body = el('div', { class: 'screen__body' });
    const grid = el('div', { class: 'shop-grid' });
    for (const weapon of WEAPONS) {
      const isOwned = !!owned[weapon.id];
      const canAfford = profile.progression.gold >= weapon.price;
      const item = el('div', { class: `shop-item${isOwned ? ' is-owned' : ''}` }, [
        el('div', { class: 'shop-item__name', text: `${weapon.icon} ${weapon.name}` }),
        el('div', { class: 'shop-item__tagline', text: weapon.tagline }),
        el('div', { class: 'shop-item__price', text: isOwned ? '已拥有' : `${formatGold(weapon.price)} 金币` }),
      ]);
      const buy = el('button', {
        class: 'shop-item__buy',
        type: 'button',
        text: isOwned ? '装备' : canAfford ? '购买' : '金币不足',
        'data-buy-weapon': weapon.id,
      });
      if (isOwned) {
        buy.addEventListener('click', () => this.show('loadout'));
      } else if (canAfford) {
        buy.addEventListener('click', () => this.ctx.onBuy(weapon.id));
      } else {
        buy.setAttribute('disabled', 'true');
      }
      item.appendChild(buy);
      grid.appendChild(item);
    }
    body.appendChild(grid);
    screen.appendChild(body);

    const foot = el('div', { class: 'screen__foot' }, [
      el('button', { class: 'btn', type: 'button', text: '返回主菜单', 'data-action': 'back-home' }),
    ]);
    foot.querySelector('button')?.addEventListener('click', () => this.show('home'));
    screen.appendChild(foot);
    return screen;
  }

  // ------------------------------------------------------------ settings

  private buildSettings(): HTMLElement {
    const screen = el('div', { class: 'screen screen--settings is-active', 'data-screen': 'settings' });
    const settings = this.ctx.profile.settings;

    screen.appendChild(
      el('div', { class: 'screen__head' }, [
        el('div', { class: 'screen__lead' }, [
          el('span', { class: 'screen__eyebrow', text: 'SETTINGS' }),
          el('span', { class: 'screen__title', text: '设置' }),
        ]),
      ]),
    );

    const body = el('div', { class: 'screen__body' });

    // Audio.
    const audio = el('div', { class: 'settings__section' }, [el('h3', { text: '音量' })]);
    audio.appendChild(
      this.buildSlider('主音量', settings.masterVolume, 0, 1, 0.05, (value) => {
        this.ctx.onSettingChanged();
        void value;
      }),
    );
    audio.appendChild(
      this.buildSlider('音乐音量', settings.musicVolume, 0, 1, 0.05, () => this.ctx.onSettingChanged()),
    );
    audio.appendChild(
      this.buildToggle('音效静音', settings.sfxMuted, () => this.ctx.onSettingChanged()),
    );
    audio.appendChild(
      this.buildToggle('音乐静音', settings.musicMuted, () => this.ctx.onSettingChanged()),
    );
    body.appendChild(audio);

    // Display.
    const display = el('div', { class: 'settings__section' }, [el('h3', { text: '显示' })]);
    display.appendChild(
      this.buildSlider('鼠标灵敏度', settings.mouseSensitivity, 0.0005, 0.02, 0.0005, () =>
        this.ctx.onSettingChanged(),
      ),
    );
    display.appendChild(
      this.buildSlider('视野 (FOV)', settings.fov, 60, 110, 1, () => this.ctx.onSettingChanged()),
    );
    display.appendChild(
      this.buildSlider('震动强度', settings.shakeIntensity, 0, 2, 0.1, () => this.ctx.onSettingChanged()),
    );
    display.appendChild(
      this.buildToggle('降低闪烁', settings.reduceFlashing, () => this.ctx.onSettingChanged()),
    );
    display.appendChild(
      this.buildToggle('自适应画质', settings.adaptiveQuality, () => this.ctx.onSettingChanged()),
    );
    display.appendChild(
      this.buildToggle('显示帧率', settings.showFps, () => this.ctx.onSettingChanged()),
    );
    body.appendChild(display);

    // Key bindings.
    const keys = el('div', { class: 'settings__section' }, [el('h3', { text: '按键设置' })]);
    const keyLabels: Record<string, string> = {
      moveForward: '前进',
      moveBackward: '后退',
      moveLeft: '左移',
      moveRight: '右移',
      jump: '跳跃',
      reload: '换弹',
      weaponSkill: '武器技能',
      weaponSpecial: '武器特殊',
      pause: '暂停',
      panel: '个人面板',
      skipBoss: '跳过波次',
      holdFire: '持续射击',
    };
    for (const [action, label] of Object.entries(keyLabels)) {
      const row = el('div', { class: 'keybind-row' }, [
        el('span', { class: 'keybind-row__action', text: label }),
        el('span', { class: 'keybind-row__key', text: prettyKey(settings.keymap[action as keyof typeof settings.keymap] ?? '') }),
      ]);
      const button = el('button', { class: 'btn btn--small', type: 'button', text: '修改' });
      button.addEventListener('click', () => this.ctx.onRebind(action));
      row.appendChild(button);
      keys.appendChild(row);
    }
    const reset = el('button', { class: 'btn', type: 'button', text: '恢复默认按键' });
    reset.addEventListener('click', () => this.ctx.onResetKeymap());
    keys.appendChild(reset);
    body.appendChild(keys);

    // Save management.
    const saves = el('div', { class: 'settings__section' }, [el('h3', { text: '存档' })]);
    const exportBtn = el('button', { class: 'btn', type: 'button', text: '导出存档' });
    exportBtn.addEventListener('click', () => this.ctx.onExportProfile());
    const importBtn = el('button', { class: 'btn', type: 'button', text: '导入旧版存档' });
    importBtn.addEventListener('click', () => this.ctx.onImportProfile());
    saves.appendChild(exportBtn);
    saves.appendChild(importBtn);
    body.appendChild(saves);

    screen.appendChild(body);

    const foot = el('div', { class: 'screen__foot' }, [
      el('button', { class: 'btn', type: 'button', text: '返回主菜单', 'data-action': 'back-home' }),
    ]);
    foot.querySelector('button')?.addEventListener('click', () => this.show('home'));
    screen.appendChild(foot);
    return screen;
  }

  private buildSlider(
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (value: number) => void,
  ): HTMLElement {
    const input = el('input', { class: 'slider', type: 'range' }) as HTMLInputElement;
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(value);
    const valueEl = el('span', { class: 'stat-row__value', text: formatSettingValue(label, value) });
    input.addEventListener('input', () => {
      const next = Number(input.value);
      valueEl.textContent = formatSettingValue(label, next);
      onChange(next);
    });
    return el('div', { class: 'settings__row' }, [
      el('span', { class: 'stat-row__label', text: label }),
      input,
      valueEl,
    ]);
  }

  private buildToggle(label: string, value: boolean, onChange: () => void): HTMLElement {
    const button = el('button', {
      class: `toggle${value ? ' is-on' : ''}`,
      type: 'button',
      text: value ? '开' : '关',
      'aria-pressed': value ? 'true' : 'false',
    });
    button.addEventListener('click', () => onChange());
    return el('div', { class: 'settings__row' }, [
      el('span', { class: 'stat-row__label', text: label }),
      button,
    ]);
  }
}

// ---------------------------------------------------------------- helpers

/**
 * Describes where the current save came from.
 * An imported save has not been confirmed by the server, so it is labelled
 * explicitly rather than presented as ordinary progress.
 */
export function syncLabel(state: 'local' | 'imported' | 'synced'): string {
  switch (state) {
    case 'synced':
      return '云端已同步';
    case 'imported':
      return '本地导入 · 尚未云端确认';
    case 'local':
    default:
      return '本地存档';
  }
}

/** One-line summary of a weapon's combat stats, derived from the rules. */
export function weaponStatsLine(weapon: WeaponDef): string {
  const parts: string[] = [];
  if (weapon.stats.baseDamage > 0) {
    parts.push(`${formatNumber(weapon.stats.baseDamage)}${weapon.stats.unit}`);
  }
  if (weapon.stats.fireInterval) {
    parts.push(`${(1 / weapon.stats.fireInterval).toFixed(1)} 发/秒`);
  }
  if (weapon.stats.magazine === null) parts.push('无限弹药');
  else if (weapon.stats.magazine) parts.push(`${weapon.stats.magazine} 发弹匣`);
  return parts.join(' · ');
}

/** Turns a raw key code into a readable label. */
export function prettyKey(code: string): string {
  if (!code) return '—';
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Mouse')) return `鼠标${({ Mouse0: '左键', Mouse1: '中键', Mouse2: '右键' } as Record<string, string>)[code] ?? code}`;
  const named: Record<string, string> = {
    Space: '空格',
    Escape: 'Esc',
    ShiftLeft: '左Shift',
    ShiftRight: '右Shift',
    ControlLeft: '左Ctrl',
    ControlRight: '右Ctrl',
    AltLeft: '左Alt',
    AltRight: '右Alt',
  };
  return named[code] ?? code;
}

function formatSettingValue(label: string, value: number): string {
  if (label.includes('灵敏度')) return (value * 1000).toFixed(1);
  if (label.includes('FOV')) return value.toFixed(0);
  if (value <= 1) return `${Math.round(value * 100)}%`;
  return value.toFixed(1);
}

export { show };
