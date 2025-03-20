'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  UserIcon, 
  KeyIcon, 
  BellIcon, 
  ShieldCheckIcon, 
  DocumentDuplicateIcon,
  Cog6ToothIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const navItems = [
  {
    name: '个人资料',
    href: '/settings/profile',
    icon: UserIcon,
  },
  {
    name: '账号安全',
    href: '/settings',
    icon: KeyIcon,
  },
  {
    name: '通知设置',
    href: '/settings/notifications',
    icon: BellIcon,
  },
  {
    name: '隐私选项',
    href: '/settings/privacy',
    icon: ShieldCheckIcon,
  },
  {
    name: '内容管理',
    href: '/settings/content',
    icon: DocumentDuplicateIcon,
  },
  {
    name: '高级设置',
    href: '/settings/advanced',
    icon: Cog6ToothIcon,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 确保在客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-64 h-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            <div className="flex-1 h-96 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 移动版标题和汉堡菜单 */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">设置</h1>
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="sr-only">打开菜单</span>
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* 返回链接 - 移动版 */}
          <div className="lg:hidden mb-4">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              返回首页
            </Link>
          </div>

          {/* 侧边导航 - 移动版 */}
          <nav
            className={cn(
              'lg:hidden bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-6',
              {
                'block': isMobileMenuOpen,
                'hidden': !isMobileMenuOpen,
              }
            )}
          >
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {navItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center px-4 py-3 text-sm font-medium',
                      {
                        'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400': pathname === item.href,
                        'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50': pathname !== item.href,
                      }
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      {
                        'text-blue-500': pathname === item.href,
                        'text-gray-400 dark:text-gray-500': pathname !== item.href,
                      }
                    )} />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 侧边导航 - 桌面版 */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {/* 返回链接 */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <Link
                  href="/"
                  className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1" />
                  返回首页
                </Link>
              </div>
              
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">设置</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  管理您的账号偏好
                </p>
              </div>
              
              <nav className="p-2">
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                          {
                            'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400': pathname === item.href,
                            'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50': pathname !== item.href,
                          }
                        )}
                      >
                        <item.icon className={cn(
                          'mr-3 h-5 w-5 flex-shrink-0',
                          {
                            'text-blue-500': pathname === item.href,
                            'text-gray-400 dark:text-gray-500': pathname !== item.href,
                          }
                        )} />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          {/* 主内容区域 */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 