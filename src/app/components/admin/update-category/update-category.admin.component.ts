import { Component, Output, EventEmitter, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryRequest } from '../../../request/category.request';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../services/category.service';
import { ApiResponse } from '../../../models/response';
import { Category } from '../../../models/category';
import { ToasterService } from '../../../services/toaster.service';

@Component({
  selector: 'app-update-category-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './update-category.admin.component.html',
  styleUrl: './update-category.admin.component.scss',
})
export class UpdateCategoryAdminComponent {
  categoryForm: FormGroup;
  @Input() categoryId: number | null = null; // Nhận ID từ component cha
  // Tạo một EventEmitter để phát sự kiện thêm category
  @Output() updateCategory = new EventEmitter<CategoryRequest>();

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private toastr: ToasterService,
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
    });
  }

  ngOnInit(): void {
    if (this.categoryId !== null) {
      this.loadCategory();
    }
  }

  loadCategory(): void {
    if (this.categoryId !== null) {
      this.categoryService.getCategoryById(this.categoryId).subscribe({
        next: (response: ApiResponse<Category>) => {
          if (response.status === 'OK' && response.data) {
            this.categoryForm.patchValue(response.data);
          }
        },
      });
    }
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      this.updateCategory.emit(this.categoryForm.value);
      this.activeModal.close();
    }
  }
}
