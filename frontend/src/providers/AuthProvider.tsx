'use client';

import { isEmailIdentifier } from '@/features/auth/schemas/login.schema';
import { userHasPortalRole } from '@/lib/auth/roles';
import { authApi, buyerProfileApi, farmerProfileApi, isApiError } from '@/lib/api';
import { queryKeys } from '@/lib/query/keys';
import { clearSession, getSession } from '@/lib/auth/session';
import { hasStoredToken } from '@/lib/auth/token-storage';
import type { BuyerProfile } from '@/types/buyer';
import type { FarmerProfile } from '@/types/farmer';
import type { PortalRole, RegisterPayload, User } from '@/types/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

export interface LoginInput {
  identifier: string;
  password: string;
  remember?: boolean;
  portalRole?: PortalRole;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: PortalRole;
}

interface AuthContextValue {
  user: User | null;
  profile: FarmerProfile | null;
  buyerProfile: BuyerProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isFarmer: boolean;
  isBuyer: boolean;
  activePortal: PortalRole | null;
  isProfileComplete: boolean;
  isBuyerProfileComplete: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  addPortalRole: (role: PortalRole) => Promise<void>;
  switchPortal: (portal: PortalRole) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

function toLoginCredentials(input: LoginInput) {
  const identifier = input.identifier.trim();
  return {
    email: isEmailIdentifier(identifier)
      ? identifier
      : identifier.replace(/\s/g, ''),
    password: input.password,
    remember: input.remember ?? false,
    portalRole: input.portalRole,
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const hasToken = typeof window !== 'undefined' && hasStoredToken();

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authApi.getCurrentUser,
    enabled: hasToken,
    retry: false,
    staleTime: 2 * 60 * 1000,
  });

  const userForQueries = meQuery.data ?? (typeof window !== 'undefined' ? getSession()?.user : null);

  const farmerProfileQuery = useQuery({
    queryKey: queryKeys.farmer.profile(),
    queryFn: async () => {
      try {
        return await farmerProfileApi.getFarmerProfile();
      } catch (error) {
        if (isApiError(error) && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: hasToken && userHasPortalRole(userForQueries, 'farmer'),
    retry: false,
    staleTime: 2 * 60 * 1000,
  });

  const buyerProfileQuery = useQuery({
    queryKey: queryKeys.buyer.profile(),
    queryFn: async () => {
      try {
        return await buyerProfileApi.getBuyerProfile();
      } catch (error) {
        if (isApiError(error) && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: hasToken && userHasPortalRole(userForQueries, 'buyer'),
    retry: false,
    staleTime: 2 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: (input: LoginInput) => authApi.login(toLoginCredentials(input)),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.auth.me(), session.user);
      void queryClient.invalidateQueries({ queryKey: queryKeys.farmer.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.buyer.all });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) => {
      const payload: RegisterPayload = {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        password: input.password,
        role: input.role,
      };
      return authApi.register(payload);
    },
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.auth.me(), session.user);
      void queryClient.invalidateQueries({ queryKey: queryKeys.farmer.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.buyer.all });
    },
  });

  const addPortalRoleMutation = useMutation({
    mutationFn: (role: PortalRole) => authApi.addPortalRole(role),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me(), user);
      void queryClient.invalidateQueries({ queryKey: queryKeys.farmer.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.buyer.all });
    },
  });

  const switchPortalMutation = useMutation({
    mutationFn: (portal: PortalRole) => authApi.switchPortal(portal),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.auth.me(), user);
    },
  });

  const login = useCallback(
    async (input: LoginInput) => {
      await loginMutation.mutateAsync(input);
      await Promise.all([farmerProfileQuery.refetch(), buyerProfileQuery.refetch()]);
    },
    [loginMutation, farmerProfileQuery, buyerProfileQuery],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      await registerMutation.mutateAsync(input);
      await Promise.all([meQuery.refetch(), farmerProfileQuery.refetch(), buyerProfileQuery.refetch()]);
    },
    [registerMutation, meQuery, farmerProfileQuery, buyerProfileQuery],
  );

  const addPortalRole = useCallback(
    async (role: PortalRole) => {
      await addPortalRoleMutation.mutateAsync(role);
      await Promise.all([farmerProfileQuery.refetch(), buyerProfileQuery.refetch()]);
    },
    [addPortalRoleMutation, farmerProfileQuery, buyerProfileQuery],
  );

  const switchPortal = useCallback(
    async (portal: PortalRole) => {
      await switchPortalMutation.mutateAsync(portal);
      await Promise.all([farmerProfileQuery.refetch(), buyerProfileQuery.refetch()]);
    },
    [switchPortalMutation, farmerProfileQuery, buyerProfileQuery],
  );

  const logout = useCallback(() => {
    clearSession();
    queryClient.clear();
  }, [queryClient]);

  const refreshSession = useCallback(async () => {
    await Promise.all([
      meQuery.refetch(),
      farmerProfileQuery.refetch(),
      buyerProfileQuery.refetch(),
    ]);
  }, [meQuery, farmerProfileQuery, buyerProfileQuery]);

  const cachedSession = typeof window !== 'undefined' ? getSession() : null;
  const user = meQuery.data ?? cachedSession?.user ?? null;
  const profile = farmerProfileQuery.data ?? null;
  const buyerProfile = buyerProfileQuery.data ?? null;

  const loading =
    (hasToken && meQuery.isLoading) ||
    (hasToken && userHasPortalRole(user, 'farmer') && farmerProfileQuery.isLoading) ||
    (hasToken && userHasPortalRole(user, 'buyer') && buyerProfileQuery.isLoading) ||
    loginMutation.isPending ||
    registerMutation.isPending ||
    addPortalRoleMutation.isPending ||
    switchPortalMutation.isPending;

  const activePortal: PortalRole | null =
    user?.role === 'farmer' || user?.role === 'buyer' ? user.role : null;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      buyerProfile,
      loading,
      isAuthenticated: Boolean(user && hasStoredToken()),
      isFarmer: userHasPortalRole(user, 'farmer'),
      isBuyer: userHasPortalRole(user, 'buyer'),
      activePortal,
      isProfileComplete: Boolean(profile?.onboardingComplete),
      isBuyerProfileComplete: Boolean(buyerProfile?.onboardingComplete),
      login,
      register,
      addPortalRole,
      switchPortal,
      logout,
      refreshSession,
    }),
    [
      user,
      profile,
      buyerProfile,
      loading,
      activePortal,
      login,
      register,
      addPortalRole,
      switchPortal,
      logout,
      refreshSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}

export { AuthContext };
