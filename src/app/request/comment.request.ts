export interface AddCommentRequest {
  post_id: number;
  user_id: number;
  content: string;
  parent_comment_id?: number;
}

export interface UpdateCommentRequest {
  content: string;
  status?: CommentStatus;
}

export interface DeleteCommentRequest {
  comment_id: number;
}

export enum CommentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SPAM = 'SPAM',
  DELETED = 'DELETED',
}
