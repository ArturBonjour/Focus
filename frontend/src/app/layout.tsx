import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeScript } from '@/components/theme-script';
import { RouteProgress } from '@/components/route-progress';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

export const metadata: Metadata = {
  title: { default: 'NeuroTrack', template: '%s | NeuroTrack' },
  description: 'Интеллектуальная система планирования и анализа продуктивности',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NeuroTrack',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
  keywords: ['продуктивность', 'задачи', 'привычки', 'фокус', 'планирование'],
  openGraph: {
    title: 'NeuroTrack — AI Productivity',
    description: 'Интеллектуальная система планирования и анализа продуктивности',
    type: 'website',
    locale: 'ru_RU',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f4f8' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <RouteProgress />
        {children}
        <MobileBottomNav />
      </body>
    </html>
  );
}
