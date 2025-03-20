/**
 * 全局认证提供器
 */

'use client';

import { ReactNode } from 'react';
import { AuthProvider as AuthContextProvider } from '../lib/context/AuthContext';

export default function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
} 