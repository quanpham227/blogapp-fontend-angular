import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Post } from '../../models/post';
import { PostService } from '../../services/post.service';
import { ApiResponse } from '../../models/response';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class BlogDetailComponent implements OnInit {
  post: Post | null = null;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.getPostDetail(slug);
      }
    });
  }

  getPostDetail(slug: string) {
    this.postService.getDetailPost(slug).subscribe({
      next: (response: ApiResponse<Post>) => {
        if (response && response.data) {
          this.post = response.data;
          console.log('Post details:', this.post);
        } else {
          console.error('Invalid response structure:', response);
        }
      },
      error: (error: any) => {
        console.error('Error fetching post details:', error);
        // Optionally, you can set this.post to null or show an error message in the UI
        this.post = null;
      },
      complete: () => {
        console.log('Post detail fetch complete');
      },
    });
  }
}
