import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { SnackbarService } from '../services/snackbar.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false; // Tránh làm mới token nhiều lần cùng lúc
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    private location: Location,
    private snackbarService: SnackbarService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.token$.pipe(
      take(1), // Lấy token hiện tại
      switchMap((token) => {
        // Thêm token vào header nếu có
        const authReq = token ? this.addToken(req, token) : req;
        const currentUrl = this.location.path(); // Lưu URL hiện tại của người dùng
        console.log('currentUrl in token interceptor', currentUrl);
        return next.handle(authReq).pipe(
          catchError((error: HttpErrorResponse) => {
            // Xử lý lỗi 401 (Token hết hạn)
            if (error.status === 401 && token && this.authService.isTokenExpired(token)) {
              return this.handle401Error(authReq, next, currentUrl);
            }

            // Xử lý lỗi 403 (Không có quyền)
            if (error.status === 403) {
              this.snackbarService.show('You do not have permission to access this resource.');
              this.router.navigate(['/forbidden']);
            }

            // Xử lý lỗi mạng (status = 0)
            if (error.status === 0) {
              this.snackbarService.show('Network error. Please check your connection and try again.');
            }

            return throwError(() => error);
          }),
        );
      }),
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler, currentUrl: string): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      this.snackbarService.show('Token expired. Attempting to refresh token...');

      return this.tokenService.refreshToken(currentUrl).pipe(
        switchMap((response) => {
          if (!response?.data?.token) {
            throw new Error('Token refresh failed.');
          }
          const newToken = response.data.token;
          this.isRefreshing = false;

          // Lưu token mới và phát tín hiệu
          this.authService.setAccessToken(newToken);
          this.refreshTokenSubject.next(newToken);

          // Tiếp tục request ban đầu với token mới
          return next.handle(this.addToken(request, newToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          // Nếu refresh token thất bại, đăng xuất người dùng
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
          return throwError(() => err);
        }),
      );
    } else {
      // Chờ token mới nếu đã có yêu cầu refresh đang xử lý
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null), // Đợi đến khi token được cập nhật
        take(1), // Lấy token mới nhất
        switchMap((token) => next.handle(this.addToken(request, token!))),
      );
    }
  }
}
