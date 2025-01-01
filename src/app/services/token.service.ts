import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { UserDetailService } from './user.details';
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
    private loggingService: LoggingService,
    private snackbarService: SnackbarService,
  ) {}

  refreshToken(): Observable<string> {
    return this.http.post(this.apiRefreshToken, {}, { withCredentials: true }).pipe(
      tap((response: any) => {
        if (response.status !== 'OK' || !response.data?.token) {
          throw new Error('Invalid refresh token response');
        }
      }),
      switchMap((response: any) => {
        const newToken = response.data.token;
        this.authService.setAccessToken(newToken);
        return this.updateUserDetails(newToken).pipe(switchMap(() => of(newToken)));
      }),
      catchError((error) => {
        this.loggingService.logError('Error when refreshing token', error);
        this.authService.logout();
        return throwError(() => error);
      }),
    );
  }

  private updateUserDetails(token: string): Observable<void> {
    return this.userDetailService.getUserDetail(token).pipe(
      tap((response: ApiResponse<UserResponse>) => {
        if (response.status === 'OK' && response.data) {
          this.userResponse = response.data;
          this.authService.setUser(this.userResponse ?? null);
        }
      }),
      catchError((error) => {
        this.loggingService.logError('Error when getting user detail', error);
        this.snackbarService.show('Unable to retrieve user details. Please refresh or login again.');
        return throwError(() => error);
      }),
      switchMap(() => of(void 0)),
    );
  }
}
