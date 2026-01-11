'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Folder,
  ChevronDown,
  ChevronRight,
  Filter,
  SortAsc,
  Search,
  X,
  Calendar,
} from 'lucide-react';
import { useAllFiles } from '@/hooks/useAllFiles';
import { useProjects } from '@/hooks/useProjects';
import {
  FileListItem,
  FileGridCard,
  FilePreviewModal,
  ViewToggle,
  type ViewMode,
} from '@/components/files';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { GlobalFilesFilters, GlobalFile, FileTypeCategory } from '@/lib/api/files';

// Filter options
const TYPE_OPTIONS: { value: FileTypeCategory | null; label: string }[] = [
  { value: null, label: 'All Types' },
  { value: 'images', label: 'Images' },
  { value: 'documents', label: 'Documents' },
  { value: 'spreadsheets', label: 'Spreadsheets' },
  { value: 'archives', label: 'Archives' },
  { value: 'other', label: 'Other' },
];

const DATE_OPTIONS = [
  { value: null, label: 'All Time', days: null },
  { value: '7', label: 'Last 7 Days', days: 7 },
  { value: '30', label: 'Last 30 Days', days: 30 },
  { value: '90', label: 'Last 90 Days', days: 90 },
];

const SORT_OPTIONS = [
  { sortBy: 'createdAt' as const, sortOrder: 'desc' as const, label: 'Newest First' },
  { sortBy: 'createdAt' as const, sortOrder: 'asc' as const, label: 'Oldest First' },
  { sortBy: 'size' as const, sortOrder: 'desc' as const, label: 'Largest First' },
  { sortBy: 'size' as const, sortOrder: 'asc' as const, label: 'Smallest First' },
  { sortBy: 'originalName' as const, sortOrder: 'asc' as const, label: 'Name (A-Z)' },
  { sortBy: 'originalName' as const, sortOrder: 'desc' as const, label: 'Name (Z-A)' },
];

// LocalStorage keys
const VIEW_MODE_KEY = 'files-view-mode';
const EXPANDED_PROJECTS_KEY = 'files-expanded-projects';

export default function FilesPage() {
  // Filter state
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<FileTypeCategory | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'createdAt' | 'size' | 'originalName'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  // Preview state
  const [previewFile, setPreviewFile] = useState<GlobalFile | null>(null);

  // Load view mode from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedViewMode = localStorage.getItem(VIEW_MODE_KEY) as ViewMode | null;
      if (savedViewMode) {
        setViewMode(savedViewMode);
      }
      const savedExpanded = localStorage.getItem(EXPANDED_PROJECTS_KEY);
      if (savedExpanded) {
        try {
          setExpandedProjects(new Set(JSON.parse(savedExpanded)));
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, []);

  // Save view mode to localStorage
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  }, []);

  // Toggle project expansion
  const toggleProject = useCallback((projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      localStorage.setItem(EXPANDED_PROJECTS_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  // Build filters
  const filters: GlobalFilesFilters = useMemo(() => {
    const f: GlobalFilesFilters = {
      sortBy,
      sortOrder,
      limit: 100,
    };
    if (search) f.search = search;
    if (selectedType) f.type = selectedType;
    if (selectedProjectId) f.projectId = selectedProjectId;
    if (selectedDateRange) {
      const days = parseInt(selectedDateRange, 10);
      const date = new Date();
      date.setDate(date.getDate() - days);
      f.dateFrom = date.toISOString();
    }
    return f;
  }, [search, selectedType, selectedProjectId, selectedDateRange, sortBy, sortOrder]);

  // Fetch files
  const {
    files,
    groupedByProject,
    meta,
    isLoading,
    isError,
    error,
    refetch,
  } = useAllFiles({ filters });

  // Fetch projects for filter dropdown
  const { projects } = useProjects();

  // Expand first project by default when data loads
  useEffect(() => {
    if (groupedByProject.length > 0 && expandedProjects.size === 0) {
      const firstProjectId = groupedByProject[0].project.id;
      setExpandedProjects(new Set([firstProjectId]));
      localStorage.setItem(EXPANDED_PROJECTS_KEY, JSON.stringify([firstProjectId]));
    }
  }, [groupedByProject, expandedProjects.size]);

  // Active filter count
  const activeFilterCount = [selectedType, selectedDateRange, selectedProjectId].filter(Boolean).length;

  // Has active filters (including search)
  const hasActiveFilters = search || selectedType || selectedDateRange || selectedProjectId;

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearch('');
    setSelectedType(null);
    setSelectedDateRange(null);
    setSelectedProjectId(null);
  }, []);

  // Get current sort label
  const currentSortLabel = SORT_OPTIONS.find(
    (opt) => opt.sortBy === sortBy && opt.sortOrder === sortOrder
  )?.label || 'Sort';

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>

        {/* Filter bar skeleton */}
        <div className="flex items-center gap-3 flex-wrap">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-20 ml-auto" />
        </div>

        {/* Project groups skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-10 w-48" />
              <div className="space-y-2 pl-4">
                <FileListItem.Skeleton />
                <FileListItem.Skeleton />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-card border border-gray-200">
        <div className="p-4 bg-red-50 rounded-full mb-4">
          <Folder className="size-8 text-red-400" />
        </div>
        <h3 className="text-base font-medium text-gray-800 mb-1">
          Failed to load files
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {error instanceof Error ? error.message : 'An error occurred'}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state - no files at all
  if (files.length === 0 && !hasActiveFilters) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-gray-800">All Files</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage files from all your projects
          </p>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-card border border-gray-200">
          <div className="p-4 bg-gray-50 rounded-full mb-4">
            <Folder className="size-8 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-800 mb-1">
            No files yet
          </h3>
          <p className="text-sm text-gray-500">
            Upload files to your tasks to see them here
          </p>
        </div>
      </div>
    );
  }

  // Empty state - filters applied but no results
  if (files.length === 0 && hasActiveFilters) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">All Files</h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage files from all your projects
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          search={search}
          setSearch={setSearch}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedDateRange={selectedDateRange}
          setSelectedDateRange={setSelectedDateRange}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          sortBy={sortBy}
          sortOrder={sortOrder}
          setSortBy={setSortBy}
          setSortOrder={setSortOrder}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          activeFilterCount={activeFilterCount}
          clearFilters={clearFilters}
          currentSortLabel={currentSortLabel}
          projects={projects}
        />

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-card border border-gray-200">
          <div className="p-4 bg-gray-50 rounded-full mb-4">
            <Search className="size-8 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-800 mb-1">
            No files match your filters
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Try adjusting your search or filters
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">All Files</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage files from all your projects
          </p>
        </div>
        {meta && (
          <Badge variant="secondary">{meta.total} files</Badge>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedDateRange={selectedDateRange}
        setSelectedDateRange={setSelectedDateRange}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        sortBy={sortBy}
        sortOrder={sortOrder}
        setSortBy={setSortBy}
        setSortOrder={setSortOrder}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        activeFilterCount={activeFilterCount}
        clearFilters={clearFilters}
        currentSortLabel={currentSortLabel}
        projects={projects}
      />

      {/* Project Groups */}
      <div className="space-y-4">
        {groupedByProject.map((group) => (
          <Collapsible
            key={group.project.id}
            open={expandedProjects.has(group.project.id)}
            onOpenChange={() => toggleProject(group.project.id)}
          >
            <CollapsibleTrigger asChild>
              <button className="flex items-center gap-2 w-full p-3 text-left text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                {expandedProjects.has(group.project.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: group.project.color }}
                />
                <span className="font-medium">{group.project.name}</span>
                <Badge variant="secondary" className="ml-1">
                  {group.files.length}
                </Badge>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              {viewMode === 'list' ? (
                <div className="space-y-2">
                  {group.files.map((file) => (
                    <FileListItem
                      key={file.id}
                      file={file}
                      onPreview={setPreviewFile}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {group.files.map((file) => (
                    <FileGridCard
                      key={file.id}
                      file={file}
                      onPreview={setPreviewFile}
                    />
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={previewFile !== null}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}

// Filter Bar Component
interface FilterBarProps {
  search: string;
  setSearch: (value: string) => void;
  selectedType: FileTypeCategory | null;
  setSelectedType: (value: FileTypeCategory | null) => void;
  selectedDateRange: string | null;
  setSelectedDateRange: (value: string | null) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (value: string | null) => void;
  sortBy: 'createdAt' | 'size' | 'originalName';
  sortOrder: 'asc' | 'desc';
  setSortBy: (value: 'createdAt' | 'size' | 'originalName') => void;
  setSortOrder: (value: 'asc' | 'desc') => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  activeFilterCount: number;
  clearFilters: () => void;
  currentSortLabel: string;
  projects?: { id: string; name: string; color: string }[];
}

function FilterBar({
  search,
  setSearch,
  selectedType,
  setSelectedType,
  selectedDateRange,
  setSelectedDateRange,
  selectedProjectId,
  setSelectedProjectId,
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
  viewMode,
  onViewModeChange,
  activeFilterCount,
  clearFilters,
  currentSortLabel,
  projects,
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Filter className="h-4 w-4" />
            Type
            {selectedType && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {TYPE_OPTIONS.find((o) => o.value === selectedType)?.label}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {TYPE_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value || 'all'}
              onClick={() => setSelectedType(option.value)}
              className={cn(selectedType === option.value && 'bg-gray-100')}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Date Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Calendar className="h-4 w-4" />
            Date
            {selectedDateRange && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {DATE_OPTIONS.find((o) => o.value === selectedDateRange)?.label}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {DATE_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value || 'all'}
              onClick={() => setSelectedDateRange(option.value)}
              className={cn(selectedDateRange === option.value && 'bg-gray-100')}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Project Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            Project
            {selectedProjectId && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {projects?.find((p) => p.id === selectedProjectId)?.name || '1'}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
          <DropdownMenuItem onClick={() => setSelectedProjectId(null)}>
            All Projects
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {projects?.map((project) => (
            <DropdownMenuItem
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className={cn(selectedProjectId === project.id && 'bg-gray-100')}
            >
              <div
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: project.color }}
              />
              {project.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <SortAsc className="h-4 w-4" />
            {currentSortLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={`${option.sortBy}-${option.sortOrder}`}
              onClick={() => {
                setSortBy(option.sortBy);
                setSortOrder(option.sortOrder);
              }}
              className={cn(
                sortBy === option.sortBy && sortOrder === option.sortOrder && 'bg-gray-100'
              )}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9 text-gray-500"
        >
          Clear filters
          <X className="h-4 w-4 ml-1" />
        </Button>
      )}

      {/* View Toggle */}
      <div className="ml-auto">
        <ViewToggle value={viewMode} onChange={onViewModeChange} />
      </div>
    </div>
  );
}
