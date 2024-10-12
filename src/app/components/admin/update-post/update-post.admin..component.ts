import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
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
import { PreviewDataService } from '../../../services/preview-data.service';

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
})
export class UpdatePostAdminComponent implements OnInit {
  postId: number = 0;
  revisionCount: number = 0;
  categories: Category[] = [];
  topCategories: Category[] = [];
  postForm: FormGroup;
  newCategoryNameControl: FormControl; // FormControl riêng cho newCategoryName
  showAddCategory: boolean = false;
  activeCategoryTab: string = 'all';
  isCategoryBodyVisible = true;
  isPublishBodyVisible = true;
  isTagsBodyVisible = true;
  isThumbnailBodyVisible = true;
  isFavoriteBodyVisible = true;
  selectedThumbnailUrl: string | null = null;
  selectedPublicId: string | null = null;
  previousSelectedCategoryId: number | null = null;

  isLoading = false;

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

  constructor(
    private modalService: NgbModal,
    private categoryService: CategoryService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private postService: PostService,
    private router: Router,
    private route: ActivatedRoute,
    private previewDataService: PreviewDataService,
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
      thumbnail: [null, Validators.required], // Thêm thuộc tính thumbnail
    });

    this.newCategoryNameControl = new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
    ]);
  }

  ngOnInit(): void {
    this.getCategories();
    this.getTopCategoriesByPostCount();
    this.route.paramMap.subscribe((params) => {
      this.postId = +(params.get('id') ?? 0); // Sử dụng nullish coalescing để cung cấp giá trị mặc định
      if (this.postId) {
        this.getPostById(this.postId);
      }
    });
  }

  // Phương thức để tải bài viết dựa vào postId
  getPostById(postId: number): void {
    this.postService.getPostById(postId).subscribe({
      next: (response: ApiResponse<Post>) => {
        const post = response.data;
        console.log('Post:', post); // Kiểm tra dữ liệu bài viết
        this.postForm.patchValue({
          title: post.title,
          content: post.content,
          category: { category_id: post.category.id },
          status: post.status,
          visibility: post.visibility,
          revision_count: post.revision_count,
          tags: post.tags.map((tag) => tag.name),
          thumbnail: post.thumbnail_url,
        });
        this.selectedThumbnailUrl = post.thumbnail_url;
        this.tags = post.tags.map((tag) => tag.name);
        this.revisionCount = post.revision_count; // Lưu giá trị revision_count
      },
      complete: () => {},
      error: (error: any) => {
        console.error('Error loading post:', error);
        this.toastr.error('An error occurred while loading the post.');
      },
    });
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

    // Chuyển đổi cấu trúc dữ liệu
    const postRequest: PostRequest = {
      ...formValue,
      category_id: formValue.category.category_id,
    };

    this.postService.updatePost(this.postId, postRequest).subscribe({
      next: (response: ApiResponse<Post>) => {
        if (response.status === 'CREATED') {
          const navigationExtras: NavigationExtras = {
            state: { message: response.message },
          };
          console.log('Navigation Extras:', navigationExtras); // Kiểm tra navigationExtras
          setTimeout(() => {
            this.router
              .navigate(['/admin/posts'], navigationExtras)
              .then(() => {
                this.isLoading = false;
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
