import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserDetailService } from '../../services/user.details';
import { LoginResponse } from '../../responses/user/login.response';
import { UserResponse } from './../../responses/user/user.response';
import { CommonModule } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime, finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { emailOrPhoneValidator } from '../../validators/validators';
import { SnackbarService } from '../../services/snackbar.service';
import { LoginType } from '../../enums/login.type';
import { ApiResponse } from '../../models/response';
import { Status } from '../../enums/status.enum';

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  userResponse?: UserResponse | null = null;
  passwordVisible: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userDetailService: UserDetailService,
    private authService: AuthService,
    private snackBar: SnackbarService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, emailOrPhoneValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    const existingUser = this.authService.getUser();
    if (existingUser) {
      this.userResponse = existingUser;
    } else {
      this.authService.user$.pipe(untilDestroyed(this)).subscribe((user) => {
        this.userResponse = user;
      });
    }
    // Thêm debounce vào form validation
    this.loginForm.valueChanges.pipe(debounceTime(300), untilDestroyed(this)).subscribe(() => {
      // Handle form changes
      this.validateForm();
    });
  }

  validateForm() {
    // Thực hiện các bước kiểm tra và xử lý form
    if (this.loginForm.invalid) {
      const errors = Object.keys(this.loginForm.controls)
        .filter((key) => this.loginForm.get(key)?.invalid)
        .map((key) => `${key} không hợp lệ`);
      this.errorMessage = errors.join(', ');
    } else {
      this.errorMessage = null;
    }
  }

  login() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const loginDTO = this.loginForm.value;

    this.authService

      .loginWithRecovery(loginDTO)
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (response: LoginResponse) => {
          if (response.status == Status.OK && response.data) {
            this.getUserDetails(response.data.token);
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = 'Đăng nhập thất bại.';
        },
      });
  }

  getUserDetails(token: string) {
    this.userDetailService
      .getUserDetail(token)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: ApiResponse<UserResponse>) => {
          if (response.status == Status.OK && response.data) {
            this.userResponse = response.data;
            this.authService.setUser(this.userResponse ?? null);
            this.authService.navigateToDashboard(this.userResponse ?? null); // Sử dụng toán tử ?? để đảm bảo giá trị không phải undefined
            this.isLoading = false;
          }
        },
        error: (error: any) => {
          this.isLoading = false;
        },
      });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  navigateToResetPassword(): void {
    if (!this.loginForm.get('email')?.value) {
      this.snackBar.show('Vui lòng nhập email hoặc số điện thoại để lấy lại mật khẩu');
      return;
    }
    this.router.navigate(['/forgot-password']);
  }

  loginWithGoogle() {
    this.authService.authenticate(LoginType.GOOGLE).subscribe({
      next: (url: string) => {
        if (url) {
          window.location.href = url;
        } else {
          this.snackBar.show('URL đăng nhập không hợp lệ');
        }
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.show('Lỗi khi xác thực với Google:', error?.error?.message ?? '');
      },
    });
  }

  loginWithFacebook() {
    // Logic đăng nhập với Facebook
    this.authService.authenticate(LoginType.FACEBOOK).subscribe({
      next: (url: string) => {
        if (url) {
          window.location.href = url;
        } else {
          this.snackBar.show('URL đăng nhập không hợp lệ');
        }
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.show('Lỗi khi xác thực với Facebook:', error?.error?.message ?? '');
      },
    });
  }
}
