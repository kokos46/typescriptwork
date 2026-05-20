import { describe, it, expect, vi, beforeEach } from 'vitest';
import authReducer, {
  clearAuthState,
  loginUser,
  registerUser,
  restoreSession,
  logoutUser,
} from './auth';
import * as authService from '../api/authService';

vi.mock('../api/authService.ts', () => ({
  login: vi.fn(),
  register: vi.fn(),
  refreshAccessToken: vi.fn(),
  getCurrentUser: vi.fn(),
  logout: vi.fn(),
  clearAuthTokens: vi.fn(),
}));

describe('auth slice', () => {
  const initial = authReducer(undefined, { type: '@@INIT' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clearAuthState resets to anonymous', () => {
    const authenticated = {
      ...initial,
      status: 'authenticated' as const,
      user: { id: '1', email: 'a@b.com' },
      username: 'a@b.com',
    };
    const state = authReducer(authenticated, clearAuthState());
    expect(state.status).toBe('anonymous');
    expect(state.user).toBeNull();
    expect(authService.clearAuthTokens).toHaveBeenCalled();
  });

  it('loginUser.fulfilled sets authenticated user', () => {
    const user = { id: '1', email: 'a@b.com' };
    const action = {
      type: loginUser.fulfilled.type,
      payload: { access_token: 't', user },
    };
    const state = authReducer(initial, action);
    expect(state.status).toBe('authenticated');
    expect(state.user).toEqual(user);
    expect(state.username).toBe('a@b.com');
  });

  it('loginUser.rejected sets error', () => {
    const action = {
      type: loginUser.rejected.type,
      error: { message: 'fail' },
    };
    const state = authReducer(
      { ...initial, loginStatus: 'loading' },
      action
    );
    expect(state.status).toBe('anonymous');
    expect(state.error).toBe('fail');
  });

  it('registerUser.fulfilled resets to anonymous', () => {
    const action = { type: registerUser.fulfilled.type, payload: { message: 'ok' } };
    const state = authReducer(
      { ...initial, status: 'loading' },
      action
    );
    expect(state.status).toBe('anonymous');
  });

  it('restoreSession.fulfilled restores user', () => {
    const user = { id: '1', email: 'u@test.com' };
    const action = { type: restoreSession.fulfilled.type, payload: user };
    const state = authReducer(initial, action);
    expect(state.status).toBe('authenticated');
    expect(state.user).toEqual(user);
  });

  it('restoreSession.rejected clears state when not logged in', () => {
    const action = { type: restoreSession.rejected.type };
    const state = authReducer(initial, action);
    expect(state.status).toBe('anonymous');
  });

  it('logoutUser.fulfilled clears user', () => {
    const action = { type: logoutUser.fulfilled.type };
    const state = authReducer(
      {
        ...initial,
        status: 'authenticated',
        user: { id: '1', email: 'a@b.com' },
        username: 'a@b.com',
        error: 'x',
      },
      action
    );
    expect(state.status).toBe('anonymous');
    expect(state.user).toBeNull();
    expect(state.error).toBeNull();
  });
});
