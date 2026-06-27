import type { AuthSession, User } from '@/types/auth';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getRememberPreference,
  setAccessToken,
  setRefreshToken,
} from './token-storage';

const SESSION_USER_KEY = 'farmlink_session_user';

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  const remember = getRememberPreference();
  return remember ? window.localStorage : window.sessionStorage;
}

function parseUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession, remember?: boolean): void {
  if (typeof window === 'undefined') return;
  const useRemember = remember ?? getRememberPreference();
  clearSession();
  setAccessToken(session.accessToken, useRemember);
  if (session.refreshToken) {
    setRefreshToken(session.refreshToken, useRemember);
  }
  const storage = useRemember ? window.localStorage : window.sessionStorage;
  storage.setItem(SESSION_USER_KEY, JSON.stringify(session.user));
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const accessToken = getAccessToken();
  const user = parseUser(getSessionStorage()?.getItem(SESSION_USER_KEY) ?? null);
  if (!accessToken || !user) return null;
  return {
    user,
    accessToken,
    refreshToken: getRefreshToken() ?? undefined,
  };
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  clearTokens();
  window.sessionStorage.removeItem(SESSION_USER_KEY);
  window.localStorage.removeItem(SESSION_USER_KEY);
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export { SESSION_USER_KEY };
