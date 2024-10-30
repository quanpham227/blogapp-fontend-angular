import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Category } from '../../models/category';
import { Post } from '../../models/post';
import { ApiResponse } from '../../models/response';
import { CategoryService } from '../../services/category.service';
import { PostService } from '../../services/post.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BlogStateService } from '../../services/blog-state.service';
import { HttpStatusService } from '../../services/http-status.service';
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CommonModule, NgbPaginationModule, ReactiveFormsModule, NgbModule],
})
export class BlogComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  recentPosts: Post[] = [];
  categories: Category[] = [];
  selectedCategorySlug: string = '';
  selectedTagSlug: string = '';
  currentPage: number = 1; // Sửa đổi để bắt đầu từ trang 1
  itemsPerPage: number = 10;
  totalPages: number = 0;
  searchForm: FormGroup;
  renderCount: number = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private postService: PostService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private blogStateService: BlogStateService,
    private httpStatusService: HttpStatusService,
    private loggingService: LoggingService,
  ) {
    this.searchForm = this.fb.group({
      keyword: [''],
      categorySlug: [''],
      page: [1],
    });
  }

  ngOnInit() {
    this.restoreState();
    this.subscribeToRouteParamsAndQueryParams();
    this.getCategories();
    this.getRecentPosts(1, 5);
  }

  ngOnDestroy() {
    this.saveState();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToRouteParamsAndQueryParams() {
    combineLatest([this.route.params, this.route.queryParams])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, queryParams]) => {
        this.handleRouteAndQueryParams(params, queryParams);
      });
  }

  private handleRouteAndQueryParams(params: any, queryParams: any) {
    const keyword =
      params['keyword'] || queryParams['keyword']
        ? (params['keyword'] || queryParams['keyword']).replace(/-/g, ' ')
        : '';
    const categorySlug = params['categorySlug'] || queryParams['categorySlug'] || '';
    const page = params['page'] || queryParams['page'] || 1;

    this.updateFormAndSlug(keyword, categorySlug);
    this.currentPage = page;
    this.itemsPerPage = 10;
    this.getPosts();
  }

  searchPosts() {
    this.currentPage = 1;
    this.selectedCategorySlug = '';
    this.updateQueryParams();
    this.getPosts();
  }

  resetSearch() {
    this.searchForm.reset();
    this.currentPage = 1;
    this.updateQueryParams();
    this.getPosts();
  }

  getPosts() {
    console.log('getPosts called');
    const keyword = this.searchForm.get('keyword')?.value || '';
    this.getPostsForUser(keyword, this.selectedCategorySlug, this.currentPage, this.itemsPerPage);
  }

  getPostsForUser(keyword: string, categorySlug: string, page: number, limit: number) {
    this.postService.getPostsForUser(keyword, categorySlug, page - 1, limit).subscribe({
      next: (response: any) => {
        const data = response.data;
        console.log('Data:', data);
        this.posts = response.data.posts;
        this.totalPages = response.data.totalPages;
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        this.loggingService.logError('Error fetching posts for user:', error);
      },
    });
  }
  getCategories() {
    this.categoryService.getCategories().subscribe({
      next: (response: ApiResponse<Category[]>) => {
        if (response.data !== this.categories) {
          this.categories = response.data;
          this.cdr.markForCheck();
        }
      },
      error: (error: any) => {
        this.loggingService.logError('Error fetching categories:', error);
      },
    });
  }

  getRecentPosts(page: number, limit: number) {
    this.postService.getRecentPosts(page, limit).subscribe({
      next: (response: any) => {
        if (response.data.posts !== this.recentPosts) {
          this.recentPosts = response.data.posts;
          this.cdr.markForCheck();
        }
      },
      error: (error: any) => {
        this.loggingService.logError('Error fetching recent posts:', error);
        // Không cần hiển thị thông báo lỗi vì đã được xử lý bởi HttpInterceptor
      },
    });
  }

  onPageChange(page: number) {
    if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getPosts(); // Call getPosts to fetch the posts for the new page
    }
  }

  onCategorySelect(slug: string) {
    this.selectedCategorySlug = this.selectedCategorySlug === slug ? '' : slug;
    this.searchForm.reset();
    this.selectedTagSlug = '';
    this.currentPage = 1;
    this.updateQueryParams();
    this.getPosts();
  }

  onPostClick(slug: string) {
    // Kiểm tra tính hợp lệ của slug
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      console.error('Invalid slug');
      alert('Slug không hợp lệ. Vui lòng thử lại.');
      return;
    }

    // Kiểm tra trạng thái của ứng dụng (ví dụ: không có yêu cầu HTTP đang chờ xử lý)
    if (this.isRequestPending()) {
      console.error('Request pending');
      alert('Vui lòng đợi yêu cầu hiện tại hoàn thành.');
      return;
    }

    // Nếu tất cả các điều kiện đều thỏa mãn, thực hiện điều hướng
    this.router.navigate([`/blog/${slug}`]);
  }

  isRequestPending(): boolean {
    let isPending = false;
    this.httpStatusService.pendingRequests$.subscribe((status) => {
      isPending = status;
    });
    return isPending;
  }

  updateQueryParams(): void {
    let url = '/blog';
    const keyword = this.formatKeyword(this.searchForm.get('keyword')?.value || '');
    const categorySlug = this.selectedCategorySlug;

    url = this.buildUrl(url, keyword, categorySlug);

    this.router.navigate([url], {
      queryParamsHandling: 'merge',
      replaceUrl: true,
      skipLocationChange: false,
    });
  }

  limitWords(event: any, maxWords: number, maxChars: number) {
    let value = event.target.value;

    let wordCount = value.trim().split(/\s+/).length;
    if (wordCount > maxWords) {
      value = value.trim().split(/\s+/).slice(0, maxWords).join(' ');
    }

    if (value.length > maxChars) {
      value = value.slice(0, maxChars);
    }

    event.target.value = value;
  }

  private updateFormAndSlug(keyword: string, categorySlug: string) {
    if (keyword) {
      this.searchForm.patchValue({ keyword });
    } else if (categorySlug) {
      this.selectedCategorySlug = categorySlug;
    }
  }

  private formatKeyword(keyword: string): string {
    return keyword.trim().replace(/\s+/g, '-');
  }

  private buildUrl(baseUrl: string, keyword: string, categorySlug: string): string {
    if (keyword) {
      baseUrl += `/search/${keyword}`;
    } else if (categorySlug) {
      baseUrl += `/category/${categorySlug}`;
    }

    if (this.currentPage > 1) {
      baseUrl += `/page/${this.currentPage}`;
    }

    return baseUrl;
  }

  private saveState() {
    this.blogStateService.setCurrentCategory(this.selectedCategorySlug);
    this.blogStateService.setCurrentKeyword(this.searchForm.get('keyword')?.value || '');
    this.blogStateService.setCurrentPage(this.currentPage);
  }

  private restoreState() {
    this.selectedCategorySlug = this.blogStateService.getCurrentCategory();
    this.searchForm.patchValue({
      keyword: this.blogStateService.getCurrentKeyword(),
    });
    this.currentPage = this.blogStateService.getCurrentPage();
  }

  trackByFn(_index: number, post: Post) {
    return post.id;
  }
}
