'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { CommentInput } from './CommentInput';
import type { Comment } from '@/lib/api/comments';
import { cn } from '@/lib/utils';

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onUpdate: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
  className?: string;
}

export function CommentItem({
  comment,
  currentUserId,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false,
  className,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOwner = currentUserId === comment.userId;
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
  const wasEdited = comment.createdAt !== comment.updatedAt;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleUpdate = (content: string) => {
    onUpdate(comment.id, content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(comment.id);
    setShowDeleteDialog(false);
  };

  if (isEditing) {
    return (
      <div className={cn('flex gap-3', className)}>
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.user.avatar ?? undefined} alt={comment.user.name} />
          <AvatarFallback className="text-xs">
            {getInitials(comment.user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CommentInput
            initialValue={comment.content}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isSubmitting={isUpdating}
            submitLabel="Save"
            autoFocus
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn('group flex gap-3', className)}>
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.user.avatar ?? undefined} alt={comment.user.name} />
          <AvatarFallback className="text-xs">
            {getInitials(comment.user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{comment.user.name}</span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {timeAgo}
              {wasEdited && ' (edited)'}
            </span>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                    disabled={isDeleting}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Comment actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap break-words mt-1">
            {comment.content}
          </p>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default CommentItem;
