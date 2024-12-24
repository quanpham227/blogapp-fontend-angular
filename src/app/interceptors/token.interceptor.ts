import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { SnackbarService } from '../services/snackbar.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    private snackbarService: SnackbarService,
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
          return this.handle401Error(authReq, next);
        } else if (error.status === 403) {
          this.snackbarService.show('You do not have permission to access this resource.');
          this.router.navigate(['/forbidden']);
        } else if (error.status === 0) {
          this.snackbarService.show('There seems to be a problem with your network. Please try again.');
        }
        return throwError(() => error);
      }),
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      this.snackbarService.show('Token expired, attempting to refresh token');

      return this.tokenService.refreshToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          const newToken = response.data.token;
          this.authService.setAccessToken(newToken);
          this.refreshTokenSubject.next(newToken);
          return next.handle(this.addToken(request, newToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.clearAuthData();
          this.router.navigate(['/login']);
          return throwError(() => err);
        }),
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) => next.handle(this.addToken(request, token))),
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
}
