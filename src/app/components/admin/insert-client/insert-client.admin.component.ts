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
    });
  }

  onSubmit() {
    if (this.clientForm.valid) {
      this.addClient.emit(this.clientForm.value);
      this.activeModal.close();
    }
  }

  openLogoModal(): void {
    const modalRef = this.modalService.open(ImageSelectModalAdminComponent);
    modalRef.componentInstance.objectType = 'clients'; // Truyền object_type vào modal
    modalRef.result.then(
      (result: string) => {
        this.selectedLogoUrl = result;
        this.clientForm.patchValue({ logo: result });
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
