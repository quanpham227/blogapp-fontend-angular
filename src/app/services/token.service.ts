import { Inject, Injectable } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  private jwtHelperService = new JwtHelperService();
  localStorage?: Storage;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.localStorage = document.defaultView?.localStorage;
  }
  //getter/setter
  getToken(): string {
    return this.localStorage?.getItem(this.TOKEN_KEY) ?? '';
  }
  setToken(token: string): void {
    this.localStorage?.setItem(this.TOKEN_KEY, token);
  }

  // Getter cho refresh token
  getRefreshToken(): string {
    return this.localStorage?.getItem(this.REFRESH_TOKEN_KEY) ?? '';
  }

  // Setter cho refresh token
  setRefreshToken(refreshToken: string): void {
    this.localStorage?.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  getUserId(): number {
    let token = this.getToken();
    if (!token) {
      return 0;
    }
    let userObject = this.jwtHelperService.decodeToken(token);
    return 'userId' in userObject ? parseInt(userObject['userId']) : 0;
  }

  removeToken(): void {
    this.localStorage?.removeItem(this.TOKEN_KEY);
  }
  removeRefreshToken(): void {
    this.localStorage?.removeItem(this.REFRESH_TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true; // Nếu không có token, coi như hết hạn
    }
    return this.jwtHelperService.isTokenExpired(token); // Trả về true nếu token hết hạn
  }
}
