import { Component, inject, Inject, OnInit } from '@angular/core';
import { PostService } from '../../../services/post.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Post } from '../../../models/post';
import { Category } from '../../../models/category';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbDateStruct, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CategoryService } from '../../../services/category.service';
import { ApiResponse } from '../../../models/response';
import { HttpErrorResponse } from '@angular/common/http';
import { PostStatus } from '../../../enums/post-status.enum';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-post-admin',
  templateUrl: './post.admin.component.html',
  styleUrls: ['./post.admin.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, NgbModule, RouterModule],
})
export class PostAdminComponent implements OnInit {
  posts: Post[] = [];
  selectedObjectType: string = '';
  categories: Category[] = [];
  selectedCategoryId: number = 0;
  currentPage: number = 1; // Sửa đổi để bắt đầu từ trang 1
  itemsPerPage: number = 12;
  pages: number[] = [];
  totalPages: number = 0;
  visiblePages: number[] = [];
  keyword: string = '';
  localStorage?: Storage;

  activeColumn: string = '';
  sortDirection: string = 'asc';

  months: string[] = [];
  totalPostCount: number = 0; // Biến lưu trữ tổng số lượng bài viết

  status: PostStatus | '' = '';
  createdAt: string | null = null;

  selectedPosts: Set<number> = new Set<number>(); // Set chứa ID của các bài viết đã chọn
  allPostsSelected: boolean = false; // Biến kiểm tra xem tất cả checkbox đã được chọn hay chưa

  constructor(
    private router: Router,
    private toast: ToastrService,
    private postService: PostService,
    private categoryService: CategoryService,
  ) {
    this.localStorage = document.defaultView?.localStorage;
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const navigation = this.router.getCurrentNavigation();
        const message = navigation?.extras?.state?.['message'];
        if (message) {
          this.toast.success(message);
        }
      });
  }

  counts: {
    PUBLISHED: number;
    DRAFT: number;
    DELETED: number;
    PENDING: number;
  } = { PUBLISHED: 0, DRAFT: 0, DELETED: 0, PENDING: 0 };

  postStatus = PostStatus;

  ngOnInit(): void {
    this.currentPage =
      Number(this.localStorage?.getItem('currentProductAdminPage')) || 1;
    this.getPosts(
      this.keyword,
      this.selectedCategoryId,
      this.currentPage - 1,
      this.itemsPerPage,
      this.status,
      this.createdAt ?? undefined,
    );
    this.getCategories();
    this.getPostCounts();
  }
  getCategories() {
    this.categoryService.getCategories().subscribe({
      next: (response: any) => {
        this.categories = response.data;
        console.log('Categories:', this.categories);
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      },
    });
  }

  getPosts(
    keyword: string,
    selectedCategoryId: number,
    page: number,
    limit: number,
    status?: '' | PostStatus,
    createdAt?: string,
  ) {
    this.postService
      .getPosts(keyword, selectedCategoryId, page, limit, status, createdAt)
      .subscribe({
        next: (response: any) => {
          this.posts = response.data.posts;
          this.totalPages = response.data.totalPages;
          this.visiblePages = this.generateVisiblePageArray(
            this.currentPage,
            this.totalPages,
          );
          console.log('Posts:', this.posts);
        },
        error: (error: any) => {
          console.error('Error fetching posts:', error);
        },
      });
  }

  onPageChange(page: number) {
    if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getPosts(
        this.keyword,
        this.selectedCategoryId,
        this.currentPage - 1,
        this.itemsPerPage,
        this.status,
        this.createdAt ?? undefined,
      );
    }
  }

  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5; // Số trang tối đa để hiển thị
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    // Điều chỉnh khi có ít trang hơn maxVisiblePages
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    // Chỉ trả về các trang trong khoảng hợp lệ
    return new Array(endPage - startPage + 1)
      .fill(0)
      .map((_, index) => startPage + index);
  }
  onKeywordChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.keyword = target.value;
    console.log('Keyword:', this.keyword);
    this.getPosts(
      this.keyword,
      this.selectedCategoryId,
      this.currentPage - 1,
      this.itemsPerPage,
      this.status,
      this.createdAt ?? undefined,
    );
  }

  onStatusChange(status: PostStatus | '') {
    this.status = status;
    this.filterPosts(
      this.status,
      this.createdAt ?? undefined,
      this.selectedCategoryId,
    );
    console.log('Status:', this.status);
  }

  onDateChange(date: NgbDateStruct) {
    if (date) {
      this.createdAt = `${date.year}-${('0' + date.month).slice(-2)}`;
      this.filterPosts(this.status, this.createdAt, this.selectedCategoryId);
    } else {
      this.clearDate();
    }
  }
  clearDate() {
    if (this.createdAt !== null && this.createdAt !== '') {
      this.createdAt = null;
      this.filterPosts(
        this.status,
        this.createdAt ?? undefined,
        this.selectedCategoryId,
      );
      console.log('Date cleared');
    } else {
      console.log('Date is already cleared or not set');
    }
  }

  onCategoryChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedCategoryId = +target.value;
    this.filterPosts(
      this.status,
      this.createdAt ?? undefined,
      this.selectedCategoryId,
    );
  }

  filterPosts(
    status: '' | PostStatus,
    createdAt?: string,
    categoryId?: number,
  ) {
    this.status = status;
    this.createdAt = createdAt || '';
    this.selectedCategoryId =
      categoryId !== undefined ? categoryId : this.selectedCategoryId;
    this.getPosts(
      this.keyword,
      this.selectedCategoryId,
      this.currentPage - 1,
      this.itemsPerPage,
      this.status,
      this.createdAt,
    );
  }
  navigateToAddPost(): void {
    this.router.navigate(['/admin/add-post']);
  }
  navigateToEditPost(postId: number) {
    if (postId) {
      this.router.navigate(['/admin/post-edit', postId]);
    } else {
      this.toast.error('Invalid post ID');
    }
  }

  deletePost(postId: number) {
    console.log('Deleting post:', postId);
  }
  viewPost(postId: number) {
    console.log(postId);
  }
  // Phương thức sắp xếp bài viết theo cột
  sortPostsBy(column: keyof Post) {
    if (this.activeColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.activeColumn = column;
      this.sortDirection = 'asc';
    }

    this.posts.sort((a, b) => {
      let comparison = 0;
      if (a[column] > b[column]) {
        comparison = 1;
      } else if (a[column] < b[column]) {
        comparison = -1;
      }
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }
  // Phương thức chọn hoặc bỏ chọn tất cả bài viết
  selectAllPosts = (event: any) => {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.posts.forEach((post) => this.selectedPosts.add(post.id)); // Chọn tất cả bài viết
    } else {
      this.selectedPosts.clear(); // Bỏ chọn tất cả bài viết
    }
    this.allPostsSelected = isChecked; // Cập nhật trạng thái checkbox tổng
  };

  // Phương thức chọn hoặc bỏ chọn một bài viết
  selectPost(postId: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.selectedPosts.add(postId);
    } else {
      this.selectedPosts.delete(postId);
    }
    this.updateAllPostsSelectedState(); // Kiểm tra lại trạng thái của checkbox tổng
  }

  // Cập nhật trạng thái của checkbox "chọn tất cả" dựa trên số lượng checkbox đã chọn
  updateAllPostsSelectedState() {
    this.allPostsSelected = this.posts.length === this.selectedPosts.size;
  }
  getPostCounts() {
    this.postService.countPostsByStatus().subscribe({
      next: (
        response: ApiResponse<{
          [key in PostStatus]: number;
        }>,
      ) => {
        this.counts = response.data; // Lưu trữ số lượng bài viết vào biến counts
        console.log('Post counts:', this.counts);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching post counts:', error);
      },
    });
  }
}
