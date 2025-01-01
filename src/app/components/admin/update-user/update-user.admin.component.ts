import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, Optional } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { RoleService } from '../../../services/role.service';
import { distinctUntilChanged } from 'rxjs';
import isEqual from 'lodash-es/isEqual';
import { ApiResponse } from '../../../models/response';
import { Role } from '../../../models/role';
import { Status } from '../../../enums/status.enum';

@UntilDestroy()
@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MatSnackBarModule],
  templateUrl: './update-user.admin.component.html',
  styleUrls: ['./update-user.admin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateUserAdminComponent implements OnInit {
  userForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  roles: Role[] = [];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UpdateUserAdminComponent>,
    private cdr: ChangeDetectorRef,
    private roleService: RoleService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any,
  ) {
    this.userForm = this.fb.group(
      {
        fullName: this.fb.control(data?.fullName || '', Validators.required),
        phoneNumber: this.fb.control(data?.phoneNumber || '', [Validators.required, Validators.pattern(/^\d{10}$/)]),
        email: this.fb.control(data?.email || '', [Validators.required, Validators.email]),
        roleId: this.fb.control(data?.roleId || null, Validators.required),
        password: this.fb.control('', [
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
        ]),
        retypePassword: this.fb.control(''),
      },
      { validators: this.passwordMatchValidator() },
    );
  }

  ngOnInit() {
    this.getRoles();
  }

  passwordMatchValidator(): ValidatorFn {
    return (form: AbstractControl): { [key: string]: any } | null => {
      const password = form.get('password')?.value;
      const retypePassword = form.get('retypePassword')?.value;
      return password === retypePassword ? null : { passwordMismatch: true };
    };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  submitForm() {
    if (this.userForm.valid) {
      this.dialogRef.close(this.userForm.value);
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
    }
  }

  getRoles() {
    this.roleService
      .getRoles()
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)),
      )
      .subscribe({
        next: (response: ApiResponse<Role[]>) => {
          if (response.status === Status.OK) {
            if (response.data) {
              const newRoles = response.data;
              if (!isEqual(this.roles, newRoles)) {
                this.roles = newRoles;
                this.cdr.markForCheck();
              }
            }
          }
        },
      });
  }

  onRoleChange() {
    const roleId = this.userForm.get('roleId')?.value;
    console.log('Selected Role ID:', roleId);
  }

  closeModal() {
    this.dialogRef.close();
  }
  trackByRoleId(index: number, role: Role): number {
    return role.id;
  }
}
