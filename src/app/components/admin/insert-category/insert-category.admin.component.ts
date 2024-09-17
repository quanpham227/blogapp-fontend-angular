import { Component, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CategoryRequest } from '../../../request/category.request';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-insert-category-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './insert-category.admin.component.html',
  styleUrls: ['./insert-category.admin.component.scss'],
})
export class InsertCategoryAdminComponent {
  categoryForm: FormGroup;
  categoryId: number | null = null;
  name: string = '';
  description: string = '';

  // Tạo một EventEmitter để phát sự kiện thêm category
  @Output() addCategory = new EventEmitter<CategoryRequest>();

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
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
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(255),
        ],
      ],
    });
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      this.addCategory.emit(this.categoryForm.value);
      this.activeModal.close();
    }
  }
}
