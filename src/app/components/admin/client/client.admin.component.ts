import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Client } from '../../../models/client';
import { ClientService } from '../../../services/client.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NavigationState } from '../../../models/navigation-state';
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';
import { ApiResponse } from '../../../models/response';
import { stripHtml } from '../../../utils/strip-html'; // Import hàm stripHtml
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  private navigationStateMessage: string | null = null;
  private modalRef: NgbModalRef | null = null;
  private routerSubscription: Subscription | null = null;

  constructor(
    private clientService: ClientService,
    private router: Router,
    private toastr: ToastrService,
    private modalService: NgbModal,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit() {
    this.getClients();
    this.checkNavigationState();
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
        console.log(response.data);
      },
      complete: () => {},
      error: (error: any) => {
        console.error('Error fetching clients:', error);
        this.toastr.error('An error occurred while fetching clients.');
      },
    });
  }

  addClient() {
    this.router.navigate(['admin/client-add']);
  }

  openDeleteModal(id: number | null): void {
    if (id !== null) {
      this.clientIdToDelete = id;

      this.modalRef = this.modalService.open(ConfirmModalComponent);
      this.modalRef.componentInstance.title = 'Confirm Delete';
      this.modalRef.componentInstance.message =
        'Do you want to delete this client?';
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
            this.toastr.success(
              response.message || 'Category deleted successfully!',
            );
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
      this.router.navigate(['admin/client-edit', id]);
    } else {
      console.error('Client ID is null');
    }
  }
  private checkNavigationState(): void {
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        const navigation = this.router.getCurrentNavigation();
        const state = navigation?.extras?.state as NavigationState;
        if (state?.message) {
          this.navigationStateMessage = state.message;
        }
      }
    });

    if (this.navigationStateMessage) {
      this.toastr.success(this.navigationStateMessage);
      this.navigationStateMessage = null;
    }
  }
  // Hàm để loại bỏ các thẻ HTML khỏi description
  getPlainText(html: string): string {
    return stripHtml(html, this.platformId);
  }
}
