/**
 * Audio mixer.
 *
 * The legacy build had two structural audio defects that are fixed here:
 *
 *  1. `musicGainNode` sat UNDER `masterGainNode`, so muting SFX also muted
 *     the music and the music slider could never work independently.
 *     Here the graph is `master -> {music, sfx}`, with music and sfx as
 *     siblings under the master bus.
 *  2. There was no `AudioContext.resume()` anywhere, so the context could
 *     stay suspended forever (Chrome starts it suspended outside a user
 *     gesture). Here the context is created and resumed inside the first
 *     user gesture.
 *
 * On top of that the rewrite adds a voice pool with a concurrency cap, so a
 * 20 rounds-per-second weapon cannot allocate unbounded audio nodes, and
 * distance attenuation for world sounds.
 */
export type SoundCategory = 'sfx' | 'music';

export interface SoundOptions {
  /** Playback rate. */
  rate?: number;
  /** Peak gain. */
  gain?: number;
  /** Distance from the listener, for attenuation. */
  distance?: number;
  /** Delay before the sound starts, in seconds. */
  delay?: number;
}

interface Voice {
  nodes: AudioNode[];
  startedAt: number;
  endsAt: number;
}

/** Maximum simultaneous voices per category. */
const VOICE_LIMIT = { sfx: 24, music: 4 } as const;

/** Distance at which a world sound becomes inaudible. */
const AUDIBLE_DISTANCE = 60;

export class AudioMixer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private noiseCache = new Map<string, AudioBuffer>();
  private voices: Voice[] = [];
  private unlocked = false;

  private _masterVolume = 1;
  private _musicVolume = 0.5;
  private _sfxMuted = false;
  private _musicMuted = false;

  get masterVolume(): number {
    return this._masterVolume;
  }

  get musicVolume(): number {
    return this._musicVolume;
  }

  get sfxMuted(): boolean {
    return this._sfxMuted;
  }

  get musicMuted(): boolean {
    return this._musicMuted;
  }

  get ready(): boolean {
    return this.ctx !== null && this.ctx.state === 'running';
  }

  /**
   * Creates and resumes the audio context.
   * MUST be called from a user-gesture handler, otherwise Chrome keeps the
   * context suspended.
   */
  unlock(): void {
    if (this.unlocked) return;
    try {
      const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      // master -> destination, with music and sfx as siblings.
      this.masterGain.connect(this.ctx.destination);
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);

      this.applyVolumes();
      void this.ctx.resume();
      this.unlocked = true;
    } catch {
      this.ctx = null;
    }
  }

  /** Releases the audio context and every cached buffer. */
  dispose(): void {
    this.voices = [];
    this.noiseCache.clear();
    if (this.ctx) {
      void this.ctx.close().catch(() => undefined);
    }
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.unlocked = false;
  }

  setMasterVolume(value: number): void {
    this._masterVolume = clamp01(value);
    this.applyVolumes();
  }

  setMusicVolume(value: number): void {
    this._musicVolume = clamp01(value);
    this.applyVolumes();
  }

  setSfxMuted(muted: boolean): void {
    this._sfxMuted = muted;
    this.applyVolumes();
  }

  setMusicMuted(muted: boolean): void {
    this._musicMuted = muted;
    this.applyVolumes();
  }

  private applyVolumes(): void {
    if (!this.ctx || !this.masterGain || !this.musicGain || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setTargetAtTime(this._masterVolume, now, 0.02);
    this.musicGain.gain.setTargetAtTime(this._musicMuted ? 0 : this._musicVolume, now, 0.02);
    this.sfxGain.gain.setTargetAtTime(this._sfxMuted ? 0 : 1, now, 0.02);
  }

  /** Prunes finished voices and enforces the concurrency cap. */
  private reserveVoice(category: SoundCategory, duration: number): boolean {
    if (!this.ctx) return false;
    const now = this.ctx.currentTime;
    this.voices = this.voices.filter((v) => v.endsAt > now);
    const limit = VOICE_LIMIT[category];
    if (this.voices.length >= limit) {
      // Steal the oldest voice rather than dropping the new one.
      const oldest = this.voices.shift();
      if (oldest) {
        for (const node of oldest.nodes) {
          try {
            (node as any).stop?.(now);
            (node as any).disconnect?.();
          } catch {
            /* already stopped */
          }
        }
      }
    }
    return true;
  }

  private track(nodes: AudioNode[], duration: number): void {
    if (!this.ctx) return;
    this.voices.push({ nodes, startedAt: this.ctx.currentTime, endsAt: this.ctx.currentTime + duration });
  }

  /** Distance attenuation for world sounds. */
  private distanceGain(distance: number | undefined): number {
    if (distance === undefined) return 1;
    if (distance >= AUDIBLE_DISTANCE) return 0;
    return Math.max(0, 1 - distance / AUDIBLE_DISTANCE) ** 1.5;
  }

  private getNoiseBuffer(duration: number, decay: number): AudioBuffer {
    const key = `${duration.toFixed(3)}|${decay.toFixed(3)}`;
    const cached = this.noiseCache.get(key);
    if (cached) return cached;
    const ctx = this.ctx!;
    const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay);
    }
    this.noiseCache.set(key, buffer);
    return buffer;
  }

  // ------------------------------------------------------------ one-shots

  /** A filtered noise burst — the basis for impacts, explosions and reloads. */
  noise(options: {
    duration: number;
    decay?: number;
    filter?: BiquadFilterType;
    frequency?: number;
    endFrequency?: number;
    q?: number;
    gain?: number;
    category?: SoundCategory;
    distance?: number;
    delay?: number;
  }): void {
    if (!this.ctx || !this.sfxGain) return;
    const ctx = this.ctx;
    const category = options.category ?? 'sfx';
    const gainValue = (options.gain ?? 0.4) * this.distanceGain(options.distance);
    if (gainValue <= 0.001) return;
    if (!this.reserveVoice(category, options.duration + 0.1)) return;

    const start = ctx.currentTime + (options.delay ?? 0);
    const source = ctx.createBufferSource();
    source.buffer = this.getNoiseBuffer(options.duration, options.decay ?? 2);

    const filter = ctx.createBiquadFilter();
    filter.type = options.filter ?? 'lowpass';
    filter.frequency.setValueAtTime(options.frequency ?? 1200, start);
    if (options.endFrequency !== undefined) {
      filter.frequency.exponentialRampToValueAtTime(
        Math.max(40, options.endFrequency),
        start + options.duration,
      );
    }
    filter.Q.value = options.q ?? 1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainValue, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + options.duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(category === 'music' ? this.musicGain! : this.sfxGain!);
    source.start(start);
    source.stop(start + options.duration + 0.02);
    this.track([source, filter, gain], options.duration + (options.delay ?? 0));
  }

  /** A pitched tone — the basis for lasers, beeps and energy feedback. */
  tone(options: {
    type?: OscillatorType;
    frequency: number;
    endFrequency?: number;
    duration: number;
    gain?: number;
    category?: SoundCategory;
    distance?: number;
    delay?: number;
  }): void {
    if (!this.ctx || !this.sfxGain) return;
    const ctx = this.ctx;
    const category = options.category ?? 'sfx';
    const gainValue = (options.gain ?? 0.3) * this.distanceGain(options.distance);
    if (gainValue <= 0.001) return;
    if (!this.reserveVoice(category, options.duration + 0.1)) return;

    const start = ctx.currentTime + (options.delay ?? 0);
    const osc = ctx.createOscillator();
    osc.type = options.type ?? 'sine';
    osc.frequency.setValueAtTime(options.frequency, start);
    if (options.endFrequency !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(20, options.endFrequency),
        start + options.duration,
      );
    }

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + Math.min(0.02, options.duration * 0.2));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + options.duration);

    osc.connect(gain);
    gain.connect(category === 'music' ? this.musicGain! : this.sfxGain!);
    osc.start(start);
    osc.stop(start + options.duration + 0.02);
    this.track([osc, gain], options.duration + (options.delay ?? 0));
  }

  // ------------------------------------------------------------ game sounds

  /** Weapon fire. Each weapon family gets a distinct signature. */
  shoot(weaponId: string): void {
    switch (weaponId) {
      case 'dawnlight':
        this.tone({ type: 'sawtooth', frequency: 900, endFrequency: 300, duration: 0.18, gain: 0.22 });
        this.noise({ duration: 0.12, frequency: 5000, endFrequency: 900, filter: 'bandpass', q: 3, gain: 0.14 });
        break;
      case 'phasewalker':
      case 'shadowasura':
        this.tone({ type: 'triangle', frequency: 1400, endFrequency: 420, duration: 0.14, gain: 0.2 });
        this.noise({ duration: 0.1, frequency: 3200, endFrequency: 700, filter: 'bandpass', q: 4, gain: 0.16 });
        break;
      case 'zeushand':
      case 'arcion':
        this.tone({ type: 'square', frequency: 620, endFrequency: 180, duration: 0.16, gain: 0.2 });
        this.noise({ duration: 0.14, frequency: 4200, endFrequency: 500, filter: 'highpass', gain: 0.12 });
        break;
      case 'tumo':
      case 'yanzhi':
      case 'parasite':
        this.noise({ duration: 0.3, frequency: 2400, endFrequency: 160, filter: 'lowpass', gain: 0.4 });
        this.tone({ type: 'sawtooth', frequency: 220, endFrequency: 60, duration: 0.28, gain: 0.26 });
        break;
      default:
        this.noise({ duration: 0.11, frequency: 3600, endFrequency: 420, filter: 'bandpass', q: 1.6, gain: 0.3 });
        this.tone({ type: 'square', frequency: 260, endFrequency: 90, duration: 0.09, gain: 0.14 });
        break;
    }
  }

  /** Mechanical reload — a click, a pause, then the magazine seating. */
  reload(): void {
    this.noise({ duration: 0.05, frequency: 2800, endFrequency: 900, filter: 'bandpass', q: 4, gain: 0.26 });
    this.noise({ duration: 0.06, frequency: 1800, endFrequency: 500, filter: 'bandpass', q: 3, gain: 0.22, delay: 0.32 });
    this.noise({ duration: 0.07, frequency: 1200, endFrequency: 300, filter: 'lowpass', gain: 0.24, delay: 0.62 });
  }

  /** A regular enemy hit. The legacy was silent here. */
  hit(): void {
    this.noise({ duration: 0.07, frequency: 2200, endFrequency: 700, filter: 'bandpass', q: 2, gain: 0.2 });
  }

  crit(): void {
    this.tone({ type: 'sine', frequency: 1200, endFrequency: 2400, duration: 0.12, gain: 0.24 });
    this.tone({ type: 'triangle', frequency: 3000, endFrequency: 1500, duration: 0.14, gain: 0.16 });
  }

  headshot(): void {
    this.tone({ type: 'square', frequency: 2000, endFrequency: 800, duration: 0.1, gain: 0.22 });
    this.tone({ type: 'sine', frequency: 3000, endFrequency: 1500, duration: 0.12, gain: 0.18 });
  }

  enemyDeath(distance?: number): void {
    this.noise({ duration: 0.28, frequency: 2000, endFrequency: 100, filter: 'lowpass', gain: 0.3, distance });
  }

  bossDeath(): void {
    this.noise({ duration: 1, frequency: 1800, endFrequency: 60, filter: 'lowpass', gain: 0.5 });
    this.tone({ type: 'sine', frequency: 120, endFrequency: 40, duration: 0.9, gain: 0.3 });
  }

  playerHurt(): void {
    this.tone({ type: 'sine', frequency: 150, endFrequency: 60, duration: 0.2, gain: 0.3 });
    this.noise({ duration: 0.18, frequency: 900, endFrequency: 200, filter: 'lowpass', gain: 0.22 });
  }

  /** Boss telegraph — the legacy had no sound for this at all. */
  bossTelegraph(): void {
    this.tone({ type: 'sawtooth', frequency: 220, endFrequency: 660, duration: 0.55, gain: 0.26 });
    this.noise({ duration: 0.55, frequency: 600, endFrequency: 2400, filter: 'bandpass', q: 2, gain: 0.14 });
  }

  /** Boss attack impact. */
  bossAttack(distance?: number): void {
    this.noise({ duration: 0.5, frequency: 1400, endFrequency: 120, filter: 'lowpass', gain: 0.4, distance });
    this.tone({ type: 'sawtooth', frequency: 160, endFrequency: 40, duration: 0.45, gain: 0.24, distance });
  }

  explosion(distance?: number): void {
    this.noise({ duration: 0.6, frequency: 1600, endFrequency: 80, filter: 'lowpass', gain: 0.42, distance });
    this.tone({ type: 'sine', frequency: 90, endFrequency: 25, duration: 0.5, gain: 0.3, distance });
  }

  hazard(): void {
    this.noise({ duration: 0.24, frequency: 2600, endFrequency: 400, filter: 'bandpass', q: 3, gain: 0.24 });
  }

  pickup(): void {
    this.tone({ type: 'sine', frequency: 440, endFrequency: 880, duration: 0.16, gain: 0.22 });
    this.tone({ type: 'sine', frequency: 660, endFrequency: 1047, duration: 0.18, gain: 0.18, delay: 0.1 });
  }

  uiClick(): void {
    this.tone({ type: 'sine', frequency: 1800, endFrequency: 2400, duration: 0.06, gain: 0.14 });
  }

  uiConfirm(): void {
    this.tone({ type: 'sine', frequency: 660, endFrequency: 1320, duration: 0.16, gain: 0.2 });
  }

  dryFire(): void {
    this.noise({ duration: 0.05, frequency: 3000, endFrequency: 1400, filter: 'bandpass', q: 6, gain: 0.16 });
  }

  waveStart(): void {
    this.tone({ type: 'sine', frequency: 320, endFrequency: 640, duration: 0.3, gain: 0.22 });
  }

  victory(): void {
    [523, 659, 784, 1047].forEach((f, i) => {
      this.tone({ type: 'sine', frequency: f, duration: 0.3, gain: 0.24, delay: i * 0.14 });
    });
  }

  defeat(): void {
    [392, 330, 262, 196].forEach((f, i) => {
      this.tone({ type: 'triangle', frequency: f, duration: 0.42, gain: 0.22, delay: i * 0.2 });
    });
  }
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
