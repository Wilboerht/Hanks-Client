/**
 * 实验室页面
 * 展示项目和实验作品
 */

import Link from 'next/link';
import { FiStar, FiExternalLink } from 'react-icons/fi';
import ProjectFilter from '@/components/ProjectFilter';

export const metadata = {
  title: '实验室 | wilboerht',
  description: '查看wilboerht的项目和实验作品，从开源工具到实用应用',
};

// 项目数据
const projects = [
  {
    id: 'devutils',
    name: 'DevUtils',
    description: '开发者实用工具集合，包括JSON格式化、Base64编码、URL解析等常用功能',
    tags: ['工具', 'React', 'TypeScript'],
    github: 'https://github.com/wilboerht/devutils',
    demo: 'https://devutils.wilboerht.cn',
    featured: true,
    thumbnail: '/images/projects/devutils.png',
    tech: ['React', 'TypeScript', 'Tailwind CSS']
  },
  {
    id: 'minimalblog',
    name: 'MinimalBlog',
    description: '极简主义博客平台，专注于内容创作和阅读体验',
    tags: ['博客', 'Next.js', 'Tailwind CSS'],
    github: 'https://github.com/wilboerht/minimalblog',
    demo: 'https://blog.wilboerht.cn',
    featured: true,
    thumbnail: '/images/projects/minimalblog.png',
    tech: ['Next.js', 'MDX', 'Tailwind CSS']
  },
  {
    id: 'codesnippets',
    name: 'CodeSnippets',
    description: '代码片段管理工具，帮助开发者组织和分享常用代码',
    tags: ['生产力', 'Vue', 'Firebase'],
    github: 'https://github.com/wilboerht/codesnippets',
    demo: 'https://snippets.wilboerht.cn',
    featured: true,
    thumbnail: '/images/projects/codesnippets.png',
    tech: ['Vue', 'Firebase', 'Vite']
  },
  {
    id: 'musicplayer',
    name: 'MusicPlayer',
    description: '轻量级音乐播放器，支持本地音乐库和流媒体',
    tags: ['音乐', 'React', 'Electron'],
    github: 'https://github.com/wilboerht/musicplayer',
    demo: '',
    featured: false,
    thumbnail: '/images/projects/musicplayer.png',
    tech: ['React', 'Electron', 'Node.js']
  },
  {
    id: 'weatherapp',
    name: 'WeatherApp',
    description: '简洁的天气应用，展示实时天气和未来预报',
    tags: ['天气', 'React Native'],
    github: 'https://github.com/wilboerht/weatherapp',
    demo: '',
    featured: false,
    thumbnail: '/images/projects/weatherapp.png',
    tech: ['React Native', 'Weather API', 'Expo']
  },
  {
    id: 'markdown-editor',
    name: 'Markdown Editor',
    description: '所见即所得的markdown编辑器，支持实时预览和主题切换',
    tags: ['编辑器', 'Vue'],
    github: 'https://github.com/wilboerht/markdown-editor',
    demo: 'https://markdown.wilboerht.cn',
    featured: false,
    thumbnail: '/images/projects/markdown.png',
    tech: ['Vue', 'Marked', 'CodeMirror']
  }
];

export default function LabPage() {
  return (
    <div className="py-16 bg-gray-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            实验室
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            探索我正在进行的项目和实验作品
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div 
              key={project.id}
              className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {project.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {project.description}
                </p>
                
                {project.tech && project.tech.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center space-x-4 mt-4">
                  {project.github && (
                    <a 
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      aria-label={`${project.name} GitHub 仓库`}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                  )}
                  
                  {project.demo && (
                    <a 
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      aria-label={`${project.name} 演示链接`}
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 