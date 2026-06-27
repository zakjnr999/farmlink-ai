const ACCESS_TOKEN_KEY = 'farmlink_access_token';
const REFRESH_TOKEN_KEY = 'farmlink_refresh_token';
const REMEMBER_KEY = 'farmlink_remember';

function getStorage(remember: boolean): Storage {
  if (typeof window === 'undefined') {
    throw new Error('Token storage is only available in the browser');
  }
  return remember ? window.localStorage : window.sessionStorage;
}

export function setRememberPreference(remember: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REMEMBER_KEY, String(remember));
}

export function getRememberPreference(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(REMEMBER_KEY) === 'true';
}

export function setAccessToken(token: string, remember?: boolean): void {
  if (typeof window === 'undefined') return;
  const useRemember = remember ?? getRememberPreference();
  setRememberPreference(useRemember);
  clearTokens();
  getStorage(useRemember).setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const sessionToken = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (sessionToken) return sessionToken;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setRefreshToken(token: string, remember?: boolean): void {
  if (typeof window === 'undefined') return;
  const useRemember = remember ?? getRememberPreference();
  getStorage(useRemember).setItem(REFRESH_TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  const sessionToken = window.sessionStorage.getItem(REFRESH_TOKEN_KEY);
  if (sessionToken) return sessionToken;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function hasStoredToken(): boolean {
  return getAccessToken() !== null;
}

export { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, REMEMBER_KEY };
