import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { DOCUMENT } from '@angular/common';
import { UserDetailService } from './user.details';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private apiRefreshToken = `${environment.apiBaseUrl}/users/refreshToken`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userDetailService: UserDetailService,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  refreshToken(): Observable<any> {
    console.log('Attempting to refresh token');
    return this.http
      .post(
        this.apiRefreshToken,
        {},
        { withCredentials: true }, // Gửi yêu cầu với cookie `httpOnly`
      )
      .pipe(
        tap((response: any) => {
          const { token, refresh_token } = response.data;
          this.authService.setAccessToken(token);
          this.userDetailService.getUserDetail(token).subscribe({
            next: (response: any) => {
              this.authService.setUser(response.data ?? null);
              console.log('User details updated after token refresh');
            },
            error: (error: any) => {
              this.authService.logout();
              console.error(
                'Error getting user details after token refresh:',
                error,
              );
            },
          });
        }),
        catchError((error) => {
          this.authService.logout();
          console.error('Error refreshing token:', error);
          return of(null);
        }),
      );
  }
}
