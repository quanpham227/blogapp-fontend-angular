import { ChangeDetectionStrategy, Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryRequest } from '../../../request/category.request';
import { CommonModule } from '@angular/common';
import { Category } from '../../../models/category';

@Component({
  selector: 'app-update-category-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './update-category.admin.component.html',
  styleUrls: ['./update-category.admin.component.scss'],
})
export class UpdateCategoryAdminComponent implements OnInit {
  categoryForm: FormGroup;
  @Input() category: Category | null = null; // Nhận dữ liệu từ component cha
  @Output() updateCategory = new EventEmitter<CategoryRequest>();

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
    });
  }

  ngOnInit(): void {
    if (this.category !== null) {
      this.categoryForm.patchValue(this.category);
    }
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      this.updateCategory.emit(this.categoryForm.value);
      this.activeModal.close();
    }
  }
}
