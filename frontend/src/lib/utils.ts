import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

// Due date utilities for task cards
export type DueDateStatus = 'overdue' | 'today' | 'tomorrow' | 'soon' | 'future' | null;

/**
 * Get the status of a due date relative to today
 */
export function getDueDateStatus(dateStr: string | null): DueDateStatus {
  if (!dateStr) return null;

  const date = new Date(dateStr);
  const now = new Date();
  // Reset time to compare dates only
  now.setHours(0, 0, 0, 0);
  const dueDate = new Date(date);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays <= 3) return 'soon';
  return 'future';
}

/**
 * Format due date for compact display
 * Returns: "Overdue", "Today", "Tomorrow", "X days", or "Mon D"
 */
export function formatDueDate(dateStr: string | null): string | null {
  if (!dateStr) return null;

  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `${diffDays} days`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Get Tailwind text color class for due date based on urgency
 */
export function getDueDateColor(dateStr: string | null): string {
  const status = getDueDateStatus(dateStr);

  switch (status) {
    case 'overdue':
      return 'text-red-600';
    case 'today':
      return 'text-amber-600';
    case 'tomorrow':
    case 'soon':
      return 'text-amber-500';
    case 'future':
      return 'text-gray-500';
    default:
      return 'text-gray-400';
  }
}

/**
 * Get due date badge styles (background + text color) for visual emphasis
 */
export function getDueDateBadgeStyles(dateStr: string | null): {
  bg: string;
  text: string;
} {
  const status = getDueDateStatus(dateStr);

  switch (status) {
    case 'overdue':
      return { bg: 'bg-red-50', text: 'text-red-600' };
    case 'today':
      return { bg: 'bg-amber-50', text: 'text-amber-600' };
    case 'tomorrow':
    case 'soon':
      return { bg: 'bg-amber-50/50', text: 'text-amber-500' };
    case 'future':
      return { bg: 'bg-gray-50', text: 'text-gray-500' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-400' };
  }
}
