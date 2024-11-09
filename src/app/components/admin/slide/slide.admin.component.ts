import { Component, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ConfirmModalComponent } from '../../common/confirm-modal/confirm-modal.component';
import { ApiResponse } from '../../../models/response';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Slide } from '../../../models/slide';
import { SlideService } from '../../../services/slide.service';
import { SlideRequest } from '../../../request/slide.request';
import { InsertSlideAdminComponent } from '../insert-slide/insert-slide.admin.component';
import { UpdateSlideAdminComponent } from '../update-slide/update-slide.component';
import { NavigationEnd, Router } from '@angular/router';
import { MessageService } from '../../../services/message.service';
import { ToasterService } from '../../../services/toaster.service';
import { SuccessHandlerService } from '../../../services/success-handler.service';

@Component({
  selector: 'app-slide',
  templateUrl: './slide.admin.component.html',
  styleUrls: ['./slide.admin.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class SlideAdminComponent {
  @ViewChild('content', { static: true }) content!: TemplateRef<any>;
  slides: Slide[] = [];
  slideIdToDelete: number | null = null;
  private modalRef: NgbModalRef | null = null;
  private routerSubscription: Subscription | null = null;
  menuVisible = false;
  selectedSlideId: number | null = null;

  constructor(
    private slideService: SlideService,
    private toast: ToasterService,
    private modalService: NgbModal,
  ) {}

  ngOnInit() {
    this.getSlides();
  }

  getSlides() {
    this.slideService.getSlides().subscribe({
      next: (response: any) => {
        if (response.status === 'OK' && response.data) {
          this.slides = response.data;
        }
      },
    });
  }

  addSlide() {
    const modalRef = this.modalService.open(InsertSlideAdminComponent, {
      centered: true, // Căn giữa theo chiều dọc
      backdrop: 'static', // Không cho phép đóng khi click ngoài
      keyboard: true, //  cho phép đóng bằng phím Esc
      windowClass: 'admin-modal', // Class tùy chỉnh cho modal
      size: 'md',
    });
    modalRef.componentInstance.addSlide.subscribe((slide: SlideRequest) => {
      this.slideService.insertSlide(slide).subscribe({
        next: (response: ApiResponse<Slide>) => {
          if (response.status === 'OK' || response.status === 'CREATE') {
            this.getSlides();
          }
        },
      });
    });
  }

  openDeleteModal(id: number | null): void {
    if (id !== null) {
      this.slideIdToDelete = id;
      this.modalRef = this.modalService.open(ConfirmModalComponent);
      this.modalRef.componentInstance.title = 'Confirm Delete';
      this.modalRef.componentInstance.message = 'Do you want to delete this slide?';
      this.modalRef.componentInstance.confirmText = 'Delete';
      this.modalRef.componentInstance.cancelText = 'Cancel';

      this.modalRef.componentInstance.confirm.subscribe(() => {
        this.confirmDelete();
      });
    } else {
      this.toast.warning('Slide ID is null');
    }
  }

  confirmDelete(): void {
    if (this.slideIdToDelete !== null) {
      console.log(this.slideIdToDelete);
      debugger;
      this.slideService.deleteSlide(this.slideIdToDelete).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.status === 'OK') {
            this.getSlides();
          }
        },
        complete: () => {
          if (this.modalRef) {
            this.modalRef.close();
          }
        },
      });
      this.slideIdToDelete = null;
    }
  }

  editSlide(id: number | null): void {
    if (id !== null) {
      const modalRef = this.modalService.open(UpdateSlideAdminComponent, {
        size: 'lg', // Modal lớn
        centered: true, // Căn giữa theo chiều dọc
        backdrop: 'static', // Không cho phép đóng khi click ngoài
        keyboard: true, //  cho phép đóng bằng phím Esc
        windowClass: 'admin-modal', // Class tùy chỉnh cho modal
        backdropClass: 'admin-modal-backdrop', // Thêm lớp custom cho backdrop
      });
      modalRef.componentInstance.slideId = id; // Truyền ID vào modal
      modalRef.componentInstance.updateSlide.subscribe((slide: SlideRequest) => {
        this.slideService.updateSlide(id, slide).subscribe({
          next: (response: ApiResponse<Slide>) => {
            if (response.status === 'OK' || response.status === 'UPDATE') {
              this.getSlides();
            }
          },
        });
      });
    } else {
      this.toast.warning('Category ID is null');
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.menuVisible) {
      this.menuVisible = false;
      this.selectedSlideId = null;
    }
  }
  toggleMenu(event: Event, clientId: number | null): void {
    if (clientId !== null) {
      if (this.selectedSlideId === clientId && this.menuVisible) {
        this.menuVisible = false;
        this.selectedSlideId = null;
      } else {
        this.menuVisible = true;
        this.selectedSlideId = clientId;
      }
      event.stopPropagation(); // Ensure no other unwanted events are triggered
    } else {
      this.toast.warning('Client ID is null');
    }
  }
}
