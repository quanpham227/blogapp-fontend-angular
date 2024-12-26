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
import CryptoJS from 'crypto-es';
import { LoginType } from '../enums/login.type';
import { Roles } from '../enums/roles.enum';

@Injectable({
  providedIn: 'root',
})
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiBaseUrl = environment.apiBaseUrl;
  private secretKey = environment.secretKey;

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

    // Listen to storage events
    window.addEventListener('storage', this.handleStorageEvent.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.handleStorageEvent.bind(this)); // Remove the event listener when the service is destroyed
  }

  private handleStorageEvent(event: StorageEvent) {
    if (event.key === 'accessToken') {
      this.ngZone.run(() => {
        const token = event.newValue ? this.decryptData(event.newValue) : null;
        this.tokenSubject.next(token);
        if (!token) {
          this.clearAuthData();
          this.router.navigate(['/login']);
        }
      });
    }
  }

  clearAuthData() {
    localStorage.removeItem('accessToken');
    this.tokenSubject.next(null); // Phát giá trị null
    localStorage.setItem('logoutEvent', Date.now().toString()); // Trigger logout event
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
    this.tokenSubject.next(token); // Phát giá trị mới
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
    this.tokenSubject.next(null); // Phát giá trị null
    localStorage.setItem('logoutEvent', Date.now().toString()); // Trigger logout event
  }

  loginWithRecovery(loginDTO: any): Observable<LoginResponse> {
    return this.loginService.login(loginDTO).pipe(
      tap((response: LoginResponse) => {
        if (response.status == 'OK' && response.data) {
          debugger; // Breakpoint
          this.clearPreviousSession(); // Xóa session trước đó nếu có
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
}
