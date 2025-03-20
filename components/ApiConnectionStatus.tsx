'use client';

import { useState, useEffect } from 'react';
import { testApiConnection } from '@/lib/api/apiTest';

export default function ApiConnectionStatus() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [message, setMessage] = useState<string>('检查 API 连接...');
  const [serverInfo, setServerInfo] = useState<any>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await testApiConnection();
        
        if (result.success) {
          setStatus('connected');
          setMessage(result.message);
          setServerInfo(result.serverInfo);
        } else {
          setStatus('error');
          setMessage(result.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage('API连接检查出错');
        console.error('API连接检查错误:', error);
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="rounded-md border p-4 mb-4">
      <div className="flex items-center gap-2">
        {status === 'loading' && (
          <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
        )}
        {status === 'connected' && (
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        )}
        {status === 'error' && (
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
        )}
        
        <h3 className="text-lg font-medium">
          API 连接状态: {status === 'loading' ? '检查中' : status === 'connected' ? '已连接' : '错误'}
        </h3>
      </div>
      
      <p className="mt-2 text-gray-600 dark:text-gray-400">{message}</p>
      
      {serverInfo && (
        <div className="mt-3 text-sm">
          <div className="grid grid-cols-2 gap-1">
            <span className="text-gray-500 dark:text-gray-400">环境:</span>
            <span>{serverInfo.environment}</span>
            
            <span className="text-gray-500 dark:text-gray-400">版本:</span>
            <span>{serverInfo.version}</span>
            
            <span className="text-gray-500 dark:text-gray-400">时间戳:</span>
            <span>{new Date(serverInfo.timestamp).toLocaleString()}</span>
          </div>
        </div>
      )}
      
      {status === 'error' && (
        <button
          onClick={() => {
            setStatus('loading');
            setMessage('重新检查 API 连接...');
            testApiConnection().then(result => {
              if (result.success) {
                setStatus('connected');
                setMessage(result.message);
                setServerInfo(result.serverInfo);
              } else {
                setStatus('error');
                setMessage(result.message);
              }
            }).catch(error => {
              setStatus('error');
              setMessage('API连接检查出错');
              console.error('API连接检查错误:', error);
            });
          }}
          className="mt-3 px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
        >
          重试
        </button>
      )}
    </div>
  );
} 