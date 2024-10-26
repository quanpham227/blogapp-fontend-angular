import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { Post } from '../../models/post';
import { PostService } from '../../services/post.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

import { CommentService } from '../../services/comment.service';
import { CommentResponse } from '../../models/comment';
import { ToastrService } from 'ngx-toastr';
import { TokenService } from '../../services/token.service';
import { ApiResponse } from '../../models/response';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  post: Post | null = null;
  postId: number = 0;
  errorMessage: string | null = null;
  private routeSub: Subscription | null = null;

  comments: CommentResponse[] = [];
  rootComments: CommentResponse[] = [];
  showAddCommentForm = false;
  replyFormVisibility: { [key: number]: boolean } = {};
  replyForms: { [key: number]: FormGroup } = {};
  editingComment: CommentResponse | null = null;

  newCommentForm: FormGroup;
  editCommentForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private titleService: Title,
    private metaService: Meta,
    private commentService: CommentService,
    private toastr: ToastrService,
    private authService: AuthService,
  ) {
    this.newCommentForm = new FormGroup({
      content: new FormControl(''),
    });

    this.editCommentForm = new FormGroup({
      content: new FormControl(''),
    });
  }

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      console.log('Nhận slug:', slug);
      if (slug) {
        this.getPostBySlug(slug);
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  async getPostBySlug(slug: string) {
    try {
      const response = await firstValueFrom(
        this.postService.getPostBySlug(slug),
      );
      if (response && response.data) {
        this.post = response.data;
        this.postId = this.post.id; // Lưu trữ postId
        this.errorMessage = null;
        console.log('Post details:', this.post);
        this.updateMetaTags(this.post);
        this.getCommentsByPostId(this.post.id); // Gọi phương thức lấy bình luận sau khi đã có postId
      } else {
        this.errorMessage = 'Invalid response structure';
        console.error('Invalid response structure:', response);
      }
    } catch (error) {
      this.errorMessage = 'Error fetching post details';
      console.error('Error fetching post details:', error);
      this.post = null;
    } finally {
      console.log('Post detail fetch complete');
    }
  }

  async getCommentsByPostId(postId: number): Promise<void> {
    if (postId) {
      try {
        const response = await firstValueFrom(
          this.commentService.getCommentsByPostId(postId),
        );
        if (response.status === 'OK') {
          this.comments = response.data;
          console.log('Comments:', this.comments);
          this.comments.forEach((comment) => {
            if (!this.replyForms[comment.id]) {
              this.replyForms[comment.id] = new FormGroup({
                content: new FormControl(''),
              });
            }
          });
          // Lọc các bình luận gốc
          this.rootComments = this.comments.filter(
            (comment) => !comment.parent_comment_id,
          );
        } else {
          this.toastr.error('Failed to load comments.');
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
        this.toastr.error('An error occurred while fetching comments.');
      }
    }
  }

  private updateMetaTags(post: Post) {
    if (!post.meta) {
      console.error('Meta information is missing in the post object');
      return;
    }

    this.titleService.setTitle(post.meta.meta_title || '');
    this.metaService.updateTag({
      name: 'description',
      content: post.meta.meta_description || '',
    });
    this.metaService.updateTag({
      name: 'keywords',
      content: post.tags.map((tag) => tag.name).join(', ') || '',
    });

    // Open Graph tags
    this.metaService.updateTag({
      property: 'og:title',
      content: post.meta.og_title || '',
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: post.meta.og_description || '',
    });
    this.metaService.updateTag({
      property: 'og:image',
      content: post.meta.og_image || '',
    });
    this.metaService.updateTag({
      property: 'og:url',
      content: post.meta.slug || '',
    });

    // Twitter Card tags
    this.metaService.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.metaService.updateTag({
      name: 'twitter:title',
      content: post.meta.og_title || '',
    });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: post.meta.og_description || '',
    });
    this.metaService.updateTag({
      name: 'twitter:image',
      content: post.meta.og_image || '',
    });

    // Schema Markup
    const schema = {
      '@context': 'http://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      image: post.thumbnail_url,
      author: {
        '@type': 'Person',
        name: post.author_name,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Your Site Name',
        logo: {
          '@type': 'ImageObject',
          url: 'URL_TO_YOUR_LOGO',
        },
      },
      datePublished: post.meta.created_at,
      description: post.excerpt,
    };
    this.metaService.updateTag({
      name: 'application/ld+json',
      content: JSON.stringify(schema),
    });
  }
  toggleReplyForm(commentId: number): void {
    if (!this.replyForms[commentId]) {
      this.replyForms[commentId] = new FormGroup({
        content: new FormControl(''),
      });
    }
    this.replyFormVisibility[commentId] = !this.replyFormVisibility[commentId];
    if (!this.replyFormVisibility[commentId]) {
      this.replyForms[commentId].reset();
    }
  }

  toggleCommentForm() {
    this.showAddCommentForm = !this.showAddCommentForm;
    if (!this.showAddCommentForm) {
      this.editingComment = null; // Đặt lại khi đóng form
      this.newCommentForm.reset(); // Đặt lại nội dung textarea
    }
  }

  addReply(commentId: number): void {
    const replyContent = this.replyForms[commentId].get('content')?.value;
    const userId = this.authService.getUser()?.id ?? 0;
    const parentCommentId = commentId;
    this.commentService
      .replyComment(commentId, userId, replyContent, parentCommentId)
      .subscribe({
        next: (response: ApiResponse<CommentResponse>) => {
          if (response.status === 'OK') {
            this.toastr.success(response.message);
            this.getCommentsByPostId(this.postId);
          } else {
            this.toastr.error(response.message);
          }
          this.toggleReplyForm(commentId);
        },
        error: (error: any) => {
          this.toastr.error('An error occurred while adding the reply.');
        },
      });
    ``;
  }

  addComment(): void {
    const userId = this.authService.getUser()?.id ?? 0;
    const content = this.newCommentForm.get('content')?.value;
    const postId = this.postId;
    console.log('Adding comment:', { userId, postId, content });
    this.commentService.addComment(this.postId, userId, content).subscribe({
      next: (response: ApiResponse<CommentResponse>) => {
        if (response.status === 'OK') {
          this.toastr.success('Comment added successfully.');
          this.getCommentsByPostId(this.postId);
        } else {
          this.toastr.error('Failed to add comment.');
        }
        this.toggleCommentForm();
      },
      error: (error: any) => {
        if (error.error && error.error.message) {
          this.toastr.error(error.error.message);
        } else {
          this.toastr.error('An error occurred while deleting the comment.');
        }
      },
    });
  }

  editComment(comment: CommentResponse): void {
    this.editingComment = comment;
    this.editCommentForm.setValue({ content: comment.content });
  }

  updateComment(): void {
    if (this.editingComment) {
      const userId = this.authService.getUser()?.id ?? 0;
      this.commentService
        .editComment(
          this.editingComment.id,
          userId,
          this.editCommentForm.get('content')?.value,
        )
        .subscribe({
          next: (response: ApiResponse<CommentResponse>) => {
            if (response.status === 'OK') {
              this.toastr.success('Comment updated successfully.');
              this.getCommentsByPostId(this.postId);
            } else {
              this.toastr.error('Failed to update comment.');
            }
            this.editingComment = null;
            this.editCommentForm.reset();
          },
          error: (error: any) => {
            if (error.error && error.error.message) {
              this.toastr.error(error.error.message);
            } else {
              this.toastr.error(
                'An error occurred while deleting the comment.',
              );
            }
          },
        });
    }
  }

  deleteComment(commentId: number): void {
    this.commentService.deleteComment(commentId).subscribe({
      next: (response: ApiResponse<void>) => {
        if (response.status === 'OK') {
          this.toastr.success(response.message);
          this.getCommentsByPostId(this.postId); // Refresh comments
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error: any) => {
        if (error.error && error.error.message) {
          this.toastr.error(error.error.message);
        } else {
          this.toastr.error('An error occurred while deleting the comment.');
        }
      },
    });
  }

  cancelEdit(): void {
    this.editingComment = null; // Đặt lại bình luận đang chỉnh sửa
    this.editCommentForm.reset(); // Đặt lại nội dung textarea của form chỉnh sửa
  }
}
