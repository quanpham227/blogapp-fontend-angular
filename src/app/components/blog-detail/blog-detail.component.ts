import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Observable, BehaviorSubject, firstValueFrom } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Post } from '../../models/post';
import { PostService } from '../../services/post.service';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Title, Meta, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommentService } from '../../services/comment.service';
import { CommentResponse } from '../../models/comment';
import { ApiResponse } from '../../models/response';
import { AuthService } from '../../services/auth.service';
import { CommentFormComponent } from '../common/comment-form/comment-form.component';
import { noWhitespaceValidator } from '../../validators/validators'; // Adjust the import path accordingly
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ToasterService } from '../../services/toaster.service';
import { NgxSpinnerModule } from 'ngx-spinner';

@UntilDestroy()
@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule, CommentFormComponent, NgxSpinnerModule],
})
export class BlogDetailComponent implements OnInit {
  newCommentForm: FormGroup;
  post: Post | null = null;
  postId: number = 0;
  comments: CommentResponse[] = [];
  comments$: BehaviorSubject<CommentResponse[]> = new BehaviorSubject<CommentResponse[]>([]);
  rootComments$: Observable<CommentResponse[]> | undefined;
  showAddCommentForm = false;
  replyFormVisibility: { [key: number]: boolean } = {};
  replyForms: { [key: number]: FormGroup } = {};
  hasMoreComments = true;
  currentPage = 0;
  pageSize = 10;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private titleService: Title,
    private metaService: Meta,
    private commentService: CommentService,
    public authService: AuthService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private toast: ToasterService,
    private fb: FormBuilder,
  ) {
    this.newCommentForm = this.createCommentForm();
  }

  private createCommentForm(): FormGroup {
    return this.fb.group({
      content: [
        '',
        [Validators.required, Validators.minLength(5), Validators.maxLength(1000), noWhitespaceValidator()],
      ],
    });
  }

  ngOnInit() {
    this.route.paramMap.pipe(untilDestroyed(this)).subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this.initializeData(slug);
      }
    });
  }

  private initializeData(slug: string) {
    this.getPostBySlug(slug);
    this.initializeComments(0, 10);
  }

  async getPostBySlug(slug: string) {
    try {
      const response = await firstValueFrom(this.postService.getPostBySlug(slug));
      if (response.status === 'OK' && response.data) {
        this.post = response.data;
        console.log('meta', this.post);
        this.postId = this.post.id;
        this.updateMetaTags(this.post);
        this.initializeComments(this.currentPage, this.pageSize); // Gọi hàm để khởi tạo comments
        this.cdr.markForCheck();
      }
    } catch (error) {
      this.toast.error('Failed to load post.');
    }
  }

  private initializeComments(page: number, size: number) {
    this.commentService
      .getCommentsByPostId(this.postId, page, size)
      .pipe(
        map((response: ApiResponse<CommentResponse[]>) => {
          if (response.status === 'OK' && response.data) {
            this.comments = [...this.comments, ...response.data];
            this.comments$.next(this.comments); // Emit the new value
            this.hasMoreComments = response.data.length === size; // Check if there are more comments to load
            return response.data;
          } else {
            throw new Error(response.message);
          }
        }),
        tap((comments: CommentResponse[]) => {
          this.initializeReplyForms(comments);
          this.cdr.markForCheck(); // Ensure Angular checks and updates the view
        }),
        untilDestroyed(this),
      )
      .subscribe({
        error: () => this.toast.error('Failed to load comments.'),
      });

    this.rootComments$ = this.comments$.pipe(
      map((comments: CommentResponse[]) => comments.filter((comment) => !comment.parentCommentId)),
    );
  }

  private initializeReplyForms(comments: CommentResponse[]) {
    comments.forEach((comment) => {
      if (!this.replyForms[comment.id]) {
        this.replyForms[comment.id] = this.fb.group({
          content: ['', [Validators.required, Validators.minLength(5), noWhitespaceValidator()]],
        });
      }
    });
  }

  private updateMetaTags(post: Post) {
    if (!post.meta) return;
    this.titleService.setTitle(post.meta.ogTitle || '');
    this.updateMetaTag('description', post.meta.ogDescription || '');
    this.updateMetaTag('keywords', post.tags.map((tag) => tag.name).join(', ') || '');

    // Open Graph tags
    this.updateMetaTag('og:title', post.meta.ogTitle || '', true);
    this.updateMetaTag('og:description', post.meta.ogDescription || '', true);
    this.updateMetaTag('og:image', post.meta.ogImage || '', true);
    this.updateMetaTag('og:url', post.meta.slug || '', true);

    // Twitter Card tags
    this.updateMetaTag('twitter:card', 'summary_large_image');
    this.updateMetaTag('twitter:title', post.meta.ogTitle || '');
    this.updateMetaTag('twitter:description', post.meta.ogDescription || '');
    this.updateMetaTag('twitter:image', post.meta.ogImage || '');

    // Schema Markup
    const schema = {
      '@context': 'http://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      image: post.thumbnailUrl,
      author: {
        '@type': 'Person',
        name: post.authorName,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Your Site Name',
        logo: {
          '@type': 'ImageObject',
          url: 'URL_TO_YOUR_LOGO',
        },
      },
      datePublished: post.meta.createdAt,
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
      this.replyForms[commentId] = this.fb.group({
        content: ['', [Validators.required, Validators.minLength(5), noWhitespaceValidator()]],
      });
    }
    this.replyFormVisibility[commentId] = !this.replyFormVisibility[commentId];
    if (!this.replyFormVisibility[commentId]) {
      this.replyForms[commentId].reset();
    }
  }

  addComment(): void {
    if (!this.checkLoggedIn()) return;
    const userId = this.authService.getUserId();
    const content = this.newCommentForm.get('content')?.value;
    const postId = this.postId;
    this.commentService
      .addComment(this.postId, userId, content)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<CommentResponse>) => {
          if (response.status === 'OK' || response.status === 'CREATED') {
            // Update the comments array immutably
            this.comments = [response.data, ...this.comments];
            // Emit the new value
            this.comments$.next(this.comments);
            // Update the comment count
            if (this.post) {
              this.post.commentCount++;
            }
            // Trigger change detection manually
            this.cdr.markForCheck();
          }

          // Reset the form and toggle the comment form
          this.newCommentForm.reset();
          this.showAddCommentForm = false;
        },
      });
  }

  addReply(commentId: number): void {
    if (!this.checkLoggedIn()) return;
    const replyContent = this.replyForms[commentId].get('content')?.value;
    const userId = this.authService.getUserId();
    const parentCommentId = commentId;
    this.commentService
      .replyComment(commentId, userId, replyContent, parentCommentId)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<CommentResponse>) => {
          if (response.status === 'OK' || response.status === 'CREATED') {
            const parentCommentIndex = this.comments.findIndex((comment) => comment.id === commentId);
            if (parentCommentIndex !== -1) {
              const parentComment = this.comments[parentCommentIndex];
              const updatedReplies = [response.data, ...(parentComment.replies || [])]; // Add the new reply at the beginning
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
                this.post.commentCount++;
              }
              // Trigger change detection manually
              this.cdr.markForCheck();
            }
          }
          this.toggleReplyForm(commentId);
        },
      });
  }

  getSanitizedContent(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }

  private checkLoggedIn(): boolean {
    if (!this.authService.isLoggedIn()) {
      this.toast.warning('Bạn cần đăng nhập để thực hiện hành động này.');
      return false;
    }
    return true;
  }

  trackByCommentId(index: number, comment: CommentResponse): number {
    return comment.id;
  }
  loadMoreComments() {
    this.currentPage++;
    this.initializeComments(this.currentPage, this.pageSize);
  }
}
