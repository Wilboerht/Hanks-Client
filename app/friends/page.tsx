'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

// 定义友人类型
interface Friend {
  id: string;
  name: string;
  avatar: string;
  quote: string;
  url: string;
  category: string;
}

// 友人数据
const friendsData: Friend[] = [
  {
    id: '1',
    name: 'LuckyCC',
    avatar: '/images/friends/avatar1.png',
    quote: '「参与世界的变化 🌏」',
    url: 'https://example.com/luckycc',
    category: 'Net Friends'
  },
  {
    id: '2',
    name: 'KItyoo',
    avatar: '/images/friends/avatar2.png',
    quote: '「GenAI is pure magic!」',
    url: 'https://example.com/kityoo',
    category: 'Net Friends'
  },
  {
    id: '3',
    name: 'Kai',
    avatar: '/images/friends/avatar3.png',
    quote: '',
    url: 'https://example.com/kai',
    category: 'AdventureX'
  },
  {
    id: '4',
    name: '悦悸',
    avatar: '/images/friends/avatar4.png',
    quote: '「道阻且长，行则将至。」',
    url: 'https://example.com/yueji',
    category: 'Old Friends'
  },
  {
    id: '5',
    name: '折影彩梦',
    avatar: '/images/friends/avatar5.png',
    quote: '「纯粹、热爱、勇敢。」',
    url: 'https://example.com/zheyingcaimeng',
    category: 'Blogger'
  },
  {
    id: '6',
    name: '于长野',
    avatar: '/images/friends/avatar6.png',
    quote: '「做一个自由自在的废物。」',
    url: 'https://example.com/yuchangye',
    category: 'HNUers'
  },
  {
    id: '7',
    name: '桑桑',
    avatar: '/images/friends/avatar7.png',
    quote: '「Libra in your Area」',
    url: 'https://example.com/sangsang',
    category: 'Old Friends'
  },
  {
    id: '8',
    name: 'Lemorica',
    avatar: '/images/friends/avatar8.png',
    quote: '「一定要爱着点什么，恰似草木对光阴的钟情。」',
    url: 'https://example.com/lemorica',
    category: 'Blogger'
  },
  {
    id: '9',
    name: 'CaptainSlow',
    avatar: '/images/friends/avatar9.png',
    quote: '「做智慧而勤劳的人。」',
    url: 'https://example.com/captainslow',
    category: 'AdventureX'
  }
];

// 类别数据
const categories = [
  '全部',
  'Net Friends',
  'AdventureX',
  'Old Friends',
  'HNUers',
  'Blogger'
];

export default function FriendsPage() {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  
  // 根据选择的类别筛选友人
  const filteredFriends = selectedCategory === '全部' 
    ? friendsData 
    : friendsData.filter(friend => friend.category === selectedCategory);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 页面标题 */}
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-medium mb-3"
        >
          友人
        </motion.h1>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl font-bold mb-2"
        >
          友谊地久天长。
        </motion.h2>
      </div>

      {/* 类别筛选 */}
      <div className="flex justify-center mb-12">
        <motion.div 
          className="inline-flex bg-white dark:bg-neutral-800 rounded-full p-1.5 border border-neutral-200 dark:border-neutral-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-neutral-900 text-white dark:bg-neutral-200 dark:text-neutral-900'
                  : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>
      </div>

      {/* 友人列表 */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {filteredFriends.map((friend, index) => (
          <motion.div
            key={friend.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            className="bg-white dark:bg-neutral-800 rounded-lg p-5 border border-neutral-200 dark:border-neutral-700"
          >
            <Link href={friend.url} className="flex items-start space-x-4" target="_blank" rel="noopener noreferrer">
              <div className="flex-shrink-0">
                <div className="relative w-14 h-14 rounded-full overflow-hidden">
                  <Image
                    src={friend.avatar}
                    alt={friend.name}
                    width={56}
                    height={56}
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="text-lg font-medium truncate">{friend.name}</h3>
                {friend.quote && (
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                    {friend.quote}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
} 