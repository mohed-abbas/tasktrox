'use client';

import { cn } from '@/lib/utils';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

/**
 * ViewToggle - Button group to toggle between grid and list views
 */
export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-50',
        className
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-8 px-3 rounded-md transition-colors',
          value === 'grid'
            ? 'bg-white shadow-sm text-gray-900'
            : 'text-gray-500 hover:text-gray-700 hover:bg-transparent'
        )}
        onClick={() => onChange('grid')}
        title="Grid view"
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'h-8 px-3 rounded-md transition-colors',
          value === 'list'
            ? 'bg-white shadow-sm text-gray-900'
            : 'text-gray-500 hover:text-gray-700 hover:bg-transparent'
        )}
        onClick={() => onChange('list')}
        title="List view"
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default ViewToggle;
