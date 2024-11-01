import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserResponse } from '../../responses/user/user.response';
import { UserService } from '../../services/user.service';
import { UpdateUserDTO } from '../../dtos/user/update.user';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
})
export class UserProfileComponent implements OnInit {
  userResponse?: UserResponse;
  userProfileForm: FormGroup; // đối tượng FormGroup quản lý dữ liệu của form
  token: string | null = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
  ) {
    // Tạo FormGroup và các FormControl tương ứng
    this.userProfileForm = this.formBuilder.group(
      {
        fullname: ['', Validators.required], // fullname là FormControl bắt buộc
        phone_number: ['', Validators.minLength(10)], // phone_number là FormControl bắt buộc
        password: ['', Validators.minLength(3)],
        retype_password: ['', Validators.minLength(3)],
      },
      {
        validators: this.passwordMatchValidator, // Thêm validator tự định nghĩa
      },
    );
  }

  ngOnInit(): void {
    debugger;
    this.token = this.authService.getAccessToken();
    if (this.token) {
      this.userService.getUserDetail(this.token).subscribe({
        next: (response: any) => {
          this.userResponse = {
            id: response.data.id,
            fullname: response.data.fullname,
            email: response.data.email,
            phone_number: response.data.phone_number,
            profile_image: response.data.profile_image,
            is_active: response.data.is_active,
            facebook_account_id: response.data.facebook_account_id,
            google_account_id: response.data.google_account_id,
            role: response.data.role,
          };
          this.userProfileForm.patchValue({
            fullname: this.userResponse?.fullname ?? '',
            phone_number: this.userResponse?.phone_number ?? '',
          });
          this.authService.setUser(this.userResponse);
        },
        complete: () => {
          debugger;
        },
        error: (error: HttpErrorResponse) => {
          debugger;
          console.error(error?.error?.message ?? '');
        },
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const password = formGroup.get('password')?.value;
      const retypedPassword = formGroup.get('retype_password')?.value;
      if (password !== retypedPassword) {
        return { passwordMismatch: true };
      }

      return null;
    };
  }

  save(): void {
    if (this.userProfileForm.valid) {
      const updateUserDTO: UpdateUserDTO = {
        fullname: this.userProfileForm.get('fullname')?.value,
        phone_number: this.userProfileForm.get('phone_number')?.value,
        password: this.userProfileForm.get('password')?.value,
        retype_password: this.userProfileForm.get('retype_password')?.value,
      };

      if (this.token) {
        this.userService.updateUserDetail(this.token, updateUserDTO).subscribe({
          next: (response: any) => {
            this.authService.setUser(null);
            this.authService.clearAuthData();
            this.router.navigate(['/login']);
          },
          error: (error: HttpErrorResponse) => {
            debugger;
            console.error(error?.error?.message ?? '');
          },
        });
      } else {
        this.router.navigate(['/login']);
      }
    } else {
      if (this.userProfileForm.hasError('passwordMismatch')) {
        console.error('Mật khẩu và mật khẩu gõ lại chưa chính xác');
      }
    }
  }
}
