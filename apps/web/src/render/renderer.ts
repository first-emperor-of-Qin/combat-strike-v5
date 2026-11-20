/**
 * Three.js renderer.
 *
 * Builds the procedural level geometry, the enemy and boss meshes, the first
 * person camera and the weapon view model. Everything it allocates is tracked
 * so `dispose()` can release the GPU resources — the legacy build leaked
 * geometries and materials on every level change.
 *
 * The renderer is deliberately kept separate from the simulation: it reads the
 * simulation state and draws it, and never mutates the rules.
 */
import * as THREE from 'three';
import type { LevelDef, WeaponDef } from '@combat-strike/content';
import type { BossState, EnemyState, PlayerState, SimulationEvent } from '@combat-strike/game-core';

export type QualityTier = 0 | 1 | 2 | 3;

export interface QualityProfile {
  tier: QualityTier;
  label: string;
  pixelRatio: number;
  shadows: boolean;
  shadowMapSize: number;
  /** Maximum simultaneously rendered enemies. */
  maxEnemies: number;
  /** Maximum simultaneously rendered damage numbers. */
  maxDamageNumbers: number;
  /** Maximum simultaneous particles. */
  maxParticles: number;
  antialias: boolean;
}

export const QUALITY_PROFILES: Record<QualityTier, QualityProfile> = {
  0: { tier: 0, label: '低', pixelRatio: 0.75, shadows: false, shadowMapSize: 512, maxEnemies: 40, maxDamageNumbers: 8, maxParticles: 30, antialias: false },
  1: { tier: 1, label: '中', pixelRatio: 1, shadows: false, shadowMapSize: 1024, maxEnemies: 55, maxDamageNumbers: 16, maxParticles: 60, antialias: false },
  2: { tier: 2, label: '高', pixelRatio: 1, shadows: true, shadowMapSize: 2048, maxEnemies: 80, maxDamageNumbers: 28, maxParticles: 120, antialias: true },
  3: { tier: 3, label: '极致', pixelRatio: 1.5, shadows: true, shadowMapSize: 2048, maxEnemies: 80, maxDamageNumbers: 40, maxParticles: 200, antialias: true },
};

interface EnemyVisual {
  group: THREE.Group;
  body: THREE.Mesh;
  head: THREE.Mesh;
  accent: THREE.Mesh;
}

export class GameRenderer {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;

  private host: HTMLElement;
  private quality: QualityProfile;
  private levelGroup: THREE.Group | null = null;
  private enemyVisuals = new Map<number, EnemyVisual>();
  private bossVisual: { group: THREE.Group; body: THREE.Mesh; head: THREE.Mesh; accent: THREE.Mesh } | null = null;
  private weaponModel: THREE.Group | null = null;
  private tracers: { line: THREE.Line; life: number }[] = [];
  private damageSprites: { sprite: THREE.Sprite; life: number; velocity: THREE.Vector3 }[] = [];
  private projectiles: THREE.Mesh[] = [];
  private projectilePool: THREE.Mesh[] = [];
  private telegraphRing: THREE.Mesh | null = null;
  private telegraphTimer = 0;

  private clock = new THREE.Clock();
  private recoil = 0;
  private recoilTarget = 0;
  private shake = 0;
  private shakeIntensity = 1;
  private reduceFlashing = false;

  constructor(host: HTMLElement, quality: QualityProfile, fov: number) {
    this.host = host;
    this.quality = quality;
    this.shakeIntensity = 1;

    this.renderer = new THREE.WebGLRenderer({
      antialias: quality.antialias,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.pixelRatio));
    this.renderer.setSize(host.clientWidth || window.innerWidth, host.clientHeight || window.innerHeight);
    this.renderer.shadowMap.enabled = quality.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.tabIndex = 0;
    host.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(fov, this.aspect, 0.05, 500);
    this.camera.rotation.order = 'YXZ';

    window.addEventListener('resize', this.onResize);
  }

  private get aspect(): number {
    const w = this.host.clientWidth || window.innerWidth;
    const h = this.host.clientHeight || window.innerHeight;
    return w / Math.max(1, h);
  }

  private onResize = (): void => {
    const w = this.host.clientWidth || window.innerWidth;
    const h = this.host.clientHeight || window.innerHeight;
    this.camera.aspect = w / Math.max(1, h);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  applyQuality(quality: QualityProfile): void {
    this.quality = quality;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.pixelRatio));
    this.renderer.shadowMap.enabled = quality.shadows;
    this.onResize();
  }

  setFov(fov: number): void {
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  setShakeIntensity(value: number): void {
    this.shakeIntensity = value;
  }

  setReduceFlashing(value: boolean): void {
    this.reduceFlashing = value;
  }

  // ------------------------------------------------------------ level

  /** Builds the level geometry from the content definition. */
  buildLevel(level: LevelDef): void {
    this.clearLevel();

    const group = new THREE.Group();
    const theme = level.theme;

    this.scene.background = new THREE.Color(theme.sky);
    this.scene.fog = new THREE.Fog(theme.fog, theme.fogNear, theme.fogFar);

    const scale = level.boundsScale || 1;
    const roomSize = Math.round(100 * scale);
    const half = Math.round(48 * scale);

    // Ground.
    const groundGeo = new THREE.PlaneGeometry(roomSize, roomSize, 24, 24);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: theme.ground,
      roughness: theme.groundRough,
      metalness: theme.groundMetal,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = this.quality.shadows;
    group.add(ground);

    // Walls.
    const wallMat = new THREE.MeshStandardMaterial({
      color: theme.wall,
      roughness: theme.wallRough,
      metalness: 0.1,
      transparent: theme.wallOpacity < 1,
      opacity: theme.wallOpacity,
    });
    const wallGeo = new THREE.BoxGeometry(roomSize, 8, 1);
    for (const [x, z, rot] of [
      [0, -half - 1, 0],
      [0, half + 1, Math.PI],
      [-half - 1, 0, Math.PI / 2],
      [half + 1, 0, -Math.PI / 2],
    ] as const) {
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(x, 4, z);
      wall.rotation.y = rot;
      group.add(wall);
    }

    // Lighting.
    const hemi = new THREE.HemisphereLight(theme.hemiSky, theme.hemiGround, 1.1);
    group.add(hemi);
    const ambient = new THREE.AmbientLight(theme.ambient, 1.4);
    group.add(ambient);
    const dir = new THREE.DirectionalLight(theme.dirColor, 1.9);
    dir.position.set(theme.dirX, theme.dirY, theme.dirZ);
    if (this.quality.shadows) {
      dir.castShadow = true;
      dir.shadow.mapSize.set(this.quality.shadowMapSize, this.quality.shadowMapSize);
      dir.shadow.camera.near = 0.5;
      dir.shadow.camera.far = 160;
      dir.shadow.camera.left = -half;
      dir.shadow.camera.right = half;
      dir.shadow.camera.top = half;
      dir.shadow.camera.bottom = -half;
    }
    group.add(dir);
    const accent = new THREE.PointLight(theme.accentLight, 1.2, 90);
    accent.position.set(0, 14, 0);
    group.add(accent);

    // Cover, scaled to the arena so the layout reads the same at every size.
    const coverMat = new THREE.MeshStandardMaterial({
      color: theme.wall,
      roughness: Math.min(1, theme.wallRough + 0.1),
      metalness: 0.05,
    });
    const coverCount = Math.max(6, Math.round(14 * (level.decoDensity || 1)));
    const pattern = level.coverPattern;
    for (let i = 0; i < coverCount; i++) {
      const w = 3 + ((i * 7) % 5);
      const d = 3 + ((i * 3) % 4);
      const geo = new THREE.BoxGeometry(w, 3, d);
      const mesh = new THREE.Mesh(geo, coverMat);
      const spot = this.coverPosition(i, coverCount, pattern, half);
      mesh.position.set(spot.x, 1.5, spot.z);
      mesh.castShadow = this.quality.shadows;
      mesh.receiveShadow = this.quality.shadows;
      group.add(mesh);
    }

    // Cliff / pit regions — the void the player must not walk into.
    const voidMat = new THREE.MeshBasicMaterial({ color: 0x05070c });
    for (const v of level.voids) {
      const w = Math.abs(v.maxX - v.minX);
      const d = Math.abs(v.maxZ - v.minZ);
      const geo = new THREE.PlaneGeometry(w, d);
      geo.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(geo, voidMat);
      mesh.position.set((v.minX + v.maxX) / 2, 0.02, (v.minZ + v.maxZ) / 2);
      group.add(mesh);
    }

    // Hazards.
    for (const hazard of level.hazards) {
      const colour = HAZARD_COLOURS[hazard.kind] ?? 0xff5522;
      const size = hazard.w > 0 && hazard.d > 0
        ? new THREE.BoxGeometry(hazard.w, 1.2, hazard.d)
        : new THREE.CylinderGeometry(1.6, 1.6, 1.2, 12);
      const mat = new THREE.MeshStandardMaterial({
        color: colour,
        emissive: colour,
        emissiveIntensity: 0.6,
        roughness: 0.4,
      });
      const mesh = new THREE.Mesh(size, mat);
      mesh.position.set(hazard.x, 0.6, hazard.z);
      group.add(mesh);
    }

    // Bounce pads.
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x2ad4ff,
      emissive: 0x1a6a80,
      emissiveIntensity: 0.8,
      roughness: 0.6,
    });
    for (const pad of level.pads) {
      const geo = new THREE.CylinderGeometry(pad.r, pad.r, 0.3, 16);
      const mesh = new THREE.Mesh(geo, padMat);
      mesh.position.set(pad.x, 0.15, pad.z);
      group.add(mesh);
    }

    // Buff pickups.
    for (const buff of level.buffs) {
      const colour = BUFF_COLOURS[buff.kind] ?? 0xffffff;
      const geo = new THREE.OctahedronGeometry(0.8);
      const mat = new THREE.MeshStandardMaterial({
        color: colour,
        emissive: colour,
        emissiveIntensity: 1.1,
        roughness: 0.3,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(buff.x, 1.2, buff.z);
      mesh.userData.spin = true;
      group.add(mesh);
    }

    // Telegraph ring, reused for every boss warning.
    const ringGeo = new THREE.RingGeometry(0.9, 1, 48);
    ringGeo.rotateX(-Math.PI / 2);
    this.telegraphRing = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({ color: 0xff3355, transparent: true, opacity: 0.5, side: THREE.DoubleSide }),
    );
    this.telegraphRing.visible = false;
    group.add(this.telegraphRing);

    this.levelGroup = group;
    this.scene.add(group);
  }

  /** Places cover according to the legacy cover patterns. */
  private coverPosition(index: number, count: number, pattern: string, half: number): { x: number; z: number } {
    const span = half * 0.72;
    const ring = Math.floor(index / 6);
    const slot = index % 6;
    switch (pattern) {
      case 'ring': {
        const angle = (slot / 6) * Math.PI * 2 + ring * 0.4;
        const radius = 14 + ring * 9;
        return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
      }
      case 'corridor':
        return { x: (slot - 2.5) * 7, z: (ring - 1) * 16 };
      case 'cross':
        return index % 2 === 0
          ? { x: (slot - 2.5) * 8, z: 0 }
          : { x: 0, z: (ring - 1) * 18 };
      case 'alley':
        return { x: (slot % 2 === 0 ? -1 : 1) * (12 + ring * 6), z: (slot - 2.5) * 9 };
      case 'maze':
        return { x: ((index * 13) % 5 - 2) * 9, z: ((index * 7) % 5 - 2) * 9 };
      case 'arena':
        return { x: Math.cos((index / count) * Math.PI * 2) * span * 0.8, z: Math.sin((index / count) * Math.PI * 2) * span * 0.8 };
      case 'sanctum':
        return { x: Math.cos((index / count) * Math.PI * 2) * span * 0.45, z: Math.sin((index / count) * Math.PI * 2) * span * 0.45 };
      case 'spiral': {
        const angle = index * 0.9;
        const radius = 6 + index * 2.4;
        return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
      }
      case 'bazaar':
        return { x: ((index * 11) % 4 - 1.5) * 12, z: ((index * 5) % 4 - 1.5) * 12 };
      case 'scattered':
      default: {
        const angle = index * 2.399;
        const radius = 10 + ((index * 13) % 9) * 4;
        return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
      }
    }
  }

  // ------------------------------------------------------------ entities

  private ensureEnemyVisual(enemy: EnemyState): EnemyVisual {
    const existing = this.enemyVisuals.get(enemy.id);
    if (existing) return existing;

    const colours = ENEMY_COLOURS[enemy.kind] ?? ENEMY_COLOURS.melee!;
    const group = new THREE.Group();
    const bodyGeo = new THREE.CapsuleGeometry(0.5, 1.1, 4, 8);
    const body = new THREE.Mesh(
      bodyGeo,
      new THREE.MeshStandardMaterial({ color: colours.body, roughness: 0.65, metalness: 0.1 }),
    );
    body.position.y = 1.1;
    body.castShadow = this.quality.shadows;
    group.add(body);

    const headGeo = new THREE.SphereGeometry(0.38, 12, 10);
    const head = new THREE.Mesh(
      headGeo,
      new THREE.MeshStandardMaterial({
        color: colours.head,
        roughness: 0.5,
        emissive: colours.head,
        emissiveIntensity: 0.25,
      }),
    );
    head.position.y = 2.0;
    head.castShadow = this.quality.shadows;
    group.add(head);

    const accentGeo = new THREE.TorusGeometry(0.55, 0.1, 6, 16);
    const accent = new THREE.Mesh(
      accentGeo,
      new THREE.MeshStandardMaterial({
        color: colours.accent,
        roughness: 0.35,
        metalness: 0.6,
        emissive: colours.accent,
        emissiveIntensity: 0.4,
      }),
    );
    accent.position.y = 1.2;
    accent.rotation.x = Math.PI / 2;
    group.add(accent);

    group.position.set(enemy.x, 0, enemy.z);
    this.levelGroup?.add(group);
    const visual = { group, body, head, accent };
    this.enemyVisuals.set(enemy.id, visual);
    return visual;
  }

  private ensureBossVisual(boss: BossState): void {
    if (this.bossVisual) return;
    const group = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 2.4, 4.4, 12),
      new THREE.MeshStandardMaterial({ color: 0x7a1010, roughness: 0.55, metalness: 0.35 }),
    );
    body.position.y = 2.2;
    body.castShadow = this.quality.shadows;
    group.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(1.1, 16, 12),
      new THREE.MeshStandardMaterial({
        color: 0xff2200,
        roughness: 0.4,
        emissive: 0xff2200,
        emissiveIntensity: 0.55,
      }),
    );
    head.position.y = 4.8;
    group.add(head);

    const accent = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.2, 8, 24),
      new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        roughness: 0.3,
        metalness: 0.7,
        emissive: 0xff8800,
        emissiveIntensity: 0.7,
      }),
    );
    accent.position.y = 2.4;
    accent.rotation.x = Math.PI / 2;
    group.add(accent);

    group.position.set(boss.x, 0, boss.z);
    this.levelGroup?.add(group);
    this.bossVisual = { group, body, head, accent };
  }

  /** Builds a simple but readable first-person weapon model. */
  setWeaponModel(weapon: WeaponDef | undefined): void {
    if (this.weaponModel) {
      this.levelGroup?.remove(this.weaponModel);
      disposeObject(this.weaponModel);
      this.weaponModel = null;
    }
    if (!weapon) return;

    const group = new THREE.Group();
    const isEnergy = weapon.id === 'dawnlight' || weapon.id === 'zeushand' || weapon.id === 'arcion';
    const bodyColor = isEnergy ? 0x2a6ad4 : 0x2b2f38;
    const accentColor = isEnergy ? 0x66e6ff : 0xff8800;

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.18, 0.72),
      new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.45, metalness: 0.72 }),
    );
    group.add(body);

    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.045, 0.55, 10),
      new THREE.MeshStandardMaterial({ color: 0x14171c, roughness: 0.35, metalness: 0.85 }),
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, 0.6);
    group.add(barrel);

    const accent = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, 0.3),
      new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: 1.4,
        roughness: 0.3,
      }),
    );
    accent.position.set(0, 0.09, 0.05);
    group.add(accent);

    const grip = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.24, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x1a1d23, roughness: 0.8, metalness: 0.1 }),
    );
    grip.position.set(0, -0.2, -0.06);
    grip.rotation.x = 0.22;
    group.add(grip);

    group.position.set(0.26, -0.24, -0.55);
    group.rotation.y = 0.03;
    this.camera.add(group);
    this.scene.add(this.camera);
    this.weaponModel = group;
  }

  // ------------------------------------------------------------ frame

  /** Draws one frame. `dt` is the real (unclamped) frame time. */
  render(
    dt: number,
    player: PlayerState,
    enemies: EnemyState[],
    boss: BossState | null,
    events: SimulationEvent[],
  ): void {
    this.clock.getDelta();

    // Camera.
    this.camera.position.set(player.x, 1.7, player.z);
    this.camera.rotation.y = player.yaw;
    this.camera.rotation.x = player.pitch;

    // Weapon sway and recoil.
    this.recoilTarget = Math.max(0, this.recoilTarget - dt * 3.2);
    this.recoil += (this.recoilTarget - this.recoil) * Math.min(1, dt * 18);
    if (this.weaponModel) {
      this.weaponModel.position.set(0.26, -0.24 + Math.sin(performance.now() / 320) * 0.006, -0.55 + this.recoil * 0.12);
      this.weaponModel.rotation.x = -this.recoil * 0.35;
    }

    // Screen shake.
    this.shake = Math.max(0, this.shake - dt * 3.4);
    if (this.shake > 0 && this.shakeIntensity > 0 && !this.reduceFlashing) {
      const amount = this.shake * this.shakeIntensity * 0.22;
      this.camera.position.x += (Math.random() - 0.5) * amount;
      this.camera.position.y += (Math.random() - 0.5) * amount;
    }

    // Enemies.
    const maxEnemies = this.quality.maxEnemies;
    let drawn = 0;
    for (const enemy of enemies) {
      if (drawn >= maxEnemies) break;
      const visual = this.ensureEnemyVisual(enemy);
      visual.group.position.set(enemy.x, 0, enemy.z);
      visual.group.rotation.y = enemy.angle;
      const bob = Math.sin(performance.now() / 220 + enemy.id) * 0.05;
      visual.body.position.y = 1.1 + bob;
      visual.accent.rotation.z += dt * 2.4;
      drawn += 1;
    }
    // Remove visuals for enemies that no longer exist.
    for (const [id, visual] of this.enemyVisuals) {
      if (!enemies.some((e) => e.id === id)) {
        this.levelGroup?.remove(visual.group);
        disposeObject(visual.group);
        this.enemyVisuals.delete(id);
      }
    }

    // Boss.
    if (boss) {
      this.ensureBossVisual(boss);
      const visual = this.bossVisual!;
      visual.group.position.set(boss.x, 0, boss.z);
      visual.group.rotation.y = boss.angle;
      visual.head.position.y = 4.8 + Math.sin(performance.now() / 300) * 0.15;
      visual.accent.rotation.z += dt * 1.2;
    }

    // Telegraph ring.
    if (this.telegraphRing) {
      this.telegraphTimer = Math.max(0, this.telegraphTimer - dt);
      this.telegraphRing.visible = this.telegraphTimer > 0;
      if (this.telegraphRing.visible) {
        this.telegraphRing.rotation.y += dt * 1.5;
        const material = this.telegraphRing.material as THREE.MeshBasicMaterial;
        material.opacity = 0.25 + 0.35 * Math.abs(Math.sin(performance.now() / 120));
      }
    }

    // Animated props (buff pickups).
    if (this.levelGroup) {
      for (const child of this.levelGroup.children) {
        if (child.userData.spin) {
          child.rotation.y += dt * 1.6;
          child.position.y = 1.2 + Math.sin(performance.now() / 500) * 0.2;
        }
      }
    }

    this.updateTracers(dt);
    this.updateDamageNumbers(dt);

    this.renderer.render(this.scene, this.camera);
  }

  /** Called when the player fires, to drive the weapon kick. */
  kick(strength = 1): void {
    this.recoilTarget = Math.min(1.4, this.recoilTarget + strength * 0.5);
  }

  addShake(strength: number): void {
    this.shake = Math.min(1.5, this.shake + strength);
  }

  showTelegraph(x: number, z: number, radius: number): void {
    if (!this.telegraphRing) return;
    this.telegraphRing.position.set(x, 0.05, z);
    this.telegraphRing.scale.set(radius, 1, radius);
    this.telegraphTimer = 0.9;
  }

  spawnTracer(from: THREE.Vector3, to: THREE.Vector3): void {
    if (this.tracers.length > 40) return;
    const geometry = new THREE.BufferGeometry().setFromPoints([from, to]);
    const material = new THREE.LineBasicMaterial({ color: 0x99e6ff, transparent: true, opacity: 0.85 });
    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    this.tracers.push({ line, life: 0.06 });
  }

  private updateTracers(dt: number): void {
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const tracer = this.tracers[i]!;
      tracer.life -= dt;
      const material = tracer.line.material as THREE.LineBasicMaterial;
      material.opacity = Math.max(0, tracer.life / 0.06);
      if (tracer.life <= 0) {
        this.scene.remove(tracer.line);
        tracer.line.geometry.dispose();
        material.dispose();
        this.tracers.splice(i, 1);
      }
    }
  }

  /** Shows a floating damage number. */
  spawnDamageNumber(value: number, x: number, y: number, z: number, kind: 'normal' | 'crit' | 'headshot'): void {
    if (this.damageSprites.length >= this.quality.maxDamageNumbers) return;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.font = 'bold 44px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = kind === 'normal' ? '#ffffff' : kind === 'crit' ? '#ffd740' : '#ff6b6b';
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 6;
    const text = String(Math.round(value));
    ctx.strokeText(text, 64, 32);
    ctx.fillText(text, 64, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }),
    );
    sprite.position.set(x, y, z);
    sprite.scale.set(2.4, 1.2, 1);
    this.scene.add(sprite);
    this.damageSprites.push({
      sprite,
      life: 0.9,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 1.2, 2.4, (Math.random() - 0.5) * 1.2),
    });
  }

  private updateDamageNumbers(dt: number): void {
    for (let i = this.damageSprites.length - 1; i >= 0; i--) {
      const entry = this.damageSprites[i]!;
      entry.life -= dt;
      entry.sprite.position.addScaledVector(entry.velocity, dt);
      entry.velocity.y -= 4 * dt;
      const material = entry.sprite.material as THREE.SpriteMaterial;
      material.opacity = Math.max(0, entry.life / 0.9);
      if (entry.life <= 0) {
        this.scene.remove(entry.sprite);
        entry.sprite.material.map?.dispose();
        entry.sprite.material.dispose();
        this.damageSprites.splice(i, 1);
      }
    }
  }

  // ------------------------------------------------------------ teardown

  /** Removes the level and releases every GPU resource it used. */
  clearLevel(): void {
    for (const [, visual] of this.enemyVisuals) {
      this.levelGroup?.remove(visual.group);
      disposeObject(visual.group);
    }
    this.enemyVisuals.clear();
    if (this.bossVisual) {
      this.levelGroup?.remove(this.bossVisual.group);
      disposeObject(this.bossVisual.group);
      this.bossVisual = null;
    }
    if (this.levelGroup) {
      this.scene.remove(this.levelGroup);
      disposeObject(this.levelGroup);
      this.levelGroup = null;
    }
    for (const tracer of this.tracers) {
      this.scene.remove(tracer.line);
      tracer.line.geometry.dispose();
      (tracer.line.material as THREE.Material).dispose();
    }
    this.tracers = [];
    for (const entry of this.damageSprites) {
      this.scene.remove(entry.sprite);
      entry.sprite.material.map?.dispose();
      entry.sprite.material.dispose();
    }
    this.damageSprites = [];
    this.telegraphRing = null;
  }

  /** Releases every resource, including the WebGL context. */
  dispose(): void {
    window.removeEventListener('resize', this.onResize);
    this.clearLevel();
    if (this.weaponModel) {
      this.camera.remove(this.weaponModel);
      disposeObject(this.weaponModel);
      this.weaponModel = null;
    }
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

const ENEMY_COLOURS: Record<string, { body: number; head: number; accent: number }> = {
  melee: { body: 0x8b2500, head: 0xff4500, accent: 0xffaa00 },
  ranged: { body: 0x6b1500, head: 0xff6600, accent: 0xffaa00 },
  elite: { body: 0x5b1000, head: 0xff3300, accent: 0xffdd00 },
};

const HAZARD_COLOURS: Record<string, number> = {
  spike: 0xff5533,
  laser: 0xff2244,
  door: 0xcc8800,
  crusher: 0x886644,
  steam: 0xdddddd,
  saw: 0xffcc00,
};

const BUFF_COLOURS: Record<string, number> = {
  dmg: 0xff5a3c,
  speed: 0x54e0ff,
  regen: 0x6ee06e,
  shield: 0xffd740,
  energy: 0xb28bff,
  crit: 0xff8adf,
};

/** Releases every geometry and material under `object`. */
export function disposeObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = (mesh as any).material as THREE.Material | THREE.Material[] | undefined;
    if (!material) return;
    if (Array.isArray(material)) {
      for (const m of material) m.dispose();
    } else {
      material.dispose();
    }
  });
}
