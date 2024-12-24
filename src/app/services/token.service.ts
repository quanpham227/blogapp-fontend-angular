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
    return this.http.post(this.apiRefreshToken, {}, { withCredentials: true }).pipe(
      tap((response: any) => {
        const { token } = response.data;
        this.authService.setAccessToken(token);
        this.userDetailService.getUserDetail(token).subscribe({
          next: (response: any) => {
            this.authService.setUser(response.data ?? null);
            this.authService.navigateToDashboard(response.data ?? null); // Add this line
          },
          error: (error: any) => {
            this.loggingService.logError('Error when getting user detail', error);
            this.authService.logout();
            this.router.navigate(['/login']);
          },
        });
      }),
      catchError((error) => {
        this.loggingService.logError('Error when refreshing token', error);
        this.authService.logout();
        this.router.navigate(['/login']);
        return of(null);
      }),
    );
  }
}
