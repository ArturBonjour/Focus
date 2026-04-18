import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NeuroTrack Dashboard',
  description: 'Интеллектуальная система планирования и анализа продуктивности пользователя',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
