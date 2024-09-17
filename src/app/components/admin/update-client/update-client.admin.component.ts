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
import { ClientRequest } from '../../../request/client.request';
import { ImageSelectModalAdminComponent } from '../shared/components/image-select-modal/image-select-modal.admin.component';
import { ClientService } from '../../../services/client.service';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../../models/response';
import { Client } from '../../../models/client';

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

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private clientService: ClientService,
    private toastr: ToastrService,
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
  ngOnInit(): void {
    if (this.clientId !== null) {
      this.loadClient();
    }
  }
  loadClient(): void {
    if (this.clientId !== null) {
      this.clientService.getClientById(this.clientId).subscribe({
        next: (response: ApiResponse<Client>) => {
          if (response.status === 'OK') {
            this.clientForm.patchValue(response.data);
            this.selectedLogoUrl = response.data.logo;
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (error: any) => {
          console.error('Error loading client:', error);
          this.toastr.error('An error occurred while loading the client.');
        },
      });
    }
  }
  onSubmit() {
    if (this.clientForm.valid) {
      this.updateClient.emit(this.clientForm.value);
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
