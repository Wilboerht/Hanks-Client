/**
 * 导航栏组件
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/context/AuthContext';
import ThemeToggle from '../ui/ThemeToggle';
import { FiUser, FiLogOut, FiSettings, FiHome, FiFileText, FiUsers, FiInfo, FiCode } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    router.push('/');
  };

  // 点击外部关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
        {/* 主要导航区域 */}
        <nav className="flex items-center space-x-6">
          <Link href="/" className={`flex items-center text-sm hover:text-neutral-900 dark:hover:text-white transition-colors ${isActive('/') ? 'font-medium text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-300'}`}>
            <FiHome className="mr-1.5 h-4 w-4" />
            主页
          </Link>
          <Link href="/blog" className={`flex items-center text-sm hover:text-neutral-900 dark:hover:text-white transition-colors ${isActive('/blog') ? 'font-medium text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-300'}`}>
            <FiFileText className="mr-1.5 h-4 w-4" />
            博客
          </Link>
          <Link href="/lab" className={`flex items-center text-sm hover:text-neutral-900 dark:hover:text-white transition-colors ${isActive('/lab') ? 'font-medium text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-300'}`}>
            <FiCode className="mr-1.5 h-4 w-4" />
            实验室
          </Link>
          <Link href="/friends" className={`flex items-center text-sm hover:text-neutral-900 dark:hover:text-white transition-colors ${isActive('/friends') ? 'font-medium text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-300'}`}>
            <FiUsers className="mr-1.5 h-4 w-4" />
            友人
          </Link>
          <Link href="/about" className={`flex items-center text-sm hover:text-neutral-900 dark:hover:text-white transition-colors ${isActive('/about') ? 'font-medium text-neutral-900 dark:text-white' : 'text-neutral-600 dark:text-neutral-300'}`}>
            <FiInfo className="mr-1.5 h-4 w-4" />
            关于
          </Link>
        </nav>

        {/* 用户区域和主题切换 */}
        <div className="flex items-center">
          {/* 主题切换按钮 */}
          <ThemeToggle />

          {/* 认证相关按钮 */}
          {isAuthenticated ? (
            <div className="relative ml-4" ref={userMenuRef}>
              <button
                onClick={toggleUserMenu}
                className="flex items-center focus:outline-none rounded-full overflow-hidden"
                aria-label="用户菜单"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700">
                  {user?.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.username || '用户头像'}
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <FiUser className="text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>
              </button>

              {/* 用户下拉菜单 */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg py-1 z-10 border border-neutral-200 dark:border-neutral-700">
                  <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{user?.username}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <div className="flex items-center">
                      <FiUser className="mr-2" />
                      个人主页
                    </div>
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <div className="flex items-center">
                      <FiSettings className="mr-2" />
                      设置
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <div className="flex items-center">
                      <FiLogOut className="mr-2" />
                      退出登录
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center ml-4">
              <Link
                href="/login"
                className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors duration-300 ease-in-out hover:ring-2 hover:ring-primary-500/30 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                aria-label="登录"
              >
                <FiUser size={20} className="text-blue-600 dark:text-blue-400" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 