import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { UserDetailService } from './user.details';
import { Router } from '@angular/router';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private apiRefreshToken = `${environment.apiBaseUrl}/users/refreshToken`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userDetailService: UserDetailService,
    private router: Router,
    private loggingService: LoggingService,
  ) {}

  refreshToken(): Observable<any> {
    if (!this.authService.hasRefreshToken()) {
      return of(null);
    }
    return this.http
      .post(
        this.apiRefreshToken,
        {},
        { withCredentials: true }, // Gửi yêu cầu với cookie `httpOnly`
      )
      .pipe(
        tap((response: any) => {
          const { token } = response.data;
          this.authService.setAccessToken(token);
          this.authService.setRefreshTokenFlag();
          this.userDetailService.getUserDetail(token).subscribe({
            next: (response: any) => {
              this.authService.setUser(response.data ?? null);
            },
            error: (error: any) => {
              this.loggingService.logError('Error when getting user detail', error);
              this.authService.logout();
              this.handleNavigation();
            },
          });
        }),
        catchError((error) => {
          this.loggingService.logError('Error when refreshing token', error);
          this.authService.logout();
          this.handleNavigation();
          return of(null);
        }),
      );
  }

  private handleNavigation() {
    const currentUrl = this.router.url;
    this.authService.handleNavigation(currentUrl);
  }
}
