'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  FileText,
  Folder,
  Loader2,
  Flag,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearch } from '@/hooks/useSearch';
import { PriorityBadge } from '@/components/task/PrioritySelector';
import { LabelBadge } from '@/components/labels';
import type { TaskSearchResult, ProjectSearchResult } from '@/lib/api/search';

export interface SearchCommandProps {
  className?: string;
  onTaskClick?: (task: TaskSearchResult) => void;
}

export function SearchCommand({ className, onTaskClick }: SearchCommandProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    tasks,
    projects,
    isLoading,
    hasResults,
    isEmpty,
    isSearching,
    clearSearch,
  } = useSearch();

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
        clearSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, clearSearch]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleInputFocus = useCallback(() => {
    setOpen(true);
  }, []);

  const handleTaskClick = useCallback(
    (task: TaskSearchResult) => {
      if (onTaskClick) {
        onTaskClick(task);
      }
      setOpen(false);
      clearSearch();
    },
    [onTaskClick, clearSearch]
  );

  const handleProjectClick = useCallback(
    (project: ProjectSearchResult) => {
      router.push(`/projects/${project.id}`);
      setOpen(false);
      clearSearch();
    },
    [router, clearSearch]
  );

  const handleClear = useCallback(() => {
    clearSearch();
    inputRef.current?.focus();
  }, [clearSearch]);

  return (
    <div className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search tasks... ⌘K"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          className={cn(
            'w-full sm:w-64 pl-9 pr-8 py-2 text-sm',
            'bg-gray-100 border-0 rounded-lg',
            'placeholder:text-gray-400 text-gray-700',
            'focus:ring-2 focus:ring-gray-800/10 focus:bg-white',
            'transition-all outline-none'
          )}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {open && isSearching && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute top-full left-0 right-0 mt-2 z-50',
              'bg-white rounded-lg border border-gray-200 shadow-lg',
              'max-h-96 overflow-y-auto',
              'sm:min-w-80'
            )}
          >
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Searching...</span>
              </div>
            )}

            {/* Empty State */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Search className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-sm">No results found</span>
                <span className="text-xs mt-1">Try a different search term</span>
              </div>
            )}

            {/* Results */}
            {!isLoading && hasResults && (
              <div className="py-2">
                {/* Tasks Section */}
                {tasks.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasks
                    </div>
                    {tasks.map((task) => (
                      <TaskResultItem
                        key={task.id}
                        task={task}
                        onClick={() => handleTaskClick(task)}
                      />
                    ))}
                  </div>
                )}

                {/* Projects Section */}
                {projects.length > 0 && (
                  <div className={tasks.length > 0 ? 'mt-2 pt-2 border-t border-gray-100' : ''}>
                    <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Projects
                    </div>
                    {projects.map((project) => (
                      <ProjectResultItem
                        key={project.id}
                        project={project}
                        onClick={() => handleProjectClick(project)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            {!isLoading && isSearching && (
              <div className="px-3 py-2 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
                <span>Press Enter to search, Escape to close</span>
                <span className="text-gray-300">⌘K</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Task result item component
interface TaskResultItemProps {
  task: TaskSearchResult;
  onClick: () => void;
}

function TaskResultItem({ task, onClick }: TaskResultItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-3 py-2 text-left',
        'hover:bg-gray-50 transition-colors',
        'flex items-start gap-3'
      )}
    >
      <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 truncate">
            {task.title}
          </span>
          {task.priority && (
            <PriorityBadge priority={task.priority as 'HIGH' | 'MEDIUM' | 'LOW'} size="sm" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">
            {task.project.name} › {task.column.name}
          </span>
          {task.labels.length > 0 && (
            <div className="flex items-center gap-1">
              {task.labels.slice(0, 2).map((label) => (
                <LabelBadge key={label.id} label={label} size="sm" />
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// Project result item component
interface ProjectResultItemProps {
  project: ProjectSearchResult;
  onClick: () => void;
}

function ProjectResultItem({ project, onClick }: ProjectResultItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full px-3 py-2 text-left',
        'hover:bg-gray-50 transition-colors',
        'flex items-start gap-3'
      )}
    >
      <Folder className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-700 truncate block">
          {project.name}
        </span>
        <span className="text-xs text-gray-400">
          {project._count.tasks} task{project._count.tasks !== 1 ? 's' : ''} ·{' '}
          {project._count.columns} column{project._count.columns !== 1 ? 's' : ''}
        </span>
      </div>
    </button>
  );
}

export default SearchCommand;
