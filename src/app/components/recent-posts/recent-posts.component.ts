import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Post } from '../../models/post';
import { PostService } from '../../services/post.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { HttpStatusService } from '../../services/http-status.service';
import { LoggingService } from '../../services/logging.service';
import { catchError, distinctUntilChanged, take, tap } from 'rxjs/operators';
import { LazyLoadDirective } from '../../directives/lazy-load.directive';
import { isEqual } from 'lodash';
import { ApiResponse } from '../../models/response';
import { PostListResponse } from '../../responses/post/post-list-response';

@UntilDestroy()
@Component({
  selector: 'app-recent-posts',
  templateUrl: './recent-posts.component.html',
  styleUrls: ['./recent-posts.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, LazyLoadDirective],
})
export class RecentPostsComponent implements OnInit {
  recentPosts: Post[] = [];

  constructor(
    private postService: PostService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private httpStatusService: HttpStatusService,
  ) {}

  ngOnInit() {
    this.getRecentPosts(0, 4);
  }

  getRecentPosts(page: number, limit: number) {
    this.postService
      .getRecentPosts(page, limit)
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
        tap((response: ApiResponse<PostListResponse>) => {
          if (response.status == 'OK' && response.data.posts) {
            const newPosts = response.data.posts;
            if (!isEqual(this.recentPosts, newPosts)) {
              this.recentPosts = newPosts;
              this.cdr.detectChanges();
            }
          }
        }),
        catchError((error) => {
          console.error('Error fetching posts:', error);
          return [];
        }),
      )
      .subscribe();
  }

  onPostClick(slug: string) {
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      alert('Slug không hợp lệ. Vui lòng thử lại.');
      return;
    }

    // Kiểm tra trạng thái của ứng dụng (ví dụ: không có yêu cầu HTTP đang chờ xử lý)
    if (this.isRequestPending()) {
      alert('Vui lòng đợi yêu cầu hiện tại hoàn thành.');
      return;
    }
    this.router.navigate([`/blog/${slug}`]);
  }

  isRequestPending(): boolean {
    let isPending = false;
    this.httpStatusService.pendingRequests$.pipe(take(1)).subscribe((status) => {
      isPending = status;
    });
    return isPending;
  }
}
