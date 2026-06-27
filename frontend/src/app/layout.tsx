import type { Metadata, Viewport } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
import { AppProviders } from '@/providers/AppProviders';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'FarmLink Farmer',
    template: '%s · FarmLink Farmer',
  },
  description:
    'List produce, find buyers and manage agricultural offers from your field journal.',
  applicationName: 'FarmLink Farmer',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FarmLink',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#356B45',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${inter.variable} min-h-dvh bg-field-cream font-sans text-field-ink antialiased`}
      >
        <AppProviders>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{ className: 'font-sans' }}
          />
        </AppProviders>
      </body>
    </html>
  );
}
