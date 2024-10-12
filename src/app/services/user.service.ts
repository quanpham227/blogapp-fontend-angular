import { LoginDTO } from './../dtos/user/login.dto';
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'; // Import catchError

import { RegisterDTO } from '../../app/dtos/user/register.dto';
import { environment } from '../../environments/environment';
import { UserResponse } from '../..//app/responses/user/user.response';
import { UpdateUserDTO } from '../../app/dtos/user/update.user';
import { DOCUMENT } from '@angular/common';
import { TokenService } from '../services/token.service'; // Thêm TokenService
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiRegister = `${environment.apiBaseUrl}/users/register`;
  private apiLogin = `${environment.apiBaseUrl}/users/login`;
  private apiUserDetail = `${environment.apiBaseUrl}/users/details`;
  private apiRefreshToken = `${environment.apiBaseUrl}/users`;
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
    private tokenService: TokenService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.localStorage = this.document.defaultView?.localStorage;
    this.checkTokenValidity();
  }

  private checkTokenValidity() {
    const token = this.tokenService.getToken();
    if (token && this.tokenService.isTokenExpired()) {
      this.logout();
    }
  }

  register(registerDTO: RegisterDTO): Observable<any> {
    return this.http.post(this.apiRegister, registerDTO, this.apiConfig);
  }

  login(loginDTO: LoginDTO): Observable<any> {
    return this.http.post(this.apiLogin, loginDTO, this.apiConfig).pipe(
      tap((response: any) => {
        const { token, refresh_token } = response.data;

        if (token && refresh_token) {
          // Lưu access_token và refresh_token vào localStorage
          this.tokenService.setToken(token);
          this.tokenService.setRefreshToken(refresh_token);
          console.log('Tokens saved to localStorage.');
        }
      }),
    );
  }

  // Phương thức refresh token
  refreshToken(): Observable<any> {
    const refresh_token = this.tokenService.getRefreshToken();
    return this.http.post(
      `${this.apiRefreshToken}/refreshToken`,
      { refresh_token: refresh_token }, // Đảm bảo tên trường là refresh_token
      {
        headers: this.createHeaders(),
      },
    );
  }
  getUserDetail(token: string): Observable<UserResponse> {
    this.checkTokenValidity(); // Kiểm tra token trước khi thực hiện yêu cầu API

    return this.http
      .post<UserResponse>(
        this.apiUserDetail,
        {},
        {
          // Sử dụng POST thay vì GET
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

    const userResponse = this.getFromLocalStorage();
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

  saveToLocalStorage(userResponse?: UserResponse) {
    try {
      debugger;
      if (userResponse === null || userResponse === undefined) {
        console.error('UserResponse is undefined');
        return;
      }
      //convert userResponse obj to JSON string
      const userResponseJSON = JSON.stringify(userResponse);

      //save to local storage with key 'user'
      this.localStorage?.setItem('user', userResponseJSON);
      console.log('User saved to local storage');
    } catch (error) {
      console.error('Error saving user to local storage:', error);
    }
  }

  getFromLocalStorage(): UserResponse | null {
    try {
      // Kiểm tra sự tồn tại của localStorage
      if (!this.localStorage) {
        //console.error('localStorage is not available.');
        return null;
      }
      //get user from local storage
      const userResponseJSON = this.localStorage?.getItem('user');
      if (userResponseJSON === null || userResponseJSON === undefined) {
        return null;
      }
      //parse JSON string to UserResponse obj
      const userResponse: UserResponse = JSON.parse(userResponseJSON);
      console.log('User retrieved from local storage');
      return userResponse;
    } catch (error) {
      console.error('Error retrieving user from local storage:', error);
      return null;
    }
  }

  removeUserFromLocalStorage(): void {
    try {
      // Kiểm tra sự tồn tại của localStorage
      if (!this.localStorage) {
        console.error('localStorage is not available.');
        return;
      }

      // Remove the user data from local storage using the key
      this.localStorage?.removeItem('user');
      console.log('User data removed from local storage.');
    } catch (error) {
      console.error('Error removing user data from local storage:', error);
      // Handle the error as needed
    }
  }

  logout() {
    this.removeUserFromLocalStorage();
    this.tokenService.removeToken();
    this.tokenService.removeRefreshToken();
    this.router.navigate(['/login']).then(() => {
      console.log('User has been logged out.');
    });
  }
}
