import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { finalize } from 'rxjs/operators';

export function initializeApp(tokenService: TokenService, authService: AuthService) {
  return (): Promise<any> => {
    return new Promise((resolve) => {
      const token = authService.getAccessToken();
      console.log('test Token with login google:', token);
      if (token && !authService.isTokenExpired(token)) {
        // Nếu token hợp lệ và chưa hết hạn, thiết lập người dùng từ token
        authService.setUserFromToken(token).then(() => {
          resolve(true);
        });
      } else if (token) {
        // Nếu token đã hết hạn, gửi yêu cầu làm mới token
        debugger;
        tokenService
          .refreshToken()
          .pipe(finalize(() => resolve(true)))
          .subscribe({
            next: (response: any) => {
              try {
                const newToken = response.data.token;
                authService.setUserFromToken(newToken).then(() => {
                  resolve(true);
                });
              } catch (e) {
                authService.logout();
                resolve(true);
              }
            },
            error: () => {
              authService.logout();
              resolve(true);
            },
          });
      } else {
        // Nếu không có token, không làm gì cả và hoàn thành khởi tạo
        resolve(true);
      }
    });
  };
}
