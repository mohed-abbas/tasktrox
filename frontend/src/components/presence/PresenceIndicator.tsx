'use client';

import { cn } from '@/lib/utils';

/**
 * User currently editing a task/item
 */
export interface EditingUser {
  id: string;
  name: string;
  avatar: string | null;
}

export interface PresenceIndicatorProps {
  /** The user currently editing, or null if none */
  user: EditingUser | null;
  /** Size of the avatar indicator */
  size?: 'sm' | 'md';
  /** Additional CSS classes */
  className?: string;
}

/**
 * PresenceIndicator - Shows an avatar with pulsing animation to indicate
 * that a user is currently editing an item.
 *
 * Features:
 * - Shows user avatar if available, or initials as fallback
 * - Pulsing ring animation to indicate active editing
 * - Tooltip on hover showing "{name} is editing..."
 * - Accessible with proper ARIA labels
 *
 * @example
 * ```tsx
 * <PresenceIndicator
 *   user={{ id: '1', name: 'John Doe', avatar: '/avatars/john.jpg' }}
 *   size="sm"
 * />
 * ```
 */
export function PresenceIndicator({
  user,
  size = 'sm',
  className,
}: PresenceIndicatorProps) {
  // Return null if no user is editing
  if (!user) {
    return null;
  }

  // Get first letter of name for initials fallback
  const initials = user.name.charAt(0).toUpperCase();

  // Size classes following design system
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs', // 24px
    md: 'w-8 h-8 text-sm', // 32px
  };

  // Ring size for pulse animation
  const ringClasses = {
    sm: 'ring-2',
    md: 'ring-2',
  };

  return (
    <div
      className={cn('relative inline-flex', className)}
      title={`${user.name} is editing...`}
      aria-label={`${user.name} is editing this item`}
      role="status"
    >
      {/* Avatar container with pulse animation */}
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-medium overflow-hidden',
          'bg-gray-200 text-gray-600',
          ringClasses[size],
          'ring-info ring-offset-1 ring-offset-white',
          sizeClasses[size]
        )}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={`${user.name}'s avatar`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </div>

      {/* Pulsing ring indicator */}
      <span
        className={cn(
          'absolute inset-0 rounded-full',
          ringClasses[size],
          'ring-info',
          'animate-pulse',
          'pointer-events-none'
        )}
        aria-hidden="true"
      />
    </div>
  );
}

export default PresenceIndicator;
