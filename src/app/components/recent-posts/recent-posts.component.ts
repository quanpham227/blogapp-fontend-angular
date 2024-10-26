import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Post } from '../../models/post';
import { PostService } from '../../services/post.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recent-posts',
  templateUrl: './recent-posts.component.html',
  styleUrls: ['./recent-posts.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class RecentPostsComponent implements OnInit, OnDestroy {
  recentPosts: Post[] = [];
  private subscriptions: Subscription = new Subscription();

  constructor(
    private postService: PostService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.getRecentPosts(0, 4);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  getRecentPosts(page: number, limit: number) {
    const recentPostsSubscription = this.postService
      .getRecentPosts(page, limit)
      .subscribe({
        next: (response: any) => {
          this.recentPosts = response.data.posts;
        },
        error: (error: any) => {
          console.error('Error fetching recent posts:', error);
          // Hiển thị thông báo lỗi cho người dùng nếu cần
        },
      });

    this.subscriptions.add(recentPostsSubscription);
  }

  onPostClick(slug: string) {
    this.router.navigate(['/blog-detail', slug]);
  }
}
