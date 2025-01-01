import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Category } from '../../../models/category';
import { Post } from '../../../models/post';
import { PostStatus } from '../../../enums/post-status.enum';
import { SnackbarService } from '../../../services/snackbar.service';
import { PostService } from '../../../services/post.service';
import { CategoryService } from '../../../services/category.service';
import { MessageService } from '../../../services/message.service';
import { Subject } from 'rxjs';
import { filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CustomPaginationComponent } from '../../common/custom-pagination/custom-pagination.component';
import { PostEnumService } from '../../../utils/post-enum.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ApiResponse } from '../../../models/response';
import { PostListResponse } from '../../../responses/post/post-list-response';
import isEqual from 'lodash-es/isEqual';
import { LazyLoadDirective } from '../../../directives/lazy-load.directive';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Status } from '../../../enums/status.enum';

@UntilDestroy()
@Component({
  selector: 'app-post-admin',
  templateUrl: './post.admin.component.html',
  styleUrls: ['./post.admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, CustomPaginationComponent, MatTooltipModule, LazyLoadDirective],
})
export class PostAdminComponent implements OnInit {
  posts: Post[] = [];
  categories: Category[] = [];
  selectedCategoryId: number = 0;
  currentPage: number = 1; // Sửa đổi để bắt đầu từ trang 1
  itemsPerPage: number = 6;
  totalPages: number = 0;
  visiblePages: number[] = [];
  keyword: string = '';
  status: PostStatus | '' = '';
  startDate: string | null = null;
  endDate: string | null = null;
  private searchSubject: Subject<string> = new Subject();
  dialogRef: MatDialogRef<any> | null = null;
  showClearIcon: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: SnackbarService,
    private postService: PostService,
    private categoryService: CategoryService,
    private messageService: MessageService,
    private postEnumService: PostEnumService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        const message = this.messageService.getMessage();
        if (message) {
          this.snackBar.show(message);
        }
      });
  }
  PostStatus = this.postEnumService.getPostStatus();
  startDateDisplay: string = 'Start Date';
  endDateDisplay: string = 'End Date';

  ngOnInit(): void {
    this.getPosts();
    this.getCategories();

    this.searchSubject.pipe(debounceTime(300), untilDestroyed(this)).subscribe((keyword) => {
      this.keyword = keyword;
      this.updateUrl();
      this.getPosts();
    });
  }

  getPosts() {
    this.postService
      .getPostsForAdmin(
        this.keyword,
        this.selectedCategoryId,
        this.currentPage - 1,
        this.itemsPerPage,
        this.status,
        this.startDate ?? undefined,
        this.endDate ?? undefined,
      )
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
      )
      .subscribe({
        next: (response: ApiResponse<PostListResponse>) => {
          if (response.status === Status.OK) {
            if (response.data) {
              const newPosts = response.data.posts;
              if (!isEqual(this.posts, newPosts)) {
                this.posts = newPosts;
                this.totalPages = response.data.totalPages;
                this.cdr.markForCheck(); // Inform Angular to check for changes
              }
            }
          }
        },
      });
  }

  getCategories() {
    this.categoryService
      .getCategories()
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
      )
      .subscribe({
        next: (response: ApiResponse<Category[]>) => {
          if (response.status === Status.OK && response.data) {
            if (response.data) {
              const newCategories = response.data;
              if (!isEqual(this.categories, newCategories)) {
                this.categories = newCategories;
                this.cdr.markForCheck(); // Inform Angular to check for changes
              }
            }
          }
        },
        error: (error) => {
          this.cdr.markForCheck();
        },
      });
  }

  onPageChange(page: number) {
    if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateUrl();
      this.getPosts();
    }
  }

  onSearchEnter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.keyword = target.value;
    this.searchSubject.next(this.keyword);
    this.showClearIcon = this.keyword.length > 0;
  }

  clearSearch(event: Event): void {
    this.keyword = '';
    this.showClearIcon = false;
    const input = (event.target as HTMLElement).parentElement?.querySelector('.post-list-admin__search-input') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.focus();
      this.onSearchEnter({ target: input } as unknown as Event);
    }
    this.currentPage = 1;
    this.updateUrl();
    this.getPosts();
  }

  onFocusSearch(event: Event): void {
    this.showClearIcon = this.keyword.length > 0;
  }

  onBlurSearch(event: Event): void {
    if (this.keyword.length === 0) {
      this.showClearIcon = false;
    }
  }

  onStatusChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.status = selectElement.value as PostStatus | '';
    this.currentPage = 1;
    this.updateUrl();
    this.getPosts();
  }

  onCategoryChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedCategoryId = +selectElement.value;
    this.currentPage = 1;
    this.updateUrl();
    this.getPosts();
  }

  onSearchClick(): void {
    if (this.startDate && this.endDate && new Date(this.startDate) > new Date(this.endDate)) {
      this.snackBar.show('Start date must be earlier than end date.');
      return;
    }
    this.currentPage = 1;
    this.updateUrl();
    this.getPosts();
  }

  navigateToAddPost(): void {
    this.router.navigate(['/admin/add-post']);
  }

  navigateToPostDetail(slug: string) {
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      this.snackBar.show('Invalid slug');
      return;
    }
    this.router.navigate([`/blog/${slug}`]);
  }

  navigateToEditPost(postId: number) {
    if (postId) {
      this.router.navigate(['/admin/post-edit', postId]);
    } else {
      this.snackBar.show('Invalid post ID');
    }
  }

  deleteOrDisablePostDialog(id: number, isPermanent: boolean): void {
    if (id === null) {
      this.snackBar.show('Invalid post ID');
      return;
    }
    const dialogData: ConfirmDialogData = {
      title: isPermanent ? 'Confirm Delete' : 'Confirm Disable',
      message: isPermanent ? 'Are you sure you want to delete this post permanently?' : 'Are you sure you want to disable this post?',
      confirmText: isPermanent ? 'Delete' : 'Disable',
      cancelText: 'Cancel',
    };

    import('../shared/confirm-dialog/confirm-dialog.component').then(({ ConfirmDialogComponent }) => {
      this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: dialogData,
      });
      this.handleDialogResponse(this.dialogRef, id, isPermanent);
    });
  }

  private handleDialogResponse(dialogRef: MatDialogRef<ConfirmDialogComponent>, id: number, isPermanent: boolean): void {
    dialogRef
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (result) => {
          if (result) {
            this.postService
              .deleteOrDisablePost(id, isPermanent)
              .pipe(untilDestroyed(this))
              .subscribe({
                next: (response: ApiResponse<void>) => {
                  if (response.status === Status.OK) {
                    this.getPosts();
                    this.cdr.markForCheck();
                  }
                },
                error: (error) => {
                  this.snackBar.show('Failed to delete post');
                },
              });
          }
        },
      });
  }

  onFocusDate(field: 'startDate' | 'endDate', event: any): void {
    if (field === 'startDate' && !this.startDate) {
      this.startDateDisplay = ''; // Xóa placeholder khi focus
      event.target.type = 'date'; // Chuyển input sang kiểu date
    }

    if (field === 'endDate' && !this.endDate) {
      this.endDateDisplay = ''; // Xóa placeholder khi focus
      event.target.type = 'date'; // Chuyển input sang kiểu date
    }
  }

  onBlurDate(field: 'startDate' | 'endDate', event: any): void {
    if (field === 'startDate') {
      if (!event.target.value) {
        this.startDateDisplay = 'Start Date'; // Hiển thị lại placeholder khi blur
        event.target.type = 'text'; // Chuyển input lại kiểu text
      } else {
        this.startDate = event.target.value; // Lưu giá trị ngày đã chọn
      }
    }

    if (field === 'endDate') {
      if (!event.target.value) {
        this.endDateDisplay = 'End Date'; // Hiển thị lại placeholder khi blur
        event.target.type = 'text'; // Chuyển input lại kiểu text
      } else {
        this.endDate = event.target.value; // Lưu giá trị ngày đã chọn
      }
    }
  }

  clearDate() {
    if (this.startDate || this.endDate) {
      this.startDate = null;
      this.endDate = null;

      // Đặt lại placeholder
      this.startDateDisplay = 'Start Date';
      this.endDateDisplay = 'End Date';

      // Đặt lại kiểu input thành text để hiển thị placeholder
      const startDateInput = document.querySelector('input[placeholder="Start Date"]') as HTMLInputElement;
      const endDateInput = document.querySelector('input[placeholder="End Date"]') as HTMLInputElement;
      if (startDateInput) {
        startDateInput.type = 'text';
      }
      if (endDateInput) {
        endDateInput.type = 'text';
      }

      // Gọi API với các giá trị ngày bị xóa
      this.currentPage = 1;
      this.updateUrl();
      this.getPosts();
    }
  }

  trackByPostId(index: number, post: Post): number {
    return post.id;
  }

  updateUrl(): void {
    const queryParams: any = {
      keyword: this.keyword || undefined,
      category: this.selectedCategoryId || undefined,
      page: this.currentPage > 1 ? this.currentPage : undefined,
      status: this.status || undefined,
      startDate: this.startDate || undefined,
      endDate: this.endDate || undefined,
    };
    this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge' });
  }
}
