'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import useForm from '@/hooks/useForm';
import { ValidationRules } from '@/hooks/useForm';
import { useToast } from '@/components/ui/Toast';
import { ButtonSpinner } from '@/components/ui/Spinner';
import { Loader } from '@/components/ui/Loader';
import { useAuthContext } from '@/lib/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { register, error: authError, isLoading } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const form = useForm({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    validationRules: {
      username: [
        ValidationRules.required('用户名是必填的'),
        ValidationRules.minLength(3, '用户名至少需要3个字符'),
        ValidationRules.maxLength(30, '用户名最多30个字符'),
        ValidationRules.pattern(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')
      ],
      email: [
        ValidationRules.required('邮箱地址是必填的'),
        ValidationRules.email('请输入有效的邮箱地址'),
      ],
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
      acceptTerms: [
        (value) => (value ? null : '您必须接受服务条款才能注册'),
      ],
    },
    onSubmit: async (values) => {
      try {
        setFormError(null);
        await registerUser(values);
      } catch (error) {
        console.error('注册失败:', error);
      }
    },
  });

  const registerUser = async (values: Record<string, any>) => {
    try {
      // 使用真实API注册
      await register({
        username: values.username,
        email: values.email,
        password: values.password,
      });

      // 注册成功提示
      showToast({
        type: 'success',
        title: '注册成功',
        message: '您的账号已创建，请登录',
      });

      // 注册成功后跳转到登录页
      router.push('/login');
    } catch (error: any) {
      let errorMessage = '无法完成注册，请稍后再试';
      
      // 尝试从API响应中获取更具体的错误信息
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // 设置表单错误以便在UI中显示
      setFormError(errorMessage);
      
      showToast({
        type: 'error',
        title: '注册失败',
        message: errorMessage,
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

  // 显示来自AuthContext的错误
  useEffect(() => {
    if (authError) {
      setFormError(authError);
    }
  }, [authError]);

  // 如果正在加载，显示加载状态
  if (isLoading && !form.isSubmitting) {
    return <Loader fullPage text="正在加载..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 py-12">
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
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            注册账号
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            已有账号？{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              登录
            </Link>
          </p>
        </div>

        {/* 显示表单错误信息 */}
        {formError && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-400">{formError}</p>
              </div>
            </div>
          </div>
        )}

        {/* 注册表单 */}
        <form className="mt-8 space-y-6" onSubmit={form.handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* 用户名输入 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  form.touched.username && form.errors.username
                    ? 'border-red-300 dark:border-red-700 text-red-900 dark:text-red-300 placeholder-red-300 dark:placeholder-red-600'
                    : 'border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white'
                } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 focus:z-10 sm:text-sm`}
                placeholder="选择用户名"
                value={form.values.username}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
              />
              {form.touched.username && form.errors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.errors.username}
                </p>
              )}
            </div>

            {/* 邮箱输入 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  form.touched.email && form.errors.email
                    ? 'border-red-300 dark:border-red-700 text-red-900 dark:text-red-300 placeholder-red-300 dark:placeholder-red-600'
                    : 'border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white'
                } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 focus:z-10 sm:text-sm`}
                placeholder="您的邮箱"
                value={form.values.email}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
              />
              {form.touched.email && form.errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.errors.email}
                </p>
              )}
            </div>

            {/* 密码输入 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                密码
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    form.touched.password && form.errors.password
                      ? 'border-red-300 dark:border-red-700 text-red-900 dark:text-red-300 placeholder-red-300 dark:placeholder-red-600'
                      : 'border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white'
                  } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 focus:z-10 sm:text-sm`}
                  placeholder="创建密码"
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
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.errors.password}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                密码必须至少8个字符，包含大小写字母、数字和特殊字符
              </p>
            </div>

            {/* 确认密码输入 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                确认密码
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    form.touched.confirmPassword && form.errors.confirmPassword
                      ? 'border-red-300 dark:border-red-700 text-red-900 dark:text-red-300 placeholder-red-300 dark:placeholder-red-600'
                      : 'border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white'
                  } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 focus:z-10 sm:text-sm`}
                  placeholder="再次输入密码"
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
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* 服务条款 */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={form.values.acceptTerms}
                onChange={form.handleChange}
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 ${
                  form.touched.acceptTerms && form.errors.acceptTerms
                    ? 'border-red-300 dark:border-red-700'
                    : ''
                }`}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="acceptTerms" className={`font-medium text-gray-700 dark:text-gray-300 ${
                form.touched.acceptTerms && form.errors.acceptTerms
                  ? 'text-red-700 dark:text-red-400'
                  : ''
              }`}>
                我同意
              </label>{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                服务条款
              </a>{' '}
              和{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                隐私政策
              </a>
              {form.touched.acceptTerms && form.errors.acceptTerms && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.errors.acceptTerms}
                </p>
              )}
            </div>
          </div>

          {/* 注册按钮 */}
          <div>
            <motion.button
              type="submit"
              disabled={form.isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {form.isSubmitting ? (
                <>
                  <ButtonSpinner className="mr-2" />
                  注册中...
                </>
              ) : (
                '创建账号'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 