import { Component, Output, EventEmitter, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientRequest } from '../../../request/client.request';
import { ImageSelectModalAdminComponent } from '../shared/components/image-select-modal/image-select-modal.admin.component';
import { ClientService } from '../../../services/client.service';
import { ApiResponse } from '../../../models/response';
import { Client } from '../../../models/client';
import { ToasterService } from '../../../services/toaster.service';
import { SuccessHandlerService } from '../../../services/success-handler.service';

@Component({
  selector: 'app-update-client-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './update-client.admin.component.html',
  styleUrl: './update-client.admin.component.scss',
})
export class UpdateClientAdminComponent {
  clientForm: FormGroup;
  @Input() clientId: number | null = null; // Nhận ID từ component cha
  // Tạo một EventEmitter để phát sự kiện thêm category
  @Output() updateClient = new EventEmitter<ClientRequest>();
  selectedLogoUrl: string | null = null;
  selectedPublicId: string | null = null;

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private clientService: ClientService,
    private toast: ToasterService,
    private successHandlerService: SuccessHandlerService,
  ) {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      logo: ['', Validators.required],
      public_id: [''],
    });
  }
  ngOnInit(): void {
    if (this.clientId !== null) {
      this.loadClient();
    }
  }
  loadClient(): void {
    if (this.clientId !== null) {
      this.clientService.getClientById(this.clientId).subscribe({
        next: (response: ApiResponse<Client>) => {
          if (response.status === 'OK' && response.data) {
            this.clientForm.patchValue(response.data);
            this.selectedLogoUrl = response.data.logo;
          }
        },
      });
    }
  }
  onSubmit() {
    if (this.clientForm.valid) {
      this.updateClient.emit(this.clientForm.value);
      this.activeModal.close();
    } else {
      this.toast.warning('Form is invalid, cannot submit:');
    }
  }

  openLogoModal(): void {
    const modalRef = this.modalService.open(ImageSelectModalAdminComponent);
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
