import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null,
  );

  constructor(
    private tokenService: TokenService,
    private userService: UserService,
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const token = this.tokenService.getToken();

    // Nếu token tồn tại, thêm vào header
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Kiểm tra nếu lỗi là 401 (Unauthorized) và token hết hạn
        if (error.status === 401 && this.tokenService.isTokenExpired()) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      }),
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.userService.refreshToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          this.tokenService.setToken(response.data.token);
          this.tokenService.setRefreshToken(response.data.refreshToken);

          const clonedRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${response.data.token}`,
            },
          });

          this.refreshTokenSubject.next(response.data.token);
          return next.handle(clonedRequest);
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.userService.logout(); // Đăng xuất khi không thể refresh token
          return throwError(() => err);
        }),
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) => {
          const clonedRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });
          return next.handle(clonedRequest);
        }),
      );
    }
  }
}
