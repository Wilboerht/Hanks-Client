'use client';

import { useEffect } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 记录错误到错误报告服务
    console.error(error);
  }, [error]);

  return (
    <div className="container flex flex-col items-center justify-center min-h-[70vh] py-16 text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
        <ExclamationTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400" />
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold mb-4">出现了一些问题</h1>
      
      <p className="text-neutral-600 dark:text-neutral-400 max-w-lg mb-8">
        抱歉，应用程序遇到了一个错误。我们的团队已经收到通知，正在努力解决。
      </p>
      
      <div className="message-error mb-8 max-w-lg mx-auto text-left">
        <p className="font-mono text-sm break-all">
          {error.message || '未知错误'}
        </p>
      </div>
      
      <button
        onClick={() => reset()}
        className="btn-primary inline-flex items-center"
      >
        <ArrowPathIcon className="h-5 w-5 mr-2" />
        重试
      </button>
    </div>
  );
} 