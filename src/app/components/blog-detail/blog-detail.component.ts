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
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      console.log('Slug:', slug);
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
          this.errorMessage = null;
          console.log('Post details:', this.post);
        } else {
          this.errorMessage = 'Invalid response structure';
          console.error('Invalid response structure:', response);
        }
      },
      error: (error: any) => {
        this.errorMessage = 'Error fetching post details';
        console.error('Error fetching post details:', error);
        this.post = null;
      },
      complete: () => {
        console.log('Post detail fetch complete');
      },
    });
  }
}
