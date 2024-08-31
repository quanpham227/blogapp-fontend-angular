import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../../models/category';
import { Post } from '../../models/post';
import { ApiResponse } from '../../models/response';
import { CategoryService } from '../../services/category.service';
import { PostService } from '../../services/post.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class BlogComponent implements OnInit {
  posts: Post[] = [];
  recentPosts: Post[] = [];
  categories: Category[] = []; // Dữ liệu động từ categoryService
  selectedCategoryId: number = 0; // Giá trị category được chọn
  currentPage: number = 0;
  itemsPerPage: number = 12;
  pages: number[] = [];
  totalPages: number = 0;
  visiblePages: number[] = [];
  keyword: string = '';

  constructor(
    private postService: PostService,
    private categoryService: CategoryService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.getPosts(
      this.keyword,
      this.selectedCategoryId,
      this.currentPage,
      this.itemsPerPage,
    );
    this.getCategories();
    this.getRecentPosts(5); // Fetch 5 recent posts
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getCategories() {
    this.categoryService.getCategories().subscribe({
      next: (response: ApiResponse<Category[]>) => {
        this.categories = response.data;
      },
      complete: () => {},
      error: (error: any) => {
        console.error('Error fetching categories:', error);
      },
    });
  }

  searchPosts() {
    this.currentPage = 0;
    this.itemsPerPage = 12;
    this.selectedCategoryId = 0;
    debugger;
    this.getPosts(
      this.keyword,
      this.selectedCategoryId,
      this.currentPage,
      this.itemsPerPage,
    );
  }

  getPosts(
    keyword: string,
    selectedCategoryId: number,
    page: number,
    limit: number,
  ) {
    debugger;
    this.postService
      .getPosts(keyword, selectedCategoryId, page, limit)
      .subscribe({
        next: (response: any) => {
          debugger;
          this.posts = response.posts;
          console.log(response.posts);
          this.totalPages = response.totalPages;
          this.visiblePages = this.generateVisiblePageArray(
            this.currentPage,
            this.totalPages,
          );
        },
        complete: () => {
          debugger;
        },
        error: (error: any) => {
          debugger;
          console.error('Error fetching posts:', error);
        },
      });
  }

  getRecentPosts(limit: number) {
    this.postService.getRecentPosts(limit).subscribe({
      next: (response: any) => {
        debugger;

        this.recentPosts = response.posts;
        console.log('recent post', response.posts);
      },
      complete: () => {},
      error: (error: any) => {
        console.error('Error fetching recent posts:', error);
      },
    });
  }

  onPageChange(page: number) {
    debugger;
    this.currentPage = page;
    this.getPosts(
      this.keyword,
      this.selectedCategoryId,
      this.currentPage,
      this.itemsPerPage,
    );
  }

  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return new Array(endPage - startPage + 1)
      .fill(0)
      .map((_, index) => startPage + index);
  }

  // Hàm xử lý sự kiện khi sản phẩm được bấm vào
  onPostClick(slug: string) {
    debugger;
    // Điều hướng đến trang detail-blog với slug là tham số
    this.router.navigate(['/blog-detail', slug]);
  }

  onCategorySelect(categoryId: number | null): void {
    if (categoryId === null) {
      // Xử lý trường hợp categoryId là null nếu cần
      console.error('Category ID is null');
      return;
    }

    this.selectedCategoryId = categoryId;
    this.currentPage = 1;
    this.getPosts(
      this.keyword,
      this.selectedCategoryId,
      this.currentPage,
      this.itemsPerPage,
    );
  }
}
