import { UserResponse } from './../../responses/user/user.response';
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { LoginDTO } from '../../dtos/user/login.dto';
import { UserService } from '../../services/user.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginResponse } from '../../responses/user/login.response';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { UserDetailService } from '../../services/user.details';
import { Subscription } from 'rxjs';
import { SuccessHandlerService } from '../../services/success-handler.service';
import { LoggingService } from '../../services/logging.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('loginForm') loginForm?: NgForm;

  email: string = '';
  password: string = '';

  userResponse?: UserResponse | null = null;
  passwordVisible: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private userService: UserService,
    private userDetailService: UserDetailService,
    private authService: AuthService,
    private loggingService: LoggingService,
  ) {}

  //Khi page được load
  ngOnInit() {
    // Đăng ký để nhận thông báo khi trạng thái người dùng thay đổi
    const userSub = this.authService.user$.subscribe((user) => {
      this.userResponse = user;
    });
    this.subscriptions.add(userSub);
  }

  // Sau khi view được khởi tạo
  ngAfterViewInit() {
    if (this.loginForm?.form) {
      this.loginForm.form.markAsTouched(); // Đánh dấu form đã được "touched" sau khi view được tải
    }
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  onEmailChange(event: Event) {
    const inputEmail = event.target as HTMLInputElement;
    this.email = inputEmail.value;
  }

  onPasswordChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.password = inputElement.value;
  }

  login() {
    const loginDTO: LoginDTO = {
      email: this.email,
      password: this.password,
    };

    this.userService.login(loginDTO).subscribe({
      next: (response: LoginResponse) => {
        const { token } = response.data;
        this.authService.setAccessToken(token);
        this.authService.setRefreshTokenFlag(); // Thiết lập dấu hiệu khi refresh token được thiết lập
        const userDetailSub = this.userDetailService.getUserDetail(token).subscribe({
          next: (response: any) => {
            this.userResponse = response.data;
            // Lưu token vào sessionStorage
            this.authService.setUser(this.userResponse ?? null); // Cập nhật trạng thái người dùng
            if (this.userResponse?.role.name === 'ADMIN') {
              this.router.navigate(['/admin/dashboard']);
            } else if (this.userResponse?.role.name === 'USER') {
              this.router.navigate(['/']);
            }
          },
          error: (error: any) => {
            this.loggingService.logError('Error getting user detail', error);
          },
        });
        this.subscriptions.add(userDetailSub);
      },

      error: (error: any) => {
        this.loggingService.logError('Error logging in', error);
      },
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible; // Đảo ngược trạng thái hiển thị mật khẩu
  }
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
