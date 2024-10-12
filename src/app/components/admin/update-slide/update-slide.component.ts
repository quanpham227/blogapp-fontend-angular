import { Component, Output, EventEmitter, Input } from '@angular/core';
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
import { ToastrService } from 'ngx-toastr';
import { Slide } from '../../../models/slide';
import { SlideService } from '../../../services/slide.service';
import { ApiResponse } from '../../../models/response';

@Component({
  selector: 'app-update-slide',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './update-slide.component.html',
  styleUrls: ['./update-slide.component.scss'],
})
export class UpdateSlideAdminComponent {
  slideForm: FormGroup;
  selectedImageUrl: string | null = null;
  selectedPublicId: string | null = null;
  @Input() slideId: number | null = null; // Nhận ID từ component cha

  // Tạo một EventEmitter để phát sự kiện thêm category
  @Output() updateSlide = new EventEmitter<SlideRequest>();

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private slideService: SlideService,
    private toastr: ToastrService,
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
      status: [true, Validators.required],
      order: [0, Validators.required],
      image_url: ['', Validators.required],
      public_id: ['', Validators.required],
      link: [''],
    });
  }

  ngOnInit() {
    if (this.slideId !== null) {
      this.loadSlide();
    }
  }
  loadSlide(): void {
    if (this.slideId !== null) {
      this.slideService.getSlideById(this.slideId).subscribe({
        next: (response: ApiResponse<Slide>) => {
          if (response.status === 'OK') {
            this.slideForm.patchValue(response.data);
            this.selectedImageUrl = response.data.image_url;
            this.selectedPublicId = response.data.public_id;
          } else {
            this.toastr.error(response.message);
          }
          console.log(this.slideForm.value);
        },
        error: (error: any) => {
          console.error('Error loading client:', error);
          this.toastr.error('An error occurred while loading the client.');
        },
      });
    }
  }
  onSubmit() {
    if (this.slideForm.valid) {
      this.updateSlide.emit(this.slideForm.value);
      this.activeModal.close();
    }
  }

  openImageModal(): void {
    const modalRef = this.modalService.open(ImageSelectModalAdminComponent);
    modalRef.componentInstance.objectType = 'slides'; // Truyền object_type vào modal
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
