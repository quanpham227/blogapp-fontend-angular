import { Component, OnDestroy, OnInit } from '@angular/core';
import { PreviewDataService } from '../../services/preview-data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-preview.admin.component.html',
  styleUrls: ['./post-preview.admin.component.scss'],
})
export class PostPreviewAdminComponent implements OnInit, OnDestroy {
  post: any = {};

  constructor(private previewDataService: PreviewDataService) {}

  ngOnInit() {
    if (this.isBrowser()) {
      const postData = localStorage.getItem('postPreviewData');
      if (postData) {
        this.post = JSON.parse(postData);
        console.log('Post data preview:', this.post); // Kiểm tra dữ liệu sau khi lấy
      } else {
        console.error('No post data found in localStorage');
      }

      // Lắng nghe sự kiện beforeunload để xóa dữ liệu khi tab được đóng
      window.addEventListener('beforeunload', this.handleBeforeUnload);
    }
  }

  ngOnDestroy() {
    if (this.isBrowser()) {
      // Xóa sự kiện trước khi component bị hủy
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
      // Xóa dữ liệu khi component bị hủy
      this.clearLocalStorage();
    }
  }

  handleBeforeUnload = (event: BeforeUnloadEvent) => {
    this.clearLocalStorage();
  };

  clearLocalStorage() {
    if (this.isBrowser()) {
      localStorage.removeItem('postPreviewData');
      console.log('postPreviewData removed from localStorage');
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
