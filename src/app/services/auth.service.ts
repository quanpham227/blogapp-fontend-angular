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
import { LoginType } from '../enums/login.type';
import { Roles } from '../enums/roles.enum';
import { BroadcastMessages } from '../enums/broadcast-messages.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiBaseUrl = environment.apiBaseUrl;
  private secretKey = environment.secretKey;

  private userSubject: BehaviorSubject<UserResponse | null>;
  public user$: Observable<UserResponse | null>;
  private jwtHelperService = new JwtHelperService();
  private broadcastChannel = new BroadcastChannel('auth');

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
      if (event.data.type === BroadcastMessages.LOGOUT) {
        this.clearAuthData();
      } else if (event.data.type === BroadcastMessages.TOKEN_UPDATE) {
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
    const encryptedToken = this.encryptData(token);
    localStorage.setItem('accessToken', encryptedToken);
    this.broadcastChannel.postMessage({ type: 'TOKEN_UPDATE', token: encryptedToken });
  }

  getAccessToken(): string | null {
    const encryptedToken = localStorage.getItem('accessToken');
    return encryptedToken ? this.decryptData(encryptedToken) : null;
  }

  isTokenExpired(token: string): boolean {
    return !token || token.split('.').length !== 3 || this.jwtHelperService.isTokenExpired(token);
  }

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired(token);
  }

  clearAuthData() {
    localStorage.removeItem('accessToken');
    this.broadcastChannel.postMessage({ type: BroadcastMessages.LOGOUT });
  }

  logout() {
    this.clearAuthData(); // Xóa dữ liệu xác thực
  }

  isAdminOrModerator(): boolean {
    const user = this.getUser();
    return user?.role.name === Roles.ADMIN || user?.role.name === Roles.MODERATOR;
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

  clearPreviousSession() {
    localStorage.removeItem('accessToken'); // Xóa token
    this.broadcastChannel.postMessage({ type: BroadcastMessages.LOGOUT }); // Gửi thông báo đăng xuất
  }

  loginWithRecovery(loginDTO: any, previousToken: string): Observable<LoginResponse> {
    return this.loginService.login(loginDTO).pipe(
      tap((response: LoginResponse) => {
        if (response.status == 'OK' && response.data) {
          this.clearPreviousSession();
          const { token } = response.data;
          this.setAccessToken(token);
        } else {
          this.setAccessToken(previousToken);
        }
      }),
      catchError((error: any) => {
        this.setAccessToken(previousToken);
        return throwError(() => new Error(error));
      }),
    );
  }

  // Corrected function name and parameter usage
  authenticate(loginType: LoginType): Observable<string> {
    return this.http.get(`${this.apiBaseUrl}/users/auth/social-login?login_type=${loginType}`, { responseType: 'text' });
  }

  exchangeCodeForToken(code: string, loginType: LoginType): Observable<any> {
    const params = new HttpParams().set('code', code).set('login_type', loginType);

    return this.http.get<any>(`${this.apiBaseUrl}/users/auth/social/callback`, { params, withCredentials: true });
  }

  private encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data, this.secretKey).toString();
  }

  private decryptData(encryptedData: string): string | null {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Lỗi khi giải mã token:', error, encryptedData);
      return null;
    }
  }
  navigateToDashboard(userResponse: UserResponse | null) {
    if (!userResponse) {
      this.router.navigate(['/']);
      return;
    }
    switch (userResponse.role?.name) {
      case 'ADMIN':
      case 'MODERATOR':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'USER':
        this.router.navigate(['/']);
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
  }
}
