import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Post } from '../../models/post';
import { PostService } from '../../services/post.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { HttpStatusService } from '../../services/http-status.service';
import { LazyLoadDirective } from '../../directives/lazy-load.directive';
import isEqual from 'lodash-es/isEqual';
import { catchError, distinctUntilChanged, take, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { SnackbarService } from '../../services/snackbar.service';

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
  isLoading = false;
  errorMessage = '';

  constructor(
    private postService: PostService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private httpStatusService: HttpStatusService,
    private snackBar: SnackbarService,
  ) {}

  ngOnInit() {
    this.fetchRecentPosts(0, 4);
  }

  fetchRecentPosts(page: number, limit: number) {
    this.isLoading = true;
    this.errorMessage = '';

    this.postService
      .getRecentPosts(page, limit)
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
        tap((response) => {
          if (response.status === 'OK' && response.data.posts) {
            this.recentPosts = response.data.posts;
          } else {
            this.errorMessage = 'Failed to load posts. Please try again later.';
          }
          this.cdr.detectChanges();
        }),
        catchError((error) => {
          this.errorMessage = 'Error loading posts. Please try again.';
          return of([]);
        }),
      )
      .subscribe(() => {
        this.isLoading = false;
      });
  }

  onPostClick(slug: string) {
    if (!slug?.trim()) {
      this.snackBar.show('Invalid slug. Please try again.');
      return;
    }

    if (this.isRequestPending()) {
      this.snackBar.show('Please wait for the current request to complete.');
      return;
    }

    this.router.navigate([`/blog/${slug}`]);
  }

  isRequestPending(): boolean {
    let isPending = false;
    this.httpStatusService.pendingRequests$.pipe(take(1)).subscribe((status) => (isPending = status));
    return isPending;
  }
}
