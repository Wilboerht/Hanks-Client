'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error('Uncaught error:', error);
      setError(error.error);
      setHasError(true);
    };

    window.addEventListener('error', errorHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-red-600 mb-2">出错了！</h2>
            <p className="text-gray-600 mb-6">
              抱歉，应用程序遇到了意外错误。
            </p>
            {error && (
              <div className="bg-red-50 p-4 rounded-md mb-6 text-left">
                <p className="text-sm text-red-800 font-medium">错误信息：</p>
                <p className="text-sm text-red-700 mt-1 font-mono">
                  {error.message || '未知错误'}
                </p>
              </div>
            )}
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                刷新页面
              </button>
              <Link
                href="/"
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 