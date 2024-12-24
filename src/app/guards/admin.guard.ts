import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserResponse } from '../responses/user/user.response';
import { Roles } from '../enums/roles.enum';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('Current route:', next.routeConfig?.path);

    const isPublicRoute = next.routeConfig?.path === 'login' || next.routeConfig?.path === 'register';

    if (isPublicRoute) {
      return true;
    }

    const token = this.authService.getAccessToken();
    const isTokenExpired = token ? this.authService.isTokenExpired(token) : true;
    const userResponse: UserResponse | null = this.authService.getUser();
    const isAdminOrModerator = userResponse?.role?.name === Roles.ADMIN || userResponse?.role?.name === Roles.MODERATOR;

    if (!isTokenExpired && isAdminOrModerator) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}

export const AdminGuardFn: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(AdminGuard).canActivate(next, state);
};
