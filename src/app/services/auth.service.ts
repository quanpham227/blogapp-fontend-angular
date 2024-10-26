import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserResponse } from '../responses/user/user.response';
import { Router } from '@angular/router';
import { UserDetailService } from './user.details';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject: BehaviorSubject<UserResponse | null>;
  public user$: Observable<UserResponse | null>;
  private jwtHelperService = new JwtHelperService();

  constructor(
    private router: Router,
    private userDetailService: UserDetailService,
  ) {
    this.userSubject = new BehaviorSubject<UserResponse | null>(null);
    this.user$ = this.userSubject.asObservable();
  }

  setUser(user: UserResponse | null) {
    this.userSubject.next(user);
  }

  getUser(): UserResponse | null {
    return this.userSubject.value;
  }

  setAccessToken(token: string) {
    sessionStorage.setItem('token', token);
    console.log('Access token saved to sessionStorage:', token);
  }

  getAccessToken(): string | null {
    const token = sessionStorage.getItem('token');
    if (token) {
      return token;
    }
    console.log('No access token found in sessionStorage');
    return null;
  }

  isTokenExpired(token: string): boolean {
    if (!token) {
      console.log('Token is missing, considered expired');
      return true; // Nếu không có token, coi như hết hạn
    }
    const isExpired = this.jwtHelperService.isTokenExpired(token);
    console.log(`Token is ${isExpired ? 'expired' : 'valid'}`);
    return isExpired; // Trả về true nếu token hết hạn
  }

  clearAuthData() {
    this.userSubject.next(null);
    sessionStorage.removeItem('token');
    document.cookie =
      'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }

  logout() {
    this.clearAuthData(); // Xóa dữ liệu xác thực
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role.name === 'ADMIN';
  }

  async setUserFromToken(token: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.userDetailService.getUserDetail(token),
      );
      this.setUser(response.data ?? null);
    } catch (error) {
      console.error('Error getting user details:', error);
      this.logout();
    }
  }
}
