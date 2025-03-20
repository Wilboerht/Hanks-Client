/**
 * 首页组件 - 极简个性化设计风格
 * 参考 skywt.cn 的设计风格
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/lib/context/AuthContext';
import { FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Button } from "@/components/ui/Button";
import Footer from "./_components/Footer";

export default function HomePage() {
  const { isAuthenticated, user } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // 模拟内容加载
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* 极简风格英雄区域 - 参考SkyWT.cn的简约风格 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-white dark:bg-gray-900"></div>
          <div className="absolute inset-0 opacity-5 dark:opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>
        
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-36 md:py-48 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight"
              variants={fadeIn}
            >
              <span className="text-blue-600 dark:text-blue-400">软件工程师</span><br/>
              热衷<span className="text-blue-600 dark:text-blue-400">开发</span><br/>
              和<span className="text-blue-600 dark:text-blue-400">设计</span>
            </motion.h1>
            
            {isAuthenticated && (
              <motion.div
                className="mt-8"
                variants={fadeIn}
              >
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  嗨，{user?.username || '用户'}！
                </p>
                <Link 
                  href="/profile" 
                  className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center justify-center"
                >
                  <FiUser className="mr-1" />
                  个人中心
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>
      
      {/* 核心能力区块 - 类似SkyWT的卡片风格 */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              关于我
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-transparent rounded-xl p-6 h-36 flex flex-col justify-center transition-all duration-300 hover:shadow-md border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-center text-lg font-medium text-gray-900 dark:text-white mb-2">
                技术爱好者
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                热爱探索新技术与工具，持续学习进步
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-transparent rounded-xl p-6 h-36 flex flex-col justify-center transition-all duration-300 hover:shadow-md border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-center text-lg font-medium text-gray-900 dark:text-white mb-2">
                开发创造者
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                将创意转化为代码，构建实用解决方案
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-transparent rounded-xl p-6 h-36 flex flex-col justify-center transition-all duration-300 hover:shadow-md border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-center text-lg font-medium text-gray-900 dark:text-white mb-2">
                设计思考者
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                注重用户体验与视觉设计，创造优雅产品
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* 添加顶部"浏览更多"标题 */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-5xl font-bold text-gray-900 dark:text-white">
              浏览更多
            </h2>
          </motion.div>
        </div>
      </section>
      
      {/* 项目展示 */}
      <section className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              探索
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              发现更多有趣的内容
            </p>
          </motion.div> */}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative group"
            >
              <Link href="/projects" className="block">
                <div className="bg-white dark:bg-transparent rounded-xl p-6 h-44 flex flex-col justify-center transition-all duration-300 hover:shadow-md border border-gray-200 dark:border-gray-700">
                  <h3 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-2">项目</h3>
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    设计。开发。构建，<br/>
                    只是为了好玩！
                  </p>
                </div>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative group"
            >
              <Link href="/lab" className="block">
                <div className="bg-white dark:bg-transparent rounded-xl p-6 h-44 flex flex-col justify-center transition-all duration-300 hover:shadow-md border border-gray-200 dark:border-gray-700">
                  <h3 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-2">实验室</h3>
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    生命不息，<br/>
                    折腾不止！
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* 添加更多卡片（博客和友人） */}
      <section className="py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative group"
            >
              <Link href="/about" className="block">
                <div className="bg-white dark:bg-transparent rounded-xl p-6 h-44 flex flex-col justify-center transition-all duration-300 hover:shadow-md border border-gray-200 dark:border-gray-700">
                  <h3 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-2">关于</h3>
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    记录所想所想，<br/>
                    渴望与你共鸣。
                  </p>
                </div>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative group"
            >
              <Link href="/friends" className="block">
                <div className="bg-white dark:bg-transparent rounded-xl p-6 h-44 flex flex-col justify-center transition-all duration-300 hover:shadow-md border border-gray-200 dark:border-gray-700">
                  <h3 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-2">友人</h3>
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    友谊地久天长。
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* 使用Footer组件 */}
      <Footer />
    </div>
  );
} 