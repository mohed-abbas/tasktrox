'use client';

import Link from 'next/link';
import { FolderKanban, MoreHorizontal, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string;
  taskCount: number;
  memberCount: number;
  className?: string;
}

export function ProjectCard({
  id,
  name,
  description,
  taskCount,
  memberCount,
  className,
}: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${id}`}
      className={cn(
        'block bg-white rounded-card border border-gray-200 shadow-card p-4 transition-shadow duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
            <FolderKanban className="size-5 text-gray-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 truncate">
              {name}
            </h3>
            {description && (
              <p className="text-xs text-gray-500 mt-0.5 truncate-2">
                {description}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="flex-shrink-0 p-1 rounded hover:bg-gray-100 transition-colors"
        >
          <MoreHorizontal className="size-4 text-gray-400" />
        </button>
      </div>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <FolderKanban className="size-3.5" />
          <span>{taskCount} tasks</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Users className="size-3.5" />
          <span>{memberCount} members</span>
        </div>
      </div>
    </Link>
  );
}

export default ProjectCard;
