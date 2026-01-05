'use client';

import { useState, useMemo } from 'react';
import { Check, Plus, X, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Label } from '@/lib/api/labels';

// Predefined label colors matching DESIGN_GUIDE.md
const LABEL_COLORS = [
  { name: 'Purple', bg: '#F5F3FF', text: '#4C1D95', value: '#8B5CF6' },
  { name: 'Green', bg: '#ECFDF5', text: '#064E3B', value: '#10B981' },
  { name: 'Yellow', bg: '#FFFBEB', text: '#78350F', value: '#F59E0B' },
  { name: 'Blue', bg: '#EFF6FF', text: '#3B82F6', value: '#3B82F6' },
  { name: 'Pink', bg: '#FDF2F8', text: '#831843', value: '#EC4899' },
  { name: 'Red', bg: '#FEF2F2', text: '#991B1B', value: '#EF4444' },
];

// Get label style based on color hex
// Uses 500 shade for text to match Figma design
export function getLabelStyles(hexColor: string): { bg: string; text: string } {
  const colorMap: Record<string, { bg: string; text: string }> = {
    '#8B5CF6': { bg: 'bg-[#F5F3FF]', text: 'text-[#8B5CF6]' },
    '#7C3AED': { bg: 'bg-[#F5F3FF]', text: 'text-[#8B5CF6]' },
    '#10B981': { bg: 'bg-[#ECFDF5]', text: 'text-[#10B981]' },
    '#059669': { bg: 'bg-[#ECFDF5]', text: 'text-[#10B981]' },
    '#F59E0B': { bg: 'bg-[#FFFBEB]', text: 'text-[#F59E0B]' },
    '#D97706': { bg: 'bg-[#FFFBEB]', text: 'text-[#F59E0B]' },
    '#3B82F6': { bg: 'bg-[#EFF6FF]', text: 'text-[#3B82F6]' },
    '#2563EB': { bg: 'bg-[#EFF6FF]', text: 'text-[#3B82F6]' },
    '#EC4899': { bg: 'bg-[#FDF2F8]', text: 'text-[#EC4899]' },
    '#DB2777': { bg: 'bg-[#FDF2F8]', text: 'text-[#EC4899]' },
    '#EF4444': { bg: 'bg-[#FEF2F2]', text: 'text-[#EF4444]' },
    '#DC2626': { bg: 'bg-[#FEF2F2]', text: 'text-[#EF4444]' },
  };

  const normalized = hexColor.toUpperCase();
  return colorMap[normalized] || { bg: 'bg-gray-100', text: 'text-gray-600' };
}

export interface LabelSelectorProps {
  projectLabels: Label[];
  selectedLabelIds: string[];
  onSelect: (labelIds: string[]) => void;
  onCreateLabel?: (name: string, color: string) => Promise<Label>;
  disabled?: boolean;
  className?: string;
}

export function LabelSelector({
  projectLabels,
  selectedLabelIds,
  onSelect,
  onCreateLabel,
  disabled = false,
  className,
}: LabelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0].value);

  // Filter labels based on search
  const filteredLabels = useMemo(() => {
    if (!searchQuery.trim()) return projectLabels;
    const query = searchQuery.toLowerCase();
    return projectLabels.filter((label) =>
      label.name.toLowerCase().includes(query)
    );
  }, [projectLabels, searchQuery]);

  // Get selected labels for display
  const selectedLabels = useMemo(() => {
    return projectLabels.filter((label) => selectedLabelIds.includes(label.id));
  }, [projectLabels, selectedLabelIds]);

  const toggleLabel = (labelId: string) => {
    if (selectedLabelIds.includes(labelId)) {
      onSelect(selectedLabelIds.filter((id) => id !== labelId));
    } else {
      onSelect([...selectedLabelIds, labelId]);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim() || !onCreateLabel) return;

    try {
      const newLabel = await onCreateLabel(newLabelName.trim(), selectedColor);
      onSelect([...selectedLabelIds, newLabel.id]);
      setNewLabelName('');
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create label:', error);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200',
            'text-sm text-gray-600 hover:bg-gray-50 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          <Tag className="h-4 w-4" />
          <span>
            {selectedLabels.length === 0
              ? 'Add labels'
              : `${selectedLabels.length} label${selectedLabels.length > 1 ? 's' : ''}`}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-64 p-0" align="start">
        {/* Search input */}
        <div className="p-2 border-b border-gray-100">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search labels..."
            className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md
                       focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        {/* Label list */}
        <div className="max-h-48 overflow-y-auto p-1">
          {filteredLabels.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500 text-center">
              No labels found
            </div>
          ) : (
            filteredLabels.map((label) => {
              const isSelected = selectedLabelIds.includes(label.id);
              const styles = getLabelStyles(label.color);

              return (
                <button
                  key={label.id}
                  type="button"
                  onClick={() => toggleLabel(label.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left',
                    'hover:bg-gray-50 transition-colors'
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center w-4 h-4 rounded border',
                      isSelected
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-gray-300'
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      styles.bg,
                      styles.text
                    )}
                  >
                    {label.name}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Create new label */}
        {onCreateLabel && (
          <div className="border-t border-gray-100 p-2">
            {isCreating ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Label name"
                  className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md
                             focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateLabel();
                    if (e.key === 'Escape') setIsCreating(false);
                  }}
                />
                <div className="flex gap-1">
                  {LABEL_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setSelectedColor(color.value)}
                      className={cn(
                        'w-6 h-6 rounded-full border-2 transition-all',
                        selectedColor === color.value
                          ? 'border-gray-800 scale-110'
                          : 'border-transparent hover:scale-105'
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateLabel}
                    disabled={!newLabelName.trim()}
                    className="flex-1 px-2 py-1 text-xs bg-primary-500 text-white rounded
                               hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600
                           hover:bg-gray-50 rounded-md transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create new label
              </button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Minimal label type for display (task.labels uses this simpler structure)
export interface DisplayLabel {
  id: string;
  name: string;
  color: string;
}

// Label badge component for displaying individual labels
export interface LabelBadgeProps {
  label: DisplayLabel;
  onRemove?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function LabelBadge({
  label,
  onRemove,
  className,
  size = 'md',
}: LabelBadgeProps) {
  const styles = getLabelStyles(label.color);

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-0.5',
    md: 'px-2 py-0.5 text-xs gap-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        styles.bg,
        styles.text,
        className
      )}
    >
      {label.name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-70 transition-opacity"
        >
          <X className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
        </button>
      )}
    </span>
  );
}

export default LabelSelector;
