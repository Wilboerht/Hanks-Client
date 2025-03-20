"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiExternalLink, FiGithub } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { Badge, BadgeGroup } from '@/components/ui/Badge';
import { AnimatedElement } from '@/components/ui/AnimatedElement';

export interface ProjectCardProps {
  title: string;
  description: string;
  slug?: string;
  technologies: string[];
  demoUrl?: string;
  githubUrl?: string;
  coverImage?: string;
  featured?: boolean;
  className?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  slug,
  technologies,
  demoUrl,
  githubUrl,
  coverImage,
  featured = false,
  className
}) => {
  return (
    <AnimatedElement animation="hover-lift">
      <div className={cn(
        "border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden",
        featured ? "md:col-span-2" : "",
        className
      )}>
        {coverImage && (
          <div className="relative h-48 w-full">
            <Image 
              src={coverImage} 
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <h3 className="text-lg font-bold mb-2">{title}</h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">{description}</p>
          
          <BadgeGroup gap="sm" className="mb-4">
            {technologies.map((tech, index) => (
              <Badge key={index} size="sm" variant="subtle">{tech}</Badge>
            ))}
          </BadgeGroup>
          
          {(demoUrl || githubUrl || slug) && (
            <div className="flex space-x-4">
              {demoUrl && (
                <a 
                  href={demoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  <FiExternalLink className="mr-1" /> Demo
                </a>
              )}
              
              {githubUrl && (
                <a 
                  href={githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  <FiGithub className="mr-1" /> Source
                </a>
              )}
              
              {slug && (
                <Link 
                  href={`/projects/${slug}`}
                  className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  Details
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </AnimatedElement>
  );
};

export default ProjectCard; 