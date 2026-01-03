'use client';

import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/hooks/useAuth';
import { CommentInput } from './CommentInput';
import { CommentItem } from './CommentItem';
import { MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommentSectionProps {
  projectId: string;
  taskId: string;
  className?: string;
}

export function CommentSection({ projectId, taskId, className }: CommentSectionProps) {
  const { user } = useAuth();
  const {
    comments,
    isLoading,
    isError,
    error,
    createComment,
    updateComment,
    deleteComment,
    isCreating,
    isUpdating,
    isDeleting,
  } = useComments({ projectId, taskId });

  const handleCreate = (content: string) => {
    createComment(content);
  };

  const handleUpdate = (commentId: string, content: string) => {
    updateComment({ commentId, content });
  };

  const handleDelete = (commentId: string) => {
    deleteComment(commentId);
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold text-sm">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {/* Comment Input */}
      <div className="mb-6">
        <CommentInput onSubmit={handleCreate} isSubmitting={isCreating} />
      </div>

      {/* Comments List */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center gap-2 py-8 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm">
              {error?.message || 'Failed to load comments'}
            </span>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs">Be the first to comment</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default CommentSection;
