import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserResponse } from '../responses/user/user.response';
import { Router } from '@angular/router';
import { UserDetailService } from './user.details';
import { firstValueFrom } from 'rxjs';
import { SnackbarService } from './snackbar.service';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LoginResponse } from '../responses/user/login.response';
import { LoginService } from './login.service';
import { LoginType } from '../enums/login.type';
import { Roles } from '../enums/roles.enum';
import { BroadcastMessages } from '../enums/broadcast-messages.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiBaseUrl = environment.apiBaseUrl;
  private accessToken: string | null = null;
  private authChannel = new BroadcastChannel('auth_channel');

  private userSubject: BehaviorSubject<UserResponse | null>;
  public user$: Observable<UserResponse | null>;
  private tokenSubject: BehaviorSubject<string | null>;
  public token$: Observable<string | null>;

  private jwtHelperService = new JwtHelperService();

  constructor(
    private router: Router,
    private userDetailService: UserDetailService,
    private snackbarService: SnackbarService,
    private http: HttpClient,
    private loginService: LoginService,
    private ngZone: NgZone,
  ) {
    this.userSubject = new BehaviorSubject<UserResponse | null>(null);
    this.user$ = this.userSubject.asObservable();

    this.tokenSubject = new BehaviorSubject<string | null>(this.getAccessToken());
    this.token$ = this.tokenSubject.asObservable();

    // Lắng nghe sự kiện để đồng bộ trạng thái đăng nhập giữa các tab
    this.authChannel.onmessage = (event) => this.syncAuthState(event);
  }

  setUser(user: UserResponse | null) {
    this.userSubject.next(user);
    this.authChannel.postMessage({ event: BroadcastMessages.SET_USER, user });
  }

  getUser(): UserResponse | null {
    return this.userSubject.value;
  }

  getUserId(): number {
    return this.getUser()?.id ?? 0;
  }

  setAccessToken(accessToken: string) {
    if (this.accessToken !== accessToken) {
      // Chỉ lưu khi có sự khác biệt rõ ràng
      this.accessToken = accessToken;
      this.tokenSubject.next(accessToken); // Phát giá trị mới
      this.authChannel.postMessage({ event: BroadcastMessages.SET_TOKEN, token: accessToken }); // Phát sự kiện đăng nhập
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  isTokenExpired(token: string): boolean {
    // Kiểm tra nếu token là chuỗi hợp lệ trước khi gọi jwtHelperService
    if (typeof token !== 'string') {
      return true; // Nếu không phải chuỗi hợp lệ, coi như token đã hết hạn
    }

    // Kiểm tra token hết hạn bằng jwtHelperService
    return !token || this.jwtHelperService.isTokenExpired(token);
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired(token);
  }

  logout() {
    this.clearAuthData(); // Xóa dữ liệu xác thực
    this.authChannel.postMessage({ event: BroadcastMessages.LOGOUT }); // Phát sự kiện đăng xuất
  }

  clearAuthData() {
    this.clearToken();
    this.clearUser();
  }

  clearToken() {
    this.accessToken = null;
    this.tokenSubject.next(null); // Phát giá trị null
  }

  clearUser() {
    this.userSubject.next(null); // Xóa thông tin người dùng
  }

  isAdminOrModerator(): boolean {
    const user = this.getUser();
    return user?.role.name === Roles.ADMIN || user?.role.name === Roles.MODERATOR;
  }

  async setUserFromToken(token: string): Promise<void> {
    if (!token) {
      throw new Error('Token is null or undefined');
    }

    try {
      const response = await firstValueFrom(this.userDetailService.getUserDetail(token));
      this.setUser(response.data ?? null);
    } catch (error) {
      this.snackbarService.show('Error getting user details:');
      this.logout();
    }
  }

  loginWithRecovery(loginDTO: any): Observable<LoginResponse> {
    return this.loginService.login(loginDTO).pipe(
      tap((response: LoginResponse) => {
        if (response.status == 'OK' && response.data) {
          this.setAccessToken(response.data.token); // Lưu token mới
        }
      }),
      catchError((error: any) => {
        return throwError(() => new Error(error));
      }),
    );
  }

  authenticate(loginType: LoginType): Observable<string> {
    return this.http.get(`${this.apiBaseUrl}/users/auth/social-login?login_type=${loginType}`, { responseType: 'text' });
  }

  exchangeCodeForToken(code: string, loginType: LoginType): Observable<any> {
    const params = new HttpParams().set('code', code).set('login_type', loginType);

    return this.http.get<any>(`${this.apiBaseUrl}/users/auth/social/callback`, { params, withCredentials: true });
  }

  navigateToDashboard(userResponse: UserResponse | null) {
    if (!userResponse) {
      this.ngZone.run(() => {
        this.router.navigate(['/']);
      });
      return;
    }
    const role = userResponse.role?.name;
    this.ngZone.run(() => {
      switch (role) {
        case Roles.ADMIN:
        case Roles.MODERATOR:
          this.router.navigate(['/admin/dashboard']);
          break;
        case Roles.USER:
          this.router.navigate(['/']);
          break;
        default:
          this.router.navigate(['/']);
          break;
      }
    });
  }

  private syncAuthState(event: MessageEvent) {
    if (event.data.event === BroadcastMessages.LOGOUT) {
      this.clearAuthData();
      this.router.navigate(['/login']);
    } else if (event.data.event === BroadcastMessages.SET_TOKEN) {
      const token = event.data.token;
      if (token) {
        this.accessToken = token;
        this.tokenSubject.next(this.accessToken);
        if (this.accessToken) {
          this.setUserFromToken(this.accessToken);
        }
      }
    } else if (event.data.event === BroadcastMessages.SET_USER) {
      const user = event.data.user;
      this.userSubject.next(user);
    }
  }
}
