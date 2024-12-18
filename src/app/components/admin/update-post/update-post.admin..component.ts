import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { TinymceEditorComponent } from '../../tinymce-editor/tinymce-editor.component';
import { CommonModule, DatePipe } from '@angular/common';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category';
import { ApiResponse } from '../../../models/response';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryRequest } from '../../../request/category.request';
import { maxTagsValidator, nonEmptyTagsValidator } from '../../../validators/validators';
import { PostRequest } from '../../../request/post.request';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/post';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { ImageSelectDialogAdminComponent } from '../shared/image-select-dialog/image-select-dialog.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BehaviorSubject, Subscription } from 'rxjs';
import { PostEnumService } from '../../../utils/post-enum.service';
import { SnackbarService } from '../../../services/snackbar.service';
import { MessageService } from '../../../services/message.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog.component';
import { SharedDataService } from '../../../services/help-text.service';
@UntilDestroy()
@Component({
  selector: 'app-update-post-admin',
  standalone: true,
  imports: [
    TinymceEditorComponent,
    FlexLayoutModule,
    MatTooltipModule,
    MatSnackBarModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
  ],
  templateUrl: './update-post.admin..component.html',
  styleUrls: ['./update-post.admin..component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class UpdatePostAdminComponent implements OnInit {
  post: Post | null = null;
  postId: number = 0;
  private routeSub: Subscription | null = null;
  dialogRef: MatDialogRef<any> | null = null;
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  private topCategoriesSubject = new BehaviorSubject<Category[]>([]);
  topCategories$ = this.topCategoriesSubject.asObservable();

  postForm: FormGroup;
  newCategoryNameControl: FormControl;
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
  tagInputControl = new FormControl('', [Validators.required, Validators.minLength(3)]);
  tags: string[] = [];
  maxTags = 5;
  tagLimitExceeded = false;

  status = this.postEnumService.getPostStatus().Published;
  visibility = this.postEnumService.getPostVisibility().Public;
  isEditingStatus = false;
  isEditingVisibility = false;

  tinymceAuthorName: string | null = null;
  tinymceUpdatedAt: string | null = null;
  tinymceHelpText: string = '';

  PostStatus = this.postEnumService.getPostStatus();
  PostVisibility = this.postEnumService.getPostVisibility();
  cards: string[] = ['category', 'publish', 'tags', 'favorite', 'thumbnail'];
  cardVisibility: { [key: string]: boolean } = {
    category: true,
    publish: true,
    tags: true,
    favorite: true,
    thumbnail: true,
  };

  constructor(
    private dialog: MatDialog,
    private categoryService: CategoryService,
    private fb: FormBuilder,
    private postService: PostService,
    private router: Router,
    private snackBarService: SnackbarService,
    private cdr: ChangeDetectorRef,
    private postEnumService: PostEnumService,
    private datePipe: DatePipe,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private sharedDataService: SharedDataService,
  ) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      category: this.fb.group({
        categoryId: [null, Validators.required],
      }),
      status: [this.postEnumService.getPostStatus().Published, Validators.required],
      visibility: [this.postEnumService.getPostVisibility().Public, Validators.required],
      tags: [[], [nonEmptyTagsValidator(), maxTagsValidator(5)]],
      thumbnail: [null],
      publicId: [null],
    });

    this.newCategoryNameControl = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]);
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadTopCategories();
    this.routeSub = this.route.paramMap.pipe(untilDestroyed(this)).subscribe((params) => {
      this.postId = +(params.get('id') ?? 0);
      if (this.postId) {
        this.getPostById(this.postId);
      }
    });
  }
  getPostById(postId: number): void {
    this.postService
      .getPostById(postId)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Post>) => {
          if (response.status === 'OK' && response.data) {
            this.post = response.data;
            const { title, content, category, status, visibility, revisionCount, tags, thumbnailUrl, publicId, authorName, updatedAt } =
              this.post;

            this.postForm.patchValue({
              title,
              content,
              category: { categoryId: category.id },
              status,
              visibility,
              revisionCount,
              tags: tags.map((tag) => tag.name),
              thumbnail: thumbnailUrl,
              publicId,
            });

            this.selectedThumbnailUrl = thumbnailUrl;
            this.tags = tags.map((tag) => tag.name);
            this.updateHelpText(authorName, updatedAt);
            this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
          }
        },
      });
  }

  updateHelpText(authorName: string, updatedAt: string): void {
    this.tinymceAuthorName = authorName;
    this.tinymceUpdatedAt = this.datePipe.transform(updatedAt, "dd MMMM, yyyy 'lúc' HH:mm");
    const helpText = `Chỉnh sửa lần cuối bởi: ${this.tinymceAuthorName} vào ngày ${this.tinymceUpdatedAt}`;
    this.sharedDataService.setHelpText(helpText);
  }

  private loadCategories(forceReload: boolean = false): void {
    if (!forceReload && this.categoriesSubject.value.length > 0) {
      return; // Tránh gọi lại API nếu đã có dữ liệu và không cần cập nhật
    }
    this.categoryService
      .getCategories()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Category[]>) => {
          if (response.status === 'OK' && response.data) {
            this.categoriesSubject.next(response.data);
            this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
          }
        },
      });
  }

  private loadTopCategories(forceReload: boolean = false): void {
    if (!forceReload && this.categoriesSubject.value.length > 0) {
      return; // Tránh gọi lại API nếu đã có dữ liệu và không cần cập nhật
    }
    this.categoryService
      .getTopCategoriesByPostCount()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Category[]>) => {
          if (response.status === 'OK' && response.data) {
            this.topCategoriesSubject.next(response.data);
            this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
          }
        },
      });
  }
  openImageDialog(): void {
    import('../shared/image-select-dialog/image-select-dialog.component').then(({ ImageSelectDialogAdminComponent }) => {
      const dialogRef = this.dialog.open(ImageSelectDialogAdminComponent, {
        width: '1000px',
        disableClose: true,
      });
      this.handleDialogResponse(dialogRef);
    });
  }

  private handleDialogResponse(dialogRef: MatDialogRef<ImageSelectDialogAdminComponent>): void {
    dialogRef
      .afterClosed()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (result) => {
          if (result) {
            this.selectedThumbnailUrl = result.url;
            this.selectedPublicId = result.publicId;
            if (this.selectedThumbnailUrl && this.selectedPublicId) {
              this.postForm.patchValue({
                thumbnail: this.selectedThumbnailUrl,
                publicId: this.selectedPublicId,
              });
              this.postForm.updateValueAndValidity();
              this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
            } else {
              this.snackBarService.show('An error occurred while selecting image');
            }
          }
        },
        error: () => {
          this.snackBarService.show('An error occurred while selecting image');
        },
      });
  }

  removeThumbnail() {
    this.selectedThumbnailUrl = null;
    this.selectedPublicId = null;
    this.postForm.patchValue({
      thumbnail: null,
      publicId: null,
    });
    this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
  }

  onCategoryChange(categoryId: number | null) {
    const selectedCategoryIdControl = this.postForm.get('category.categoryId');
    if (this.previousSelectedCategoryId === categoryId) {
      selectedCategoryIdControl?.setValue(null);
      this.previousSelectedCategoryId = null;
    } else {
      selectedCategoryIdControl?.setValue(categoryId);
      this.previousSelectedCategoryId = categoryId;
    }
    this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
  }

  addCategory() {
    if (this.newCategoryNameControl.valid) {
      const categoryRequest: CategoryRequest = {
        name: this.newCategoryNameControl.value.trim(),
        description: '',
      };

      this.categoryService
        .insertCategory(categoryRequest)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: (response: ApiResponse<Category>) => {
            if (response.status === 'OK' || response.status === 'CREATED') {
              this.loadCategories(true);
              this.loadTopCategories(true);
              this.toggleAddCategory();
              this.newCategoryNameControl.reset();
              this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
            }
          },
        });
    } else {
      this.snackBarService.show('Please enter a valid category name');
    }
  }

  onSubmitPost() {
    if (this.postForm.invalid) {
      this.snackBarService.show('Please fill in all required fields');
      return;
    }
    const formValue = this.postForm.value;
    const postRequest: PostRequest = {
      ...formValue,
      categoryId: formValue.category.categoryId,
    };

    this.postService
      .updatePost(this.postId, postRequest)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Post>) => {
          if (response.status === 'CREATE' || response.status === 'OK') {
            const navigationExtras: NavigationExtras = {
              state: { message: response.message },
            };
            setTimeout(() => {
              this.router.navigate(['/admin/posts'], navigationExtras).then(() => {
                this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
              });
            }, 3000);
          } else {
            this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBarService.show(error.message || 'An error occurred');
          this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
        },
      });
  }
  deletePost(id: number): void {
    if (id === null) {
      this.snackBarService.show('Invalid post ID');
      return;
    }
    const dialogData: ConfirmDialogData = {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this post?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    };

    import('../shared/confirm-dialog/confirm-dialog.component').then(({ ConfirmDialogComponent }) => {
      this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: dialogData,
      });
      this.handleDialogResponseDeletePost(this.dialogRef, id);
    });
  }
  private handleDialogResponseDeletePost(dialogRef: MatDialogRef<ConfirmDialogComponent>, id: number): void {
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.postService
            .deleteOrDisablePost(id, false)
            .pipe(untilDestroyed(this))
            .subscribe({
              next: (response: ApiResponse<void>) => {
                if (response.status === 'OK' || response.status === 'DELETED') {
                  this.messageService.setMessage(response.message);
                  setTimeout(() => {
                    this.router.navigate(['/admin/posts']).then(() => {});
                  }, 3000);
                }
                this.cdr.markForCheck(); // Inform Angular to check for changes
              },
              error: (error) => {
                this.snackBarService.show(error.message);
              },
            });
        }
      },
      error: (reason) => {
        this.snackBarService.show('Dismissed');
      },
    });
  }

  startEditStatus() {
    this.isEditingStatus = true;
    this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
  }

  saveStatus() {
    this.isEditingStatus = false;
    this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
  }

  cancelEditStatus() {
    this.isEditingStatus = false;
    this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
  }

  startEditVisibility() {
    this.isEditingVisibility = true;
    this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
  }

  saveVisibility() {
    this.isEditingVisibility = false;
    this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
  }

  cancelEditVisibility() {
    this.isEditingVisibility = false;
    this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
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
      this.swapCards(index, index - 1);
    }
  }

  moveCardDown(index: number) {
    if (index < this.cards.length - 1) {
      this.swapCards(index, index + 1);
    }
  }

  private swapCards(index1: number, index2: number) {
    [this.cards[index1], this.cards[index2]] = [this.cards[index2], this.cards[index1]];
    [this.cardVisibility[this.cards[index1]], this.cardVisibility[this.cards[index2]]] = [
      this.cardVisibility[this.cards[index2]],
      this.cardVisibility[this.cards[index1]],
    ];
  }
  addTag() {
    const maxTagLength = 20; // Số ký tự tối đa cho mỗi tag
    const value = this.tagInputControl.value?.trim();
    if (value) {
      const newTags = value
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag && tag.length <= maxTagLength); // Bỏ qua các tag vượt quá số ký tự cho phép

      if (newTags.length < value.split(',').length) {
        this.snackBarService.show(`Mỗi tag không được vượt quá ${maxTagLength} ký tự`);
      }

      if (this.tags.length + newTags.length > this.maxTags) {
        this.tagLimitExceeded = true;
      } else {
        this.tags.push(...newTags);
        this.tagLimitExceeded = false;
        this.tagInputControl.reset();
        this.postForm.get('tags')?.setValue(this.tags);
        this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
      }
    }
  }

  removeTag(index: number) {
    this.tags.splice(index, 1);
    this.tagLimitExceeded = false;
    this.postForm.get('tags')?.setValue(this.tags);
    this.cdr.markForCheck(); // Đánh dấu để kiểm tra thay đổi
  }
}
