import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ValidationErrors, ReactiveFormsModule, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserResponse } from '../../responses/user/user.response';
import { UserService } from '../../services/user.service';
import { UpdateUserDTO } from '../../dtos/user/update.user';
import { AuthService } from '../../services/auth.service';
import { ApiResponse } from '../../models/response';

@Component({
  selector: 'app-profile-update',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class UserProfileComponent implements OnInit {
  updateForm: FormGroup;
  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;
  userImageUrl: string | null = null;
  defaultImage = 'assets/images/default-user.png';
  token: string | null = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
  ) {
    this.updateForm = this.fb.nonNullable.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        phoneNumber: ['', [Validators.pattern('^[0-9]{10}$')]],
        password: ['', [Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')]],
        retypePassword: [''],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    this.token = this.authService.getAccessToken();
    if (this.token) {
      this.userService.getUserDetail(this.token).subscribe({
        next: (response: ApiResponse<UserResponse>) => {
          const userResponse: UserResponse = response.data;
          this.updateForm.patchValue({
            fullName: userResponse.fullName,
            phoneNumber: userResponse.phoneNumber,
          });
          this.userImageUrl = userResponse.profileImage;
          this.authService.setUser(userResponse);
        },
        error: (error: HttpErrorResponse) => {
          console.error(error?.error?.message ?? '');
        },
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const retypePassword = control.get('retypePassword')?.value;
    if (password && retypePassword && password !== retypePassword) {
      return { passwordMismatch: true };
    }
    return null;
  };

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  handleImageError(): void {
    this.userImageUrl = this.defaultImage;
  }

  resetForm(): void {
    this.updateForm.reset();
    this.userImageUrl = null;
  }

  onSubmit(): void {
    if (this.updateForm.valid) {
      this.isSubmitting = true;
      const updateUserDTO: UpdateUserDTO = {
        fullName: this.updateForm.get('fullName')?.value,
        phoneNumber: this.updateForm.get('phoneNumber')?.value,
        password: this.updateForm.get('password')?.value,
        retypePassword: this.updateForm.get('retypePassword')?.value,
      };

      if (this.token) {
        this.userService.updateUserDetail(this.token, updateUserDTO).subscribe({
          next: (response: UserResponse) => {
            this.authService.setUser(null);
            this.authService.clearAuthData();
            this.router.navigate(['/login']);
          },
          error: (error: HttpErrorResponse) => {
            console.error(error?.error?.message ?? '');
            this.isSubmitting = false;
          },
        });
      } else {
        this.router.navigate(['/login']);
      }
    } else {
      Object.keys(this.updateForm.controls).forEach((key) => {
        const control = this.updateForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
