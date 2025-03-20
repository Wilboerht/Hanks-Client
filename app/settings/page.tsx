'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Form, FormGroup, Input, Checkbox } from '@/components/ui/Form';
import { useForm } from '@/lib/useForm';
import { validators } from '@/lib/validators';
import { ButtonSpinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  BellAlertIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon 
} from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react';

interface PasswordChangeFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SecuritySettingsFormValues {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  unusualActivityAlerts: boolean;
  autoLogout: number;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 密码匹配验证函数
  const passwordMatchValidator = (value: string): string | null => {
    return value === passwordFormValues.newPassword ? null : '两次输入的新密码不一致';
  };
  
  // 使用ref解决循环依赖
  let passwordFormValues: PasswordChangeFormValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  
  // 密码更改表单
  const passwordForm = useForm<PasswordChangeFormValues>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validations: {
      currentPassword: [
        validators.required('请输入当前密码')
      ],
      newPassword: [
        validators.required('请输入新密码'),
        validators.minLength(6, '密码至少需要6个字符')
      ],
      confirmPassword: [
        validators.required('请确认新密码'),
        passwordMatchValidator
      ]
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setError(null);
        setSuccess(null);
        
        const response = await fetch('/api/user/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '更改密码失败');
        }
        
        setSuccess('密码已成功更改');
        showToast({
          type: 'success',
          title: '密码已更改',
          message: '您的密码已成功更新',
        });
        resetForm();
      } catch (err: any) {
        const errorMessage = err.message || '更改密码失败，请稍后再试';
        setError(errorMessage);
        showToast({
          type: 'error',
          title: '密码更改失败',
          message: errorMessage,
        });
        console.error('Change password error:', err);
      }
    }
  });

  // 更新passwordFormValues的引用
  passwordFormValues = passwordForm.values;
  
  // 安全设置表单
  const securityForm = useForm<SecuritySettingsFormValues>({
    initialValues: {
      twoFactorEnabled: false,
      loginAlerts: false,
      unusualActivityAlerts: true,
      autoLogout: 30,
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // 保存安全设置
        await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API请求
        console.log('Security settings:', values);
        
        showToast({
          type: 'success',
          message: '安全设置已更新',
          duration: 3000,
        });
      } catch (error) {
        showToast({
          type: 'error',
          title: '保存失败',
          message: '无法保存安全设置，请稍后再试',
        });
        console.error('Save security settings error:', error);
      }
    }
  });

  // 获取表单错误信息
  const getPasswordFieldError = (field: keyof PasswordChangeFormValues): string | undefined => {
    if (!passwordForm.touched[field]) return undefined;
    return passwordForm.errors[field] || undefined;
  };

  // 处理安全设置提交
  const handleSecuritySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    securityForm.handleSubmit(e);
  };

  // 密码强度计算
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    
    let strength = 0;
    
    // 长度检查
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    
    // 字符多样性检查
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 5);
  };
  
  const passwordStrength = calculatePasswordStrength(passwordForm.values.newPassword);
  
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
  ];
  
  const strengthLabels = [
    '非常弱',
    '弱',
    '一般',
    '强',
    '非常强',
  ];

  // 切换显示密码
  const toggleCurrentPasswordVisibility = () => setShowCurrentPassword(!showCurrentPassword);
  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <ButtonSpinner size="md" />
          <p className="text-lg text-gray-600 dark:text-gray-300">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-neutral-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              账号设置
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              管理您的账号安全和偏好设置
            </p>
          </div>
          
          <div className="border-t border-gray-200 dark:border-neutral-700 px-4 py-5 sm:p-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">更改密码</h4>
            
            <Form onSubmit={passwordForm.handleSubmit} className="space-y-6">
              {error && (
                <motion.div 
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 text-sm text-red-600 dark:text-red-400"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}
              
              {success && (
                <motion.div 
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3 text-sm text-green-600 dark:text-green-400"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {success}
                </motion.div>
              )}
              
              <FormGroup
                label="当前密码"
                htmlFor="currentPassword"
                error={getPasswordFieldError('currentPassword')}
              >
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.values.currentPassword}
                  onChange={passwordForm.handleChange}
                  onBlur={passwordForm.handleBlur}
                  state={passwordForm.touched.currentPassword && passwordForm.errors.currentPassword ? "error" : undefined}
                  isDisabled={passwordForm.isSubmitting}
                />
              </FormGroup>
              
              <FormGroup
                label="新密码"
                htmlFor="newPassword"
                error={getPasswordFieldError('newPassword')}
              >
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.values.newPassword}
                  onChange={passwordForm.handleChange}
                  onBlur={passwordForm.handleBlur}
                  state={passwordForm.touched.newPassword && passwordForm.errors.newPassword ? "error" : undefined}
                  isDisabled={passwordForm.isSubmitting}
                />
                
                {/* 密码强度指示器 */}
                {passwordForm.values.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">密码强度:</span>
                      <span className="text-xs font-medium" style={{ color: strengthColors[passwordStrength-1] }}>
                        {passwordStrength > 0 ? strengthLabels[passwordStrength-1] : ''}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${passwordStrength > 0 ? strengthColors[passwordStrength-1] : ''}`}
                        initial={{ width: '0%' }}
                        animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
              </FormGroup>
              
              <FormGroup
                label="确认新密码"
                htmlFor="confirmPassword"
                error={getPasswordFieldError('confirmPassword')}
              >
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.values.confirmPassword}
                  onChange={passwordForm.handleChange}
                  onBlur={passwordForm.handleBlur}
                  state={passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword ? "error" : undefined}
                  isDisabled={passwordForm.isSubmitting}
                />
              </FormGroup>
              
              <div>
                <button
                  type="submit"
                  disabled={passwordForm.isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 dark:bg-primary-700 dark:hover:bg-primary-600"
                >
                  {passwordForm.isSubmitting ? (
                    <>
                      <ButtonSpinner />
                      更改中...
                    </>
                  ) : '更改密码'}
                </button>
              </div>
            </Form>
          </div>
          
          <div className="border-t border-gray-200 dark:border-neutral-700 px-4 py-5 sm:p-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">账号安全</h4>
            
            <Form onSubmit={handleSecuritySubmit} className="space-y-4">
              <div className="flex items-start">
                <Checkbox
                  id="twoFactorEnabled"
                  name="twoFactorEnabled"
                  checked={securityForm.values.twoFactorEnabled}
                  onChange={(e) => securityForm.setFieldValue('twoFactorEnabled', e.target.checked)}
                  label="启用两步验证"
                />
                <div className="ml-7 text-sm">
                  <p className="text-gray-500 dark:text-gray-400">
                    为您的账号添加额外的安全层级，登录时需要输入验证码。
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Checkbox
                  id="loginAlerts"
                  name="loginAlerts"
                  checked={securityForm.values.loginAlerts}
                  onChange={(e) => securityForm.setFieldValue('loginAlerts', e.target.checked)}
                  label="登录提醒"
                />
                <div className="ml-7 text-sm">
                  <p className="text-gray-500 dark:text-gray-400">
                    当有新设备登录您的账号时，发送电子邮件通知。
                  </p>
                </div>
              </div>
              
              <div className="mt-5">
                <button
                  type="submit"
                  disabled={securityForm.isSubmitting}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 dark:bg-primary-700 dark:hover:bg-primary-600"
                >
                  {securityForm.isSubmitting ? (
                    <>
                      <ButtonSpinner />
                      保存中...
                    </>
                  ) : '保存安全设置'}
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
} 