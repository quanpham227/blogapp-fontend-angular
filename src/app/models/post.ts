import { Category } from './category';
import { Meta } from './meta';
import { Tag } from './tag';

export interface Post {
  id: number;
  title: string;
  content: string;
  slug: string;
  excerpt: string;
  status: string;
  thumbnailUrl: string;
  publicId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
  commentCount: number;
  authorName: string;
  profileImage: string;
  email: string;
  ratingsCount: number;
  viewCount: number;
  visibility: string;
  revisionCount: number;
  meta: Meta;
  totalPages: number;
  tags: Tag[];
}
