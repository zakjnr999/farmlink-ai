import { apiGet, apiPost } from './client';
import type { AuthSession, LoginCredentials, PortalRole, RegisterPayload, User } from '@/types/auth';
import { getSession, saveSession, clearSession } from '@/lib/auth/session';
import { getRememberPreference } from '@/lib/auth/token-storage';

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const response = await apiPost<AuthSession>('/auth/login', credentials);
  saveSession(response.data, credentials.remember);
  return response.data;
}

export async function register(payload: RegisterPayload): Promise<AuthSession> {
  const response = await apiPost<AuthSession>('/auth/register', payload);
  saveSession(response.data);
  return response.data;
}

export async function addPortalRole(role: PortalRole): Promise<User> {
  const response = await apiPost<User>('/auth/add-role', { role });
  const session = getSession();
  if (session) {
    saveSession({ ...session, user: response.data }, getRememberPreference());
  }
  return response.data;
}

export async function switchPortal(portalRole: PortalRole): Promise<User> {
  const response = await apiPost<User>('/auth/switch-portal', { portalRole });
  const session = getSession();
  if (session) {
    saveSession({ ...session, user: response.data }, getRememberPreference());
  }
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiGet<User>('/auth/me');
  return response.data;
}

export async function logout(): Promise<void> {
  try {
    await apiPost<void>('/auth/logout');
  } finally {
    clearSession();
  }
}
