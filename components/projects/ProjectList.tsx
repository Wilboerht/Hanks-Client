"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ProjectCard } from './ProjectCard';
import { cn } from '@/lib/utils';
import { AnimatedElement } from '@/components/ui/AnimatedElement';
import { FiFilter, FiSearch, FiStar, FiClock, FiArrowDown, FiArrowUp } from 'react-icons/fi';
import { Badge } from '@/components/ui/Badge';

export interface Project {
  id: string;
  title: string;
  description: string;
  slug?: string;
  technologies: string[];
  demoUrl?: string;
  githubUrl?: string;
  coverImage?: string;
  featured?: boolean;
  status?: 'completed' | 'in-progress' | 'planned';
  createdAt: string; // ISO 日期格式
  updatedAt?: string; // ISO 日期格式
}

export interface ProjectListProps {
  projects: Project[];
  showFilters?: boolean;
  showSearch?: boolean;
  className?: string;
}

type SortOption = 'featured' | 'newest' | 'oldest' | 'az' | 'za';

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  showFilters = true,
  showSearch = true,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [filterTech, setFilterTech] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 提取项目中所有的技术栈
  const allTechnologies = useMemo(() => {
    const techSet = new Set<string>();
    projects.forEach(project => {
      project.technologies.forEach(tech => techSet.add(tech));
    });
    return Array.from(techSet).sort();
  }, [projects]);

  // 过滤和排序项目
  const filteredProjects = useMemo(() => {
    // 过滤
    let result = projects;
    
    // 搜索筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        project => 
          project.title.toLowerCase().includes(query) || 
          project.description.toLowerCase().includes(query) ||
          project.technologies.some(tech => tech.toLowerCase().includes(query))
      );
    }
    
    // 技术栈筛选
    if (filterTech.length > 0) {
      result = result.filter(
        project => filterTech.some(tech => project.technologies.includes(tech))
      );
    }
    
    // 状态筛选
    if (filterStatus.length > 0) {
      result = result.filter(
        project => project.status && filterStatus.includes(project.status)
      );
    }
    
    // 排序
    return result.sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }, [projects, searchQuery, filterTech, filterStatus, sortBy]);

  // 切换技术栈筛选
  const toggleTechFilter = (tech: string) => {
    setFilterTech(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech) 
        : [...prev, tech]
    );
  };

  // 切换状态筛选
  const toggleStatusFilter = (status: string) => {
    setFilterStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  // 清除所有筛选
  const clearFilters = () => {
    setFilterTech([]);
    setFilterStatus([]);
    setSearchQuery('');
  };

  const getSortIcon = (option: SortOption) => {
    if (sortBy !== option) return null;
    
    switch (option) {
      case 'newest':
      case 'za':
        return <FiArrowDown className="ml-1 w-4 h-4" />;
      case 'oldest':
      case 'az':
        return <FiArrowUp className="ml-1 w-4 h-4" />;
      case 'featured':
        return <FiStar className="ml-1 w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'in-progress': return '进行中';
      case 'planned': return '计划中';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'in-progress': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'planned': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300';
      default: return '';
    }
  };

  return (
    <div className={className}>
      {/* 控制栏 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        {showSearch && (
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="搜索项目..."
              className="pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-md dark:bg-neutral-800 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          </div>
        )}

        <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
          {showFilters && (
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center px-3 py-1.5 text-sm border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700"
            >
              <FiFilter className="mr-1.5" />
              筛选
              {(filterTech.length > 0 || filterStatus.length > 0) && (
                <span className="ml-1.5 bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 text-xs px-1.5 rounded-full">
                  {filterTech.length + filterStatus.length}
                </span>
              )}
            </button>
          )}

          {/* 排序选择 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">排序:</span>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSortBy('featured')}
                className={cn(
                  "inline-flex items-center px-2 py-1 text-xs rounded",
                  sortBy === 'featured' 
                    ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
              >
                推荐 {getSortIcon('featured')}
              </button>
              <button
                onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
                className={cn(
                  "inline-flex items-center px-2 py-1 text-xs rounded",
                  (sortBy === 'newest' || sortBy === 'oldest')
                    ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
              >
                日期 {getSortIcon(sortBy === 'newest' ? 'newest' : 'oldest')}
              </button>
              <button
                onClick={() => setSortBy(sortBy === 'az' ? 'za' : 'az')}
                className={cn(
                  "inline-flex items-center px-2 py-1 text-xs rounded",
                  (sortBy === 'az' || sortBy === 'za')
                    ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
              >
                名称 {getSortIcon(sortBy === 'az' ? 'az' : 'za')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选面板 */}
      {isFilterOpen && (
        <div className="mb-6 p-4 border border-neutral-200 dark:border-neutral-700 rounded-md bg-neutral-50 dark:bg-neutral-800/50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">筛选条件</h3>
            {(filterTech.length > 0 || filterStatus.length > 0) && (
              <button
                onClick={clearFilters}
                className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                清除所有筛选
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {/* 技术栈筛选 */}
            <div>
              <h4 className="text-sm font-medium mb-2">技术栈</h4>
              <div className="flex flex-wrap gap-2">
                {allTechnologies.map(tech => (
                  <Badge
                    key={tech}
                    variant="subtle"
                    className={cn(
                      'cursor-pointer',
                      filterTech.includes(tech) 
                        ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 border border-primary-300 dark:border-primary-700'
                        : ''
                    )}
                    onClick={() => toggleTechFilter(tech)}
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* 状态筛选 */}
            <div>
              <h4 className="text-sm font-medium mb-2">状态</h4>
              <div className="flex flex-wrap gap-2">
                {['completed', 'in-progress', 'planned'].map(status => (
                  <Badge
                    key={status}
                    variant="subtle"
                    className={cn(
                      'cursor-pointer',
                      filterStatus.includes(status) 
                        ? 'border border-primary-300 dark:border-primary-700'
                        : '',
                      getStatusColor(status)
                    )}
                    onClick={() => toggleStatusFilter(status)}
                  >
                    {getStatusLabel(status)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 没有找到结果 */}
      {filteredProjects.length === 0 && (
        <div className="py-10 text-center">
          <p className="text-lg text-neutral-500 dark:text-neutral-400">
            {searchQuery || filterTech.length > 0 || filterStatus.length > 0 
              ? '没有找到符合条件的项目' 
              : '暂无项目'}
          </p>
          {(searchQuery || filterTech.length > 0 || filterStatus.length > 0) && (
            <button
              onClick={clearFilters}
              className="mt-2 text-primary-600 dark:text-primary-400 hover:underline"
            >
              清除筛选条件
            </button>
          )}
        </div>
      )}

      {/* 项目列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <AnimatedElement key={project.id} animation="hover-lift">
            <ProjectCard
              title={project.title}
              description={project.description}
              slug={project.slug}
              technologies={project.technologies}
              demoUrl={project.demoUrl}
              githubUrl={project.githubUrl}
              coverImage={project.coverImage}
              featured={project.featured}
              className={project.featured ? 'md:col-span-2' : ''}
            />
          </AnimatedElement>
        ))}
      </div>
    </div>
  );
};

export default ProjectList; 