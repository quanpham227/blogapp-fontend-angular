export interface CommentResponse {
  id: number;
  content: string;
  postId: number;
  userId: number;
  fullName: string;
  status?: string;
  email: string;
  profileImage?: string;
  parentCommentId?: number;
  createdAt?: string;
  updatedAt?: string;
  replies?: CommentResponse[];
}
