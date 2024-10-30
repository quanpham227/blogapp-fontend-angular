import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();

    let authReq = req;
    if (token) {
      authReq = this.addToken(req, token);
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && token && this.authService.isTokenExpired(token)) {
          // Xử lý khi token hết hạn và cần làm mới
          return this.handle401Error(authReq, next);
        } else if (error.status === 403) {
          // Xử lý khi không có quyền truy cập (Forbidden)
          console.error('Access forbidden: You do not have permission to access this resource.');
          this.router.navigate(['/forbidden']); // Bạn có thể tạo trang forbidden để hiển thị thông báo lỗi
        } else if (error.status === 0) {
          // Xử lý khi có lỗi kết nối mạng (Network error)
          console.error('Network error: Please check your internet connection.');
          alert('There seems to be a problem with your network. Please try again.');
        }

        // Nếu không có lỗi nào trong số trên, tiếp tục trả về lỗi
        return throwError(() => error);
      }),
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      console.log('Token expired, attempting to refresh token');

      if (!this.authService.hasRefreshToken()) {
        this.isRefreshing = false;
        this.authService.clearAuthData();
        this.handleNavigation();
        return EMPTY;
      }

      return this.tokenService.refreshToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          const clonedRequest = this.addToken(request, response.data.token);
          this.refreshTokenSubject.next(response.data.token);
          console.log('Token refreshed successfully');
          return next.handle(clonedRequest);
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.clearAuthData();
          this.handleNavigation();
          console.error('Error refreshing token:', err);
          return throwError(() => err);
        }),
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) => {
          const clonedRequest = this.addToken(request, token);
          return next.handle(clonedRequest);
        }),
      );
    }
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private handleNavigation() {
    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/admin')) {
      this.router.navigate(['/login']);
    } else if (currentUrl.startsWith('/login')) {
      // Giữ nguyên trang đăng nhập
    } else {
      // Giữ nguyên trang hiện tại (trang chủ hoặc các trang khác)
    }
  }
}
