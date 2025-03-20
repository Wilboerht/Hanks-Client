'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CameraIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import useForm from '@/hooks/useForm';
import { ValidationRules } from '@/hooks/useForm';
import useApi from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';
import Spinner, { ButtonSpinner } from '@/components/ui/Spinner';

interface ProfileFormValues {
  username: string;
  name: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  twitter: string;
  github: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 使用API Hook获取用户数据
  const { data: userData, isLoading, refetch } = useApi<{
    user: {
      id: string;
      username: string;
      name: string;
      email: string;
      bio: string;
      location: string;
      website: string;
      twitter: string;
      github: string;
      avatar: string;
    };
  }>({
    url: '/api/user/profile',
    showErrorToast: true,
  });

  // 使用表单Hook处理表单状态和验证
  const form = useForm<ProfileFormValues>({
    initialValues: {
      username: userData?.user?.username || '',
      name: userData?.user?.name || '',
      email: userData?.user?.email || '',
      bio: userData?.user?.bio || '',
      location: userData?.user?.location || '',
      website: userData?.user?.website || '',
      twitter: userData?.user?.twitter || '',
      github: userData?.user?.github || '',
    },
    validationRules: {
      username: [
        ValidationRules.required('用户名是必填的'),
        ValidationRules.minLength(3, '用户名至少需要3个字符'),
        ValidationRules.maxLength(30, '用户名最多30个字符'),
        ValidationRules.pattern(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')
      ],
      email: [
        ValidationRules.required('邮箱是必填的'),
        ValidationRules.email('请输入有效的邮箱地址')
      ],
      website: [
        ValidationRules.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, '请输入有效的网址')
      ],
      twitter: [
        ValidationRules.pattern(/^@?[a-zA-Z0-9_]{1,15}$/, '请输入有效的Twitter用户名')
      ],
      github: [
        ValidationRules.pattern(/^[a-zA-Z0-9-]+$/, '请输入有效的GitHub用户名')
      ]
    },
    onSubmit: async (values) => {
      try {
        await updateProfile(values);
      } catch (error) {
        console.error('更新个人资料失败:', error);
      }
    }
  });

  // 更新用户头像
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 选择新头像
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 文件类型验证
    if (!file.type.match('image.*')) {
      showToast({
        type: 'error',
        title: '无效的文件类型',
        message: '请选择图片文件（JPEG, PNG, GIF）'
      });
      return;
    }

    // 文件大小验证（最大3MB）
    if (file.size > 3 * 1024 * 1024) {
      showToast({
        type: 'error',
        title: '文件过大',
        message: '头像图片不能超过3MB'
      });
      return;
    }

    // 生成预览
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarPreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // 上传头像
    await uploadAvatar(file);
  };

  // 上传头像到服务器
  const uploadAvatar = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '上传头像失败');
      }

      showToast({
        type: 'success',
        title: '上传成功',
        message: '您的头像已更新'
      });

      // 刷新用户数据
      refetch();
    } catch (error) {
      console.error('头像上传错误:', error);
      showToast({
        type: 'error',
        title: '上传失败',
        message: error instanceof Error ? error.message : '上传头像时发生错误'
      });
      // 恢复之前的头像预览
      setAvatarPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  // 更新个人资料
  const updateProfile = async (values: ProfileFormValues) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '更新个人资料失败');
      }

      showToast({
        type: 'success',
        title: '更新成功',
        message: '您的个人资料已更新'
      });

      // 刷新用户数据
      refetch();
    } catch (error) {
      showToast({
        type: 'error',
        title: '更新失败',
        message: error instanceof Error ? error.message : '更新个人资料时发生错误'
      });
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" text="加载个人资料..." />
      </div>
    );
  }

  // 确保用户数据已加载
  if (!userData?.user && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-red-500 mb-4">无法加载个人资料</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          请确保您已登录并拥有查看此页面的权限。
        </p>
        <button
          onClick={() => router.push('/login')}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          返回登录
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        编辑个人资料
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {/* 头像部分 */}
        <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            个人头像
          </h2>
          <div className="flex items-center space-x-6">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                {(avatarPreview || userData?.user?.avatar) ? (
                  <Image
                    src={avatarPreview || userData?.user?.avatar || ''}
                    alt="用户头像"
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <UserCircleIcon className="h-24 w-24 text-gray-400" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Spinner color="light" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all">
                <CameraIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={handleAvatarClick}
                className="bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                更改头像
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                JPG、PNG或GIF，最大3MB
              </p>
            </div>
          </div>
        </div>

        {/* 表单部分 */}
        <form onSubmit={form.handleSubmit} className="p-6 space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                用户名
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={form.values.username}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                className={`mt-1 block w-full border ${
                  form.touched.username && form.errors.username
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
              />
              {form.touched.username && form.errors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.errors.username}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                显示名称
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.values.name}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                电子邮箱
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.values.email}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                className={`mt-1 block w-full border ${
                  form.touched.email && form.errors.email
                    ? 'border-red-300 dark:border-red-700'
                    : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
              />
              {form.touched.email && form.errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {form.errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                所在地
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={form.values.location}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          {/* 个人简介 */}
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              个人简介
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={form.values.bio}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="介绍一下自己..."
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              简短介绍自己，将显示在个人资料页面。
            </p>
          </div>

          {/* 社交链接 */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
              社交链接
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  个人网站
                </label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={form.values.website}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  className={`mt-1 block w-full border ${
                    form.touched.website && form.errors.website
                      ? 'border-red-300 dark:border-red-700'
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                  placeholder="https://example.com"
                />
                {form.touched.website && form.errors.website && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {form.errors.website}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="twitter"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Twitter
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    id="twitter"
                    name="twitter"
                    value={form.values.twitter}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    className={`flex-1 block w-full border ${
                      form.touched.twitter && form.errors.twitter
                        ? 'border-red-300 dark:border-red-700'
                        : 'border-gray-300 dark:border-gray-600'
                    } rounded-r-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                    placeholder="username"
                  />
                </div>
                {form.touched.twitter && form.errors.twitter && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {form.errors.twitter}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="github"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  GitHub
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 sm:text-sm">
                    github.com/
                  </span>
                  <input
                    type="text"
                    id="github"
                    name="github"
                    value={form.values.github}
                    onChange={form.handleChange}
                    onBlur={form.handleBlur}
                    className={`flex-1 block w-full border ${
                      form.touched.github && form.errors.github
                        ? 'border-red-300 dark:border-red-700'
                        : 'border-gray-300 dark:border-gray-600'
                    } rounded-r-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white sm:text-sm`}
                    placeholder="username"
                  />
                </div>
                {form.touched.github && form.errors.github && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {form.errors.github}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end pt-4">
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
                '保存个人资料'
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
} 