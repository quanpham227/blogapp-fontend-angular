import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TinymceEditorComponent } from '../../tinymce-editor/tinymce-editor.component';
import { Category } from '../../../models/category';
import { PostStatus } from '../../../enums/post-status.enum';
import { PostVisibility } from '../../../enums/post-visibility.enum';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CategoryService } from '../../../services/category.service';
import { ToastrService } from 'ngx-toastr';
import { PostService } from '../../../services/post.service';
import {
  maxTagsValidator,
  nonEmptyTagsValidator,
} from '../../../validators/validators';
import { ImageSelectModalAdminComponent } from '../shared/components/image-select-modal/image-select-modal.admin.component';
import { ApiResponse } from '../../../models/response';
import { CategoryRequest } from '../../../request/category.request';
import { PostRequest } from '../../../request/post.request';
import { Post } from '../../../models/post';
import { CommentService } from '../../../services/comment.service';
import { CommentResponse } from '../../../models/comment';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { TokenService } from '../../../services/token.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-update-post-admin',
  standalone: true,
  imports: [
    TinymceEditorComponent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './update-post.admin..component.html',
  styleUrls: ['./update-post.admin..component.scss'],
  providers: [DatePipe], // Thêm DatePipe vào providers
})
export class UpdatePostAdminComponent implements OnInit {
  post: Post | null = null;
  postId: number = 0;

  categories: Category[] = [];
  topCategories: Category[] = [];
  postForm: FormGroup;
  newCategoryNameControl: FormControl; // FormControl riêng cho newCategoryName
  newCommentContentControl: FormControl; // FormControl riêng cho newCategoryName
  editCommentContentControl: FormControl;
  showAddCategory: boolean = false;
  activeCategoryTab: string = 'all';
  isCategoryBodyVisible = true;
  isPublishBodyVisible = true;
  isCommentBodyCardVisible = true;
  isTagsBodyVisible = true;
  isThumbnailBodyVisible = true;
  isFavoriteBodyVisible = true;
  selectedThumbnailUrl: string | null = null;
  selectedPublicId: string | null = null;
  previousSelectedCategoryId: number | null = null;
  revisionCount: number = 0;
  viewCount: number = 0;
  tinymceAuthorName: string | null = null;
  tinymceUpdatedAt: string | null = null;
  isLoading = false;
  isDeleting = false;
  tagInputControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
  ]);
  tags: string[] = [];
  maxTags = 5; // Giới hạn số lượng thẻ
  tagLimitExceeded = false; // Biến để kiểm tra xem có vượt quá giới hạn không

  status = PostStatus.Published;
  visibility = PostVisibility.Public;
  isEditingStatus = false;
  isEditingVisibility = false;

  PostStatus = PostStatus;
  PostVisibility = PostVisibility;
  cards: string[] = ['category', 'publish', 'tags', 'favorite', 'thumbnail'];
  cardVisibility: { [key: string]: boolean } = {
    category: true,
    publish: true,
    tags: true,
    favorite: true,
    thumbnail: true,
  };

  comments: CommentResponse[] = [];
  rootComments: CommentResponse[] = [];
  showAddCommentForm = false;
  replyFormVisibility: { [key: number]: boolean } = {}; // Add this line
  replyContent: { [key: number]: string } = {}; // Add this line
  replyContentControls: { [key: number]: FormControl } = {}; // Add this line
  editingComment: CommentResponse | null = null; // Thêm thuộc tính này

  private routeSub: Subscription | null = null;

  constructor(
    private modalService: NgbModal,
    private categoryService: CategoryService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private postService: PostService,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private commentService: CommentService,
    private messageService: MessageService,
    private tokenService: TokenService,
    private authService: AuthService,
  ) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      category: this.fb.group({
        category_id: [null, Validators.required], // Đảm bảo rằng selectedCategoryId được khai báo ở đây
      }),
      status: [PostStatus.Published, Validators.required],
      visibility: [PostVisibility.Public, Validators.required],
      tags: [[], [nonEmptyTagsValidator(), maxTagsValidator(5)]], // Sử dụng các validator tùy chỉnh
      thumbnail: [null], // Thêm thuộc tính thumbnail
      public_id: [null],
    });

    this.newCategoryNameControl = new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
    ]);
    this.newCommentContentControl = new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(500),
    ]);
    this.editCommentContentControl = new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(500),
    ]);
  }

  ngOnInit(): void {
    this.getCategories();
    this.getTopCategoriesByPostCount();
    this.routeSub = this.route.paramMap.subscribe((params) => {
      this.postId = +(params.get('id') ?? 0); // Sử dụng nullish coalescing để cung cấp giá trị mặc định
      if (this.postId) {
        this.getPostById(this.postId);
        this.getCommentsByPostId(this.postId);
      }
    });
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  // Phương thức để tải bài viết dựa vào postId
  getPostById(postId: number): void {
    this.postService.getPostById(postId).subscribe({
      next: (response: ApiResponse<Post>) => {
        this.post = response.data;
        console.log('Post:', this.post); // Kiểm tra dữ liệu bài viết
        this.postForm.patchValue({
          title: this.post.title,
          content: this.post.content,
          category: { category_id: this.post.category.id },
          status: this.post.status,
          visibility: this.post.visibility,
          revision_count: this.post.revision_count,
          tags: this.post.tags.map((tag) => tag.name),
          thumbnail: this.post.thumbnail_url,
          public_id: this.post.public_id,
        });
        this.selectedThumbnailUrl = this.post.thumbnail_url;
        this.tags = this.post.tags.map((tag) => tag.name);
        this.revisionCount = this.post.revision_count; // Lưu giá trị revision_count
        this.viewCount = this.post.view_count; // Lưu giá trị view_count
        this.tinymceAuthorName = this.post.author_name;
        this.tinymceUpdatedAt = this.datePipe.transform(
          this.post.updated_at,
          "dd MMMM, yyyy 'lúc' HH:mm",
        ); // Định dạng updated_at
      },
      complete: () => {},
      error: (error: any) => {
        console.error('Error loading post:', error);
        this.toastr.error('An error occurred while loading the post.');
      },
    });
  }
  getCommentsByPostId(postId: number): void {
    if (postId) {
      this.commentService.getCommentsByPostId(postId).subscribe({
        next: (response: ApiResponse<CommentResponse[]>) => {
          if (response.status === 'OK') {
            this.comments = response.data;
            console.log('Comments:', this.comments);
            this.comments.forEach((comment) => {
              if (!this.replyContentControls[comment.id]) {
                this.replyContentControls[comment.id] = new FormControl('');
              }
            });
            // Lọc các bình luận gốc
            this.rootComments = this.comments.filter(
              (comment) => !comment.parent_comment_id,
            );
          } else {
            this.toastr.error('Failed to load comments.');
          }
        },
        error: (error: any) => {
          console.error('Error fetching comments:', error);
          this.toastr.error('An error occurred while fetching comments.');
        },
      });
    }
  }
  toggleReplyForm(commentId: number): void {
    if (!this.replyContentControls[commentId]) {
      this.replyContentControls[commentId] = new FormControl('');
    }
    this.replyFormVisibility[commentId] = !this.replyFormVisibility[commentId];
    if (!this.replyFormVisibility[commentId]) {
      this.replyContentControls[commentId].reset();
    }
  }
  toggleCommentForm() {
    this.showAddCommentForm = !this.showAddCommentForm;
    if (!this.showAddCommentForm) {
      this.editingComment = null; // Đặt lại khi đóng form
      this.newCommentContentControl.reset(); // Đặt lại nội dung textarea
    }
  }
  addReply(commentId: number): void {
    const replyContent = this.replyContentControls[commentId].value;
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
  }

  addComment(): void {
    const userId = this.authService.getUser()?.id ?? 0;
    const content = this.newCommentContentControl.value;
    console.log('Adding userId comment:', userId, content);
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
    this.editCommentContentControl.setValue(comment.content);
  }
  updateComment(): void {
    if (this.editingComment) {
      const userId = this.authService.getUser()?.id ?? 0;
      this.commentService
        .editComment(
          this.editingComment.id,
          userId,
          this.editCommentContentControl.value,
        )
        .subscribe({
          next: (response: ApiResponse<CommentResponse>) => {
            if (response.status === 'OK') {
              this.toastr.success('Comment updated successfully.');
              this.getCommentsByPostId(this.postId);
            } else {
              this.toastr.error(response.message);
            }
            this.editingComment = null;
            this.editCommentContentControl.reset();
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
    this.editCommentContentControl.reset(); // Đặt lại nội dung textarea của form chỉnh sửa
  }
  getGlobalIndex(commentIndex: number, replyIndex: number): number {
    let globalIndex = 0;
    for (let i = 0; i < commentIndex; i++) {
      globalIndex += (this.comments[i]?.replies?.length ?? 0) + 1;
    }
    return globalIndex + replyIndex;
  }

  setActiveCategoryTab(tabName: string) {
    this.activeCategoryTab = tabName;
  }
  isCategoryTabActive(tabName: string): boolean {
    return this.activeCategoryTab === tabName;
  }
  toggleAddCategory() {
    this.showAddCategory = !this.showAddCategory;
  }
  toggleCardCommentBody() {
    this.isCommentBodyCardVisible = !this.isCommentBodyCardVisible;
  }

  toggleCardBody(card: string): void {
    this.cardVisibility[card] = !this.cardVisibility[card];
  }

  moveCardUp(index: number) {
    if (index > 0) {
      // Hoán đổi vị trí của các card
      const tempCard = this.cards[index - 1];
      this.cards[index - 1] = this.cards[index];
      this.cards[index] = tempCard;

      // Hoán đổi trạng thái hiển thị của các card
      const tempVisibility = this.cardVisibility[tempCard];
      this.cardVisibility[tempCard] =
        this.cardVisibility[this.cards[index - 1]];
      this.cardVisibility[this.cards[index - 1]] = tempVisibility;
    }
  }

  moveCardDown(index: number) {
    if (index < this.cards.length - 1) {
      // Hoán đổi vị trí của các card
      const tempCard = this.cards[index + 1];
      this.cards[index + 1] = this.cards[index];
      this.cards[index] = tempCard;

      // Hoán đổi trạng thái hiển thị của các card
      const tempVisibility = this.cardVisibility[tempCard];
      this.cardVisibility[tempCard] =
        this.cardVisibility[this.cards[index + 1]];
      this.cardVisibility[this.cards[index + 1]] = tempVisibility;
    }
  }
  // Hàm thêm thẻ vào danh sách
  addTag() {
    const value = this.tagInputControl.value?.trim(); // Optional chaining để kiểm tra null

    if (value) {
      const newTags = value
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag); // Chỉ lấy các giá trị tag không rỗng

      if (this.tags.length + newTags.length > this.maxTags) {
        this.tagLimitExceeded = true; // Hiển thị cảnh báo
      } else {
        this.tags.push(...newTags);
        this.tagLimitExceeded = false; // Ẩn cảnh báo nếu thêm thành công
        this.tagInputControl.reset();
        this.postForm.get('tags')?.setValue(this.tags); // Cập nhật giá trị của tags trong FormGroup
      }
    }
  }

  // Hàm xóa thẻ khỏi danh sách
  removeTag(index: number) {
    this.tags.splice(index, 1);
    this.tagLimitExceeded = false; // Ẩn cảnh báo khi xóa thẻ
    this.postForm.get('tags')?.setValue(this.tags); // Cập nhật giá trị của tags trong FormGroup
  }

  // Phương thức để mở modal chọn ảnh
  openImageModal(): void {
    const modalRef = this.modalService.open(ImageSelectModalAdminComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: true,
      windowClass: 'admin-image-modal',
      size: 'lg',
    });

    modalRef.result
      .then((result) => {
        if (result) {
          this.selectedThumbnailUrl = result.url;
          this.selectedPublicId = result.publicId;

          // Check if values are correctly retrieved
          if (this.selectedThumbnailUrl && this.selectedPublicId) {
            this.postForm.patchValue({
              thumbnail: this.selectedThumbnailUrl,
              public_id: this.selectedPublicId,
            });

            // Force change detection
            this.postForm.updateValueAndValidity();
          } else {
            console.error('Received values are undefined');
          }
        }
      })
      .catch((error) => {
        console.log('Modal dismissed with error:', error);
      });
  }

  // Phương thức để xóa ảnh
  removeThumbnail() {
    this.selectedThumbnailUrl = null;
    this.selectedPublicId = null;
    this.postForm.patchValue({
      thumbnail: null,
      public_id: null,
    });
  }
  getCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response: ApiResponse<Category[]>) => {
        this.categories = response.data;
      },
      complete: () => {},
      error: (error: any) => {
        console.error('Error fetching categories:', error);
        this.toastr.error('An error occurred while fetching categories.');
      },
    });
  }
  getTopCategoriesByPostCount(): void {
    this.categoryService.getTopCategoriesByPostCount().subscribe({
      next: (response: ApiResponse<Category[]>) => {
        this.topCategories = response.data;
      },
      complete: () => {},
      error: (error: any) => {
        console.error('Error fetching top categories:', error);
        this.toastr.error('An error occurred while fetching top categories.');
      },
    });
  }
  onCategoryChange(categoryId: number | null) {
    const selectedCategoryIdControl = this.postForm.get('category.category_id');
    if (this.previousSelectedCategoryId === categoryId) {
      selectedCategoryIdControl?.setValue(null); // Bỏ chọn nếu giá trị giống nhau
      this.previousSelectedCategoryId = null;
    } else {
      selectedCategoryIdControl?.setValue(categoryId);
      this.previousSelectedCategoryId = categoryId;
    }
    console.log('Selected Category ID:', categoryId);
  }
  addCategory() {
    if (this.newCategoryNameControl.valid) {
      const categoryRequest: CategoryRequest = {
        name: this.newCategoryNameControl.value.trim(), // Lấy giá trị từ FormControl
        description: '',
      };

      this.categoryService.insertCategory(categoryRequest).subscribe({
        next: (response: ApiResponse<Category>) => {
          if (response.status === 'OK') {
            this.toastr.success(response.message);
            this.getCategories();
            this.getTopCategoriesByPostCount();
            this.toggleAddCategory();
            this.newCategoryNameControl.reset(); // Reset giá trị sau khi thêm
          } else {
            this.toastr.error(response.message);
          }
        },
        complete: () => {},
        error: (error: any) => {
          const errorMessage =
            error.error?.message ||
            'An unexpected error occurred. Please try again.';
          this.toastr.error(errorMessage);
          console.error('Error:', error);
        },
      });
    } else {
      this.toastr.error('Vui lòng nhập tên chuyên mục hợp lệ');
    }
  }
  previewPost() {
    const postData = this.postForm.value;
    console.log('Setting post data:', postData); // Kiểm tra dữ liệu trước khi lưu
    localStorage.setItem('postPreviewData', JSON.stringify(postData));
    setTimeout(() => {
      window.open('/post-preview', '_blank');
    }, 100); // Trì hoãn 100ms trước khi mở cửa sổ mới
  }
  onSubmitPost() {
    if (this.postForm.invalid) {
      this.toastr.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    this.isLoading = true;
    const formValue = this.postForm.value;
    console.log('Form Value:', formValue); // Kiểm tra dữ liệu trước khi gửi

    // Chuyển đổi cấu trúc dữ liệu
    const postRequest: PostRequest = {
      ...formValue,
      category_id: formValue.category.category_id,
    };

    this.postService.updatePost(this.postId, postRequest).subscribe({
      next: (response: ApiResponse<Post>) => {
        if (response.status === 'CREATED') {
          this.messageService.setMessage(response.message);
          setTimeout(() => {
            this.router.navigate(['/admin/posts']).then(() => {
              this.isLoading = false; // Kết thúc trạng thái xóa
            });
          }, 3000); // Thời gian chờ 3 giây trước khi điều hướng
        } else {
          this.isLoading = false;
          // Xử lý lỗi server trả về
          this.toastr.error(response.message);
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        // Xử lý lỗi không mong đợi (như lỗi mạng, server không phản hồi)
        const errorMessage =
          error.error?.message ||
          'An unexpected error occurred. Please try again.';
        this.toastr.error(errorMessage);
        console.error('Error:', error);
      },
    });
  }
  deletePost(postId: number) {
    this.isDeleting = true; // Bắt đầu trạng thái xóa
    this.postService.deletePost(postId).subscribe({
      next: (response: any) => {
        if (response.status === 'OK') {
          this.messageService.setMessage(response.message);
          setTimeout(() => {
            this.router.navigate(['/admin/posts']).then(() => {
              this.isDeleting = false; // Kết thúc trạng thái xóa
            });
          }, 3000); // Thời gian chờ 3 giây trước khi điều hướng
        } else {
          this.isDeleting = false; // Kết thúc trạng thái xóa
          // Xử lý lỗi server trả về
          this.toastr.error(response.message);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.isDeleting = false; // Kết thúc trạng thái xóa
        const errorMessage =
          error.error?.message ||
          'An unexpected error occurred. Please try again.';
        this.toastr.error(errorMessage);
        console.error('Error:', error);
      },
    });
  }
  startEditStatus() {
    this.isEditingStatus = true;
  }

  saveStatus() {
    this.isEditingStatus = false;
    console.log('Updated Status:', this.status); // Thêm dòng này để kiểm tra giá trị cập nhật
  }

  cancelEditStatus() {
    this.isEditingStatus = false;
  }

  startEditVisibility() {
    this.isEditingVisibility = true;
  }

  saveVisibility() {
    this.isEditingVisibility = false;
    console.log('Updated Visibility:', this.visibility); // Thêm dòng này để kiểm tra giá trị cập nhật
  }

  cancelEditVisibility() {
    this.isEditingVisibility = false;
  }
}
