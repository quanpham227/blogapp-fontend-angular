import {
  Component,
  Output,
  EventEmitter,
  ViewEncapsulation,
  Input,
  ViewChild,
} from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SlideRequest } from '../../../request/slide.request';
import { ImageSelectModalAdminComponent } from '../shared/components/image-select-modal/image-select-modal.admin.component';
import { LazyLoadDirective } from '../../../directives/lazy-load.directive';

@Component({
  selector: 'insert-slide-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './insert-slide.admin.component.html',
  styleUrls: ['./insert-slide.admin.component.scss'],
})
export class InsertSlideAdminComponent {
  slideForm: FormGroup;
  slideId: number | null = null;
  selectedImageUrl: string | null = null;
  selectedPublicId: string | null = null;

  // Tạo một EventEmitter để phát sự kiện thêm category
  @Output() addSlide = new EventEmitter<SlideRequest>();

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private fb: FormBuilder,
  ) {
    this.slideForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(255),
        ],
      ],
      order: [0, Validators.required],
      image_url: ['', Validators.required],
      public_id: ['', Validators.required],
      link: [''],
    });
  }

  onSubmit() {
    if (this.slideForm.valid) {
      this.addSlide.emit(this.slideForm.value);
      this.activeModal.close();
    }
  }

  openImageModal(): void {
    const modalRef = this.modalService.open(ImageSelectModalAdminComponent, {
      centered: true, // Căn giữa theo chiều dọc
      backdrop: 'static', // Không cho phép đóng khi click ngoài
      keyboard: true, //  cho phép đóng bằng phím Esc
      windowClass: 'admin-image-modal', // Class tùy chỉnh cho modal
      size: 'lg', // Sử dụng kích thước lớn
    });

    modalRef.result.then(
      (result: { url: string; publicId: string }) => {
        this.selectedImageUrl = result.url;
        this.selectedPublicId = result.publicId;
        this.slideForm.patchValue({
          image_url: result.url,
          public_id: result.publicId,
        });
      },
      (reason) => {
        console.log('Modal dismissed: ' + reason);
      },
    );
  }

  removeImage() {
    this.selectedImageUrl = null;
    this.slideForm.patchValue({ image_url: null });
  }
}
