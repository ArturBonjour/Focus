import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeScript } from '@/components/theme-script';

export const metadata: Metadata = {
  title: { default: 'NeuroTrack', template: '%s | NeuroTrack' },
  description: 'Интеллектуальная система планирования и анализа продуктивности',
  icons: { icon: '/favicon.ico' },
  keywords: ['продуктивность', 'задачи', 'привычки', 'фокус', 'планирование'],
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
      <body>{children}</body>
    </html>
  );
}
