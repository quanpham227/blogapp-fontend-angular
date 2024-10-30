import { Component, ViewChild, ElementRef, Renderer2, Input, HostListener, AfterViewInit, OnInit } from '@angular/core';
import { Image } from '../../../../../models/image';
import { ImageService } from '../../../../../services/image.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfirmModalComponent } from '../../../../common/confirm-modal/confirm-modal.component';
import { checkFile, FileValidationResult } from '../../../../../utils/file-validator';
import { firstValueFrom } from 'rxjs';
import { LazyLoadDirective } from '../../../../../directives/lazy-load.directive';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-image-select-modal-admin',
  templateUrl: './image-select-modal.admin.component.html',
  styleUrls: ['./image-select-modal.admin.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, LazyLoadDirective],
})
export class ImageSelectModalAdminComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef;

  isSearchActive = false;
  images: Image[] = [];
  selectedImages: Image[] = [];
  selectedObjectType: string = '';
  currentPage: number = 0;
  itemsPerPage: number = 24;
  pages: number[] = [];
  totalPages: number = 0;
  totalFileSize: number = 0;
  visiblePages: number[] = [];
  keyword: string = '';
  allImagesLoaded: boolean = false;
  uploadType: string = '';
  selectedImage: Image | null = null;
  isDeleting: boolean = false;

  constructor(
    private renderer: Renderer2,
    private imageService: ImageService,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private activeModal: NgbActiveModal,
    private cdRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadImages();
  }
  ngAfterViewInit(): void {
    this.cdRef.detectChanges(); // Đảm bảo view được cập nhật sau khi modal mở
  }
  async loadImages(append: boolean = true) {
    try {
      const response = await firstValueFrom(
        this.imageService.getImages(this.keyword, this.selectedObjectType, this.currentPage, this.itemsPerPage),
      );
      if (response) {
        if (append) {
          this.images = [...this.images, ...response.images];
        } else {
          this.images = response.images;
        }
        this.totalPages = response.totalPages;
        this.totalFileSize = response.totalFileSizes;
        this.currentPage++;
        if (this.currentPage >= this.totalPages) {
          this.allImagesLoaded = true;
        }
        this.cdRef.detectChanges();
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      this.toastr.error('Lỗi khi tải hình ảnh');
    }
  }

  // Hàm để chuyển đổi hiển thị của ô tìm kiếm
  toggleSearch() {
    this.isSearchActive = !this.isSearchActive;

    if (this.isSearchActive) {
      // Focus vào ô tìm kiếm khi nó hiển thị
      setTimeout(() => {
        this.searchInput.nativeElement.focus();
      }, 0);
    }
  }
  @HostListener('scroll', ['$event'])
  onScroll(event: any): void {
    const element = event.target;
    if (element.scrollHeight - element.scrollTop === element.clientHeight) {
      this.loadImages(true);
    }
  }

  filterMedia(type: string) {
    this.selectedObjectType = type;
    this.currentPage = 0;
    this.images = [];
    this.loadImages(false);
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
    }
  }

  uploadFile(file: File): void {
    // Tạo đối tượng hình ảnh tạm thời
    const tempImage: Image = {
      id: 0, // ID tạm thời
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      image_url: URL.createObjectURL(file), // Tạo URL tạm thời cho hình ảnh
      public_id: '',
      file_name: file.name,
      object_type: this.uploadType,
      file_type: file.type,
      file_size: file.size,
      is_used: false,
      usage_count: 0,
      isTemporary: true, // Đánh dấu là hình ảnh tạm thời
      isUploading: true, // Đánh dấu là hình ảnh đang tải lên
    };

    // Thêm hình ảnh tạm thời vào danh sách
    this.images.unshift(tempImage);

    this.imageService.uploadImage(file, this.uploadType).subscribe({
      next: (event: any) => {
        if (event.status === 'CREATED') {
          this.toastr.success(event.message);
          // Cập nhật hình ảnh tạm thời với dữ liệu từ server
          const index = this.images.findIndex((img) => img.id === 0);
          if (index !== -1) {
            this.images[index] = {
              ...event.data,
              isTemporary: false,
              isUploading: false,
            }; // Cập nhật hình ảnh với dữ liệu từ server
          }
          // Gọi lại hàm loadImages để cập nhật danh sách hình ảnh từ server
          this.loadImages(true);
        } else if (event.status === 'error') {
          this.toastr.error(event.message);
          // Xóa hình ảnh tạm thời nếu tải lên thất bại
          this.images = this.images.filter((img) => img.id !== 0);
        }
      },
      error: (error: any) => {
        console.error('Lỗi khi tải lên hình ảnh:', error);
        this.toastr.error('Lỗi khi tải lên hình ảnh');
        // Xóa hình ảnh tạm thời nếu tải lên thất bại
        this.images = this.images.filter((img) => img.id !== 0);
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
    if (this.selectedImages.includes(image)) {
      this.selectedImages = [];
    } else {
      this.selectedImages = [image];
    }
  }

  isSelected(image: Image): boolean {
    return this.selectedImages.indexOf(image) !== -1;
  }

  getSelectedIndex(image: Image): number {
    return this.selectedImages.indexOf(image) + 1;
  }

  async removeSelectedImages(): Promise<void> {
    this.isDeleting = true;
    const idsToDelete = this.selectedImages.map((image) => image.id);
    try {
      await firstValueFrom(this.imageService.deleteImages(idsToDelete));
      this.toastr.success('Đã xóa các hình ảnh thành công');
      this.selectedImages.forEach((image) => {
        const index = this.images.indexOf(image);
        if (index !== -1) {
          this.images.splice(index, 1);
        }
      });
      this.selectedImages = [];
      this.currentPage = 0;
      this.loadImages(false); // Gọi hàm loadImages với append là false
    } catch (error) {
      console.error('Error deleting images:', error);
      this.toastr.error('Lỗi khi xóa hình ảnh');
    } finally {
      this.isDeleting = false;
    }
  }

  // async viewSelectedImages(content: any): Promise<void> {
  //   if (this.selectedImages.length === 0) {
  //     alert('Vui lòng chọn ít nhất một hình ảnh để chỉnh sửa');
  //     return;
  //   } else if (this.selectedImages.length > 1) {
  //     alert('Chỉ có thể chỉnh sửa một hình ảnh mỗi lần');
  //     return;
  //   } else {
  //     const selectedImageId = this.selectedImages[0].id;
  //     if (selectedImageId !== null) {
  //       try {
  //         const response = await firstValueFrom(
  //           this.imageService.getImageById(selectedImageId),
  //         );
  //         if (response && response.status === 'OK') {
  //           this.selectedImage = response.data;
  //           this.modalService.open(content, {
  //             ariaLabelledBy: 'imageModalLabel',
  //           });
  //         } else if (response) {
  //           this.toastr.error(response.message);
  //         }
  //       } catch (error) {
  //         console.error('Error loading image:', error);
  //         this.toastr.error('An error occurred while loading the image.');
  //       }
  //     }
  //   }
  // }

  openConfirmModal(): void {
    const modalRef = this.modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.title = 'Xác nhận xóa';
    modalRef.componentInstance.message = 'Bạn có chắc chắn muốn xóa các hình ảnh đã chọn không?';
    modalRef.componentInstance.confirmText = 'Xóa';
    modalRef.componentInstance.cancelText = 'Hủy';

    modalRef.componentInstance.confirm.subscribe(() => {
      this.removeSelectedImages();
    });
  }
  unSelectAll(): void {
    this.selectedImages = [];
  }
  insertSelectedImage(): void {
    if (this.selectedImages.length > 0) {
      const selectedImage = this.selectedImages[0];
      // Đóng modal và truyền dữ liệu hình ảnh đã chọn
      this.activeModal.close({
        url: selectedImage.image_url,
        publicId: selectedImage.public_id,
      });
    }
  }
  closeModal() {
    this.activeModal.dismiss('cancel');
  }
  // confirmSelection(): void {
  //   if (this.selectedImage) {
  //     const selectedImage = this.images.find(
  //       (image) => image.image_url === this.selectedImage,
  //     );
  //     if (selectedImage) {
  //       this.activeModal.close({
  //         url: selectedImage.image_url,
  //         publicId: selectedImage.public_id,
  //       });
  //     }
  //   }
  // }
}
