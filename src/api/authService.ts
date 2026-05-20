import type {User} from "../slices/auth.ts";

const API_URL = 'http://127.0.0.1:8000';
const LEGACY_REFRESH_TOKEN_KEY = 'tableAppRefreshToken';

interface LoginResponse {
  access_token: string;
}

interface RegisterResponse {
  message: string;
}

interface RefreshResponse {
  access_token: string;
}

interface AuthSession {
  access_token: string;
  user: User;
}

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
const REQUEST_TIMEOUT_MS = 10_000;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const parseJwtPayload = (token: string): {exp?: number} | null => {
  try {
    const payload = token.split('.')[1];
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalizedPayload));
  } catch {
    return null;
  }
};

const isAccessTokenExpired = (token: string) => {
  const payload = parseJwtPayload(token);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now() + 30_000;
};

const saveAccessTokenResponse = (data: LoginResponse | RefreshResponse) => {
  if (!data.access_token) {
    throw new Error('Некорректный ответ сервера');
  }

  setAccessToken(data.access_token);
  return data;
};

export const clearAuthTokens = () => {
  setAccessToken(null);
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
};

const fetchWithTimeout = async (input: RequestInfo | URL, init?: RequestInit) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const login = async (email: string, password: string) => {
  let response: Response;

  try {
    response = await fetchWithTimeout(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      credentials: 'include',
      body: JSON.stringify({email, password}),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Сервер не ответил на запрос входа');
    }

    throw new Error('Не удалось прочитать ответ входа. Проверьте CORS и allow_credentials на backend');
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Неверный email или пароль'));
  }

  const data: LoginResponse = await response.json();
  saveAccessTokenResponse(data);

  return {
    access_token: data.access_token,
    user: await getCurrentUser(),
  } satisfies AuthSession;
};

export const register = async (username: string, email: string, password: string) => {
  void username;

  const response = await fetchWithTimeout(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
    body: JSON.stringify({email, password}),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Не удалось зарегистрироваться'));
  }

  return response.json() as Promise<RegisterResponse>;
};

export const refreshAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = fetchWithTimeout(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then(async (response) => {
      if (!response.ok) {
        clearAuthTokens();
        return null;
      }

      const data: RefreshResponse = await response.json();
      return saveAccessTokenResponse(data).access_token;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

export const ensureAccessToken = async () => {
  if (!accessToken || isAccessTokenExpired(accessToken)) {
    return refreshAccessToken();
  }

  return accessToken;
};

export const logout = async () => {
  try {
    await fetchWithTimeout(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } finally {
    clearAuthTokens();
  }
};

export const getCurrentUser = async () => {
  const token = accessToken;

  if (!token) {
    throw new Error('Сессия истекла');
  }

  const response = await fetchWithTimeout(`${API_URL}/me`, {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Не удалось получить пользователя');
  }

  return response.json() as Promise<User>;
};

export const updateProfile = async (data: {username?: string}) => {
  const token = accessToken;

  if (!token) throw new Error('Сессия истекла');

  const response = await fetchWithTimeout(`${API_URL}/me`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Не удалось обновить профиль'));
  }

  return response.json();
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
  const token = accessToken;

  if (!token) throw new Error('Сессия истекла');

  const response = await fetchWithTimeout(`${API_URL}/auth/change-password`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({old_password: oldPassword, new_password: newPassword}),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Не удалось сменить пароль'));
  }

  return response.json();
};

const getErrorMessage = async (response: Response, fallback: string) => {
  try {
    const data = await response.json();
    return data.detail || data.message || fallback;
  } catch {
    return fallback;
  }
};

export {API_URL};
