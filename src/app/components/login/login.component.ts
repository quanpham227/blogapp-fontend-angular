import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserDetailService } from '../../services/user.details';
import { LoginResponse } from '../../responses/user/login.response';
import { UserResponse } from './../../responses/user/user.response';
import { CommonModule } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { debounceTime } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { emailOrPhoneValidator } from '../../validators/validators';
import { SnackbarService } from '../../services/snackbar.service';

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
    private userService: UserService,
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
      this.errorMessage = 'Form không hợp lệ';
    } else {
      this.errorMessage = null;
    }
  }
  login() {
    if (this.loginForm.invalid) {
      return;
    }
    this.isLoading = true;
    const loginDTO = this.loginForm.value;

    // Tạm thời lưu token của tài khoản trước khi xóa
    const previousToken = this.authService.getAccessToken();
    const previousRefreshToken = this.authService.getRefreshToken();

    this.authService
      .loginWithRecovery(loginDTO, previousToken!, previousRefreshToken!)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: LoginResponse) => {
          if (response.status == 'OK' && response.data) {
            this.getUserDetails(response.data.token);
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
        },
      });
  }
  getUserDetails(token: string) {
    this.userDetailService
      .getUserDetail(token)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: any) => {
          if (response.status == 'OK' && response.data) {
            this.userResponse = response.data;
            this.authService.setUser(this.userResponse ?? null);
            this.navigateToDashboard();
            this.isLoading = false;
          }
        },
        error: (error: any) => {
          this.isLoading = false;
        },
      });
  }

  navigateToDashboard() {
    if (!this.userResponse) {
      this.router.navigate(['/']);
      return;
    }
    switch (this.userResponse.role.name) {
      case 'ADMIN':
      case 'MODERATOR':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'USER':
        this.router.navigate(['/']);
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
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
    debugger;
    this.authService.authenticate('google').subscribe({
      next: (url: string) => {
        if (url) {
          window.location.href = url;
        } else {
          this.snackBar.show('URL đăng nhập không hợp lệ');
        }
      },
      error: (error: HttpErrorResponse) => {
        debugger;
        this.snackBar.show('Lỗi khi xác thực với Google:', error?.error?.message ?? '');
      },
    });
  }

  loginWithFacebook() {
    // Logic đăng nhập với Facebook
    this.authService.authenticate('facebook').subscribe({
      next: (url: string) => {
        if (url) {
          window.location.href = url;
        } else {
          this.snackBar.show('URL đăng nhập không hợp lệ');
        }
      },
      error: (error: HttpErrorResponse) => {
        debugger;
        this.snackBar.show('Lỗi khi xác thực với Facebook:', error?.error?.message ?? '');
      },
    });
  }
}
