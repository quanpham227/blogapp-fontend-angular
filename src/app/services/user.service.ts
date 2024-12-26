import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { RegisterDTO } from '../../app/dtos/user/register.dto';
import { environment } from '../../environments/environment';
import { UserResponse } from '../../app/responses/user/user.response';
import { UpdateUserDTO } from '../../app/dtos/user/update.user';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { LoginDTO } from '../dtos/user/login.dto';
import { AuthService } from './auth.service';
import { convertToCamelCase, convertToSnakeCase } from '../utils/case-converter';
import { SuccessHandlerService } from './success-handler.service';
import { ApiResponse } from '../models/response';
import { User } from '../models/user';
import { UserListResponse } from '../responses/user/uses-list-response';
import { UpdateUserByAdminDTO } from '../dtos/user/update.user.admin';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiRegister = `${environment.apiBaseUrl}/users/register`;
  private apiLogout = `${environment.apiBaseUrl}/users/logout`;
  private apiUserDetail = `${environment.apiBaseUrl}/users/details`;
  private apiUsers = `${environment.apiBaseUrl}/users`;
  private apiBlockUser = `${environment.apiBaseUrl}/users/block`;
  private apiUpdateUserByAdmin = `${environment.apiBaseUrl}/users/admin/update`;

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
    private successHandlerService: SuccessHandlerService,
    private snackbarService: SnackbarService,
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
    const snakeCaseDTO = convertToSnakeCase(registerDTO);
    return this.http.post(this.apiRegister, snakeCaseDTO, this.apiConfig);
  }

  getUserDetail(token: string): Observable<ApiResponse<UserResponse>> {
    this.checkTokenValidity();
    return this.http
      .post<ApiResponse<UserResponse>>(
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
        map((response) => ({
          ...response,
          data: convertToCamelCase(response.data),
        })),
      );
  }

  updateUserDetail(token: string, updateUserDTO: UpdateUserDTO): Observable<any> {
    this.checkTokenValidity();
    const userResponse = this.authService.getUser();
    const snakeCaseDTO = convertToSnakeCase(updateUserDTO);
    return this.http
      .put(`${this.apiUserDetail}/${userResponse?.id}`, snakeCaseDTO, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }),
      })
      .pipe(
        map((response) => convertToCamelCase(response)),
        tap((response) => this.successHandlerService.handleApiResponse(response)),
      );
  }
  updateUserByAdmin(token: string, userId: number, updateUserByAdminDTO: UpdateUserByAdminDTO): Observable<ApiResponse<User>> {
    this.checkTokenValidity();
    const snakeCaseDTO = convertToSnakeCase(updateUserByAdminDTO);
    return this.http
      .put(`${this.apiUpdateUserByAdmin}/${userId}`, snakeCaseDTO, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }),
      })
      .pipe(
        map((response) => convertToCamelCase(response)),
        tap((response) => this.successHandlerService.handleApiResponse(response)),
      );
  }

  logout() {
    this.http.post<ApiResponse<void>>(this.apiLogout, {}, { withCredentials: true }).subscribe({
      next: (response: ApiResponse<void>) => {
        const user = this.authService.getUser();
        const isAdminOrModerator = this.authService.isAdminOrModerator();
        this.authService.logout(); // Gọi phương thức logout từ AuthService
        this.router.navigate([isAdminOrModerator ? '/login' : '/']).then(() => {});
        this.snackbarService.show(response.message);
      },
      error: (error) => {},
    });
  }
  findAllUsers(
    keyword: string = '',
    status: boolean | null = null,
    roleId: number,
    page: number = 0,
    limit: number = 10,
  ): Observable<ApiResponse<UserListResponse>> {
    let params = new HttpParams()
      .set('keyword', keyword)
      .set('status', status !== null ? status.toString() : '')
      .set('roleId', roleId)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ApiResponse<UserListResponse>>(this.apiUsers, { params }).pipe(
      map((response) => {
        if (response && response.data) {
          response.data.users = response.data.users.map((user) => convertToCamelCase(user));
        }
        return response;
      }),
    );
  }
  blockOrEnableUser(userId: number, active: boolean): Observable<ApiResponse<void>> {
    const url = `${this.apiBlockUser}/${userId}/${active ? 1 : 0}`;
    return this.http
      .put<ApiResponse<void>>(url, {}, this.apiConfig)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }

  deleteUser(userId: number): Observable<ApiResponse<void>> {
    return this.http
      .delete<ApiResponse<any>>(`${this.apiUsers}/${userId}`)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }
}
