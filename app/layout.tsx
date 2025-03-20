import type { Metadata, Viewport } from 'next/types';
import './globals.css';

import ErrorBoundary from '@/components/ErrorBoundary';
import ThemeProvider from '@/providers/ThemeProvider';
import AuthProvider from '@/providers/AuthProvider';
import ToastProvider from '@/providers/ToastProvider';
import AppStateProvider from '@/providers/AppStateProvider';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'wilboerht - 个人网站',
  description: '欢迎访问我的个人网站，这里分享我的项目、文章和想法',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#111111' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_API_URL || ''}
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href={process.env.NEXT_PUBLIC_API_URL || ''}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ErrorBoundary>
          <AppStateProvider>
            <ThemeProvider>
              <AuthProvider>
                <ToastProvider>
                  <Navbar />
                  <main className="flex-1 min-h-screen">
                    {children}
                  </main>
                </ToastProvider>
              </AuthProvider>
            </ThemeProvider>
          </AppStateProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
} 