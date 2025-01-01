import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { Image } from '../../../models/image';
import { ImageService } from '../../../services/image.service';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { checkFile, FileValidationResult } from '../../../utils/file-validator';
import { firstValueFrom } from 'rxjs';
import { LazyLoadDirective } from '../../../directives/lazy-load.directive';
import { ChangeDetectorRef } from '@angular/core';
import { ToasterService } from '../../../services/toaster.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { distinctUntilChanged, tap } from 'rxjs/operators';
import { ApiResponse } from '../../../models/response';
import { ImageListResponse } from '../../../responses/image/image-list-response';
import debounce from 'lodash-es/debounce';
import isEqual from 'lodash-es/isEqual';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HttpEventType } from '@angular/common/http';
import { convertToCamelCase } from '../../../utils/case-converter';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImageDetailDialogAdminComponent } from '../image-detail/image-detail-admin.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { SnackbarService } from '../../../services/snackbar.service';
import { Status } from '../../../enums/status.enum';

@UntilDestroy()
@Component({
  selector: 'app-media-admin',
  standalone: true,
  templateUrl: './media.admin.component.html',
  styleUrls: ['./media.admin.component.scss'],
  imports: [
    FormsModule,
    CommonModule,
    MatSnackBarModule,
    MatCardModule,
    MatGridListModule,
    LazyLoadDirective,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaAdminComponent implements AfterViewInit, OnDestroy {
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef;
  @ViewChild('scrollAnchor', { static: false }) scrollAnchor!: ElementRef;
  private observer!: IntersectionObserver;
  images: Image[] = [];
  selectedImages: Image[] = [];
  selectedObjectType: string = '';
  currentPage: number = 0;
  itemsPerPage: number = 24;
  totalPages: number = 0;
  totalFileSizes: number = 0;
  keyword: string = '';
  allImagesLoaded: boolean = false;
  uploadType: string = '';
  selectedImage: Image | null = null;
  isDeleting: boolean = false;
  isSearchActive = false;
  isDropdownOpen = false;
  isMobileView = false;
  uploadProgress = 0;
  objectTypes: { label: string; value: string }[] = [
    { label: 'All', value: '' },
    { label: 'Posts', value: 'posts' },
    { label: 'Clients', value: 'clients' },
    { label: 'Slides', value: 'slides' },
    { label: 'User Profile', value: 'user_profile' },
    { label: 'Unused', value: 'unused' },
  ];

  constructor(
    private imageService: ImageService,
    private dialog: MatDialog,
    private toastr: ToasterService,
    private snackBar: MatSnackBar,
    private cdRef: ChangeDetectorRef,
    private snackbarService: SnackbarService,
  ) {
    this.debouncedCheckScreenSize = debounce(this.checkScreenSize.bind(this), 200);
  }

  ngOnInit(): void {
    this.loadImages();
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.debouncedCheckScreenSize(); // Sử dụng debounce cho các sự kiện thay đổi kích thước
  }

  checkScreenSize() {
    this.isMobileView = window.innerWidth <= 991;
    this.cdRef.markForCheck(); // Đảm bảo Angular kiểm tra lại view
  }

  debouncedCheckScreenSize: () => void;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.allImagesLoaded) {
          this.loadImages(true);
        }
      },
      { threshold: 1.0 },
    );

    if (this.scrollAnchor) {
      this.observer.observe(this.scrollAnchor.nativeElement);
    }

    this.cdRef.detectChanges();
    this.checkIfMoreImagesNeeded();
  }

  ngOnDestroy(): void {
    if (this.observer && this.scrollAnchor) {
      this.observer.unobserve(this.scrollAnchor.nativeElement);
    }
  }

  async loadImages(append: boolean = true) {
    try {
      const response = await firstValueFrom(
        this.imageService.getImages(this.keyword, this.selectedObjectType, this.currentPage, this.itemsPerPage).pipe(
          untilDestroyed(this),
          distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
          tap((response: ApiResponse<ImageListResponse>) => {
            if (response.status === Status.OK && response.data) {
              const newImages = response.data.images;
              if (!isEqual(this.images, newImages)) {
                if (append) {
                  this.images = [...this.images, ...newImages];
                } else {
                  this.images = newImages;
                }
                this.totalPages = response.data.totalPages;
                this.totalFileSizes = response.data.totalFileSizes;
                this.currentPage++;
                if (this.currentPage >= this.totalPages) {
                  this.allImagesLoaded = true;
                }
                this.cdRef.markForCheck();
                this.checkIfMoreImagesNeeded();
              }
            }
          }),
        ),
      );
    } catch (error) {
      this.snackbarService.show('Error loading images');
    }
  }
  checkIfMoreImagesNeeded() {
    setTimeout(() => {
      const contentHeight = this.scrollAnchor.nativeElement.getBoundingClientRect().top;
      const viewportHeight = window.innerHeight;
      if (contentHeight <= viewportHeight && !this.allImagesLoaded) {
        this.loadImages(true);
      }
    }, 100);
  }

  toggleSearch() {
    this.isSearchActive = !this.isSearchActive;
    if (this.isSearchActive) {
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 0);
    }
  }

  filterMedia(type: string) {
    if (this.selectedObjectType !== type) {
      this.selectedObjectType = type;
      this.currentPage = 0;
      this.images = [];
      this.loadImages(false);
    }
    this.isDropdownOpen = false;
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const validationResult: FileValidationResult = checkFile(file, this.uploadType);
      if (!validationResult.isValid) {
        alert(validationResult.message);
        input.value = '';
        return;
      }
      this.uploadFile(file);
    } else {
      this.snackBar.open('No file selected', 'Close', {
        duration: 3000,
      });
      this.snackbarService.show('No file selected', 300, 'center', 'top');
    }
  }

  uploadFile(file: File): void {
    const tempImage: Image = {
      id: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: URL.createObjectURL(file),
      publicId: '',
      fileName: file.name,
      objectType: this.uploadType,
      fileType: file.type,
      fileSize: file.size,
      isUsed: false,
      usageCount: 0,
      isTemporary: true,
      isUploading: true,
      uploadProgress: 0,
    };

    this.images.unshift(tempImage);
    this.cdRef.markForCheck();

    this.imageService
      .uploadImage(file, this.uploadType)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (event: any) => {
          const index = this.images.findIndex((img) => img.id === 0);
          if (event.type === 3 && index !== -1) {
            const total = event.total ?? file.size;
            const progress = Math.round((100 * event.loaded) / total);
            this.uploadProgress = progress;
            this.images[index].uploadProgress = progress;
            this.cdRef.markForCheck();
          } else if (event.type === HttpEventType.Response && event.body) {
            const responseBody = event.body as ApiResponse<Image>;
            if (responseBody.status === Status.CREATED) {
              if (index !== -1) {
                this.images[index] = {
                  ...convertToCamelCase(responseBody.data),
                  isTemporary: false,
                  isUploading: false,
                };
              }
              this.loadImages(true);
              this.toastr.success('Image uploaded successfully');
            } else {
              if (index !== -1) {
                this.images.splice(index, 1);
              }
              this.uploadProgress = 0;
              this.toastr.error('Error uploading image');
            }
            this.cdRef.markForCheck();
          }
        },
        error: (error) => {
          const index = this.images.findIndex((img) => img.id === 0);
          if (index !== -1) {
            this.images.splice(index, 1);
          }
          this.snackbarService.show('Error uploading image', 300, 'center', 'top');
          this.cdRef.markForCheck();
        },
      });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.keyword = input.value;
    this.currentPage = 0;
    this.images = [];
    this.loadImages(false);
  }

  toggleSelectImage(image: Image): void {
    const index = this.selectedImages.indexOf(image);
    if (index !== -1) {
      this.selectedImages.splice(index, 1);
    } else {
      this.selectedImages.push(image);
    }
  }

  isSelected(image: Image): boolean {
    return this.selectedImages.indexOf(image) !== -1;
  }

  getSelectedIndex(image: Image): number {
    return this.selectedImages.indexOf(image) + 1;
  }

  async removeSelectedImages(): Promise<void> {
    if (this.selectedImages.length === 0) {
      this.snackbarService.show('No images selected to delete');
      return;
    }
    this.isDeleting = true;
    this.cdRef.markForCheck();
    const idsToDelete = this.selectedImages.map((image) => image.id);
    try {
      const response = await firstValueFrom(this.imageService.deleteImages(idsToDelete).pipe(untilDestroyed(this)));
      if (response?.status === Status.OK) {
        this.images = this.images.filter((image) => !idsToDelete.includes(image.id));
        this.selectedImages = [];
        this.currentPage = 0;
        this.loadImages(false);
        this.snackbarService.show('Images deleted successfully');
      } else {
        this.snackbarService.show('Failed to delete images. Please try again.');
      }
    } catch (error) {
      this.snackbarService.show('Error deleting images');
    } finally {
      this.isDeleting = false;
      this.cdRef.markForCheck();
    }
  }

  openConfirmDialog(): void {
    import('../shared/confirm-dialog/confirm-dialog.component').then(({ ConfirmDialogComponent }) => {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Xác nhận xóa',
          message: 'Bạn có chắc chắn muốn xóa các hình ảnh đã chọn không?',
          confirmText: 'Xóa',
          cancelText: 'Hủy',
        },
      });
      this.handleDialogResponse(dialogRef);
    });
  }

  private handleDialogResponse(dialogRef: MatDialogRef<ConfirmDialogComponent>): void {
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.removeSelectedImages();
      }
    });
  }

  unSelectAll(): void {
    this.selectedImages = [];
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = '';
  }

  getFilteredObjectTypes(): { label: string; value: string }[] {
    return this.objectTypes.filter((type) => type.value !== 'unused' && type.value !== '');
  }

  trackByImageId(index: number, image: Image): number {
    return image.id;
  }

  checkUploadType(event: Event): void {
    if (!this.uploadType) {
      event.preventDefault();
      this.snackbarService.show('Please select an object type', 300, 'center', 'top');
    }
  }

  viewSelectImage(): void {
    if (this.selectedImages.length > 1) {
      this.snackbarService.show('Please select only one image', 300, 'center', 'top');
      return;
    }

    if (this.selectedImages.length === 1) {
      this.selectedImage = this.selectedImages[0];
      this.dialog.open(ImageDetailDialogAdminComponent, {
        data: { image: this.selectedImage },
        width: '1000px',
        height: '600px',
      });
    }
  }
}
