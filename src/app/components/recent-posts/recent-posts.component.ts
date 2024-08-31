import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Post } from '../../models/post';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-recent-posts',
  templateUrl: './recent-posts.component.html',
  styleUrls: ['./recent-posts.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class RecentPostsComponent implements OnInit {
  recentPosts: Post[] = [];

  constructor(
    private postService: PostService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.getRecentPosts(4);
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

  // Hàm xử lý sự kiện khi sản phẩm được bấm vào
  onPostClick(slug: string) {
    debugger;
    // Điều hướng đến trang detail-blog với slug là tham số
    this.router.navigate(['/blog-detail', slug]);
  }
}
