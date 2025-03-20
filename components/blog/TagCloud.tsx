"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export interface TagCloudProps {
  tags: {
    name: string;
    count?: number;
  }[];
  selectedTags?: string[];
  onTagSelect?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  onClearAll?: () => void;
  showCounts?: boolean;
  maxTagsVisible?: number;
  className?: string;
  colorful?: boolean;
}

export const TagCloud: React.FC<TagCloudProps> = ({
  tags,
  selectedTags = [],
  onTagSelect,
  onTagRemove,
  onClearAll,
  showCounts = true,
  maxTagsVisible,
  className,
  colorful = false
}) => {
  const [visibleTags, setVisibleTags] = useState<typeof tags>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // 根据计数排序标签
  const sortedTags = [...tags].sort((a, b) => (b.count || 0) - (a.count || 0));

  useEffect(() => {
    if (maxTagsVisible && !isExpanded && sortedTags.length > maxTagsVisible) {
      setVisibleTags(sortedTags.slice(0, maxTagsVisible));
    } else {
      setVisibleTags(sortedTags);
    }
  }, [tags, maxTagsVisible, isExpanded, sortedTags]);

  const toggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      onTagRemove?.(tagName);
    } else {
      onTagSelect?.(tagName);
    }
  };

  // 颜色管理
  const getTagColor = (index: number, selected: boolean): string => {
    if (!colorful) return '';
    
    const colors = [
      'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300',
      'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300',
      'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300',
    ];
    
    // 如果选中，返回特殊样式
    if (selected) {
      return 'bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 border-primary-300 dark:border-primary-700';
    }
    
    return colors[index % colors.length];
  };

  return (
    <div className={cn('space-y-3', className)}>
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex items-center">
            <span className="text-sm text-neutral-500 dark:text-neutral-400 mr-2">已选择:</span>
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                className="m-1 cursor-pointer bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
                onClick={() => onTagRemove?.(tag)}
              >
                {tag} ×
              </Badge>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 ml-2"
              >
                清除全部
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tag, index) => (
          <Badge
            key={tag.name}
            variant="subtle"
            className={cn(
              'cursor-pointer transition-all',
              colorful && getTagColor(index, selectedTags.includes(tag.name)),
              selectedTags.includes(tag.name) && 
                'border border-primary-300 dark:border-primary-700 font-medium'
            )}
            onClick={() => toggleTag(tag.name)}
          >
            {tag.name}
            {showCounts && tag.count !== undefined && (
              <span className="ml-1 text-xs opacity-70">({tag.count})</span>
            )}
          </Badge>
        ))}
        
        {maxTagsVisible && sortedTags.length > maxTagsVisible && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-1"
          >
            {isExpanded ? '显示较少' : `显示全部 (${sortedTags.length})`}
          </button>
        )}
      </div>
    </div>
  );
};

export default TagCloud; 