import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageService } from '../../../../../services/image.service';
import { ToastrService } from 'ngx-toastr';
import { Image } from '../../../../../models/image';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpEvent, HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-image-select-modal-admin',
  templateUrl: './image-select-modal.admin.component.html',
  styleUrls: ['./image-select-modal.admin.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class ImageSelectModalAdminComponent implements OnInit {
  @Input() objectType: string = ''; // Nhận object_type từ component cha
  selectedImage: string | null = null;
  selectedFileName: string | null = null; // Thêm thuộc tính này
  activeTab: string = 'upload'; // Quản lý tab hiện tại
  images: Image[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 50;
  pages: number[] = [];
  totalPages: number = 0;
  visiblePages: number[] = [];
  keyword: string = '';
  uploadProgress: number = 0;
  uploadingImage: boolean = false;
  uploadSuccess: boolean = false;
  uploadError: boolean = false;
  uploadComplete: boolean = false;
  allImagesLoaded: boolean = false;

  isHidden: boolean = false;

  constructor(
    private imageService: ImageService,
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadImages(this.keyword, this.currentPage, this.itemsPerPage);
  }

  loadImages(keyword: string, page: number, limit: number) {
    this.imageService.getImages(keyword, page, limit).subscribe({
      next: (response: any) => {
        this.images = [...this.images, ...response.images]; // Giữ nguyên các hình ảnh trước đó và thêm hình ảnh mới
        this.totalPages = response.totalPages;
        this.currentPage++;
        if (this.currentPage >= this.totalPages) {
          this.allImagesLoaded = true;
        }
      },
      error: (error: any) => {
        console.error('Error fetching posts:', error);
      },
    });
  }
  loadMoreImages(): void {
    this.loadImages(this.keyword, this.currentPage, this.itemsPerPage);
  }
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (this.isValidFile(file)) {
        this.selectedFileName = file.name; // Lưu tên file đã chọn
        this.uploadingImage = true;
        this.uploadProgress = 0;
        this.uploadSuccess = false;
        this.uploadError = false;
        this.uploadComplete = false; // Đặt lại trạng thái hoàn tất
        this.setActiveTab('upload');

        this.imageService.uploadImage(file, this.objectType).subscribe({
          next: (event: HttpEvent<any>) => {
            debugger;
            switch (event.type) {
              case HttpEventType.Sent:
                console.log('Request sent');
                break;
              case HttpEventType.UploadProgress:
                if (event.total && event.total > 0) {
                  this.uploadProgress = Math.round(
                    (100 * event.loaded) / event.total,
                  );
                  console.log(`Uploaded ${this.uploadProgress}%`);
                } else {
                  this.uploadProgress = 100;
                }
                break;
              case HttpEventType.ResponseHeader:
                console.log('Response header received');
                break;
              case HttpEventType.DownloadProgress:
                console.log(`Download in progress: ${event.loaded}`);
                break;
              case HttpEventType.Response:
                console.log('Upload complete');
                this.images.push(event.body.data);
                this.selectedImage = event.body.data.image_url;
                this.uploadSuccess = true;
                this.uploadComplete = true; // Đặt trạng thái hoàn tất
                break;
              default:
                console.log(`Unhandled event: ${event.type}`);
            }
          },
          error: (error: any) => {
            this.uploadError = true;
            this.uploadingImage = false;
            const errorMessage =
              error.error?.message ||
              'Error uploading image. Please try again.';
            this.toastr.error(errorMessage, 'Error');
          },
          complete: () => {
            this.uploadingImage = false;
          },
        });
      } else {
        this.toastr.error(
          'Invalid file type or size. Please select a valid image file.',
          'Error',
        );
        console.error('Invalid file type or size');
      }
    }
  }

  isValidFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  selectImage(imageUrl: string): void {
    if (this.selectedImage === imageUrl) {
      // Nếu hình ảnh đã được chọn, bỏ tích
      this.selectedImage = null;
    } else {
      // Nếu hình ảnh chưa được chọn, tích vào
      this.selectedImage = imageUrl;
    }
  }

  confirmSelection(): void {
    if (this.selectedImage) {
      this.activeModal.close(this.selectedImage);
    }
  }

  closeModal(): void {
    this.activeModal.dismiss();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.onFileChange({ target: { files: [file] } });
    }
  }
}
