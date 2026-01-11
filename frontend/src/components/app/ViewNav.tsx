'use client';

import { useState } from 'react';
import {
  BoardIcon,
  ListIcon,
  CalendarViewIcon,
  SearchStatusIcon,
  FilterFunnelIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';

export type ViewType = 'board' | 'list' | 'calendar';

interface ViewNavProps {
  activeView?: ViewType;
  onViewChange?: (view: ViewType) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  hasActiveFilters?: boolean;
  className?: string;
}

const viewOptions: { id: ViewType; label: string; icon: typeof BoardIcon }[] = [
  { id: 'board', label: 'Board', icon: BoardIcon },
  { id: 'list', label: 'List', icon: ListIcon },
  { id: 'calendar', label: 'Calendar', icon: CalendarViewIcon },
];

export function ViewNav({
  activeView: controlledActiveView,
  onViewChange,
  searchValue: controlledSearchValue,
  onSearchChange,
  onFilterClick,
  hasActiveFilters = false,
  className,
}: ViewNavProps) {
  // Internal state for uncontrolled mode
  const [internalActiveView, setInternalActiveView] = useState<ViewType>('board');
  const [internalSearchValue, setInternalSearchValue] = useState('');

  // Use controlled or internal state
  const activeView = controlledActiveView ?? internalActiveView;
  const searchValue = controlledSearchValue ?? internalSearchValue;

  const handleViewChange = (view: ViewType) => {
    if (onViewChange) {
      onViewChange(view);
    } else {
      setInternalActiveView(view);
    }
  };

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearchValue(value);
    }
  };

  return (
    <nav
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full',
        className
      )}
      aria-label="View navigation"
    >
      {/* View Toggle Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-3" role="tablist" aria-label="View options">
        {viewOptions.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${id}-view`}
              onClick={() => handleViewChange(id)}
              className={cn(
                'flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-base font-normal transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2',
                isActive
                  ? 'bg-white border border-gray-100 text-gray-700 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon size={20} className="text-gray-700" />
              {/* Hide label on mobile, show on sm+ */}
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar - full width on mobile, fixed on larger screens */}
        <div className="relative flex-1 sm:flex-none">
          <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <SearchStatusIcon size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={cn(
              'w-full sm:w-[200px] lg:w-[270px] h-10 pl-10 sm:pl-11 pr-4 rounded-md border border-gray-200',
              'text-sm text-gray-700 placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent',
              'transition-all duration-200'
            )}
            aria-label="Search tasks"
          />
        </div>

        {/* Filter Button - icon only on mobile, with label on sm+ */}
        <button
          type="button"
          onClick={onFilterClick}
          className={cn(
            'flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-md border',
            'text-sm font-normal',
            'hover:bg-gray-50 transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2',
            hasActiveFilters
              ? 'border-primary-300 bg-primary-50 text-primary-700'
              : 'border-gray-200 text-gray-800'
          )}
          aria-label="Open filters"
        >
          <FilterFunnelIcon size={20} className={hasActiveFilters ? 'text-primary-600' : 'text-gray-800'} />
          {/* Hide label on mobile, show on sm+ */}
          <span className="hidden sm:inline">Filter</span>
          {hasActiveFilters && (
            <span className="ml-0.5 w-2 h-2 rounded-full bg-primary-500" />
          )}
        </button>
      </div>
    </nav>
  );
}
