'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import Spinner, { ButtonSpinner } from '@/components/ui/Spinner';
import useForm from '@/hooks/useForm';
import { motion } from 'framer-motion';

interface NotificationSettings {
  emailNotifications: boolean;
  emailNewsletter: boolean;
  emailProductUpdates: boolean;
  emailSecurityAlerts: boolean;
  
  pushNewComments: boolean;
  pushMentions: boolean;
  pushDirectMessages: boolean;
  pushPostLikes: boolean;
  pushFollowers: boolean;
  
  smsSecurityAlerts: boolean;
  smsLoginAlerts: boolean;
}

export default function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  
  // 表单处理
  const form = useForm<NotificationSettings>({
    initialValues: {
      emailNotifications: true,
      emailNewsletter: false,
      emailProductUpdates: true,
      emailSecurityAlerts: true,
      
      pushNewComments: true,
      pushMentions: true,
      pushDirectMessages: true,
      pushPostLikes: false,
      pushFollowers: false,
      
      smsSecurityAlerts: false,
      smsLoginAlerts: false,
    },
    onSubmit: async (values) => {
      try {
        await saveNotificationSettings(values);
      } catch (error) {
        console.error('保存通知设置失败:', error);
      }
    }
  });

  // 模拟保存设置
  const saveNotificationSettings = async (settings: NotificationSettings) => {
    setIsLoading(true);
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast({
        type: 'success',
        title: '设置已保存',
        message: '您的通知偏好已更新'
      });
      
    } catch (error) {
      showToast({
        type: 'error',
        title: '保存失败',
        message: '无法更新通知设置，请稍后再试'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" text="加载通知设置..." />
      </div>
    );
  }

  // 切换开关状态
  const toggleSwitch = (field: keyof NotificationSettings) => {
    form.setFieldValue(field, !form.values[field]);
  };

  // 切换所有邮件通知
  const toggleAllEmailNotifications = (enabled: boolean) => {
    form.setMultipleValues({
      emailNotifications: enabled,
      emailNewsletter: enabled ? form.values.emailNewsletter : false,
      emailProductUpdates: enabled ? form.values.emailProductUpdates : false,
      emailSecurityAlerts: enabled ? form.values.emailSecurityAlerts : false,
    });
  };

  // 渲染开关控件
  const Switch = ({ 
    field, 
    label, 
    description, 
    disabled = false 
  }: { 
    field: keyof NotificationSettings; 
    label: string; 
    description?: string;
    disabled?: boolean;
  }) => {
    const isActive = form.values[field];
    
    return (
      <div className="flex items-start py-4">
        <div className="flex items-center h-5">
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            disabled={disabled}
            onClick={() => toggleSwitch(field)}
            className={`${
              isActive 
                ? 'bg-blue-600 dark:bg-blue-500' 
                : 'bg-gray-200 dark:bg-gray-700'
            } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span className="sr-only">{label}</span>
            <span
              aria-hidden="true"
              className={`${
                isActive ? 'translate-x-5' : 'translate-x-0'
              } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
            />
          </button>
        </div>
        <div className="ml-3 text-sm">
          <label className="font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          {description && (
            <p className="text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          通知设置
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          设置您希望如何接收通知和提醒
        </p>
      </div>

      <form onSubmit={form.handleSubmit} className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* 邮件通知 */}
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900 dark:text-white">电子邮件通知</h3>
            
            <Switch 
              field="emailNotifications" 
              label="启用电子邮件通知" 
              description="控制是否接收任何电子邮件通知"
            />
            
            <div className="pl-6 space-y-3 border-l-2 border-gray-100 dark:border-gray-700 ml-2">
              <Switch 
                field="emailNewsletter" 
                label="电子邮件通讯" 
                description="接收定期通讯和促销信息"
                disabled={!form.values.emailNotifications}
              />
              
              <Switch 
                field="emailProductUpdates" 
                label="产品更新" 
                description="有新功能或更新时接收通知"
                disabled={!form.values.emailNotifications}
              />
              
              <Switch 
                field="emailSecurityAlerts" 
                label="安全提醒" 
                description="接收账号安全相关的重要通知"
                disabled={!form.values.emailNotifications}
              />
            </div>
          </div>
        </div>

        {/* 推送通知 */}
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900 dark:text-white">推送通知</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              这些通知将显示在您的设备上
            </p>
            
            <Switch 
              field="pushNewComments" 
              label="新评论" 
              description="当有人评论您的文章时"
            />
            
            <Switch 
              field="pushMentions" 
              label="提及" 
              description="当有人在评论或文章中提及您时"
            />
            
            <Switch 
              field="pushDirectMessages" 
              label="私信" 
              description="当您收到新私信时"
            />
            
            <Switch 
              field="pushPostLikes" 
              label="获赞" 
              description="当有人点赞您的文章时"
            />
            
            <Switch 
              field="pushFollowers" 
              label="新关注者" 
              description="当有人关注您时"
            />
          </div>
        </div>

        {/* 短信通知 */}
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900 dark:text-white">短信通知</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              这些通知将通过短信发送到您的手机
            </p>
            
            <Switch 
              field="smsSecurityAlerts" 
              label="安全提醒" 
              description="接收账号安全相关的重要通知"
            />
            
            <Switch 
              field="smsLoginAlerts" 
              label="登录提醒" 
              description="当有新设备登录您的账号时"
            />
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="px-4 py-5 sm:p-6 flex justify-end">
          <motion.button
            type="submit"
            disabled={form.isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {form.isSubmitting ? (
              <>
                <ButtonSpinner className="mr-2" />
                保存中...
              </>
            ) : (
              '保存设置'
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
} 