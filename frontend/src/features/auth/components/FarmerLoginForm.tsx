'use client';

import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/schemas/login.schema';
import { useAuth } from '@/hooks/use-auth';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { getSession } from '@/lib/auth/session';
import { userHasPortalRole } from '@/lib/auth/roles';
import {
  getMissingPortalRoleMessage,
  getPortalRoleSignupPath,
} from '@/features/auth/utils/role-validation';
import { config } from '@/lib/config';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, WifiOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';

interface FarmerLoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function FarmerLoginForm({ onSuccess, className }: FarmerLoginFormProps) {
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
    defaultValues: {
      identifier: '',
      password: '',
      remember: false,
    },
  });

  const remember = watch('remember');

  const onSubmit = async (values: LoginFormValues) => {
    if (!isOnline) {
      setSubmitError(
        'You are offline. Connect to the internet to sign in to your FarmLink account.',
      );
      return;
    }

    setSubmitError(null);

    try {
      await login({
        identifier: values.identifier,
        password: values.password,
        remember: values.remember,
        portalRole: 'farmer',
      });
      const session = getSession();
      if (!userHasPortalRole(session?.user, 'farmer')) {
        setSubmitError(getMissingPortalRoleMessage('farmer'));
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-5', className)}
      noValidate
    >
      {!isOnline && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-clay-orange/40 bg-clay-orange/10 px-4 py-3 text-sm text-field-ink"
        >
          <WifiOff className="mt-0.5 size-5 shrink-0 text-clay-orange" aria-hidden />
          <p>
            You are offline. Sign-in needs an internet connection. Saved drafts on
            this device are still available once you are back online.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="identifier">Phone number or email</Label>
        <Input
          id="identifier"
          type="text"
          inputMode="email"
          autoComplete="username"
          placeholder="0244123456 or you@example.com"
          aria-invalid={Boolean(errors.identifier)}
          aria-describedby={errors.identifier ? 'identifier-error' : undefined}
          {...register('identifier')}
        />
        {errors.identifier && (
          <p id="identifier-error" className="text-sm text-tomato-red" role="alert">
            {errors.identifier.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            className="pr-12"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-sm text-tomato-red" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Checkbox
          id="remember"
          checked={remember}
          onCheckedChange={(checked) =>
            setValue('remember', checked === true, { shouldDirty: true })
          }
        />
        <Label htmlFor="remember" className="cursor-pointer font-normal">
          Keep me signed in on this device
        </Label>
      </div>

      {submitError && (
        <div
          className="rounded-lg border border-tomato-red/30 bg-tomato-red/10 px-4 py-3 text-sm text-tomato-red"
          role="alert"
        >
          <p>{submitError}</p>
          {submitError.includes('does not have farmer access') && (
            <Link
              href={getPortalRoleSignupPath('farmer')}
              className="mt-2 inline-block font-medium underline"
            >
              Add farmer access to your account
            </Link>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting || !isOnline}
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {config.isDemoMode
          ? 'Demo farmer: kwame.mensah@example.com or 0244123456 · any password (6+ characters)'
          : 'Use your registered farmer email or phone and password.'}
      </p>
    </form>
  );
}
