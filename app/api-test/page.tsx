'use client';

import { useState } from 'react';
import ApiConnectionStatus from '@/components/ApiConnectionStatus';
import { testAuthFlow, testDataApi } from '@/lib/api/apiTest';

export default function ApiTestPage() {
  // 认证测试状态
  const [authTestRunning, setAuthTestRunning] = useState(false);
  const [authTestResult, setAuthTestResult] = useState<any>(null);
  const [authTestError, setAuthTestError] = useState<string | null>(null);
  
  // 数据API测试状态
  const [dataTestRunning, setDataTestRunning] = useState(false);
  const [dataTestResult, setDataTestResult] = useState<any>(null);
  const [dataTestError, setDataTestError] = useState<string | null>(null);
  
  // 测试凭据
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('password123');
  
  // 运行认证测试
  const runAuthTest = async () => {
    setAuthTestRunning(true);
    setAuthTestResult(null);
    setAuthTestError(null);
    
    try {
      const result = await testAuthFlow(testEmail, testPassword);
      setAuthTestResult(result);
    } catch (error) {
      setAuthTestError(`测试过程中出错: ${(error as any)?.message || '未知错误'}`);
    } finally {
      setAuthTestRunning(false);
    }
  };
  
  // 运行数据API测试
  const runDataTest = async () => {
    setDataTestRunning(true);
    setDataTestResult(null);
    setDataTestError(null);
    
    try {
      const result = await testDataApi();
      setDataTestResult(result);
    } catch (error) {
      setDataTestError(`测试过程中出错: ${(error as any)?.message || '未知错误'}`);
    } finally {
      setDataTestRunning(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">API 测试页面</h1>
      <p className="mb-8 text-gray-600 dark:text-gray-400">
        此页面用于测试前后端通信是否正常工作。您可以在此测试API连接、认证流程和数据获取。
      </p>
      
      <div className="space-y-8">
        {/* API 连接状态 */}
        <section>
          <h2 className="text-xl font-semibold mb-3">API 连接状态</h2>
          <ApiConnectionStatus />
        </section>
        
        {/* 认证测试 */}
        <section className="border rounded-md p-6">
          <h2 className="text-xl font-semibold mb-4">认证流程测试</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                测试邮箱
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="输入测试邮箱"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                测试密码
              </label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="输入测试密码"
              />
            </div>
          </div>
          
          <button
            onClick={runAuthTest}
            disabled={authTestRunning}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          >
            {authTestRunning ? '测试中...' : '运行认证测试'}
          </button>
          
          {authTestError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
              {authTestError}
            </div>
          )}
          
          {authTestResult && (
            <div className="mt-4">
              <div className={`p-3 mb-3 rounded-md ${authTestResult.success ? 'bg-green-100 border border-green-300 text-green-700' : 'bg-yellow-100 border border-yellow-300 text-yellow-700'}`}>
                <strong>测试结果:</strong> {authTestResult.message}
              </div>
              
              <h3 className="font-medium mb-2">测试步骤结果:</h3>
              <div className="border rounded-md overflow-hidden">
                {authTestResult.steps.map((step: any, index: number) => (
                  <div 
                    key={index} 
                    className={`p-3 border-b last:border-b-0 flex items-center ${step.success ? 'bg-green-50' : 'bg-red-50'}`}
                  >
                    {step.success ? (
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <div>
                      <div className="font-medium">{step.name}</div>
                      <div className="text-sm">{step.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
        
        {/* 数据API测试 */}
        <section className="border rounded-md p-6">
          <h2 className="text-xl font-semibold mb-4">数据 API 测试</h2>
          
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            此测试将尝试从服务器获取博客文章列表数据，验证数据API是否正常工作。
          </p>
          
          <button
            onClick={runDataTest}
            disabled={dataTestRunning}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
          >
            {dataTestRunning ? '测试中...' : '运行数据API测试'}
          </button>
          
          {dataTestError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
              {dataTestError}
            </div>
          )}
          
          {dataTestResult && (
            <div className="mt-4">
              <div className={`p-3 mb-3 rounded-md ${dataTestResult.success ? 'bg-green-100 border border-green-300 text-green-700' : 'bg-yellow-100 border border-yellow-300 text-yellow-700'}`}>
                <strong>测试结果:</strong> {dataTestResult.message}
              </div>
              
              {dataTestResult.data && (
                <div>
                  <h3 className="font-medium mb-2">返回的数据:</h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-auto max-h-60 text-sm">
                    {JSON.stringify(dataTestResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
} 