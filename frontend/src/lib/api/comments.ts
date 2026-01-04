import api from '../axios';

// Types
export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

interface CommentsResponse {
  comments: Comment[];
}

interface CommentResponse {
  comment: Comment;
}

// ============ COMMENT API ============

/**
 * Get all comments for a task
 */
export async function getTaskComments(
  projectId: string,
  taskId: string
): Promise<Comment[]> {
  const response = await api.get<ApiResponse<CommentsResponse>>(
    `/projects/${projectId}/tasks/${taskId}/comments`
  );
  return response.data.data.comments;
}

/**
 * Create a new comment
 */
export async function createComment(
  projectId: string,
  taskId: string,
  content: string
): Promise<Comment> {
  const response = await api.post<ApiResponse<CommentResponse>>(
    `/projects/${projectId}/tasks/${taskId}/comments`,
    { content }
  );
  return response.data.data.comment;
}

/**
 * Update a comment
 */
export async function updateComment(
  projectId: string,
  commentId: string,
  content: string
): Promise<Comment> {
  const response = await api.patch<ApiResponse<CommentResponse>>(
    `/projects/${projectId}/comments/${commentId}`,
    { content }
  );
  return response.data.data.comment;
}

/**
 * Delete a comment
 */
export async function deleteComment(
  projectId: string,
  commentId: string
): Promise<void> {
  await api.delete(`/projects/${projectId}/comments/${commentId}`);
}
