import { Component, HostListener, inject, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Client } from '../../../models/client';
import { ClientService } from '../../../services/client.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ConfirmModalComponent } from '../../common/confirm-modal/confirm-modal.component';
import { ApiResponse } from '../../../models/response';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsertClientAdminComponent } from '../insert-client/insert-client.admin.component';
import { ClientRequest } from '../../../request/client.request';
import { UpdateClientAdminComponent } from '../update-client/update-client.admin.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-client-admin',
  templateUrl: './client.admin.component.html',
  styleUrls: ['./client.admin.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ClientAdminComponent implements OnInit {
  clients: Client[] = [];
  clientIdToDelete: number | null = null;
  private modalRef: NgbModalRef | null = null;
  private routerSubscription: Subscription | null = null;
  menuVisible = false;
  selectedClientId: number | null = null;

  constructor(
    private clientService: ClientService,
    private toastr: ToastrService,
    private modalService: NgbModal,
  ) {}

  ngOnInit() {
    this.getClients();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  getClients() {
    this.clientService.getClients().subscribe({
      next: (response: any) => {
        this.clients = response.data;
      },
      complete: () => {},
      error: (error: any) => {
        console.error('Error fetching clients:', error);
        this.toastr.error('An error occurred while fetching clients.');
      },
    });
  }

  addClient() {
    const modalRef = this.modalService.open(InsertClientAdminComponent, {
      centered: true, // Căn giữa theo chiều dọc
      backdrop: 'static', // Không cho phép đóng khi click ngoài
      keyboard: true, //  cho phép đóng bằng phím Esc
      windowClass: 'admin-modal', // Class tùy chỉnh cho modal
      size: 'md',
    });
    modalRef.componentInstance.addClient.subscribe((client: ClientRequest) => {
      this.clientService.insertClient(client).subscribe({
        next: (response: ApiResponse<Client>) => {
          if (response.status === 'OK') {
            this.toastr.success(response.message);
            this.getClients();
          } else {
            // Xử lý lỗi server trả về
            this.toastr.error(response.message);
          }
        },
        complete() {},
        error: (error: any) => {
          // Xử lý lỗi không mong đợi (như lỗi mạng, server không phản hồi)
          const errorMessage = error.error?.message || 'An unexpected error occurred. Please try again.';
          this.toastr.error(errorMessage);
          console.error('Error:', error);
        },
      });
    });
  }

  openDeleteModal(id: number | null): void {
    if (id !== null) {
      this.clientIdToDelete = id;

      this.modalRef = this.modalService.open(ConfirmModalComponent);
      this.modalRef.componentInstance.title = 'Confirm Delete';
      this.modalRef.componentInstance.message = 'Do you want to delete this client?';
      this.modalRef.componentInstance.confirmText = 'Delete';
      this.modalRef.componentInstance.cancelText = 'Cancel';

      this.modalRef.componentInstance.confirm.subscribe(() => {
        this.confirmDelete();
      });
    } else {
      console.error('Category ID is null');
    }
  }

  confirmDelete(): void {
    if (this.clientIdToDelete !== null) {
      this.clientService.deleteClient(this.clientIdToDelete).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.status === 'OK') {
            this.toastr.success(response.message || 'Category deleted successfully!');
            this.getClients();
          } else {
            this.toastr.error(response.message || 'Failed to delete category.');
          }
        },
        error: (error: any) => {
          console.error('Error deleting category:', error);
          this.toastr.error('An error occurred while deleting the category.');
        },
        complete: () => {
          if (this.modalRef) {
            this.modalRef.close();
          }
        },
      });
      this.clientIdToDelete = null;
    }
  }

  editClient(id: number | null): void {
    if (id !== null) {
      const modalRef = this.modalService.open(UpdateClientAdminComponent, {
        centered: true, // Căn giữa theo chiều dọc
        backdrop: 'static', // Không cho phép đóng khi click ngoài
        keyboard: true, //  cho phép đóng bằng phím Esc
        windowClass: 'admin-modal', // Class tùy chỉnh cho modal
        size: 'md',
      });
      modalRef.componentInstance.clientId = id; // Truyền ID vào modal
      modalRef.componentInstance.updateClient.subscribe((client: ClientRequest) => {
        this.clientService.updateClient(id, client).subscribe({
          next: (response: ApiResponse<Client>) => {
            if (response.status === 'OK') {
              this.toastr.success(response.message);
              this.getClients();
            } else {
              // Xử lý lỗi server trả về
              this.toastr.error(response.message);
            }
          },
          error: (error: any) => {
            // Xử lý lỗi không mong đợi (như lỗi mạng, server không phản hồi)
            const errorMessage = error.error?.message || 'An unexpected error occurred. Please try again.';
            this.toastr.error(errorMessage);
            console.error('Error:', error);
          },
        });
      });
    } else {
      console.error('Category ID is null');
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.menuVisible) {
      this.menuVisible = false;
      this.selectedClientId = null;
    }
  }
  toggleMenu(event: Event, clientId: number | null): void {
    if (clientId !== null) {
      if (this.selectedClientId === clientId && this.menuVisible) {
        this.menuVisible = false;
        this.selectedClientId = null;
      } else {
        this.menuVisible = true;
        this.selectedClientId = clientId;
      }
      event.stopPropagation(); // Ensure no other unwanted events are triggered
    } else {
      console.error('Client ID is null');
    }
  }
}
