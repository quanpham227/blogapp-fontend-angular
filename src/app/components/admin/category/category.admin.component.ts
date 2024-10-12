import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CategoryService } from '../../../services/category.service';
import { ApiResponse } from '../../../models/response';
import { Category } from '../../../models/category';
import { Router, NavigationStart } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NavigationState } from '../../../models/navigation-state';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsertCategoryAdminComponent } from '../insert-category/insert-category.admin.component';
import { CategoryRequest } from '../../../request/category.request';
import { UpdateCategoryAdminComponent } from '../update-category/update-category.admin.component';

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
    private toastr: ToastrService,
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
        this.categories = response.data;
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
        this.toastr.error('An error occurred while fetching categories.');
      },
    });
  }

  addCategory(): void {
    const modalRef = this.modalService.open(InsertCategoryAdminComponent);
    modalRef.componentInstance.addCategory.subscribe(
      (category: CategoryRequest) => {
        // Gọi phương thức insertCategory từ CategoryService để thêm chuyên mục mới
        this.categoryService.insertCategory(category).subscribe({
          next: (response: ApiResponse<Category>) => {
            if (response.status === 'OK') {
              this.toastr.success(response.message);
              this.getCategories(); // Gọi lại hàm getCategories để làm mới danh sách
            } else {
              // Xử lý lỗi server trả về
              this.toastr.error(response.message);
            }
          },
          complete: () => {},
          error: (error: any) => {
            // Xử lý lỗi không mong đợi (như lỗi mạng, server không phản hồi)
            const errorMessage =
              error.error?.message ||
              'An unexpected error occurred. Please try again.';
            this.toastr.error(errorMessage);
            console.error('Error:', error);
          },
        });
      },
    );
  }

  openDeleteModal(id: number | null): void {
    if (id !== null) {
      this.categoryIdToDelete = id;

      this.modalRef = this.modalService.open(ConfirmModalComponent);
      this.modalRef.componentInstance.title = 'Confirm Delete';
      this.modalRef.componentInstance.message =
        'Do you want to delete this category?';
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
    if (this.categoryIdToDelete !== null) {
      this.categoryService.deleteCategory(this.categoryIdToDelete).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.status === 'OK') {
            this.toastr.success(
              response.message || 'Category deleted successfully!',
            );
            this.getCategories();
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
      this.categoryIdToDelete = null;
    }
  }

  editCategory(id: number | null): void {
    if (id !== null) {
      const modalRef = this.modalService.open(UpdateCategoryAdminComponent);
      modalRef.componentInstance.categoryId = id; // Truyền ID vào modal
      modalRef.componentInstance.updateCategory.subscribe(
        (category: CategoryRequest) => {
          // Gọi phương thức updateCategory từ CategoryService để cập nhật chuyên mục
          this.categoryService.updateCategory(id, category).subscribe({
            next: (response: ApiResponse<Category>) => {
              if (response.status === 'OK') {
                this.toastr.success(response.message);
                this.getCategories(); // Gọi lại hàm getCategories để làm mới danh sách
              } else {
                // Xử lý lỗi server trả về
                this.toastr.error(response.message);
              }
            },
            error: (error: any) => {
              // Xử lý lỗi không mong đợi (như lỗi mạng, server không phản hồi)
              const errorMessage =
                error.error?.message ||
                'An unexpected error occurred. Please try again.';
              this.toastr.error(errorMessage);
              console.error('Error:', error);
            },
          });
        },
      );
    } else {
      console.error('Category ID is null');
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
      console.error('Category ID is null');
    }
  }
}
