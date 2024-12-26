import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserResponse } from '../responses/user/user.response';
import { Roles } from '../enums/roles.enum';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const isPublicRoute = next.routeConfig?.path === 'login' || next.routeConfig?.path === 'register';

    if (isPublicRoute) {
      return of(true);
    }

    return this.authService.token$.pipe(
      take(1),
      map((token) => {
        const isTokenExpired = token ? this.authService.isTokenExpired(token) : true;
        const userResponse: UserResponse | null = this.authService.getUser();

        if (!isTokenExpired && userResponse) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      }),
    );
  }
}

export const AdminGuardFn: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> => {
  return inject(AdminGuard).canActivate(next, state);
};
