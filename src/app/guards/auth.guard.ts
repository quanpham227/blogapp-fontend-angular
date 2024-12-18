import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
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
    const userId = this.authService.getUser()?.id ?? 0;
    const isUserIdValid = userId > 0;

    if (!isTokenExpired && isUserIdValid) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}

export const AuthGuardFn: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(AuthGuard).canActivate(next, state);
};
