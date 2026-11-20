/**
 * Cloud API client.
 *
 * The game is fully playable without the network: the profile lives in local
 * storage and the client only talks to the API when a session exists. Every
 * call has a timeout and degrades to "offline" rather than blocking the UI.
 */
import type { PlayerProfile } from '@combat-strike/game-core';

const REQUEST_TIMEOUT_MS = 8000;

export interface ApiUser {
  id: string;
  email: string;
  displayName: string | null;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export class ApiClient {
  private token: string | null = null;
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  get signedIn(): boolean {
    return this.token !== null;
  }

  setToken(token: string | null): void {
    this.token = token;
    if (token) window.localStorage.setItem('cs_session_token', token);
    else window.localStorage.removeItem('cs_session_token');
  }

  restoreSession(): void {
    const stored = window.localStorage.getItem('cs_session_token');
    if (stored) this.token = stored;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'content-type': 'application/json',
          ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
          ...(options.headers ?? {}),
        },
      });

      const text = await response.text();
      const body = text ? JSON.parse(text) : {};

      if (!response.ok) {
        const error = body?.error ?? {};
        throw new ApiError(error.message ?? `请求失败（${response.status}）`, error.code ?? 'unknown', response.status);
      }
      return body as T;
    } finally {
      window.clearTimeout(timer);
    }
  }

  async register(email: string, password: string, displayName?: string): Promise<{ token: string; user: ApiUser }> {
    const result = await this.request<{ token: string; user: ApiUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
    this.setToken(result.token);
    return result;
  }

  async login(email: string, password: string): Promise<{ token: string; user: ApiUser }> {
    const result = await this.request<{ token: string; user: ApiUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.token);
    return result;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async fetchProfile(): Promise<{ profile: PlayerProfile; revision: number } | null> {
    return this.request('/api/profile');
  }

  /** Pushes the profile. Returns null when the server reports a conflict. */
  async pushProfile(
    profile: PlayerProfile,
    baseRevision: number,
  ): Promise<{ profile: PlayerProfile; revision: number } | { conflict: true; profile: PlayerProfile; revision: number }> {
    const result = await this.request<any>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify({ profile, baseRevision }),
    });
    if (result?.conflict) {
      return { conflict: true, profile: result.current?.profile ?? result.profile, revision: result.current?.revision ?? result.revision };
    }
    return { profile: result.profile, revision: result.revision };
  }

  async importLegacy(legacy: Record<string, string | null>): Promise<{ profile: PlayerProfile; revision: number; report: unknown }> {
    return this.request('/api/profile/import', {
      method: 'POST',
      body: JSON.stringify({ legacy }),
    });
  }

  async health(): Promise<{ status: string; db: string }> {
    return this.request('/api/health');
  }
}
