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
import { LoggingService } from './logging.service';
import { SuccessHandlerService } from './success-handler.service';
import { ApiResponse } from '../models/response';

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
    private loggingService: LoggingService,
    private successHandlerService: SuccessHandlerService,
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
    return this.http.post(this.apiLogin, loginDTO, {
      ...this.apiConfig,
      withCredentials: true,
    });
  }

  getUserDetail(token: string): Observable<UserResponse> {
    this.checkTokenValidity();

    return this.http.post<UserResponse>(
      this.apiUserDetail,
      {},
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }),
      },
    );
  }
  updateUserDetail(token: string, updateUserDTO: UpdateUserDTO): Observable<any> {
    this.checkTokenValidity();

    const userResponse = this.authService.getUser();

    return this.http.put(`${this.apiUserDetail}/${userResponse?.id}`, updateUserDTO, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    });
  }

  logout() {
    this.http.post<ApiResponse<void>>(this.apiLogout, {}, { withCredentials: true }).subscribe({
      next: (response: ApiResponse<void>) => {
        const user = this.authService.getUser();
        const isAdmin = user?.role.name === 'ADMIN';
        this.authService.logout(); // Gọi phương thức logout từ AuthService
        this.router.navigate([isAdmin ? '/login' : '/']).then(() => {});
        this.successHandlerService.handleApiResponse(response);
      },
      error: (error) => {},
    });
  }
}
