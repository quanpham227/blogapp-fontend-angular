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
    let loginType: 'google' | 'facebook';
    if (url.includes('/auth/google/callback')) {
      loginType = 'google';
    } else if (url.includes('/auth/facebook/callback')) {
      loginType = 'facebook';
    } else {
      console.error('Không xác định được nhà cung cấp xác thực.');
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
                this.authService.setRefreshTokenFlag();
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
          this.navigateToDashboard();
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
        },
      });
  }

  private navigateToDashboard() {
    switch (this.userResponse?.role.name) {
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
}
