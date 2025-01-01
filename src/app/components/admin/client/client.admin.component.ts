import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Client } from '../../../models/client';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { ImageSelectDialogAdminComponent } from '../shared/image-select-dialog/image-select-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ClientService } from '../../../services/client.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ApiResponse } from '../../../models/response';
import { ClientRequest } from '../../../request/client.request';
import { MatTooltipModule } from '@angular/material/tooltip';

import { LoadingSpinnerComponent } from '../../common/loading-spinner/loading-spinner.component';
import { SnackbarService } from '../../../services/snackbar.service';
import { Status } from '../../../enums/status.enum';

@UntilDestroy()
@Component({
  selector: 'app-client-admin',
  templateUrl: './client.admin.component.html',
  styleUrls: ['./client.admin.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTooltipModule, DragDropModule, MatDialogModule, LoadingSpinnerComponent],
})
export class ClientAdminComponent implements OnInit {
  @ViewChild('client', { static: true }) content!: TemplateRef<any>;
  clients: Client[] = [];
  clientForm: FormGroup;
  showForm = false;
  editMode = false;
  currentEditId: number | null = null;
  logoPreview: string | null = null;
  visiblePartners: Client[] = [];
  currentIndex = 0;
  dialogRef: MatDialogRef<any> | null = null;
  autoSlideInterval: any;

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private snackBarService: SnackbarService,
  ) {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(10000)]],
      logo: ['', Validators.required],
      publicId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getClients();
  }

  getClients() {
    this.clientService
      .getClients()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Client[]>) => {
          if (response.status === Status.OK) {
            if (response.data) {
              this.clients = response.data;
            }
          }
          this.cdr.markForCheck(); // Inform Angular to check for changes
        },
        error: (error) => {
          this.cdr.markForCheck(); // Inform Angular to check for changes
        },
      });
  }

  openForm(client: Client | null = null): void {
    console.log('Open form ... ');
    if (client) {
      this.clientForm.patchValue(client);
      this.logoPreview = client.logo;
      this.currentEditId = client.id;
      this.editMode = true;
      // Remove validators for logo and publicId in edit mode
      this.clientForm.get('logo')?.clearValidators();
      this.clientForm.get('publicId')?.clearValidators();
    } else {
      this.clientForm.reset({ status: true, order: this.clients.length + 1 });
      this.logoPreview = null;
      this.currentEditId = null;
      this.editMode = false;
      // Add validators for logo and publicId in add mode
      this.clientForm.get('logo')?.setValidators([Validators.required]);
      this.clientForm.get('publicId')?.setValidators([Validators.required]);
    }

    // Update the validity of the form controls
    this.clientForm.get('logo')?.updateValueAndValidity();
    this.clientForm.get('publicId')?.updateValueAndValidity();

    this.dialogRef = this.dialog.open(this.content, {
      width: '600px',
      disableClose: true,
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (this.editMode && this.currentEditId) {
          this.updateClient(this.currentEditId, this.clientForm.value);
        } else {
          this.createClient(this.clientForm.value);
        }
      }
    });
  }

  closeForm(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.showForm = false;
    this.logoPreview = null;
    this.currentEditId = null;
    this.cdr.markForCheck(); // Inform Angular to check for changes
  }

  openImageSelectDialog(): void {
    import('../shared/image-select-dialog/image-select-dialog.component').then(({ ImageSelectDialogAdminComponent }) => {
      const dialogRef = this.dialog.open(ImageSelectDialogAdminComponent, {
        width: '1000px',
        disableClose: true,
        data: {
          /* truyền dữ liệu nếu cần */
        },
      });
      this.handleDialogResponseSelectImage(dialogRef);
    });
  }

  private handleDialogResponseSelectImage(dialogRef: MatDialogRef<ImageSelectDialogAdminComponent>): void {
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.clientForm.patchValue({
            logo: result.url,
            publicId: result.publicId,
          });
          this.logoPreview = result.url;
          this.cdr.markForCheck(); // Inform Angular to check for changes
        }
      },
      error: (reason) => {
        console.log('Dismissed');
      },
    });
  }

  clearImage(): void {
    this.logoPreview = null;
    this.clientForm.patchValue({
      logo: '',
      publicId: '',
    });
    this.cdr.markForCheck(); // Inform Angular to check for changes
  }

  deleteClient(id: number): void {
    if (id === null) {
      return;
    }
    const dialogData: ConfirmDialogData = {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this client?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    };

    import('../shared/confirm-dialog/confirm-dialog.component').then(({ ConfirmDialogComponent }) => {
      this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: dialogData,
      });
      this.handleDialogResponseDelete(this.dialogRef, id);
    });
  }
  private handleDialogResponseDelete(dialogRef: MatDialogRef<ConfirmDialogComponent>, id: number): void {
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.clientService
            .deleteClient(id)
            .pipe(untilDestroyed(this))
            .subscribe({
              next: (response: ApiResponse<void>) => {
                if (response.status === Status.OK) {
                  this.clients = this.clients.filter((client) => client.id !== id);
                  this.cdr.markForCheck(); // Inform Angular to check for changes
                }
              },
              error: (error) => {
                this.snackBarService.show('Failed to delete client');
              },
            });
        }
      },
      error: (reason) => {
        console.log('Dismissed');
      },
    });
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      const formValue = this.clientForm.value;
      const clientRequest: ClientRequest = {
        name: formValue.name,
        description: formValue.description,
        logo: formValue.logo,
        publicId: formValue.publicId,
      };

      if (this.editMode && this.currentEditId) {
        this.updateClient(this.currentEditId, clientRequest);
      } else {
        this.createClient(clientRequest);
      }
    } else {
      this.snackBarService.show('Please fill in all required fields');
    }
  }

  createClient(clientRequest: ClientRequest): void {
    this.clientService
      .insertClient(clientRequest)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Client>) => {
          if (response.status === Status.CREATED) {
            if (response.data) {
              this.clients.push(response.data);
              this.closeForm();
              this.cdr.markForCheck(); // Inform Angular to check for changes
            }
          }
        },
        error: (error) => {},
      });
  }

  updateClient(id: number, clientRequest: ClientRequest): void {
    this.clientService
      .updateClient(id, clientRequest)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Client>) => {
          if (response.status === Status.OK) {
            if (response.data) {
              const index = this.clients.findIndex((s) => s.id === id);
              if (index !== -1) {
                this.clients[index] = response.data;
              }
              this.closeForm();
              this.cdr.markForCheck(); // Inform Angular to check for changes
            }
          }
        },
        error: (error) => {
          this.snackBarService.show('Failed to update client');
        },
      });
  }

  truncate(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  }
}
