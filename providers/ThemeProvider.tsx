/**
 * 主题提供器
 * 管理网站主题（亮色/暗色模式）
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

// 防止主题闪烁的脚本
const themeScript = `
  (function() {
    // 立即检查本地存储中的主题设置
    const storageKey = 'theme-preference';
    const theme = localStorage.getItem(storageKey);
    
    // 如果有保存的主题设置，立即应用
    if (theme) {
      document.documentElement.classList.add(theme === 'dark' ? 'dark' : 'light');
      document.documentElement.classList.remove(theme === 'dark' ? 'light' : 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // 如果没有存储的主题，检查系统偏好
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function ThemeProvider({ children }: { children: ReactNode }) {
  // 添加主题过渡CSS
  useEffect(() => {
    // 在<html>标签上添加transition类以实现颜色平滑过渡
    document.documentElement.classList.add('transition-colors');
    document.documentElement.style.transitionDuration = '300ms';
    
    // 清理函数
    return () => {
      document.documentElement.classList.remove('transition-colors');
      document.documentElement.style.transitionDuration = '';
    };
  }, []);
  
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
      themes={['light', 'dark', 'system']}
      storageKey="theme-preference"
    >
      {/* 防止主题闪烁的内联脚本 */}
      <script
        dangerouslySetInnerHTML={{ __html: themeScript }}
        suppressHydrationWarning
      />
      {children}
    </NextThemesProvider>
  );
} 