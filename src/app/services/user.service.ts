import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'; // Import catchError

import { RegisterDTO } from '../../app/dtos/user/register.dto';
import { environment } from '../../environments/environment';
import { UserResponse } from '../../app/responses/user/user.response';
import { UpdateUserDTO } from '../../app/dtos/user/update.user';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { LoginDTO } from '../dtos/user/login.dto';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiRegister = `${environment.apiBaseUrl}/users/register`;
  private apiLogin = `${environment.apiBaseUrl}/users/login`;
  private apiLogout = `${environment.apiBaseUrl}/users/logout`;
  private apiUserDetail = `${environment.apiBaseUrl}/users/details`;
  localStorage?: Storage;

  private apiConfig = {
    headers: this.createHeaders(),
  };

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,

    @Inject(DOCUMENT) private document: Document,
  ) {
    this.localStorage = this.document.defaultView?.localStorage;
    this.checkTokenValidity();
  }

  private checkTokenValidity() {
    const token = this.authService.getAccessToken();
    if (token && this.authService.isTokenExpired(token)) {
      this.logout();
    }
  }

  register(registerDTO: RegisterDTO): Observable<any> {
    return this.http.post(this.apiRegister, registerDTO, this.apiConfig);
  }

  login(loginDTO: LoginDTO): Observable<any> {
    return this.http
      .post(this.apiLogin, loginDTO, {
        ...this.apiConfig,
        withCredentials: true, // Thêm withCredentials ở đây
      })
      .pipe(
        tap((response: any) => {
          const { token, refresh_token } = response.data;
          console.log('Token after login:', token);
          console.log('Refresh Token after login:', refresh_token);
          if (token && refresh_token) {
            // Lưu access_token trong In-Memory Storage
            // Kiểm tra giá trị của document.cookie
            console.log('Document Cookie after login:', this.document.cookie);
          }
        }),
      );
  }

  getUserDetail(token: string): Observable<UserResponse> {
    this.checkTokenValidity(); // Kiểm tra token trước khi thực hiện yêu cầu API

    return this.http
      .post<UserResponse>(
        this.apiUserDetail,
        {},
        {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          }),
        },
      )
      .pipe(
        catchError((error) => {
          if (error.status === 401) {
            this.logout();
          }
          return throwError(() => new Error(error));
        }),
      );
  }
  updateUserDetail(
    token: string,
    updateUserDTO: UpdateUserDTO,
  ): Observable<any> {
    this.checkTokenValidity(); // Kiểm tra token trước khi thực hiện yêu cầu API

    const userResponse = this.authService.getUser();

    return this.http
      .put(`${this.apiUserDetail}/${userResponse?.id}`, updateUserDTO, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }),
      })
      .pipe(
        catchError((error) => {
          if (error.status === 401) {
            this.logout();
          }
          return throwError(() => new Error(error));
        }),
      );
  }

  logout() {
    this.http.post(this.apiLogout, {}, { withCredentials: true }).subscribe({
      next: () => {
        const user = this.authService.getUser();
        const isAdmin = user?.role.name === 'ADMIN';
        this.authService.logout(); // Gọi phương thức logout từ AuthService
        this.router.navigate([isAdmin ? '/login' : '/']).then(() => {
          console.log('User has been logged out.');
        });
      },
      error: (error) => {
        console.error('Error logging out:', error);
      },
    });
  }
}
