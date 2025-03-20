'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline';

import useForm from '@/hooks/useForm';
import { ValidationRules } from '@/hooks/useForm';
import { useToast } from '@/components/ui/Toast';
import { ButtonSpinner } from '@/components/ui/Spinner';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isResetComplete, setIsResetComplete] = useState(false);
  
  // 获取URL中的重置令牌
  useEffect(() => {
    const token = searchParams?.get('token');
    setResetToken(token);
    
    // 验证令牌有效性
    if (token) {
      validateToken(token);
    }
  }, [searchParams]);

  // 模拟验证令牌
  const validateToken = async (token: string) => {
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟验证结果（在实际应用中，这应该是一个API调用）
      const isValid = token.length > 10; // 简单的模拟条件
      setIsTokenValid(isValid);
      
      if (!isValid) {
        showToast({
          type: 'error',
          title: '无效链接',
          message: '密码重置链接无效或已过期'
        });
      }
    } catch (error) {
      setIsTokenValid(false);
      showToast({
        type: 'error',
        title: '验证失败',
        message: '无法验证重置链接'
      });
    }
  };
  
  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationRules: {
      password: [
        ValidationRules.required('密码是必填的'),
        ValidationRules.minLength(8, '密码至少需要8个字符'),
        ValidationRules.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          '密码必须包含大小写字母、数字和特殊字符'
        ),
      ],
      confirmPassword: [
        ValidationRules.required('请确认密码'),
        (value, formValues) => 
          value === formValues.password ? null : '两次输入的密码不一致',
      ],
    },
    onSubmit: async (values) => {
      try {
        await resetPassword(values.password);
      } catch (error) {
        console.error('密码重置失败:', error);
      }
    },
  });

  const resetPassword = async (newPassword: string) => {
    if (!resetToken) return;
    
    try {
      // 模拟API请求
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 模拟成功重置密码
      showToast({
        type: 'success',
        title: '密码已重置',
        message: '您的密码已成功更新'
      });

      // 设置重置完成状态
      setIsResetComplete(true);
    } catch (error) {
      showToast({
        type: 'error',
        title: '重置失败',
        message: error instanceof Error ? error.message : '无法重置密码，请稍后再试'
      });
      throw error;
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // 页面切换动画
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // 显示加载状态
  if (isTokenValid === null && resetToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <ButtonSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">正在验证重置链接...</p>
        </div>
      </div>
    );
  }

  // 显示无效令牌
  if (isTokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16 mb-2">
              <Image
                src="/images/logo.svg"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              链接无效
            </h2>
            <div className="mt-4 text-center">
              <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      密码重置链接无效或已过期
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>
                        请重新请求一个新的密码重置链接。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Link
                href="/forgot-password"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                重新获取重置链接
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // 显示缺少令牌
  if (!resetToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16 mb-2">
              <Image
                src="/images/logo.svg"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              缺少重置令牌
            </h2>
            <div className="mt-4 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                此链接缺少必要的重置令牌。请确保您点击的是完整的链接，或重新请求一个新的密码重置链接。
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/forgot-password"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                获取重置链接
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16 mb-2">
            <Image
              src="/images/logo.svg"
              alt="Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            重置密码
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            请输入您的新密码
          </p>
        </div>

        {!isResetComplete ? (
          // 重置密码表单
          <form className="mt-8 space-y-6" onSubmit={form.handleSubmit}>
            <div className="space-y-4">
              {/* 新密码输入 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  新密码
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      form.touched.password && form.errors.password
                        ? 'border-red-300 dark:border-red-700 text-red-900 dark:text-red-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                    } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 sm:text-sm`}
                    placeholder="输入新密码"
                    value={form.values.password}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {form.touched.password && form.errors.password && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {form.errors.password}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  密码必须至少8个字符，包含大小写字母、数字和特殊字符
                </p>
              </div>

              {/* 确认新密码输入 */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  确认新密码
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`block w-full pl-10 pr-10 py-2 border ${
                      form.touched.confirmPassword && form.errors.confirmPassword
                        ? 'border-red-300 dark:border-red-700 text-red-900 dark:text-red-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                    } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 sm:text-sm`}
                    placeholder="再次输入新密码"
                    value={form.values.confirmPassword}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {form.touched.confirmPassword && form.errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {form.errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div>
              <motion.button
                type="submit"
                disabled={form.isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {form.isSubmitting ? (
                  <>
                    <ButtonSpinner className="mr-2" />
                    重置中...
                  </>
                ) : (
                  '重置密码'
                )}
              </motion.button>
            </div>
          </form>
        ) : (
          // 重置成功
          <motion.div 
            className="mt-8 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    密码重置成功
                  </h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                    <p>
                      您的密码已成功更新。现在您可以使用新密码登录您的账号。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                返回登录
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 