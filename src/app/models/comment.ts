import { User } from './user';

export interface CommentResponse {
  id: number;
  content: string;
  post_id: number;
  user_id: number;
  full_name: string;
  status?: string;
  email: string;
  profile_image?: string;
  parent_comment_id?: number;
  created_at?: string;
  updated_at?: string;
  replies?: CommentResponse[];
}
