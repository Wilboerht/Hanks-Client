import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-8 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              wilboerht
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 md:gap-8">
            {/* TODO: 创建这些页面或更新链接到已存在的页面 */}
            <Link href="/blog/tags" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              链接
            </Link>
            <Link href="/blog/friends" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              朋友
            </Link>
            <Link href="/about" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              联系
            </Link>
            <a href="/api/rss" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              RSS
            </a>
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              GitHub
            </a>
            <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Telegram
            </a>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
          <p>Copyright © 2024-2025 wilboerht. <a href="https://creativecommons.org/share-your-work/cclicenses/" target="_blank" rel="noopener noreferrer" className="underline text-gray-400 dark:text-gray-500">Licensed under CC BY-NC 4.0</a></p>
        </div>
      </div>
    </footer>
  );
} 