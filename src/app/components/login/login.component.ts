import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { UserDetailService } from '../../services/user.details';
import { LoginResponse } from '../../responses/user/login.response';
import { UserResponse } from './../../responses/user/user.response';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgxSpinnerModule],
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
    private spinner: NgxSpinnerService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    this.authService.user$.pipe(untilDestroyed(this)).subscribe((user) => {
      this.userResponse = user;
    });
  }

  login() {
    if (this.loginForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.spinner.show(); // Hiển thị spinner
    const loginDTO = this.loginForm.value;
    this.userService
      .login(loginDTO)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (response: LoginResponse) => {
          if (response.status == 'OK' && response.data) {
            const { token } = response.data;
            this.authService.setAccessToken(token);
            this.authService.setRefreshTokenFlag();
            this.getUserDetails(token);
          }
          this.spinner.hide();
        },
        error: (error: any) => {
          this.spinner.hide(); // Ẩn spinner nếu có lỗi
          this.isLoading = false;
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
            this.spinner.hide(); // Ẩn spinner sau khi hoàn thành
            this.isLoading = false;
          }
        },
        error: (error: any) => {
          this.spinner.hide(); // Ẩn spinner nếu có lỗi
          this.isLoading = false;
        },
      });
  }

  navigateToDashboard() {
    switch (this.userResponse?.role.name) {
      case 'ADMIN':
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

  loginWithGoogle() {
    console.log('Google login initiated');
  }

  loginWithFacebook() {
    console.log('Facebook login initiated');
  }
}
