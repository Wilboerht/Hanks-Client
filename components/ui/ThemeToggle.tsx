/**
 * 主题切换按钮组件
 */

'use client';

import { useTheme } from 'next-themes';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  // 防止水合不匹配
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setIsChanging(true);
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // 添加延迟，以便用户能够看到过渡动画
    setTimeout(() => {
      setIsChanging(false);
    }, 300);
  };

  // 获取当前主题
  const currentTheme = resolvedTheme || theme;

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <motion.button
      onClick={toggleTheme}
      disabled={isChanging}
      className="relative p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors duration-300 ease-in-out hover:ring-2 hover:ring-primary-500/30 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-70"
      aria-label={currentTheme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'}
      whileTap={{ scale: 0.9 }}
      title={currentTheme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentTheme}
          initial={{ opacity: 0, rotate: -30, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {currentTheme === 'dark' ? (
            <FiSun size={20} className="text-yellow-400" />
          ) : (
            <FiMoon size={20} className="text-blue-600" />
          )}
        </motion.div>
      </AnimatePresence>
      
      {isChanging && (
        <span className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="w-full h-full rounded-full"
            animate={{ 
              backgroundColor: currentTheme === 'dark' 
                ? ['rgba(255,255,255,0)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0)'] 
                : ['rgba(0,0,0,0)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0)']
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </span>
      )}
    </motion.button>
  );
} 