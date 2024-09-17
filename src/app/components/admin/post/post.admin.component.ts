import { Component, inject, Inject, OnInit } from '@angular/core';
import { PostService } from '../../../services/post.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Post } from '../../../models/post';
import { Category } from '../../../models/category';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-admin',
  templateUrl: './post.admin.component.html',
  styleUrls: ['./post.admin.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class PostAdminComponent implements OnInit {
  posts: Post[] = [];
  categories: Category[] = [];
  selectedCategoryId: number = 0;
  currentPage: number = 1; // Sửa đổi để bắt đầu từ trang 1
  itemsPerPage: number = 12;
  pages: number[] = [];
  totalPages: number = 0;
  visiblePages: number[] = [];
  keyword: string = '';
  localStorage?: Storage;

  private postService = inject(PostService);
  private router = inject(Router);
  // private location = inject(Location);

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.localStorage = document.defaultView?.localStorage;
  }

  ngOnInit(): void {
    this.currentPage =
      Number(this.localStorage?.getItem('currentProductAdminPage')) || 1;
    this.getPosts(
      this.keyword,
      this.selectedCategoryId,
      this.currentPage - 1,
      this.itemsPerPage,
    );
  }
  getPosts(
    keyword: string,
    selectedCategoryId: number,
    page: number,
    limit: number,
  ) {
    this.postService
      .getPosts(keyword, selectedCategoryId, page, limit)
      .subscribe({
        next: (response: any) => {
          this.posts = response.data.posts;
          this.totalPages = response.data.totalPages;
          this.visiblePages = this.generateVisiblePageArray(
            this.currentPage,
            this.totalPages,
          );
        },
        error: (error: any) => {
          console.error('Error fetching posts:', error);
        },
      });
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getPosts(
        this.keyword,
        this.selectedCategoryId,
        this.currentPage - 1,
        this.itemsPerPage,
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
}
