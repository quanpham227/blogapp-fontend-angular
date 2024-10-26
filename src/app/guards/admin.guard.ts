import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateFn,
} from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserResponse } from '../responses/user/user.response';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    console.log('Current route:', next.routeConfig?.path); // Log route hiện tại

    // Cho phép truy cập vào các route login và register mà không cần kiểm tra token
    const isPublicRoute =
      next.routeConfig?.path === 'login' ||
      next.routeConfig?.path === 'register';

    if (isPublicRoute) {
      return true;
    }

    // Kiểm tra token và quyền admin cho các route không công khai
    const token = this.authService.getAccessToken();
    const isTokenExpired = token
      ? this.authService.isTokenExpired(token)
      : true;
    const userResponse: UserResponse | null = this.authService.getUser();
    const isAdmin = userResponse?.role?.name === 'ADMIN';

    if (!isTokenExpired && isAdmin) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}

export const AdminGuardFn: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): boolean => {
  return inject(AdminGuard).canActivate(next, state);
};
