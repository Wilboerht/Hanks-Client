'use client';

import { ReactNode } from 'react';
import { AppProvider } from '@/lib/context/AppContext';
import QueryProvider from '@/lib/query/QueryProvider';

interface AppStateProviderProps {
  children: ReactNode;
}

/**
 * 统一的应用状态提供器
 * 集成了React Query和全局状态Context
 */
export default function AppStateProvider({ children }: AppStateProviderProps) {
  return (
    <QueryProvider>
      <AppProvider>
        {children}
      </AppProvider>
    </QueryProvider>
  );
} 