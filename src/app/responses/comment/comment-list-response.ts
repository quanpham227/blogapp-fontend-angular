import { CommentResponse } from '../../models/comment';

export interface CommentListResponse {
  comments: CommentResponse[];
  totalPages: number;
}
