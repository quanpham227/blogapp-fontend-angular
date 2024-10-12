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
  thumbnail_url: string;
  category: Category;
  created_at: string;
  updated_at: string;
  comment_count: number;
  author_name: string;
  profile_image: string;
  ratings_count: number;
  view_count: number;
  visibility: string;
  revision_count: number;
  meta: Meta;
  totalPages: number;
  tags: Tag[];
}
