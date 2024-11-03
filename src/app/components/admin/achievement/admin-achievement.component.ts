import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AchievementService, Achievement } from '../../../services/achievement.service';
import { CommonModule } from '@angular/common';
import { ApiResponse } from '../../../models/response';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmModalComponent } from '../../common/confirm-modal/confirm-modal.component';

@UntilDestroy()
@Component({
  selector: 'app-admin-achievement',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './admin-achievement.component.html',
  styleUrls: ['./admin-achievement.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Sử dụng ChangeDetectionStrategy.OnPush
})
export class AchievementAdminComponent implements OnInit {
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;

  private achievementsSubject = new BehaviorSubject<Achievement[]>([]);
  achievements$ = this.achievementsSubject.asObservable();
  isModalOpen = false;
  editingId: number | null = null;
  formData: FormGroup;

  constructor(
    private fb: FormBuilder,
    private achievementService: AchievementService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef, // Inject ChangeDetectorRef
  ) {
    this.formData = this.createForm();
  }

  ngOnInit(): void {
    this.loadAchievements();
  }

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', Validators.required],
      value: ['', [Validators.required, Validators.min(0), Validators.max(2147483647)]], // Giới hạn giá trị value
      description: ['', Validators.required],
      isActive: [true, Validators.required],
    });
  }

  loadAchievements(): void {
    this.achievementService
      .getAchievements()
      .pipe(
        map((response: ApiResponse<Achievement[]>) => response.data),
        untilDestroyed(this),
      )
      .subscribe((achievements: Achievement[]) => {
        this.achievementsSubject.next(achievements);
        this.cdr.markForCheck(); // Mark for check to update view
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
          if (response.status === 'OK' || response.status === 'CREATED') {
            this.updateLocalAchievement(response.data);
            this.closeModal();
            this.cdr.markForCheck(); // Mark for check to update view
          }
        });
    } else {
      this.achievementService
        .createAchievement(achievement)
        .pipe(untilDestroyed(this))
        .subscribe((response: ApiResponse<Achievement>) => {
          if (response.status === 'OK' || response.status === 'CREATED') {
            this.loadAchievements();
            this.closeModal();
            this.cdr.markForCheck(); // Mark for check to update view
          }
        });
    }
  }

  handleEdit(achievement: Achievement): void {
    this.editingId = achievement.id;
    this.formData.patchValue(achievement);
    this.openModal(false); // Open modal without resetting form
  }

  handleDelete(id: number): void {
    const modalRef = this.modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.title = 'Confirm Delete';
    modalRef.componentInstance.message = 'Are you sure you want to delete this achievement?';
    modalRef.componentInstance.confirmText = 'Delete';
    modalRef.componentInstance.cancelText = 'Cancel';

    modalRef.componentInstance.confirm.subscribe(() => {
      this.achievementService
        .deleteAchievement(id)
        .pipe(untilDestroyed(this))
        .subscribe((response: ApiResponse<void>) => {
          if (response.status === 'OK') {
            this.loadAchievements();
            this.cdr.markForCheck(); // Mark for check to update view
          }
        });
    });
  }

  openModal(resetForm: boolean = true): void {
    if (resetForm) {
      this.editingId = null;
      this.formData.reset({ isActive: true }); // Reset form to empty
    }
    this.isModalOpen = true;
    const modalRef = this.modalService.open(this.modalContent, {
      centered: true,
      backdrop: 'static',
      keyboard: true,
      windowClass: 'admin-modal',
      size: 'md',
    });
    modalRef.result.then(
      () => {
        this.isModalOpen = false;
        this.cdr.markForCheck(); // Mark for check to update view
      },
      () => {
        this.isModalOpen = false;
        this.cdr.markForCheck(); // Mark for check to update view
      },
    );
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.modalService.dismissAll();
    this.cdr.markForCheck(); // Mark for check to update view
  }

  private updateLocalAchievement(updatedAchievement: Achievement): void {
    const achievements = this.achievementsSubject.getValue();
    const index = achievements.findIndex((a) => a.id === updatedAchievement.id);
    if (index !== -1) {
      achievements[index] = updatedAchievement;
      this.achievementsSubject.next(achievements);
      this.cdr.markForCheck(); // Mark for check to update view
    }
  }

  trackById(index: number, item: Achievement): number {
    return item.id;
  }
}
