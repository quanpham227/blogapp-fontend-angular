import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { takeUntil, map, tap } from 'rxjs/operators';
import { Post } from '../../models/post';
import { PostService } from '../../services/post.service';

import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Title, Meta, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommentService } from '../../services/comment.service';
import { CommentResponse } from '../../models/comment';
import { NotificationService } from '../../services/toastr.service';
import { ApiResponse } from '../../models/response';
import { AuthService } from '../../services/auth.service';

import { CommentComponent } from '../common/comment/comment.component';
import { ReplyCommentComponent } from '../common/comment-reply/comment-reply.component';
import { CommentFormComponent } from '../common/comment-form/comment-form.component';
import { noWhitespaceValidator } from '../../validators/validators'; // Adjust the import path accordingly
import { LoggingService } from '../../services/logging.service';
import { SuccessHandlerService } from '../../services/success-handler.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    CommentComponent,
    ReplyCommentComponent,
    CommentFormComponent,
  ],
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  post: Post | null = null;
  postId: number = 0;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  comments: CommentResponse[] = [];
  comments$: BehaviorSubject<CommentResponse[]> = new BehaviorSubject<CommentResponse[]>([]);
  rootComments$: Observable<CommentResponse[]> | undefined;
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
    private notificationService: NotificationService,
    public authService: AuthService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private loggingService: LoggingService,
    private successHandlerService: SuccessHandlerService,
    private confirmDialogService: ConfirmDialogService,
  ) {
    this.newCommentForm = new FormGroup({
      content: new FormControl('', [Validators.required, Validators.minLength(5), noWhitespaceValidator()]),
    });

    this.editCommentForm = new FormGroup({
      content: new FormControl('', [Validators.required, Validators.minLength(5), noWhitespaceValidator()]),
    });
  }

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const slug = params.get('slug');
      console.log('Nhận slug:', slug);
      if (slug) {
        this.initializeData(slug);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeData(slug: string) {
    this.getPostBySlug(slug);
    this.initializeComments();
  }

  private initializeComments() {
    this.commentService
      .getCommentsByPostId(this.postId)
      .pipe(
        map((response: ApiResponse<CommentResponse[]>) => {
          if (response.status === 'OK') {
            this.comments = response.data;
            this.comments$.next(response.data); // Emit the new value
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        tap((comments: CommentResponse[]) => {
          this.initializeReplyForms(comments);
          this.cdr.markForCheck(); // Ensure Angular checks and updates the view
        }),
      )
      .subscribe({
        error: (error) => {
          this.loggingService.logError('Error initializing comments:', error);
        },
      });

    this.rootComments$ = this.comments$.pipe(
      map((comments: CommentResponse[]) => comments.filter((comment) => !comment.parent_comment_id)),
    );
  }

  async getPostBySlug(slug: string) {
    try {
      const response = await firstValueFrom(this.postService.getPostBySlug(slug));
      if (response && response.data) {
        this.post = response.data;
        this.postId = this.post.id;
        console.log('Post details:', this.post);
        this.updateMetaTags(this.post);
        this.initializeComments(); // Gọi hàm để khởi tạo comments
        this.cdr.markForCheck();
      }
    } catch (error) {
      this.loggingService.logError('Error fetching post by slug:', error);
    }
  }

  private initializeReplyForms(comments: CommentResponse[]) {
    comments.forEach((comment) => {
      if (!this.replyForms[comment.id]) {
        this.replyForms[comment.id] = new FormGroup({
          content: new FormControl(''),
        });
      }
    });
  }

  private updateMetaTags(post: Post) {
    if (!post.meta) return;
    this.titleService.setTitle(post.meta.meta_title || '');
    this.updateMetaTag('description', post.meta.meta_description || '');
    this.updateMetaTag('keywords', post.tags.map((tag) => tag.name).join(', ') || '');

    // Open Graph tags
    this.updateMetaTag('og:title', post.meta.og_title || '', true);
    this.updateMetaTag('og:description', post.meta.og_description || '', true);
    this.updateMetaTag('og:image', post.meta.og_image || '', true);
    this.updateMetaTag('og:url', post.meta.slug || '', true);

    // Twitter Card tags
    this.updateMetaTag('twitter:card', 'summary_large_image');
    this.updateMetaTag('twitter:title', post.meta.og_title || '');
    this.updateMetaTag('twitter:description', post.meta.og_description || '');
    this.updateMetaTag('twitter:image', post.meta.og_image || '');

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
    this.updateMetaTag('application/ld+json', JSON.stringify(schema));
  }

  private updateMetaTag(name: string, content: string, isProperty: boolean = false) {
    if (isProperty) {
      this.metaService.updateTag({ property: name, content });
    } else {
      this.metaService.updateTag({ name, content });
    }
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
    if (!this.checkLoggedIn()) return;
    this.showAddCommentForm = !this.showAddCommentForm;
    if (!this.showAddCommentForm) {
      this.editingComment = null;
      this.newCommentForm.reset();
    }
  }

  addComment(): void {
    if (!this.checkLoggedIn()) return;
    const userId = this.authService.getUserId();
    const content = this.newCommentForm.get('content')?.value;
    const postId = this.postId;
    console.log('Adding comment:', { userId, postId, content });
    this.commentService.addComment(this.postId, userId, content).subscribe({
      next: (response: ApiResponse<CommentResponse>) => {
        if (response.status === 'OK' && response.data) {
          // Update the comments array immutably
          this.comments = [...this.comments, response.data];
          // Emit the new value
          this.comments$.next(this.comments);
          // Update the comment count
          if (this.post) {
            this.post.comment_count++;
          }
          // Trigger change detection manually
          this.cdr.markForCheck();
        }
        // Gọi phương thức để hiển thị thông báo thành công
        this.successHandlerService.handleApiResponse(response, 'Comment added successfully.');
        // Reset the form and toggle the comment form
        this.newCommentForm.reset();
        this.showAddCommentForm = false;
      },
      error: (error: any) => {
        this.loggingService.logError('Error adding comment:', error);
      },
    });
  }
  addReply(commentId: number): void {
    if (!this.checkLoggedIn()) return;
    const replyContent = this.replyForms[commentId].get('content')?.value;
    const userId = this.authService.getUserId();
    const parentCommentId = commentId;
    this.commentService.replyComment(commentId, userId, replyContent, parentCommentId).subscribe({
      next: (response: ApiResponse<CommentResponse>) => {
        if (response.status === 'OK' && response.data) {
          const parentCommentIndex = this.comments.findIndex((comment) => comment.id === commentId);
          if (parentCommentIndex !== -1) {
            const parentComment = this.comments[parentCommentIndex];
            const updatedReplies = [...(parentComment.replies || []), response.data];
            const updatedComment = {
              ...parentComment,
              replies: updatedReplies,
            };
            this.comments = [
              ...this.comments.slice(0, parentCommentIndex),
              updatedComment,
              ...this.comments.slice(parentCommentIndex + 1),
            ];
            // Emit the new value
            this.comments$.next(this.comments);
            // Update the comment count
            if (this.post) {
              this.post.comment_count++;
            }
            // Trigger change detection manually
            this.cdr.markForCheck();
          }
          this.successHandlerService.handleApiResponse(response, 'Reply added successfully.');
        }
        this.toggleReplyForm(commentId);
      },
      error: (error: any) => {
        this.loggingService.logError('Error adding reply:', error);
      },
    });
  }

  editComment(comment: CommentResponse): void {
    this.editingComment = comment;
    this.editCommentForm.setValue({ content: comment.content });
  }

  updateComment(): void {
    if (!this.checkLoggedIn()) return;
    if (this.editingComment) {
      const userId = this.authService.getUserId();
      this.commentService
        .editComment(this.editingComment.id, userId, this.editCommentForm.get('content')?.value)
        .subscribe({
          next: (response: ApiResponse<CommentResponse>) => {
            if (response.status === 'OK' && response.data) {
              const index = this.comments.findIndex((comment) => comment.id === this.editingComment!.id);
              if (index !== -1) {
                // Update the root comment immutably
                this.comments = [...this.comments.slice(0, index), response.data, ...this.comments.slice(index + 1)];
              } else {
                // Update the reply comment immutably
                this.comments = this.comments.map((comment) => {
                  if (comment.replies) {
                    const replyIndex = comment.replies.findIndex((reply) => reply.id === this.editingComment!.id);
                    if (replyIndex !== -1) {
                      const updatedReplies = [
                        ...comment.replies.slice(0, replyIndex),
                        response.data,
                        ...comment.replies.slice(replyIndex + 1),
                      ];
                      return { ...comment, replies: updatedReplies };
                    }
                  }
                  return comment;
                });
              }
              // Emit the new value
              this.comments$.next(this.comments);
              // Trigger change detection manually
              this.cdr.markForCheck();
            }
            this.successHandlerService.handleApiResponse(response, 'Comment updated successfully.');
            this.cancelEdit();
          },
          error: (error: any) => {
            this.loggingService.logError('Error updating comment:', error);
          },
        });
    }
  }

  deleteComment(commentId: number): void {
    if (!this.checkLoggedIn()) return;
    this.confirmDialogService.confirm('Xác nhận', 'Bạn có chắc chắn muốn xóa bình luận này?').subscribe((result) => {
      if (!result) {
        this.commentService.deleteComment(commentId).subscribe({
          next: (response: ApiResponse<void>) => {
            if (response.status === 'OK') {
              // Check if the comment to be deleted is a root comment
              const index = this.comments.findIndex((comment) => comment.id === commentId);
              if (index !== -1) {
                // Update the root comments array immutably
                this.comments = this.comments.filter((comment) => comment.id !== commentId);
              } else {
                // Update the reply comments immutably
                this.comments = this.comments.map((comment) => {
                  if (comment.replies) {
                    const replyIndex = comment.replies.findIndex((reply) => reply.id === commentId);
                    if (replyIndex !== -1) {
                      const updatedReplies = comment.replies.filter((reply) => reply.id !== commentId);
                      return { ...comment, replies: updatedReplies };
                    }
                  }
                  return comment;
                });
              }
              // Emit the new value
              this.comments$.next(this.comments);
              // Update the comment count
              if (this.post) {
                if (this.post.comment_count > 0) {
                  this.post.comment_count--;
                }
              }
              // Trigger change detection manually
              this.cdr.markForCheck();
            }
            this.successHandlerService.handleApiResponse(response, 'Comment deleted successfully.');
          },
          error: (error: any) => {
            this.loggingService.logError('Error deleting comment:', error);
          },
        });
      }
    });
  }

  cancelEdit(): void {
    this.editingComment = null;
    this.editCommentForm.reset();
  }

  trackByCommentId(index: number, comment: CommentResponse): number {
    return comment.id;
  }

  getSanitizedContent(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
  getFormattedDate(date: string): string {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  private checkLoggedIn(): boolean {
    if (!this.authService.isLoggedIn()) {
      this.notificationService.showWarning('Bạn cần đăng nhập để thực hiện hành động này.');
      return false;
    }
    return true;
  }
}
