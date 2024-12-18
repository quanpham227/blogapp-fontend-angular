import { PostStatus } from '../enums/post-status.enum';
import { PostVisibility } from '../enums/post-visibility.enum';
import { TagRequest } from './tags.request';

export interface PostRequest {
  title: string;
  content: string;
  categoryId: number;
  thumbnail: String;
  publicId: String;
  status: PostStatus;
  visibility: PostVisibility;
  tags: TagRequest[];
}
