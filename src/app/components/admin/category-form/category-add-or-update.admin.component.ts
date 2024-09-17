import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CategoryService } from '../../../services/category.service';
import { ToastrService } from 'ngx-toastr';
import { Category } from '../../../models/category';
import { ApiResponse } from '../../../models/response';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-form-admin',
  templateUrl: './category-add-or-update.admin.component.html',
  styleUrls: ['./category-add-or-update.admin.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
})
export class CategoryAddOrUpdateAdminComponent implements OnInit {
  categoryForm: FormGroup;
  categoryId: number | null = null;
  category: Category = {
    id: null,
    name: '',
    code: '',
    description: '',
    postCount: 0,
  };

  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
  ) {
    this.categoryForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.categoryId = this.categoryId = Number(params.get('id'));

      this.isEditMode = !!this.categoryId;
      if (this.isEditMode) {
        this.loadCategory();
      }
    });
  }

  loadCategory(): void {
    if (this.categoryId !== null) {
      this.categoryService.getCategoryById(this.categoryId).subscribe({
        next: (response: ApiResponse<Category>) => {
          if (response.status === 'OK') {
            this.categoryForm.patchValue(response.data);
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (error: any) => {
          console.error('Error loading category:', error);
          this.toastr.error('An error occurred while loading the category.');
        },
      });
    }
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.toastr.error('All fields are required and must be valid!');
      return;
    }

    if (this.isEditMode) {
      this.updateCategory();
    } else {
      this.addCategory();
    }
  }
  addCategory(): void {
    this.categoryService.insertCategory(this.categoryForm.value).subscribe({
      next: (response: ApiResponse<Category>) => {
        if (response.status === 'OK') {
          this.toastr.success(response.message);
          this.router.navigate(['/admin/categories'], {
            state: { message: response.message },
          });
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
  }

  updateCategory(): void {
    if (this.categoryId !== null) {
      this.categoryService
        .updateCategory(this.categoryId, this.categoryForm.value)
        .subscribe({
          next: (response: ApiResponse<Category>) => {
            if (response.status === 'OK') {
              this.toastr.success(response.message);
              this.router.navigate(['/admin/categories'], {
                state: { message: response.message },
              });
            } else {
              // Xử lý lỗi server trả về
              this.toastr.error(response.message);
            }
          },
          error: (error: any) => {
            // Xử lý lỗi không mong đợi (như lỗi mạng, server không phản hồi)
            const errorMessage =
              error.error?.message ||
              'An unexpected error occurred while updating the category. Please try again.';
            this.toastr.error(errorMessage);
            console.error('Error:', error);
          },
        });
    }
  }
}
