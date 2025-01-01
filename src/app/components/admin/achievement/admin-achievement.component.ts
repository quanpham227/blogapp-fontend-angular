import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AchievementService, Achievement } from '../../../services/achievement.service';
import { CommonModule } from '@angular/common';
import { ApiResponse } from '../../../models/response';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackbarService } from '../../../services/snackbar.service';
import { ConfirmDialogComponent, ConfirmDialogData } from '../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Status } from '../../../enums/status.enum';

@UntilDestroy()
@Component({
  selector: 'app-admin-achievement',
  standalone: true,
  imports: [ReactiveFormsModule, MatSnackBarModule, MatTooltipModule, CommonModule],
  templateUrl: './admin-achievement.component.html',
  styleUrls: ['./admin-achievement.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementAdminComponent implements OnInit {
  private achievementsSubject = new BehaviorSubject<Achievement[]>([]);
  achievements$ = this.achievementsSubject.asObservable();
  isModalOpen = false;
  editingId: number | null = null;
  formData: FormGroup;
  dialogRef: MatDialogRef<any> | null = null;

  constructor(
    private fb: FormBuilder,
    private achievementService: AchievementService,
    private cdr: ChangeDetectorRef,
    private snackBar: SnackbarService,
    private dialog: MatDialog,
  ) {
    this.formData = this.createForm();
  }

  ngOnInit(): void {
    this.loadAchievements();
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      value: ['', [Validators.required, Validators.min(0), Validators.max(2147483647)]],
      description: ['', Validators.required],
      isActive: [true, Validators.required],
    });
  }

  loadAchievements(): void {
    if (this.achievementsSubject.getValue().length > 0) return;
    this.achievementService
      .getAchievementsForAdmin()
      .pipe(
        map((response: ApiResponse<Achievement[]>) => {
          if (response.status === Status.OK) {
            return response.data;
          } else {
            throw new Error('Failed to load achievements');
          }
        }),
        untilDestroyed(this),
      )
      .subscribe((achievements: Achievement[] | null) => {
        if (achievements) {
          this.achievementsSubject.next(achievements);
          this.cdr.markForCheck();
        }
      });
  }

  validateForm(): boolean {
    if (this.formData.invalid) {
      this.formData.markAllAsTouched();
      return false;
    }
    return true;
  }

  handleSubmit(): void {
    if (!this.validateForm()) return;

    const achievement: Achievement = this.formData.value;
    if (this.editingId !== null) {
      achievement.id = this.editingId;
      this.achievementService
        .updateAchievement(this.editingId, achievement)
        .pipe(untilDestroyed(this))
        .subscribe((response: ApiResponse<Achievement>) => {
          if (response.status === Status.OK) {
            if (response.data) {
              this.updateLocalAchievement(response.data);
              this.closeForm();
              this.cdr.markForCheck();
            }
          }
        });
    } else {
      this.achievementService
        .createAchievement(achievement)
        .pipe(untilDestroyed(this))
        .subscribe((response: ApiResponse<Achievement>) => {
          if (response.status === Status.CREATED) {
            if (response.data) {
              this.addLocalAchievement(response.data);
              this.closeForm();
              this.cdr.markForCheck();
            }
          }
        });
    }
  }

  handleEdit(achievement: Achievement): void {
    if (!achievement.id) {
      this.snackBar.show('Invalid achievement ID');
      return;
    }
    this.editingId = achievement.id;
    this.formData.patchValue(achievement);
    this.openForm(false);
  }

  deleteAchievement(id: number): void {
    if (id === null) {
      this.snackBar.show('Invalid comment ID');
      return;
    }
    const dialogData: ConfirmDialogData = {
      title: 'Confirm Action',
      message: `Are you sure you want to delete this achievement?`,
      confirmText: 'Confirm',
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
    dialogRef.afterClosed().subscribe({
      next: (result) => {
        if (result) {
          this.achievementService
            .deleteAchievement(id)
            .pipe(untilDestroyed(this))
            .subscribe((response: ApiResponse<void>) => {
              if (response.status === Status.OK) {
                this.achievementsSubject.next(this.achievementsSubject.getValue().filter((a) => a.id !== id));
                this.cdr.markForCheck(); // Inform Angular to check for changes
              }
            });
        }
      },
    });
  }

  openForm(resetForm: boolean = true): void {
    if (resetForm) {
      this.editingId = null;
      this.formData.reset({ isActive: true });
    }
    this.isModalOpen = true;
    this.cdr.markForCheck();
  }

  closeForm(): void {
    this.isModalOpen = false;
    this.cdr.markForCheck();
  }

  private addLocalAchievement(newAchievement: Achievement): void {
    const achievements = this.achievementsSubject.getValue();
    achievements.push(newAchievement);
    this.achievementsSubject.next(achievements);
    this.cdr.markForCheck();
  }

  private updateLocalAchievement(updatedAchievement: Achievement): void {
    const achievements = this.achievementsSubject.getValue();
    const index = achievements.findIndex((a) => a.id === updatedAchievement.id);
    if (index !== -1) {
      achievements[index] = updatedAchievement;
      this.achievementsSubject.next(achievements);
      this.cdr.markForCheck();
    }
  }

  trackById(index: number, item: Achievement): number {
    return item.id;
  }
}
