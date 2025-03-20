/**
 * 关于页面
 */

import Link from 'next/link';
import { FiMail, FiGithub, FiTwitter } from 'react-icons/fi';

export const metadata = {
  title: '关于 | wilboerht',
  description: '了解更多关于wilboerht的信息，包括技能、经历和联系方式',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-20">
      <section className="mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="block">关于我</span>
        </h1>
        <div className="text-lg text-neutral-600 dark:text-neutral-400 space-y-6">
          <p>
            你好，我是 wilboerht，一名软件工程师、开源爱好者和偶尔涂鸦的业余画家。
            我热爱构建美观且实用的数字产品，特别是那些能够解决实际问题和改善用户体验的项目。
          </p>
          <p>
            我的技术栈主要包括 JavaScript/TypeScript、React、Next.js 和 Node.js，
            但我也对其他领域保持着浓厚的兴趣，如系统设计、UI/UX 设计和人工智能。
          </p>
          <p>
            在业余时间，我喜欢通过开源项目贡献社区，撰写技术博客分享我的经验和见解，
            以及探索新技术和创意想法。
          </p>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">我的技能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">开发技能</h3>
            <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
              <li>• 前端开发 (React, Vue, Next.js)</li>
              <li>• 后端开发 (Node.js, Express, NestJS)</li>
              <li>• 移动应用开发 (React Native)</li>
              <li>• 数据库设计与优化 (MongoDB, PostgreSQL)</li>
              <li>• DevOps & CI/CD (Docker, GitHub Actions)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">其他技能</h3>
            <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
              <li>• UI/UX 设计 (Figma)</li>
              <li>• 技术写作</li>
              <li>• 项目管理</li>
              <li>• 开源贡献与维护</li>
              <li>• 数字插画</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">工作经历</h2>
        <div className="space-y-8">
          <div className="border-l-4 border-neutral-200 dark:border-neutral-700 pl-6">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">2021 - 至今</div>
            <h3 className="text-xl font-bold mt-2">高级前端工程师</h3>
            <div className="text-lg font-medium text-neutral-600 dark:text-neutral-400">某科技公司</div>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              负责公司核心产品的前端架构设计与实现，优化用户体验和性能，带领前端团队实施最佳实践。
            </p>
          </div>
          <div className="border-l-4 border-neutral-200 dark:border-neutral-700 pl-6">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">2018 - 2021</div>
            <h3 className="text-xl font-bold mt-2">Web 开发工程师</h3>
            <div className="text-lg font-medium text-neutral-600 dark:text-neutral-400">某互联网公司</div>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              参与多个 Web 应用的开发，包括用户界面设计、前端实现和后端集成，提升了产品的用户满意度和市场竞争力。
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">联系我</h2>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
          如果您有任何问题、合作意向或者只是想打个招呼，欢迎通过以下方式联系我：
        </p>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
          <Link 
            href="mailto:hello@wilboerht.cn" 
            className="inline-flex items-center px-6 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-md font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <FiMail className="mr-2" />
            发送邮件
          </Link>
          <Link 
            href="https://github.com/wilboerht" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-md font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <FiGithub className="mr-2" />
            GitHub
          </Link>
          <Link 
            href="https://twitter.com/wilboerht" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-md font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            <FiTwitter className="mr-2" />
            Twitter
          </Link>
        </div>
      </section>
    </div>
  );
} 