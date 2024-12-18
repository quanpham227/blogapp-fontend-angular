import { Post } from './post';

export interface Dashboard {
  totalPosts: number;
  activeUsers: number;
  commentsToday: number;
  recentPosts: Post[];
  commentsPerDayLastWeek: number[];
  pageViewsPerDayLastWeek: number[];
}
