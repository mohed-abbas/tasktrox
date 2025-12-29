'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: { name: string; description: string }) => Promise<void>;
}

export function NewProjectModal({
  open,
  onOpenChange,
  onSubmit,
}: NewProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isSubmitting) {
      if (!open) {
        setName('');
        setDescription('');
      }
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to organize your tasks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="project-name" className="text-sm font-medium text-gray-700">
              Project Name
            </label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Marketing Campaign"
              className="input-base"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="project-description" className="text-sm font-medium text-gray-700">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project about?"
              rows={3}
              className="input-base resize-none"
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Create Project
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default NewProjectModal;
