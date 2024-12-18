import { Injectable } from '@angular/core';
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
import CryptoJS from 'crypto-es';

const ROLE_ADMIN = 'ADMIN';
const ROLE_MODERATOR = 'MODERATOR';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiBaseUrl = environment.apiBaseUrl;
  private secretKey = environment.secretKey;

  private readonly refreshTokenKey = 'refreshToken';
  private readonly refreshTokenFlagKey = 'refreshTokenFlag';
  private userSubject: BehaviorSubject<UserResponse | null>;
  public user$: Observable<UserResponse | null>;
  private jwtHelperService = new JwtHelperService();
  private broadcastChannel = new BroadcastChannel('auth');
  private isRefreshingToken = false;

  constructor(
    private router: Router,
    private userDetailService: UserDetailService,
    private snackbarService: SnackbarService,
    private http: HttpClient,
    private loginService: LoginService,
  ) {
    this.userSubject = new BehaviorSubject<UserResponse | null>(null);
    this.user$ = this.userSubject.asObservable();
    this.broadcastChannel.onmessage = (event) => {
      if (event.data.type === 'LOGOUT') {
        this.clearAuthData();
      } else if (event.data.type === 'TOKEN_UPDATE') {
        this.setAccessToken(event.data.token);
      }
    };
  }

  setUser(user: UserResponse | null) {
    this.userSubject.next(user);
  }

  getUser(): UserResponse | null {
    return this.userSubject.value;
  }

  getUserId(): number {
    return this.getUser()?.id ?? 0;
  }

  setAccessToken(token: string) {
    const encryptedToken = CryptoJS.AES.encrypt(token, this.secretKey).toString();
    localStorage.setItem('accessToken', encryptedToken);
    this.broadcastChannel.postMessage({ type: 'TOKEN_UPDATE', token: encryptedToken });
  }

  getAccessToken(): string | null {
    const encryptedToken = localStorage.getItem('accessToken');
    if (encryptedToken) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedToken, this.secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
      } catch (error) {
        console.error('Error decrypting access token:', error);
        this.clearAuthData(); // Xóa dữ liệu xác thực nếu giải mã thất bại
        return null;
      }
    }
    return null;
  }

  setRefreshToken(refreshToken: string) {
    const encryptedToken = CryptoJS.AES.encrypt(refreshToken, this.secretKey).toString();
    localStorage.setItem(this.refreshTokenKey, encryptedToken);
  }

  getRefreshToken(): string | null {
    const encryptedToken = localStorage.getItem(this.refreshTokenKey);
    if (encryptedToken) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedToken, this.secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
      } catch (error) {
        console.error('Error decrypting refresh token:', error);
        this.clearAuthData(); // Xóa dữ liệu xác thực nếu giải mã thất bại
        return null;
      }
    }
    return null;
  }

  isTokenExpired(token: string): boolean {
    if (!token || token.split('.').length !== 3) {
      console.warn('Invalid token format');
      return true; // Nếu token không hợp lệ, coi như hết hạn
    }
    return this.jwtHelperService.isTokenExpired(token);
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    return token !== null && !this.isTokenExpired(token);
  }

  clearAuthData() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem(this.refreshTokenKey); // Nếu bạn dùng refresh token
    this.broadcastChannel.postMessage({ type: 'LOGOUT' });
  }

  logout() {
    this.clearAuthData(); // Xóa dữ liệu xác thực
  }

  isAdminOrModerator(): boolean {
    const user = this.getUser();
    return user?.role.name === ROLE_ADMIN || user?.role.name === ROLE_MODERATOR;
  }

  async setUserFromToken(token: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.userDetailService.getUserDetail(token));
      this.setUser(response.data ?? null);
    } catch (error) {
      this.snackbarService.show('Error getting user details:');
      this.logout();
    }
  }

  setRefreshTokenFlag() {
    localStorage.setItem(this.refreshTokenFlagKey, 'true');
  }

  clearRefreshTokenFlag() {
    localStorage.removeItem(this.refreshTokenFlagKey);
  }

  hasRefreshToken(): boolean {
    return localStorage.getItem(this.refreshTokenFlagKey) === 'true';
  }

  clearPreviousSession() {
    localStorage.removeItem('accessToken'); // Xóa token
    localStorage.removeItem(this.refreshTokenKey); // Xóa refresh token
    this.clearRefreshTokenFlag(); // Xóa cờ liên quan
    this.broadcastChannel.postMessage('LOGOUT'); // Gửi thông báo đăng xuất
  }

  handleNavigation(currentUrl: string) {
    if (this.isRefreshingToken) {
      // Wait for the token refresh process to complete
      setTimeout(() => this.handleNavigation(currentUrl), 100);
      return;
    }

    if (currentUrl.startsWith('/admin') && !this.isLoggedIn()) {
      this.router.navigate(['/login']);
    } else if (currentUrl.startsWith('/login')) {
      // Giữ nguyên trang đăng nhập
    } else {
      // Giữ nguyên trang hiện tại
    }
  }

  loginWithRecovery(loginDTO: any, previousToken: string, previousRefreshToken: string): Observable<LoginResponse> {
    return this.loginService.login(loginDTO).pipe(
      tap((response: LoginResponse) => {
        if (response.status == 'OK' && response.data) {
          this.clearPreviousSession();
          const { token } = response.data;
          this.setAccessToken(token);
          this.setRefreshTokenFlag();
        } else {
          this.setAccessToken(previousToken);
          this.setRefreshToken(previousRefreshToken);
        }
      }),
      catchError((error: any) => {
        this.setAccessToken(previousToken);
        this.setRefreshToken(previousRefreshToken);
        return throwError(() => new Error(error));
      }),
    );
  }

  // Corrected function name and parameter usage
  authenticate(loginType: 'facebook' | 'google'): Observable<string> {
    debugger;
    return this.http.get(`${this.apiBaseUrl}/users/auth/social-login?login_type=${loginType}`, { responseType: 'text' });
  }

  exchangeCodeForToken(code: string, loginType: 'facebook' | 'google'): Observable<any> {
    const params = new HttpParams().set('code', code).set('login_type', loginType);

    return this.http.get<any>(`${this.apiBaseUrl}/users/auth/social/callback`, { params });
  }
}
