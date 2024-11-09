import { Post } from '../../models/post';

export interface PostListResponse {
  posts: Post[];
  totalPages: number;
}
