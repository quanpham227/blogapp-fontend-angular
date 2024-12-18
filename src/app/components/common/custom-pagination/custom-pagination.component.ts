import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-custom-pagination',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './custom-pagination.component.html',
  styleUrls: ['./custom-pagination.component.scss'],
})
export class CustomPaginationComponent implements OnInit, OnChanges {
  @Input() totalPages!: number; // Tổng số trang
  @Input() currentPage: number = 1; // Trang hiện tại
  @Output() pageChange = new EventEmitter<number>(); // Sự kiện đổi trang

  pages: number[] = [];
  showEllipsisAfter = false;

  ngOnInit() {
    this.calculatePages();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['totalPages'] || changes['currentPage']) {
      this.calculatePages();
    }
  }

  calculatePages() {
    this.pages = [];
    const maxVisiblePages = 5; // Số trang hiển thị

    if (this.totalPages <= maxVisiblePages) {
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    } else {
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);

      this.pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      this.showEllipsisAfter = end < this.totalPages;
    }
  }

  goToPage(page: number) {
    if (page !== this.currentPage) {
      this.currentPage = page;
      this.pageChange.emit(page);
      this.calculatePages();
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToNextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }
}
