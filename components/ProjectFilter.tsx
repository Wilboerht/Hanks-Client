'use client';

import { useState } from 'react';
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';

// 项目类型定义
interface Project {
  id: string;
  name: string;
  description: string;
  tags: string[];
  github?: string;
  demo?: string;
  featured: boolean;
  thumbnail?: string;
  tech: string[];
}

interface ProjectFilterProps {
  projects: Project[];
}

export default function ProjectFilter({ projects }: ProjectFilterProps) {
  // 生成标签列表
  const allTags = ['全部', ...Array.from(new Set(projects.flatMap(project => project.tags)))];
  
  // 状态
  const [selectedTag, setSelectedTag] = useState('全部');
  
  // 过滤项目
  const filteredProjects = selectedTag === '全部' 
    ? projects 
    : projects.filter(project => project.tags.includes(selectedTag));
  
  return (
    <>
      {/* 标签筛选器 */}
      <div className="flex flex-wrap gap-2 mb-10">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTag === tag
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      
      {/* 项目网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div 
            key={project.id}
            className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="h-44 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              {/* 项目缩略图（如果有的话） */}
              <div className="text-4xl text-neutral-300 dark:text-neutral-700">
                {project.id.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold">{project.name}</h3>
                <div className="flex space-x-2">
                  {project.github && (
                    <Link 
                      href={project.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      aria-label={`查看 ${project.name} 的 GitHub 仓库`}
                    >
                      <FiGithub size={18} />
                    </Link>
                  )}
                  {project.demo && (
                    <Link 
                      href={project.demo} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                      aria-label={`访问 ${project.name} 的演示`}
                    >
                      <FiExternalLink size={18} />
                    </Link>
                  )}
                </div>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span 
                    key={tech} 
                    className="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
} 