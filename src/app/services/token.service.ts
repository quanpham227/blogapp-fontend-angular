import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { UserDetailService } from './user.details';
import { Router } from '@angular/router';
import { LoggingService } from './logging.service';
import { ApiResponse } from '../models/response';
import { UserResponse } from '../responses/user/user.response';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  userResponse?: UserResponse | null = null;
  private apiRefreshToken = `${environment.apiBaseUrl}/users/refreshToken`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userDetailService: UserDetailService,
    private router: Router,
    private loggingService: LoggingService,
    private snackbarService: SnackbarService,
    private ngZone: NgZone,
  ) {}

  refreshToken(currentUrl: string): Observable<any> {
    return this.http.post(this.apiRefreshToken, {}, { withCredentials: true }).pipe(
      tap((response: any) => {
        const { token } = response.data;
        this.authService.setAccessToken(token);
        this.updateUserDetails(token);
      }),
      catchError((error) => {
        this.loggingService.logError('Error when refreshing token', error);
        this.authService.logout();
        this.ngZone.run(() => {
          this.router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
        });
        return of(null);
      }),
    );
  }

  private updateUserDetails(token: string) {
    this.userDetailService.getUserDetail(token).subscribe({
      next: (response: ApiResponse<UserResponse>) => {
        if (response.status === 'OK' && response.data) {
          this.userResponse = response.data;
          this.authService.setUser(this.userResponse ?? null);
        }
      },
      error: (error: any) => {
        this.loggingService.logError('Error when getting user detail', error);
        this.snackbarService.show('Unable to retrieve user details. Please refresh or login again.');
      },
    });
  }
}
