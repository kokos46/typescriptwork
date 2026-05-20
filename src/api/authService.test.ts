import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  setAccessToken,
  getAccessToken,
  clearAuthTokens,
  login,
  register,
  refreshAccessToken,
  ensureAccessToken,
  logout,
  getCurrentUser,
  API_URL,
} from './authService';
import { createLocalStorageMock } from '../test/localStorageMock';

const makeJwt = (payload: Record<string, unknown>) => {
  const header = btoa(JSON.stringify({ alg: 'HS256' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.sig`;
};

describe('authService', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createLocalStorageMock());
    vi.stubGlobal('window', {
      setTimeout: globalThis.setTimeout,
      clearTimeout: globalThis.clearTimeout,
    });
    clearAuthTokens();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('token helpers', () => {
    it('setAccessToken and getAccessToken', () => {
      setAccessToken('token-1');
      expect(getAccessToken()).toBe('token-1');
    });

    it('clearAuthTokens resets token and legacy key', () => {
      setAccessToken('token-1');
      localStorage.setItem('tableAppRefreshToken', 'legacy');
      clearAuthTokens();
      expect(getAccessToken()).toBeNull();
      expect(localStorage.getItem('tableAppRefreshToken')).toBeNull();
    });
  });

  describe('login', () => {
    it('stores token and returns session on success', async () => {
      const user = { id: '1', email: 'a@b.com' };
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ access_token: 'access-1' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => user,
        });
      vi.stubGlobal('fetch', fetchMock);

      const session = await login('a@b.com', 'password123');

      expect(session.access_token).toBe('access-1');
      expect(session.user).toEqual(user);
      expect(getAccessToken()).toBe('access-1');
      expect(fetchMock).toHaveBeenCalledWith(
        `${API_URL}/auth/login`,
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('throws on failed login', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: async () => ({ detail: 'Bad credentials' }),
        })
      );

      await expect(login('a@b.com', 'wrong')).rejects.toThrow('Bad credentials');
    });
  });

  describe('register', () => {
    it('returns message on success', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ message: 'ok' }),
        })
      );

      const result = await register('name', 'a@b.com', 'password123');
      expect(result.message).toBe('ok');
    });
  });

  describe('refreshAccessToken', () => {
    it('returns new token when refresh succeeds', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ access_token: 'refreshed' }),
        })
      );

      const token = await refreshAccessToken();
      expect(token).toBe('refreshed');
      expect(getAccessToken()).toBe('refreshed');
    });

    it('returns null and clears tokens on failure', async () => {
      setAccessToken('old');
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

      const token = await refreshAccessToken();
      expect(token).toBeNull();
      expect(getAccessToken()).toBeNull();
    });
  });

  describe('ensureAccessToken', () => {
    it('returns current token when not expired', async () => {
      const exp = Math.floor(Date.now() / 1000) + 3600;
      const token = makeJwt({ exp });
      setAccessToken(token);

      const result = await ensureAccessToken();
      expect(result).toBe(token);
    });

    it('refreshes expired token', async () => {
      const exp = Math.floor(Date.now() / 1000) - 10;
      setAccessToken(makeJwt({ exp }));

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ access_token: 'new-token' }),
        })
      );

      const result = await ensureAccessToken();
      expect(result).toBe('new-token');
    });
  });

  describe('logout', () => {
    it('clears tokens even when request fails', async () => {
      setAccessToken('token');
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

      await expect(logout()).rejects.toThrow('network');
      expect(getAccessToken()).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('throws without token', async () => {
      await expect(getCurrentUser()).rejects.toThrow('Сессия истекла');
    });

    it('returns user when authorized', async () => {
      setAccessToken('token');
      const user = { id: '1', email: 'a@b.com' };
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => user,
        })
      );

      await expect(getCurrentUser()).resolves.toEqual(user);
    });
  });
});
