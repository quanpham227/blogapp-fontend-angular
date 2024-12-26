import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { finalize, take } from 'rxjs/operators';

export function initializeApp(tokenService: TokenService, authService: AuthService, router: Router, location: Location) {
  return (): Promise<any> => {
    return new Promise((resolve) => {
      authService.token$.pipe(take(1)).subscribe((token) => {
        if (token) {
          if (!authService.isTokenExpired(token)) {
            // Token hợp lệ, thiết lập người dùng
            authService.setUserFromToken(token).then(() => resolve(true));
          } else {
            const currentUrl = location.path(); // Lưu URL hiện tại
            console.log('currentUrl in app initializer', currentUrl);
            // Token hết hạn, làm mới token
            tokenService
              .refreshToken(currentUrl)
              .pipe(
                finalize(() => resolve(true)), // Đảm bảo luôn kết thúc Promise
              )
              .subscribe({
                next: (response: any) => {
                  if (!response || !response.data || !response.data.token) {
                    authService.logout();
                    router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
                    resolve(true);
                    return;
                  }
                  const newToken = response.data.token;
                  authService
                    .setUserFromToken(newToken)
                    .then(() => resolve(true))
                    .catch(() => {
                      authService.logout();
                      router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } });
                      resolve(true);
                    });
                },
                error: () => {
                  authService.logout(); // Xử lý khi refresh token thất bại
                  router.navigate(['/login'], { queryParams: { returnUrl: currentUrl } }); // Chuyển hướng tới trang login
                  resolve(true);
                },
              });
          }
        } else {
          // Không có token, hoàn thành khởi tạo
          resolve(true);
        }
      });
    });
  };
}
