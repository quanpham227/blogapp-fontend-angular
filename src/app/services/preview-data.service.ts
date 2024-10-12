import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PreviewDataService {
  private post: any = null; // Lưu trữ bài viết tạm thời

  constructor() {}

  // Lưu bài viết vào PostService
  savePost(post: any): void {
    this.post = post; // Lưu dữ liệu vào service
    console.log('Post data saved:', this.post);
  }

  // Lấy bài viết từ PostService
  getPost(): any {
    return this.post; // Trả về bài viết đã lưu
  }

  // Xoá bài viết khỏi service
  clearPost(): void {
    this.post = null; // Xóa bài viết khỏi service
  }
}
