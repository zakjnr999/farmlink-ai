'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, WifiOff } from 'lucide-react';
import {
  signupSchema,
  type SignupFormValues,
} from '@/features/auth/schemas/signup.schema';
import { useAuth } from '@/hooks/use-auth';
import { userHasPortalRole } from '@/lib/auth/roles';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/auth';
import { BUYER_ROUTES, FARMER_ROUTES } from '@/constants/routes';

interface SignupFormProps {
  role: Extract<UserRole, 'farmer' | 'buyer'>;
  onSuccess?: () => void;
  className?: string;
}

const roleCopy = {
  farmer: {
    submit: 'Create farmer account',
    submitting: 'Creating account…',
    loginHref: FARMER_ROUTES.login,
    loginLabel: 'Sign in as a farmer',
  },
  buyer: {
    submit: 'Create buyer account',
    submitting: 'Creating account…',
    loginHref: BUYER_ROUTES.login,
    loginLabel: 'Sign in as a buyer',
  },
};

export function SignupForm({ role, onSuccess, className }: SignupFormProps) {
  const {
    register: registerUser,
    addPortalRole,
    user,
    isAuthenticated,
    isFarmer,
    isBuyer,
  } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const copy = roleCopy[role];

  const isAddingRole =
    isAuthenticated &&
    user &&
    ((role === 'buyer' && isFarmer && !isBuyer) ||
      (role === 'farmer' && isBuyer && !isFarmer));

  const alreadyHasRole = isAuthenticated && user && userHasPortalRole(user, role);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  const agreeTerms = watch('agreeTerms');

  const onSubmit = async (values: SignupFormValues) => {
    if (!isOnline) {
      setSubmitError('You are offline. Connect to the internet to create an account.');
      return;
    }

    setSubmitError(null);

    try {
      if (isAddingRole) {
        await addPortalRole(role);
        onSuccess?.();
        return;
      }

      await registerUser({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone.replace(/\s/g, ''),
        password: values.password,
        role,
      });
      onSuccess?.();
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'We could not create your account. Please try again.';
      setSubmitError(message);
    }
  };

  if (alreadyHasRole) {
    return (
      <div className={cn('space-y-4 rounded-lg border border-farm-green/30 bg-farm-green/5 p-4', className)}>
        <p className="text-sm text-field-ink">
          Your account already has {role} access. Switch portals from your dashboard or sign in
          directly.
        </p>
        <Button asChild className="w-full">
          <Link href={copy.loginHref}>{copy.loginLabel}</Link>
        </Button>
      </div>
    );
  }

  if (isAddingRole && user) {
    return (
      <div className={cn('space-y-5', className)}>
        <div className="rounded-lg border border-market-green/30 bg-market-green/5 px-4 py-3 text-sm">
          Signed in as <strong>{user.fullName}</strong>. Add {role} access to the same account so
          you can sell and buy produce without a separate login.
        </div>
        {submitError && (
          <p
            className="rounded-lg border border-tomato-red/30 bg-tomato-red/10 px-4 py-3 text-sm text-tomato-red"
            role="alert"
          >
            {submitError}
          </p>
        )}
        <Button
          type="button"
          className="w-full"
          size="lg"
          disabled={!isOnline}
          onClick={async () => {
            if (!isOnline) {
              setSubmitError('You are offline. Connect to the internet to continue.');
              return;
            }
            setSubmitError(null);
            try {
              await addPortalRole(role);
              onSuccess?.();
            } catch (error) {
              const message =
                error && typeof error === 'object' && 'message' in error
                  ? String((error as { message: string }).message)
                  : 'We could not add this access. Please try again.';
              setSubmitError(message);
            }
          }}
        >
          Add {role} access to my account
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-5', className)} noValidate>
      {!isOnline && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-clay-orange/40 bg-clay-orange/10 px-4 py-3 text-sm"
        >
          <WifiOff className="mt-0.5 size-5 shrink-0 text-clay-orange" aria-hidden />
          <p>Account creation requires an internet connection.</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" autoComplete="name" {...register('fullName')} />
        {errors.fullName && (
          <p className="text-sm text-tomato-red" role="alert">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && (
          <p className="text-sm text-tomato-red" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input id="phone" type="tel" autoComplete="tel" placeholder="0244123456" {...register('phone')} />
        {errors.phone && (
          <p className="text-sm text-tomato-red" role="alert">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
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
          <p className="text-sm text-tomato-red" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            className="pr-12"
            {...register('confirmPassword')}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1"
            onClick={() => setShowConfirm((p) => !p)}
            aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirm ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-tomato-red" role="alert">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="agreeTerms"
          checked={agreeTerms === true}
          onCheckedChange={(checked) =>
            setValue('agreeTerms', checked === true, { shouldDirty: true, shouldValidate: true })
          }
        />
        <Label htmlFor="agreeTerms" className="cursor-pointer font-normal leading-snug">
          I agree to use FarmLink for lawful agricultural trade and understand that produce
          quality must be confirmed before purchase.
        </Label>
      </div>
      {errors.agreeTerms && (
        <p className="text-sm text-tomato-red" role="alert">
          {errors.agreeTerms.message}
        </p>
      )}

      {submitError && (
        <p
          className="rounded-lg border border-tomato-red/30 bg-tomato-red/10 px-4 py-3 text-sm text-tomato-red"
          role="alert"
        >
          {submitError}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !isOnline}>
        {isSubmitting ? copy.submitting : copy.submit}
      </Button>

      <p className="text-center text-sm text-muted-text">
        Already have an account?{' '}
        <Link href={copy.loginHref} className="font-medium text-primary hover:underline">
          {copy.loginLabel}
        </Link>
      </p>
    </form>
  );
}
