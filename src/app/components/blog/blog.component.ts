import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ElementRef,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiResponse } from '../../models/response';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category.service';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post';
import { HttpStatusService } from '../../services/http-status.service';
import { PostListResponse } from '../../responses/post/post-list-response';
import isEqual from 'lodash-es/isEqual';
import { NgSelectModule } from '@ng-select/ng-select';
import { combineLatest, Subscription } from 'rxjs';
import { BlogStateService } from '../../services/blog-state.service';
import { gsap } from 'gsap';
import { LazyLoadDirective } from '../../directives/lazy-load.directive';
import { distinctUntilChanged, tap, catchError, map } from 'rxjs/operators';
import { Title, Meta } from '@angular/platform-browser';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SnackbarService } from '../../services/snackbar.service';
import { CustomPaginationComponent } from '../common/custom-pagination/custom-pagination.component';

@UntilDestroy()
@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    CommonModule,
    MatPaginatorModule,
    CustomPaginationComponent,
    ReactiveFormsModule,
    NgSelectModule,
    LazyLoadDirective,
  ],
})
export class BlogComponent implements OnInit {
  @ViewChildren('articleCard') articleCards!: QueryList<ElementRef>;

  categories: Category[] = [];
  articles: Post[] = [];
  selectedCategorySlug: string = '';
  selectedCategoryName: string = '';
  currentPage: number = 1; // Sửa đổi để bắt đầu từ trang 1
  itemsPerPage: number = 6;
  totalPages: number = 0;
  searchForm: FormGroup;
  showClearIcon: boolean = false;
  showDropdown: boolean = false;
  private routeSub: Subscription | undefined;

  constructor(
    private postService: PostService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private httpStatusService: HttpStatusService,
    private cdr: ChangeDetectorRef,
    private blogStateService: BlogStateService,
    private titleService: Title,
    private metaService: Meta,
    private snackBarService: SnackbarService,
  ) {
    this.searchForm = this.fb.group({
      keyword: [''],
      categorySlug: [null],
      selectedCategoryName: [''],
      page: [1],
    });
  }

  ngOnInit() {
    console.log('Component ngOnInit');
    this.getCategories();
    combineLatest([this.route.params, this.route.queryParams])
      .pipe(
        untilDestroyed(this),
        map(([params, queryParams]) => {
          const categorySlug = params['categorySlug'];
          const keyword = params['keyword'];
          const page = params['page'] ? +params['page'] : 1; // Lấy page từ URL
          return { categorySlug, keyword, page };
        }),
      )
      .subscribe(({ categorySlug, keyword, page }) => {
        if (categorySlug) {
          this.updateFormValues({ categorySlug, selectedCategoryName: this.getCategoryNameBySlug(categorySlug) });
        } else if (keyword) {
          this.updateFormValues({ keyword });
        }

        this.currentPage = page; // Cập nhật giá trị currentPage từ URL
        this.blogStateService.setCurrentPage(page);
        this.getPosts();
        this.toggleClearIcon();
        this.updateMetaTags(); // Cập nhật meta tags
      });

    this.blogStateService.categories$.pipe(untilDestroyed(this)).subscribe((categories) => {
      this.categories = categories;
      this.cdr.markForCheck();
    });

    this.blogStateService.articles$.pipe(untilDestroyed(this)).subscribe((articles) => {
      this.articles = articles;
      this.cdr.markForCheck();
      this.animateArticles();
    });

    this.blogStateService.selectedCategorySlug$.pipe(untilDestroyed(this)).subscribe((slug) => {
      this.selectedCategorySlug = slug;
      this.cdr.markForCheck();
    });

    this.blogStateService.selectedCategoryName$.pipe(untilDestroyed(this)).subscribe((name) => {
      this.selectedCategoryName = name;
      this.cdr.markForCheck();
    });

    this.blogStateService.currentPage$.pipe(untilDestroyed(this)).subscribe((page) => {
      this.currentPage = page;
      this.cdr.markForCheck();
    });

    this.blogStateService.totalPages$.pipe(untilDestroyed(this)).subscribe((totalPages) => {
      this.totalPages = totalPages;
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedCategorySlug'] || changes['currentPage']) {
      this.getPosts();
    }
  }

  getCategoryNameBySlug(slug: string): string {
    const category = this.categories.find((cat) => cat.code === slug);
    return category ? category.name : '';
  }

  searchPosts() {
    const keyword = this.formatKeyword(this.searchForm.get('keyword')?.value.trim());
    if (keyword) {
      this.navigateToRoute(['/blog/search', keyword]);
    } else {
      this.navigateToRoute(['/blog']);
    }
    this.toggleClearIcon();
  }

  getPosts() {
    const keyword = this.searchForm.get('keyword')?.value || '';
    const categorySlug = this.searchForm.get('categorySlug')?.value || '';
    this.getPostsForUser(keyword, categorySlug, this.currentPage, this.itemsPerPage);
  }

  getPostsForUser(keyword: string, categorySlug: string, page: number, limit: number) {
    console.log('Calling getPostsForUser with:', {
      keyword,
      categorySlug,
      page,
      limit,
    });
    this.postService
      .getPostsForUser(keyword, categorySlug, page - 1, limit)
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
        tap((response: ApiResponse<PostListResponse>) => {
          if (response.status == 'OK' && response.data.posts) {
            const newPosts = response.data.posts;
            if (!isEqual(this.articles, newPosts)) {
              this.blogStateService.setArticles(newPosts);
              this.blogStateService.setTotalPages(response.data.totalPages);
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

  getCategories() {
    this.categoryService
      .getCategories()
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
        tap((response: ApiResponse<Category[]>) => {
          if (response.status === 'OK' && response.data) {
            console.log('Categories:', response.data);
            if (!isEqual(this.categories, response.data)) {
              this.blogStateService.setCategories(response.data);
            }
          }
        }),
        catchError((error) => {
          console.error('Error fetching categories:', error);
          return [];
        }),
      )
      .subscribe();
  }

  onCategorySelect(event: any) {
    if (event) {
      const code = event.code || event;
      const name = event.name || this.getCategoryNameBySlug(code);
      if (this.selectedCategorySlug !== code) {
        this.updateFormValues({ categorySlug: code, selectedCategoryName: name });
        this.blogStateService.setSelectedCategorySlug(code);
        this.blogStateService.setSelectedCategoryName(name);
        this.currentPage = 1;
        this.showDropdown = false;
        this.navigateToRoute(['/blog/category', code]);
      }
    } else {
      this.clearCategory();
    }
  }

  clearCategory() {
    this.updateFormValues({ categorySlug: '', selectedCategoryName: '' });
    this.blogStateService.setSelectedCategorySlug('');
    this.blogStateService.setSelectedCategoryName('');
    this.currentPage = 1;
    this.navigateToRoute(['/blog']);
  }

  onPageChange(page: number) {
    if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.blogStateService.setCurrentPage(page);

      const { keyword, categorySlug } = this.searchForm.value;

      const route =
        page === 1
          ? categorySlug
            ? ['/blog/category', categorySlug]
            : keyword
              ? ['/blog/search', this.formatKeyword(keyword)]
              : ['/blog']
          : categorySlug
            ? ['/blog/category', categorySlug, 'page', page]
            : keyword
              ? ['/blog/search', this.formatKeyword(keyword), 'page', page]
              : ['/blog/page', page];

      this.navigateToRoute(route);
    }
  }

  onPostClick(slug: string) {
    // Kiểm tra tính hợp lệ của slug
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      this.snackBarService.show('Invalid slug');
      return;
    }

    // Kiểm tra trạng thái của ứng dụng (ví dụ: không có yêu cầu HTTP đang chờ xử lý)
    if (this.isRequestPending()) {
      this.snackBarService.show('Vui lòng đợi yêu cầu hiện tại hoàn thành.');
      return;
    }
    // Nếu tất cả các điều kiện đều thỏa mãn, thực hiện điều hướng
    this.navigateToRoute([`/blog/${slug}`]);
  }

  isRequestPending(): boolean {
    let isPending = false;
    this.httpStatusService.pendingRequests$.pipe(untilDestroyed(this)).subscribe((status) => {
      isPending = status;
    });
    return isPending;
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  limitWords(event: any, maxWords: number, maxChars: number): void {
    let input = event.target.value;
    let words = input.split(/\s+/).filter(Boolean); // Split input into words and remove extra spaces
    let truncatedWords: string[] = [];
    let charCount = 0;

    for (let word of words) {
      if (truncatedWords.length >= maxWords || charCount + word.length > maxChars) break;
      truncatedWords.push(word);
      charCount += word.length + 1; // Add 1 for space
    }

    event.target.value = truncatedWords.join(' ').trim();
  }

  private formatKeyword(keyword: string): string {
    return keyword.trim().replace(/\s+/g, '-');
  }

  toggleClearIcon() {
    const keywordControl = this.searchForm.get('keyword');
    this.showClearIcon = !!(keywordControl && keywordControl.value.length > 0);
  }

  resetSearch() {
    this.searchForm.reset({
      keyword: '',
      categorySlug: null,
      selectedCategoryName: '',
      page: 1,
    });
    this.showClearIcon = false;
    this.navigateToRoute(['/blog']);
  }
  trackByPost(index: number, post: Post): number {
    return post.id; // Giả sử mỗi bài viết có thuộc tính id duy nhất
  }

  private updateFormValues(values: { [key: string]: any }) {
    this.searchForm.patchValue(values);
  }

  private animateArticles() {
    if (this.articleCards && this.articleCards.length > 0) {
      this.articleCards.forEach((articleCard, index) => {
        gsap.from(articleCard.nativeElement, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          delay: index * 0.1,
          ease: 'power1.out',
        });
      });
    }
  }

  private navigateToRoute(route: any[]) {
    this.router.navigate(route);
  }

  private updateMetaTags() {
    this.titleService.setTitle('PI VINA DANANG - BLOG');
    this.metaService.updateTag({ name: 'description', content: 'This is the blog page of My Website.' });
    this.metaService.updateTag({ name: 'keywords', content: 'blog, articles, posts' });
    this.metaService.updateTag({ property: 'og:title', content: 'Blog - My Website' });
    this.metaService.updateTag({ property: 'og:description', content: 'This is the blog page of My Website.' });
    this.metaService.updateTag({ property: 'og:image', content: 'URL_TO_YOUR_IMAGE' });
    this.metaService.updateTag({ property: 'og:url', content: this.router.url });
  }
}
