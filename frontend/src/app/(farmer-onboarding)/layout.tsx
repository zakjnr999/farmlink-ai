import type { ReactNode } from 'react';

export default function FarmerOnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="field-rows min-h-dvh bg-field-cream">
      <div className="mx-auto w-full max-w-2xl px-4 py-6">{children}</div>
    </div>
  );
}
