import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TinymceEditorComponent } from '../../tinymce-editor/tinymce-editor.component';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiResponse } from '../../../models/response';
import { Client } from '../../../models/client';
import { ClientService } from '../../../services/client.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { contentLengthValidator } from '../../../validators/validators'; // Nhập validator
import { ImageSelectModalAdminComponent } from '../shared/components/image-select-modal/image-select-modal.admin.component'; // Import ImageSelectModalAdminComponent
import { SanitizeService } from '../../../services/sanitize.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-form-admin',
  templateUrl: './client-add-or-update.admin.component.html',
  styleUrls: ['./client-add-or-update.admin.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    TinymceEditorComponent,
  ],
})
export class ClientAddOrUpdateAdminComponent implements OnInit {
  clientForm: FormGroup;
  clientId: number | null = null;
  selectedLogoUrl: string | null = null;

  client: Client = {
    id: 0,
    name: '',
    description: '',
    logo: '',
  };

  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private sanitizeService: SanitizeService,
    @Inject(PLATFORM_ID) private platformId: Object,
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
        [Validators.required, contentLengthValidator(5, 10000)],
      ],
      logo: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.clientId = +params.get('id')!;
      this.isEditMode = !!this.clientId;
      if (this.isEditMode) {
        this.loadClient();
      }
    });
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

  saveClient(): void {
    if (this.clientForm.invalid) {
      this.toastr.error('All fields are required and must be valid!');
      return;
    }

    const sanitizedDescription = this.sanitizeService.sanitizeHtml(
      this.clientForm.value.description,
    );
    const formData = {
      ...this.clientForm.value,
      description: sanitizedDescription,
    };

    if (this.isEditMode) {
      this.updateClient(formData);
    } else {
      this.addClient(formData);
    }
  }

  addClient(formData: any): void {
    this.clientService.insertClient(formData).subscribe({
      next: (response: ApiResponse<Client>) => {
        if (response.status === 'OK') {
          this.toastr.success(response.message);
          this.router.navigate(['/admin/clients'], {
            state: { message: response.message },
          });
        } else {
          this.toastr.error(response.message);
        }
      },
      error: (error: any) => {
        const errorMessage =
          error.error?.message ||
          'An unexpected error occurred. Please try again.';
        this.toastr.error(errorMessage);
        console.error('Error:', error);
      },
    });
  }

  updateClient(formData: any): void {
    if (this.clientId !== null) {
      this.clientService.updateClient(this.clientId, formData).subscribe({
        next: (response: ApiResponse<Client>) => {
          if (response.status === 'OK') {
            this.toastr.success(response.message);
            this.router.navigate(['/admin/clients'], {
              state: { message: response.message },
            });
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (error: any) => {
          const errorMessage =
            error.error?.message ||
            'An unexpected error occurred while updating the client. Please try again.';
          this.toastr.error(errorMessage);
          console.error('Error:', error);
        },
      });
    }
  }

  removeLogo() {
    this.selectedLogoUrl = null;
    this.clientForm.patchValue({ logo: null });
  }

  onDescriptionChange(description: string): void {
    this.clientForm.patchValue({ description });
  }
}
