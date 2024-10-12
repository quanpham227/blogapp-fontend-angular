import { Component, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientRequest } from '../../../request/client.request';
import { ImageSelectModalAdminComponent } from '../shared/components/image-select-modal/image-select-modal.admin.component';

@Component({
  selector: 'app-insert-client-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './insert-client.admin.component.html',
  styleUrls: ['./insert-client.admin.component.scss'], // Sửa 'styleUrl' thành 'styleUrls'
})
export class InsertClientAdminComponent {
  clientForm: FormGroup;
  clientId: number | null = null;
  selectedLogoUrl: string | null = null;
  selectedPublicId: string | null = null; // Thêm thuộc tính này

  // Tạo một EventEmitter để phát sự kiện thêm category
  @Output() addClient = new EventEmitter<ClientRequest>();

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private fb: FormBuilder,
  ) {
    this.clientForm = this.fb.group({
      name: [
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
      logo: ['', Validators.required],
      public_id: ['', Validators.required], // Thêm trường này vào form
    });
  }

  onSubmit() {
    if (this.clientForm.valid) {
      this.addClient.emit(this.clientForm.value);
      this.activeModal.close();
    }
  }

  openLogoModal(): void {
    const modalRef = this.modalService.open(ImageSelectModalAdminComponent, {
      centered: true, // Căn giữa theo chiều dọc
      backdrop: 'static', // Không cho phép đóng khi click ngoài
      keyboard: true, //  cho phép đóng bằng phím Esc
      windowClass: 'admin-image-modal', // Class tùy chỉnh cho modal
      size: 'lg', // Sử dụng kích thước lớn
    });
    modalRef.result.then(
      (result: { url: string; publicId: string }) => {
        this.selectedLogoUrl = result.url;
        this.selectedPublicId = result.publicId;
        this.clientForm.patchValue({
          logo: result.url,
          public_id: result.publicId,
        });
      },
      (reason) => {
        console.log('Modal dismissed: ' + reason);
      },
    );
  }

  removeLogo() {
    this.selectedLogoUrl = null;
    this.clientForm.patchValue({ logo: null });
  }
}
