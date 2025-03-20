'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Tab } from '@headlessui/react';
import { 
  MapPinIcon, 
  LinkIcon, 
  CalendarIcon, 
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  HeartIcon,
  ClockIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import useApi from '@/hooks/useApi';
import Spinner from '@/components/ui/Spinner';
import { formatDate } from '@/lib/utils';

// 用户资料接口
interface User {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatar: string;
  coverImage: string;
  location: string;
  website: string;
  twitter: string;
  github: string;
  joinedAt: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
    likes: number;
  };
}

// 文章接口
interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  publishedAt: string;
  readingTime: string;
  commentsCount: number;
  likesCount: number;
}

// 活动类型
interface Activity {
  id: string;
  type: 'post' | 'comment' | 'like';
  content: string;
  target: {
    title: string;
    slug: string;
  };
  createdAt: string;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const [activeTab, setActiveTab] = useState(0);
  
  // 获取用户资料
  const { data: userData, isLoading: isLoadingUser, error: userError } = useApi<{ user: User }>({
    url: `/api/users/${username}`,
    showErrorToast: true,
    skipInitialLoad: !username,
  });

  // 获取用户文章
  const { data: postsData, isLoading: isLoadingPosts } = useApi<{ posts: Post[] }>({
    url: `/api/users/${username}/posts`,
    showErrorToast: false,
    skipInitialLoad: !username,
  });

  // 获取用户活动
  const { data: activitiesData, isLoading: isLoadingActivities } = useApi<{ activities: Activity[] }>({
    url: `/api/users/${username}/activities`,
    showErrorToast: false,
    skipInitialLoad: !username,
  });

  // 模拟数据
  const userMock: User = {
    id: '1',
    username: username || 'johndoe',
    name: '约翰·多伊',
    bio: '前端开发工程师 | UI/UX设计爱好者 | 开源贡献者',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    coverImage: 'https://images.unsplash.com/photo-1444628838545-ac4016a5418a?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    location: '北京，中国',
    website: 'https://example.com',
    twitter: 'johndoe',
    github: 'johndoe',
    joinedAt: '2020-01-01T00:00:00Z',
    stats: {
      posts: 42,
      followers: 256,
      following: 128,
      likes: 1024
    }
  };

  const postsMock: Post[] = Array(5).fill(null).map((_, i) => ({
    id: `post-${i}`,
    title: `这是一篇关于${i % 2 === 0 ? 'React' : 'Next.js'}的精彩文章`,
    slug: `post-${i}-slug`,
    excerpt: '这篇文章讨论了现代前端技术的最新发展，涵盖了性能优化、状态管理和服务端渲染等热门话题...',
    publishedAt: new Date(Date.now() - i * 86400000 * 2).toISOString(),
    readingTime: `${5 + i}分钟`,
    commentsCount: 5 + i * 2,
    likesCount: 10 + i * 5,
    coverImage: i % 3 === 0 ? `https://picsum.photos/seed/${i}/1200/630` : undefined
  }));

  const activitiesMock: Activity[] = Array(10).fill(null).map((_, i) => {
    const types = ['post', 'comment', 'like'] as const;
    const type = types[i % 3];
    
    let content = '';
    switch(type) {
      case 'post':
        content = `发表了新文章`;
        break;
      case 'comment':
        content = `评论了文章`;
        break;
      case 'like':
        content = `点赞了文章`;
        break;
    }
    
    return {
      id: `activity-${i}`,
      type,
      content,
      target: {
        title: `文章标题 ${i}`,
        slug: `post-${i}-slug`
      },
      createdAt: new Date(Date.now() - i * 7200000).toISOString()
    };
  });

  const user = userData?.user || userMock;
  const posts = postsData?.posts || postsMock;
  const activities = activitiesData?.activities || activitiesMock;

  const isLoading = isLoadingUser;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner text="加载用户资料..." />
      </div>
    );
  }

  if (userError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <h1 className="text-2xl font-bold text-red-500 mb-4">用户不存在</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          抱歉，我们找不到用户名为 "{username}" 的用户
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 封面图片 */}
      <div className="relative h-48 md:h-64 w-full">
        <Image
          src={user.coverImage}
          alt={`${user.name} 封面图片`}
          className="object-cover"
          fill
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-12 sm:-mt-16 mb-6 flex flex-col sm:flex-row sm:items-end sm:space-x-5">
          {/* 头像 */}
          <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-full ring-4 ring-white dark:ring-gray-800 overflow-hidden bg-white">
            <Image
              src={user.avatar}
              alt={`${user.name} 头像`}
              className="object-cover"
              fill
            />
          </div>
          
          {/* 用户名和简介 */}
          <div className="mt-4 sm:mt-0 flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
              {user.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              @{user.username}
            </p>
            <p className="mt-1 text-gray-700 dark:text-gray-300">
              {user.bio}
            </p>
          </div>
          
          {/* 关注按钮 */}
          <div className="mt-4 sm:mt-0 flex-shrink-0">
            <motion.button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              关注
            </motion.button>
          </div>
        </div>

        {/* 用户信息 */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap text-sm text-gray-600 dark:text-gray-400">
              {user.location && (
                <div className="mr-6 mb-2 flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>{user.location}</span>
                </div>
              )}
              
              {user.website && (
                <div className="mr-6 mb-2 flex items-center">
                  <LinkIcon className="h-4 w-4 mr-1" />
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {user.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              
              <div className="mr-6 mb-2 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span>加入于 {formatDate(user.joinedAt)}</span>
              </div>
            </div>

            {/* 社交链接 */}
            <div className="mt-3 flex space-x-3">
              {user.twitter && (
                <a href={`https://twitter.com/${user.twitter}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                  <span className="sr-only">Twitter</span>
                </a>
              )}
              
              {user.github && (
                <a href={`https://github.com/${user.github}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <span className="sr-only">GitHub</span>
                </a>
              )}
            </div>
          </div>
          
          {/* 统计数据 */}
          <div className="mt-4 sm:mt-0 flex justify-between sm:justify-end space-x-8 sm:space-x-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.posts}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">文章</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.followers}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">关注者</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.stats.following}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">正在关注</div>
            </div>
          </div>
        </div>

        {/* 内容标签页 */}
        <Tab.Group onChange={setActiveTab}>
          <Tab.List className="flex border-b border-gray-200 dark:border-gray-700">
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-4 text-center border-b-2 font-medium text-sm',
                  selected
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                )
              }
            >
              文章
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'py-4 px-4 text-center border-b-2 font-medium text-sm',
                  selected
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                )
              }
            >
              动态
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-4">
            {/* 文章标签面板 */}
            <Tab.Panel>
              {isLoadingPosts ? (
                <div className="py-12 flex justify-center">
                  <Spinner text="加载文章..." />
                </div>
              ) : posts.length > 0 ? (
                <ul className="space-y-8">
                  {posts.map((post) => (
                    <li key={post.id}>
                      <Link href={`/blog/${post.slug}`}>
                        <article className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow duration-300">
                          {post.coverImage && (
                            <div className="relative h-48 w-full">
                              <Image
                                src={post.coverImage}
                                alt={post.title}
                                className="object-cover"
                                fill
                              />
                            </div>
                          )}
                          <div className="p-5">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center mr-4">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {formatDate(post.publishedAt)}
                              </span>
                              <span className="flex items-center mr-4">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {post.readingTime}
                              </span>
                              <span className="flex items-center mr-4">
                                <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                                {post.commentsCount}
                              </span>
                              <span className="flex items-center">
                                <HeartIcon className="h-4 w-4 mr-1" />
                                {post.likesCount}
                              </span>
                            </div>
                          </div>
                        </article>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-12 text-center">
                  <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">暂无文章</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    该用户尚未发布任何文章。
                  </p>
                </div>
              )}
            </Tab.Panel>

            {/* 动态标签面板 */}
            <Tab.Panel>
              {isLoadingActivities ? (
                <div className="py-12 flex justify-center">
                  <Spinner text="加载动态..." />
                </div>
              ) : activities.length > 0 ? (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 ml-6"></div>
                  </div>
                  <ul className="relative space-y-6">
                    {activities.map((activity) => (
                      <li key={activity.id} className="relative">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ring-8 ring-white dark:ring-gray-900">
                              {activity.type === 'post' && (
                                <PencilSquareIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                              )}
                              {activity.type === 'comment' && (
                                <ChatBubbleLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                              )}
                              {activity.type === 'like' && (
                                <HeartIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                              )}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 py-0.5">
                            <div className="text-md text-gray-900 dark:text-white">
                              <span>{activity.content} </span>
                              <Link href={`/blog/${activity.target.slug}`} className="font-medium text-blue-500 hover:underline">
                                {activity.target.title}
                              </Link>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              <time dateTime={activity.createdAt}>{formatDate(activity.createdAt)}</time>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">暂无动态</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    该用户近期没有活动记录。
                  </p>
                </div>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
} 