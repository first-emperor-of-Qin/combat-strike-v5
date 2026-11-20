/**
 * Input.
 *
 * Fixes three legacy gaps:
 *  1. There was no teardown. Every `document` / `window` listener was
 *     permanent, so a scene restart could double-register handlers. Here
 *     `dispose()` removes every listener it added.
 *  2. There was no `blur` / `visibilitychange` handling, so alt-tabbing did
 *     not pause the simulation. Here losing focus pauses automatically.
 *  3. The look sensitivity was a hard-coded `0.002`; it is now a setting.
 */
import { EMPTY_INPUT, type SimulationInput } from '@combat-strike/game-core';

export type ActionName =
  | 'moveForward'
  | 'moveBackward'
  | 'moveLeft'
  | 'moveRight'
  | 'jump'
  | 'reload'
  | 'weaponSkill'
  | 'weaponSpecial'
  | 'pause'
  | 'panel'
  | 'skipBoss'
  | 'holdFire';

export interface InputSettings {
  keymap: Record<ActionName, string>;
  mouseSensitivity: number;
}

export interface InputCallbacks {
  onPause?: () => void;
  onPanel?: () => void;
  onSkipBoss?: () => void;
  onFireHeldChange?: (held: boolean) => void;
  /** Called whenever the player presses a rebind-capturing key. */
  onKeyCapture?: (code: string) => void;
}

const MOVE_ACTIONS: ActionName[] = ['moveForward', 'moveBackward', 'moveLeft', 'moveRight'];

export class InputController {
  private keys = new Set<string>();
  private mouseButtons = new Set<number>();
  private yaw = 0;
  private pitch = 0;
  private settings: InputSettings;
  private callbacks: InputCallbacks;
  private element: HTMLElement;
  private disposed = false;
  private capturing = false;

  /** Accumulated mouse movement, drained once per frame. */
  private deltaX = 0;
  private deltaY = 0;

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.capturing) {
      e.preventDefault();
      this.capturing = false;
      this.callbacks.onKeyCapture?.(e.code);
      return;
    }
    if (e.repeat) return;
    // Do not swallow browser shortcuts.
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const action = this.actionFor(e.code);
    if (action === 'pause') {
      e.preventDefault();
      this.callbacks.onPause?.();
      return;
    }
    if (action === 'panel') {
      e.preventDefault();
      this.callbacks.onPanel?.();
      return;
    }
    if (action === 'skipBoss') {
      e.preventDefault();
      this.callbacks.onSkipBoss?.();
      return;
    }
    this.keys.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  private onMouseMove = (e: MouseEvent) => {
    if (document.pointerLockElement !== this.element) return;
    this.deltaX += e.movementX;
    this.deltaY += e.movementY;
  };

  private onMouseDown = (e: MouseEvent) => {
    if (document.pointerLockElement !== this.element) return;
    this.mouseButtons.add(e.button);
    this.callbacks.onFireHeldChange?.(e.button === 0);
  };

  private onMouseUp = (e: MouseEvent) => {
    this.mouseButtons.delete(e.button);
    if (e.button === 0) this.callbacks.onFireHeldChange?.(false);
  };

  private onWheel = (e: WheelEvent) => {
    if (document.pointerLockElement !== this.element) return;
    e.preventDefault();
    this.wheelDelta += e.deltaY;
  };

  private onContextMenu = (e: Event) => {
    if (document.pointerLockElement === this.element) e.preventDefault();
  };

  private onPointerLockChange = () => {
    if (document.pointerLockElement !== this.element) {
      // Losing the pointer lock releases every held input.
      this.keys.clear();
      this.mouseButtons.clear();
      this.callbacks.onFireHeldChange?.(false);
    }
  };

  private onBlur = () => {
    this.keys.clear();
    this.mouseButtons.clear();
    this.callbacks.onFireHeldChange?.(false);
  };

  private onVisibilityChange = () => {
    if (document.hidden) this.onBlur();
  };

  wheelDelta = 0;

  constructor(element: HTMLElement, settings: InputSettings, callbacks: InputCallbacks = {}) {
    this.element = element;
    this.settings = settings;
    this.callbacks = callbacks;

    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('wheel', this.onWheel, { passive: false });
    document.addEventListener('contextmenu', this.onContextMenu);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    window.addEventListener('blur', this.onBlur);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  updateSettings(settings: InputSettings): void {
    this.settings = settings;
  }

  /** Starts capturing the next key press, for the rebinding UI. */
  captureNextKey(): void {
    this.capturing = true;
  }

  private actionFor(code: string): ActionName | null {
    for (const [action, bound] of Object.entries(this.settings.keymap)) {
      if (bound === code) return action as ActionName;
    }
    return null;
  }

  requestPointerLock(): void {
    if (document.pointerLockElement === this.element) return;
    try {
      const result = this.element.requestPointerLock?.() as unknown as Promise<void> | undefined;
      result?.catch(() => undefined);
    } catch {
      // Pointer lock can be refused (user gesture rules, headless runs).
    }
  }

  exitPointerLock(): void {
    if (document.pointerLockElement === this.element) document.exitPointerLock();
  }

  get pointerLocked(): boolean {
    return document.pointerLockElement === this.element;
  }

  /** Applies accumulated mouse movement and returns the new look angles. */
  consumeLook(): { yaw: number; pitch: number } {
    const sensitivity = this.settings.mouseSensitivity;
    this.yaw -= this.deltaX * sensitivity;
    this.pitch -= this.deltaY * sensitivity;
    // The legacy clamped the pitch to +/- pi/2.5.
    const limit = Math.PI / 2.5;
    this.pitch = Math.max(-limit, Math.min(limit, this.pitch));
    this.deltaX = 0;
    this.deltaY = 0;
    return { yaw: this.yaw, pitch: this.pitch };
  }

  setLook(yaw: number, pitch: number): void {
    this.yaw = yaw;
    this.pitch = pitch;
  }

  /** Consumes the accumulated wheel delta: 1 = next slot, -1 = previous slot. */
  consumeWheel(): -1 | 0 | 1 {
    if (this.wheelDelta === 0) return 0;
    const dir = this.wheelDelta > 0 ? 1 : -1;
    this.wheelDelta = 0;
    return dir;
  }

  /** Builds the input snapshot for one simulation step. */
  buildInput(): SimulationInput {
    const held = (action: ActionName): boolean => {
      const code = this.settings.keymap[action];
      return code !== undefined && this.keys.has(code);
    };

    let moveX = 0;
    let moveZ = 0;
    if (held('moveForward')) moveZ += 1;
    if (held('moveBackward')) moveZ -= 1;
    if (held('moveRight')) moveX += 1;
    if (held('moveLeft')) moveX -= 1;

    const fire = this.mouseButtons.has(0) || held('holdFire');
    const altFire = this.mouseButtons.has(2);
    const skill = this.mouseButtons.has(1);

    return {
      ...EMPTY_INPUT,
      moveX,
      moveZ,
      yaw: this.yaw,
      pitch: this.pitch,
      fire,
      altFire,
      skill,
      special: held('weaponSpecial'),
      jump: held('jump'),
      reload: held('reload'),
      switchTo: null,
    };
  }

  /** Removes every listener this controller added. */
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('wheel', this.onWheel);
    document.removeEventListener('contextmenu', this.onContextMenu);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    window.removeEventListener('blur', this.onBlur);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }
}

export { MOVE_ACTIONS };
