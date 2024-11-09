import { Component, OnInit, OnDestroy, HostListener, inject, ChangeDetectionStrategy } from '@angular/core';
import { CategoryService } from '../../../services/category.service';
import { ApiResponse } from '../../../models/response';
import { Category } from '../../../models/category';
import { Router, NavigationStart } from '@angular/router';
import { NavigationState } from '../../../models/navigation-state';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from '../../common/confirm-modal/confirm-modal.component';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsertCategoryAdminComponent } from '../insert-category/insert-category.admin.component';
import { CategoryRequest } from '../../../request/category.request';
import { UpdateCategoryAdminComponent } from '../update-category/update-category.admin.component';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-category-admin',
  templateUrl: './category.admin.component.html',
  styleUrls: ['./category.admin.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class CategoryAdminComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  categoryIdToDelete: number | null = null;
  private navigationStateMessage: string | null = null;
  private modalRef: NgbModalRef | null = null;
  private routerSubscription: Subscription | null = null;
  menuVisible = false;
  selectedCategoryId: number | null = null;

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private toast: ToasterService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.getCategories();
    this.checkNavigationState();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  getCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response: ApiResponse<Category[]>) => {
        if (response.status === 'OK') {
          this.categories = response.data;
        }
      },
    });
  }

  addCategory(): void {
    const modalRef = this.modalService.open(InsertCategoryAdminComponent);
    modalRef.componentInstance.addCategory.subscribe((category: CategoryRequest) => {
      this.categoryService.insertCategory(category).subscribe({
        next: (response: ApiResponse<Category>) => {
          if (response.status === 'OK' || response.status === 'CREATED') {
            this.getCategories();
          }
        },
      });
    });
  }

  openDeleteModal(id: number | null): void {
    if (id !== null) {
      this.categoryIdToDelete = id;
      this.modalRef = this.modalService.open(ConfirmModalComponent);
      this.modalRef.componentInstance.title = 'Confirm Delete';
      this.modalRef.componentInstance.message = 'Do you want to delete this category?';
      this.modalRef.componentInstance.confirmText = 'Delete';
      this.modalRef.componentInstance.cancelText = 'Cancel';

      this.modalRef.componentInstance.confirm.subscribe(() => {
        this.confirmDelete();
      });
    } else {
      this.toast.warning('Category ID is null');
    }
  }

  confirmDelete(): void {
    if (this.categoryIdToDelete !== null) {
      this.categoryService.deleteCategory(this.categoryIdToDelete).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.status === 'OK') {
            this.getCategories();
          }
        },
        complete: () => {
          if (this.modalRef) {
            this.modalRef.close();
          }
        },
      });
      this.categoryIdToDelete = null;
    }
  }

  editCategory(id: number | null): void {
    if (id !== null) {
      const category = this.categories.find((cat) => cat.id === id);
      if (category) {
        const modalRef = this.modalService.open(UpdateCategoryAdminComponent, {
          centered: true,
          backdrop: 'static',
          keyboard: true,
          windowClass: 'admin-modal',
          size: 'md',
        });
        modalRef.componentInstance.categoryId = id; // Truyền ID vào modal
        modalRef.componentInstance.categoryForm.patchValue(category); // Truyền dữ liệu vào form
        modalRef.componentInstance.updateCategory.subscribe((categoryRequest: CategoryRequest) => {
          // Gọi phương thức updateCategory từ CategoryService để cập nhật chuyên mục
          this.categoryService.updateCategory(id, categoryRequest).subscribe({
            next: (response: ApiResponse<Category>) => {
              if (response.status === 'OK' || response.status === 'UPDATED') {
                this.getCategories(); // Gọi lại hàm getCategories để làm mới danh sách
              }
            },
          });
        });
      }
    } else {
      this.toast.warning('Category ID is null');
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
      this.toast.success(this.navigationStateMessage);
      this.navigationStateMessage = null;
    }
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.menuVisible) {
      this.menuVisible = false;
      this.selectedCategoryId = null;
    }
  }
  toggleMenu(event: Event, categoryId: number | null): void {
    if (categoryId !== null) {
      if (this.selectedCategoryId === categoryId && this.menuVisible) {
        this.menuVisible = false;
        this.selectedCategoryId = null;
      } else {
        this.menuVisible = true;
        this.selectedCategoryId = categoryId;
      }
      event.stopPropagation(); // Ensure no other unwanted events are triggered
    } else {
      this.toast.warning('Category ID is null');
    }
  }
}
