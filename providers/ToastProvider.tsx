'use client';

import { ReactNode } from 'react';
import { ToastProvider as UIToastProvider } from '@/components/ui/Toast';

export default function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <UIToastProvider position="bottom-right">
      {children}
    </UIToastProvider>
  );
} 