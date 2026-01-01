'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Loader2, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getLabelStyles } from './LabelSelector';
import type { Label, CreateLabelInput, UpdateLabelInput } from '@/lib/api/labels';

// Predefined label colors matching DESIGN_GUIDE.md
const LABEL_COLORS = [
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Red', value: '#EF4444' },
];

export interface ManageLabelsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labels: Label[];
  onCreateLabel: (data: CreateLabelInput) => Promise<Label>;
  onUpdateLabel: (labelId: string, data: UpdateLabelInput) => Promise<Label>;
  onDeleteLabel: (labelId: string) => Promise<void>;
  isLoading?: boolean;
}

interface EditingLabel {
  id: string | null; // null for new label
  name: string;
  color: string;
}

export function ManageLabels({
  open,
  onOpenChange,
  labels,
  onCreateLabel,
  onUpdateLabel,
  onDeleteLabel,
  isLoading = false,
}: ManageLabelsProps) {
  const [editingLabel, setEditingLabel] = useState<EditingLabel | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startEditing = (label?: Label) => {
    setError(null);
    if (label) {
      setEditingLabel({
        id: label.id,
        name: label.name,
        color: label.color,
      });
    } else {
      setEditingLabel({
        id: null,
        name: '',
        color: LABEL_COLORS[0].value,
      });
    }
  };

  const cancelEditing = () => {
    setEditingLabel(null);
    setError(null);
  };

  const saveLabel = async () => {
    if (!editingLabel || !editingLabel.name.trim()) {
      setError('Label name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (editingLabel.id === null) {
        // Create new label
        await onCreateLabel({
          name: editingLabel.name.trim(),
          color: editingLabel.color,
        });
      } else {
        // Update existing label
        await onUpdateLabel(editingLabel.id, {
          name: editingLabel.name.trim(),
          color: editingLabel.color,
        });
      }
      setEditingLabel(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save label');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (labelId: string) => {
    setIsDeleting(labelId);
    setError(null);

    try {
      await onDeleteLabel(labelId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete label');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Manage Labels
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Error message */}
          {error && (
            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Labels list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : labels.length === 0 && !editingLabel ? (
              <div className="text-center py-8 text-gray-500">
                <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No labels yet</p>
                <p className="text-xs text-gray-400">
                  Create labels to organize your tasks
                </p>
              </div>
            ) : (
              <>
                {labels.map((label) => {
                  const styles = getLabelStyles(label.color);
                  const isEditing = editingLabel?.id === label.id;
                  const isBeingDeleted = isDeleting === label.id;

                  if (isEditing) {
                    return (
                      <LabelEditRow
                        key={label.id}
                        value={editingLabel}
                        onChange={setEditingLabel}
                        onSave={saveLabel}
                        onCancel={cancelEditing}
                        isSaving={isSaving}
                      />
                    );
                  }

                  return (
                    <div
                      key={label.id}
                      className={cn(
                        'flex items-center justify-between p-2 rounded-lg',
                        'hover:bg-gray-50 transition-colors group',
                        isBeingDeleted && 'opacity-50 pointer-events-none'
                      )}
                    >
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-sm font-medium',
                          styles.bg,
                          styles.text
                        )}
                      >
                        {label.name}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {label._count && (
                          <span className="text-xs text-gray-400 mr-2">
                            {label._count.tasks} task
                            {label._count.tasks !== 1 ? 's' : ''}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => startEditing(label)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Edit label"
                        >
                          <Pencil className="h-4 w-4 text-gray-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(label.id)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Delete label"
                        >
                          {isBeingDeleted ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* New label row */}
                {editingLabel?.id === null && (
                  <LabelEditRow
                    value={editingLabel}
                    onChange={setEditingLabel}
                    onSave={saveLabel}
                    onCancel={cancelEditing}
                    isSaving={isSaving}
                  />
                )}
              </>
            )}
          </div>

          {/* Add label button */}
          {!editingLabel && (
            <button
              type="button"
              onClick={() => startEditing()}
              className={cn(
                'w-full mt-4 flex items-center justify-center gap-2 px-4 py-2',
                'border border-dashed border-gray-300 rounded-lg',
                'text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-400',
                'transition-colors'
              )}
            >
              <Plus className="h-4 w-4" />
              Add new label
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Label edit row component
interface LabelEditRowProps {
  value: EditingLabel;
  onChange: (value: EditingLabel) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

function LabelEditRow({
  value,
  onChange,
  onSave,
  onCancel,
  isSaving,
}: LabelEditRowProps) {
  return (
    <div className="p-2 bg-gray-50 rounded-lg space-y-2">
      <input
        type="text"
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        placeholder="Label name"
        className="w-full px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md
                   focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave();
          if (e.key === 'Escape') onCancel();
        }}
      />

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {LABEL_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => onChange({ ...value, color: color.value })}
              className={cn(
                'w-6 h-6 rounded-full border-2 transition-all',
                value.color === color.value
                  ? 'border-gray-800 scale-110'
                  : 'border-transparent hover:scale-105'
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Cancel"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || !value.name.trim()}
            className={cn(
              'p-1.5 rounded transition-colors',
              'bg-primary-500 hover:bg-primary-600',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="Save"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <Check className="h-4 w-4 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageLabels;
