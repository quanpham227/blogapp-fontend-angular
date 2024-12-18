import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { finalize } from 'rxjs/operators';

export function initializeApp(tokenService: TokenService, authService: AuthService) {
  return (): Promise<any> => {
    return new Promise((resolve) => {
      const token = authService.getAccessToken();
      if (token && !authService.isTokenExpired(token)) {
        authService.setUserFromToken(token).then(() => {
          resolve(true);
        });
      } else {
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          tokenService
            .refreshToken()
            .pipe(finalize(() => resolve(true)))
            .subscribe({
              next: (response: any) => {
                const newToken = response.data.token;
                authService.setUserFromToken(newToken).then(() => {
                  resolve(true);
                });
              },
              error: () => {
                authService.logout();
                resolve(true);
              },
            });
        } else {
          resolve(true);
        }
      }
    });
  };
}
