import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { finalize } from 'rxjs/operators';

export function initializeApp(
  tokenService: TokenService,
  authService: AuthService,
) {
  return (): Promise<any> => {
    return new Promise((resolve) => {
      const token = authService.getAccessToken();
      if (token && !authService.isTokenExpired(token)) {
        authService.setUserFromToken(token).then(() => {
          resolve(true);
        });
      } else {
        tokenService
          .refreshToken()
          .pipe(finalize(() => resolve(true)))
          .subscribe();
      }
    });
  };
}
