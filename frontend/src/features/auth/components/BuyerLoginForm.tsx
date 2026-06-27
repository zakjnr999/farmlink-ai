'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, WifiOff } from 'lucide-react';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/login.schema';
import { useAuth } from '@/hooks/use-auth';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getSession } from '@/lib/auth/session';
import { userHasPortalRole } from '@/lib/auth/roles';
import {
  getMissingPortalRoleMessage,
  getPortalRoleSignupPath,
} from '@/features/auth/utils/role-validation';
import { config } from '@/lib/config';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface BuyerLoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function BuyerLoginForm({ onSuccess, className }: BuyerLoginFormProps) {
  const { login } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '', remember: false },
  });

  const remember = watch('remember');

  const onSubmit = async (values: LoginFormValues) => {
    if (!isOnline) {
      setSubmitError('You are offline. Connect to the internet to sign in.');
      return;
    }
    setSubmitError(null);
    try {
      await login({
        identifier: values.identifier,
        password: values.password,
        remember: values.remember,
        portalRole: 'buyer',
      });
      const session = getSession();
      if (!userHasPortalRole(session?.user, 'buyer')) {
        setSubmitError(getMissingPortalRoleMessage('buyer'));
        return;
      }
      onSuccess?.();
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'We could not sign you in. Check your details and try again.';
      setSubmitError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-5', className)} noValidate>
      {!isOnline && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-basket-clay/40 bg-basket-clay/10 px-4 py-3 text-sm"
        >
          <WifiOff className="mt-0.5 size-5 shrink-0 text-basket-clay" aria-hidden />
          <p>Sign-in requires an internet connection.</p>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="buyer-identifier">Phone number or email</Label>
        <Input
          id="buyer-identifier"
          type="text"
          autoComplete="username"
          placeholder="0244555667 or orders@goldenspoon.gh"
          aria-invalid={Boolean(errors.identifier)}
          {...register('identifier')}
        />
        {errors.identifier && (
          <p className="text-sm text-tomato-accent" role="alert">
            {errors.identifier.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="buyer-password">Password</Label>
        <div className="relative">
          <Input
            id="buyer-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className="pr-12"
            {...register('password')}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1"
            onClick={() => setShowPassword((p) => !p)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-tomato-accent" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Checkbox
          id="buyer-remember"
          checked={remember}
          onCheckedChange={(c) => setValue('remember', c === true, { shouldDirty: true })}
        />
        <Label htmlFor="buyer-remember" className="cursor-pointer font-normal">
          Keep me signed in on this device
        </Label>
      </div>
      {submitError && (
        <div
          className="rounded-lg border border-tomato-accent/30 bg-tomato-accent/10 px-4 py-3 text-sm text-tomato-accent"
          role="alert"
        >
          <p>{submitError}</p>
          {submitError.includes('does not have buyer access') && (
            <Link
              href={getPortalRoleSignupPath('buyer')}
              className="mt-2 inline-block font-medium underline"
            >
              Add buyer access to your account
            </Link>
          )}
        </div>
      )}
      <Button type="submit" className="w-full bg-market-green hover:bg-market-green/90" size="lg" disabled={isSubmitting || !isOnline}>
        {isSubmitting ? 'Signing in…' : 'Sign in to Harvest Exchange'}
      </Button>
      <p className="text-center text-xs text-ledger-grey">
        {config.isDemoMode
          ? 'Demo buyer: orders@goldenspoon.gh · any password (6+ characters)'
          : 'Use your registered buyer email and password.'}
      </p>
    </form>
  );
}
