import { Component, HostListener, TemplateRef, ViewChild, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ApiResponse } from '../../../models/response';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Slide } from '../../../models/slide';
import { SlideService } from '../../../services/slide.service';
import { SlideRequest } from '../../../request/slide.request';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { ImageSelectDialogAdminComponent } from '../shared/image-select-dialog/image-select-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog.component';
import { LoadingSpinnerComponent } from '../../common/loading-spinner/loading-spinner.component';
import { SnackbarService } from '../../../services/snackbar.service';
import { Status } from '../../../enums/status.enum';

@UntilDestroy()
@Component({
  selector: 'app-slide',
  templateUrl: './slide.admin.component.html',
  styleUrls: ['./slide.admin.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, DragDropModule, MatDialogModule, LoadingSpinnerComponent],
})
export class SlideAdminComponent implements OnInit {
  @ViewChild('content', { static: true }) content!: TemplateRef<any>;
  slides: Slide[] = [];
  menuVisible = false;
  selectedSlideId: number | null = null;
  slideForm: FormGroup;
  showForm = false;
  editMode = false;
  imagePreview: string | null = null;
  currentEditId: number | null = null;
  dialogRef: MatDialogRef<any> | null = null;

  constructor(
    private slideService: SlideService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private snackBarService: SnackbarService,
  ) {
    this.slideForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(10000)]],
      status: [true, Validators.required],
      order: [1, [Validators.required, Validators.min(1)]],
      link: [''],
      imageUrl: ['', Validators.required],
      publicId: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.getSlides();
  }

  getSlides() {
    this.slideService
      .getSlidesForAdmin()
      .pipe(untilDestroyed(this))
      .subscribe((response: ApiResponse<Slide[]>) => {
        if (response.status === Status.OK) {
          if (response.data) {
            this.slides = response.data;
            this.cdr.markForCheck(); // Inform Angular to check for changes
          }
        }
      });
  }

  openForm(slide: Slide | null = null): void {
    if (slide) {
      this.slideForm.patchValue(slide);
      this.imagePreview = slide.imageUrl;
      this.currentEditId = slide.id;
      this.editMode = true;
      // Remove validators for imageUrl and publicId in edit mode
      this.slideForm.get('imageUrl')?.clearValidators();
      this.slideForm.get('publicId')?.clearValidators();
    } else {
      this.slideForm.reset({ status: true, order: this.slides.length + 1 });
      this.imagePreview = null;
      this.currentEditId = null;
      this.editMode = false;
      // Add validators for imageUrl and publicId in add mode
      this.slideForm.get('imageUrl')?.setValidators([Validators.required]);
      this.slideForm.get('publicId')?.setValidators([Validators.required]);
    }
    // Update the validity of the form controls
    this.slideForm.get('imageUrl')?.updateValueAndValidity();
    this.slideForm.get('publicId')?.updateValueAndValidity();

    this.dialogRef = this.dialog.open(this.content, {
      width: '600px',
      disableClose: true,
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (this.editMode && this.currentEditId) {
          this.updateSlide(this.currentEditId, result);
        } else {
          this.createSlide(result);
        }
      }
    });
  }

  closeForm(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.showForm = false;
    this.imagePreview = null;
    this.currentEditId = null;
    this.cdr.markForCheck(); // Inform Angular to check for changes
  }

  openImageSelectDialog(): void {
    import('../shared/image-select-dialog/image-select-dialog.component').then(({ ImageSelectDialogAdminComponent }) => {
      const dialogRef = this.dialog.open(ImageSelectDialogAdminComponent, {
        width: '1000px',
        disableClose: true,
        data: {
          /* truyền dữ liệu nếu cần */
        },
      });
      this.handleDialogResponse(dialogRef);
    });
  }

  private handleDialogResponse(dialogRef: MatDialogRef<ImageSelectDialogAdminComponent>): void {
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.slideForm.patchValue({
          imageUrl: result.url,
          publicId: result.publicId,
        });
        this.imagePreview = result.url;
        this.cdr.markForCheck(); // Inform Angular to check for changes
      }
    });
  }

  clearImage(): void {
    this.imagePreview = null;
    this.slideForm.patchValue({
      imageUrl: '',
      publicId: '',
    });
    this.cdr.markForCheck(); // Inform Angular to check for changes
  }

  deleteSlide(id: number): void {
    if (id === null) {
      this.snackBarService.show('Invalid slide ID');
      return;
    }
    const dialogData: ConfirmDialogData = {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this slide?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    };

    import('../shared/confirm-dialog/confirm-dialog.component').then(({ ConfirmDialogComponent }) => {
      this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: dialogData,
      });
      this.handleDialogResponseDelete(this.dialogRef, id);
    });
  }

  private handleDialogResponseDelete(dialogRef: MatDialogRef<ConfirmDialogComponent>, id: number): void {
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.slideService
          .deleteSlide(id)
          .pipe(untilDestroyed(this))
          .subscribe((response: ApiResponse<any>) => {
            if (response.status === Status.OK) {
              this.slides = this.slides.filter((slide) => slide.id !== id);
              this.cdr.markForCheck(); // Inform Angular to check for changes
            }
          });
      }
    });
  }

  onSubmit(): void {
    if (this.slideForm.valid) {
      const formValue = this.slideForm.value;
      const slideRequest: SlideRequest = {
        title: formValue.title,
        description: formValue.description,
        status: formValue.status,
        order: formValue.order,
        link: formValue.link,
        imageUrl: formValue.imageUrl,
        publicId: formValue.publicId,
      };

      if (this.editMode && this.currentEditId) {
        this.updateSlide(this.currentEditId, slideRequest);
      } else {
        this.createSlide(slideRequest);
      }
    } else {
      this.snackBarService.show('Please fill in all required fields');
    }
  }

  createSlide(slideRequest: SlideRequest): void {
    this.slideService
      .insertSlide(slideRequest)
      .pipe(untilDestroyed(this))
      .subscribe((response: ApiResponse<Slide>) => {
        if (response.status === Status.CREATED) {
          if (response.data) {
            this.slides.push(response.data);
            this.closeForm();
            this.cdr.markForCheck(); // Inform Angular to check for changes
          }
        }
      });
  }

  updateSlide(id: number, slideRequest: SlideRequest): void {
    this.slideService
      .updateSlide(id, slideRequest)
      .pipe(untilDestroyed(this))
      .subscribe((response: ApiResponse<Slide>) => {
        if (response.status === Status.OK) {
          if (response.data) {
            const index = this.slides.findIndex((s) => s.id === id);
            if (index !== -1) {
              this.slides[index] = response.data;
            }
            this.closeForm();
            this.cdr.markForCheck(); // Inform Angular to check for changes
          }
        }
      });
  }

  drop(event: CdkDragDrop<string[]>): void {
    const previousOrder = this.slides.map((slide) => ({ id: slide.id, order: slide.order }));
    moveItemInArray(this.slides, event.previousIndex, event.currentIndex);
    this.updateOrder();

    const currentOrder = this.slides.map((slide) => ({ id: slide.id, order: slide.order }));
    if (!this.isOrderChanged(previousOrder, currentOrder)) {
      return;
    }

    this.updateSlideOrderOnServer();
    this.cdr.markForCheck(); // Inform Angular to check for changes
  }

  private updateOrder(): void {
    this.slides.forEach((slide, index) => {
      slide.order = index + 1;
    });
    this.cdr.markForCheck(); // Inform Angular to check for changes
  }

  private updateSlideOrderOnServer(): void {
    this.slideService
      .updateSlideOrder(this.slides)
      .pipe(
        debounceTime(1000), // Waits for 1000 ms after the last update
        untilDestroyed(this),
      )
      .subscribe(() => {
        this.cdr.markForCheck(); // Inform Angular to check for changes after server update
      });
  }

  private isOrderChanged(previousOrder: { id: number; order: number }[], currentOrder: { id: number; order: number }[]): boolean {
    if (previousOrder.length !== currentOrder.length) {
      return true;
    }
    for (let i = 0; i < previousOrder.length; i++) {
      if (previousOrder[i].id !== currentOrder[i].id || previousOrder[i].order !== currentOrder[i].order) {
        return true;
      }
    }
    return false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.menuVisible) {
      this.menuVisible = false;
      this.selectedSlideId = null;
      this.cdr.markForCheck(); // Inform Angular to check for changes
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
      this.cdr.markForCheck(); // Inform Angular to check for changes
    } else {
      this.snackBarService.show('Client ID is null');
    }
  }

  trackById(index: number, item: Slide): number {
    return item.id;
  }
}
