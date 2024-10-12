import { PostStatus } from '../enums/post-status.enum';
import { PostVisibility } from '../enums/post-visibility.enum';
import { TagRequest } from './tags.request';

export interface UpdatePostRequest {
  title: string;
  content: string;
  category_id: number;
  thumbnail: String;
  public_id: String;
  status: PostStatus;
  visibility: PostVisibility;
  tags: TagRequest[];
}
