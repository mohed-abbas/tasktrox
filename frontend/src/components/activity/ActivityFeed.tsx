'use client';

import { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ActivityItem } from './ActivityItem';
import { Loader2 } from 'lucide-react';
import type { Activity } from '@/lib/api/activities';

export interface ActivityFeedProps {
  activities: Activity[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  showTask?: boolean;
  className?: string;
  emptyMessage?: string;
}

/**
 * ActivityFeed - Renders a list of activities with infinite scroll support.
 *
 * Uses intersection observer for automatic loading of more activities.
 */
export function ActivityFeed({
  activities,
  isLoading = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  fetchNextPage,
  showTask = false,
  className,
  emptyMessage = 'No activity yet',
}: ActivityFeedProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection observer callback for infinite scroll
  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && fetchNextPage) {
          fetchNextPage();
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Empty state
  if (activities.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8 text-gray-500 text-sm', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('divide-y divide-gray-100', className)}>
      {activities.map((activity, index) => {
        const isLast = index === activities.length - 1;
        return (
          <div
            key={activity.id}
            ref={isLast ? lastItemRef : undefined}
          >
            <ActivityItem activity={activity} showTask={showTask} />
          </div>
        );
      })}

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
}

export default ActivityFeed;
