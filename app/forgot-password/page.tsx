'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

import useForm from '@/hooks/useForm';
import { ValidationRules } from '@/hooks/useForm';
import { useToast } from '@/components/ui/Toast';
import { ButtonSpinner } from '@/components/ui/Spinner';

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  const form = useForm({
    initialValues: {
      email: '',
    },
    validationRules: {
      email: [
        ValidationRules.required('邮箱地址是必填的'),
        ValidationRules.email('请输入有效的邮箱地址'),
      ],
    },
    onSubmit: async (values) => {
      try {
        await requestPasswordReset(values.email);
      } catch (error) {
        console.error('密码重置请求失败:', error);
      }
    },
  });

  const requestPasswordReset = async (email: string) => {
    try {
      // 模拟API请求
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 模拟成功发送重置邮件
      showToast({
        type: 'success',
        title: '重置链接已发送',
        message: '请检查您的邮箱',
      });

      // 设置邮件已发送状态
      setIsEmailSent(true);
    } catch (error) {
      showToast({
        type: 'error',
        title: '发送失败',
        message: error instanceof Error ? error.message : '无法发送重置链接，请稍后再试',
      });
      throw error;
    }
  };

  // 页面切换动画
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

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
            找回密码
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            输入您的邮箱地址，我们将向您发送密码重置链接
          </p>
        </div>

        {!isEmailSent ? (
          // 请求重置密码表单
          <form className="mt-8 space-y-6" onSubmit={form.handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                邮箱地址
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    form.touched.email && form.errors.email
                      ? 'border-red-300 dark:border-red-700 text-red-900 dark:text-red-300 placeholder-red-300 dark:placeholder-red-600'
                      : 'border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white'
                  } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 sm:text-sm`}
                  placeholder="您的注册邮箱"
                  value={form.values.email}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                />
              </div>
              {form.touched.email && form.errors.email && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {form.errors.email}
                </p>
              )}
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
                    发送中...
                  </>
                ) : (
                  '发送重置链接'
                )}
              </motion.button>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <ArrowLeftIcon className="mr-1 h-4 w-4" />
                返回登录
              </Link>
            </div>
          </form>
        ) : (
          // 邮件已发送确认
          <motion.div 
            className="mt-8 space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400 dark:text-blue-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    重置链接已发送
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-200">
                    <p>
                      我们已向 {form.values.email} 发送了一封包含密码重置链接的电子邮件。请查看您的收件箱（并检查垃圾邮件文件夹）。
                    </p>
                    <p className="mt-2">
                      链接将在24小时内有效。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <button
                type="button"
                onClick={() => setIsEmailSent(false)}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                使用不同的邮箱地址
              </button>

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