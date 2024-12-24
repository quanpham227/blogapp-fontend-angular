import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { tap, switchMap } from 'rxjs/operators';
import { UserResponse } from '../responses/user/user.response';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../models/response';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { SnackbarService } from '../services/snackbar.service';
import { LoginType } from '../enums/login.type';

interface TokenResponse {
  token: string;
}

@UntilDestroy()
@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class AuthCallbackComponent implements OnInit {
  userResponse?: UserResponse;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private snackbarService: SnackbarService,
  ) {}

  ngOnInit() {
    const url = this.router.url;
    const loginType = this.getLoginTypeFromUrl(url);
    if (!loginType) {
      this.snackbarService.show('Không tìm thấy loại đăng nhập trong URL.');
      return;
    }

    this.activatedRoute.queryParams
      .pipe(
        switchMap((params) => {
          const code = params['code'];
          if (code) {
            return this.authService.exchangeCodeForToken(code, loginType).pipe(
              tap((response: ApiResponse<TokenResponse>) => {
                const token = response.data.token;
                this.authService.setAccessToken(token);
              }),
              switchMap((response: ApiResponse<TokenResponse>) => {
                const token = response.data.token;
                return this.userService.getUserDetail(token);
              }),
            );
          } else {
            this.snackbarService.show('Không tìm thấy mã xác thực hoặc loại đăng nhập trong URL.');
            return [];
          }
        }),
      )
      .subscribe({
        next: (apiResponse: ApiResponse<UserResponse>) => {
          this.userResponse = apiResponse.data;
          this.authService.setUser(this.userResponse ?? null);
          this.authService.navigateToDashboard(this.userResponse);
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.snackbarService.show('Lỗi khi xử lý xác thực:', error?.error?.message ?? '');
        },
      });
  }
  private getLoginTypeFromUrl(url: string): LoginType | null {
    if (url.includes('/auth/google/callback')) {
      return LoginType.GOOGLE;
    } else if (url.includes('/auth/facebook/callback')) {
      return LoginType.FACEBOOK;
    } else {
      return null;
    }
  }
}
