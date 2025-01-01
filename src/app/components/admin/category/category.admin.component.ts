import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CategoryService } from '../../../services/category.service';
import { ApiResponse } from '../../../models/response';
import { Category } from '../../../models/category';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog.component';
import { CategoryRequest } from '../../../request/category.request';
import { Status } from '../../../enums/status.enum';

@UntilDestroy()
@Component({
  selector: 'app-category-admin',
  templateUrl: './category.admin.component.html',
  styleUrls: ['./category.admin.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSnackBarModule, MatDialogModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryAdminComponent implements OnInit {
  @ViewChild('content', { static: true }) content!: TemplateRef<any>;

  categories: Category[] = [];
  selectedCategoryId: number | null = null;
  showForm = false;
  editMode = false;
  currentEditId: number | null = null;
  categoryForm: FormGroup;
  dialogRef: MatDialogRef<any> | null = null;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
    });
  }

  ngOnInit() {
    this.getCategories();
  }

  getCategories(): void {
    this.categoryService
      .getCategories()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Category[]>) => {
          if (response.status === 'OK' && response.data) {
            this.categories = response.data;
          }
          this.cdr.markForCheck(); // Manually trigger change detection
        },
        error: (error) => {
          this.cdr.markForCheck(); // Inform Angular to check for changes
        },
      });
  }

  openForm(category: Category | null = null): void {
    if (category) {
      this.categoryForm.patchValue(category);
      this.currentEditId = category.id;
      this.editMode = true;
    } else {
      this.categoryForm.reset();
      this.currentEditId = null;
      this.editMode = false;
    }

    this.dialogRef = this.dialog.open(this.content, {
      width: '600px',
      disableClose: true,
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (this.editMode && this.currentEditId) {
          this.updateCategory(this.currentEditId, this.categoryForm.value);
        } else {
          this.createCategory(this.categoryForm.value);
        }
      }
    });
  }

  closeForm(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.showForm = false;
    this.currentEditId = null;
    this.cdr.markForCheck(); // Inform Angular to check for changes
  }

  deleteCategory(id: number): void {
    if (id === null) {
      return;
    }
    const dialogData: ConfirmDialogData = {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this ctegory?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    };

    import('../shared/confirm-dialog/confirm-dialog.component').then(({ ConfirmDialogComponent }) => {
      this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: dialogData,
      });
      this.handleDialogResponse(this.dialogRef, id);
    });
  }
  private handleDialogResponse(dialogRef: MatDialogRef<ConfirmDialogComponent>, id: number): void {
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.categoryService
            .deleteCategory(id)
            .pipe(untilDestroyed(this))
            .subscribe({
              next: (response: ApiResponse<void>) => {
                if (response.status === Status.OK) {
                  this.categories = this.categories.filter((client) => client.id !== id);
                  this.cdr.markForCheck(); // Inform Angular to check for changes
                }
              },
              error: (error) => {
                this.snackBar.open('Failed to delete client', 'Close', {
                  duration: 3000,
                });
              },
            });
        }
      },
      error: (reason) => {
        this.snackBar.open('Failed to delete client', 'Close', {
          duration: 3000,
        });
      },
    });
  }
  onSubmit(): void {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      const category: CategoryRequest = {
        name: formValue.name,
        description: formValue.description,
      };

      if (this.editMode && this.currentEditId) {
        this.updateCategory(this.currentEditId, category);
      } else {
        this.createCategory(category);
      }
    } else {
      this.snackBar.open('Invalid form', 'Close', {
        duration: 3000,
      });
    }
  }

  createCategory(categoryRequest: CategoryRequest): void {
    this.categoryService
      .insertCategory(categoryRequest)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Category>) => {
          if (response.status === Status.CREATED) {
            if (response.data) {
              this.categories.push(response.data);
              this.closeForm();
              this.cdr.markForCheck(); // Inform Angular to check for changes
            }
          }
        },
        error: (error) => {},
      });
  }
  updateCategory(id: number, categoryRequest: CategoryRequest): void {
    this.categoryService
      .updateCategory(id, categoryRequest)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<Category>) => {
          if (response.status === Status.OK) {
            if (response.data) {
              const index = this.categories.findIndex((s) => s.id === id);
              if (index !== -1) {
                this.categories[index] = response.data;
              }
              this.closeForm();
              this.cdr.markForCheck(); // Inform Angular to check for changes
            }
          }
        },
        error: (error) => {
          this.snackBar.open('Failed to update category', 'Close', {
            duration: 3000,
          });
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
