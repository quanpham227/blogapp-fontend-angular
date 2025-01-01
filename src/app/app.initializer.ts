import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { finalize, take } from 'rxjs/operators';

// Hàm khởi tạo ứng dụng
export function initializeApp(tokenService: TokenService, authService: AuthService, router: Router, location: Location) {
  return (): Promise<any> => {
    return new Promise((resolve) => {
      // Lấy token hiện tại từ AuthService
      authService.token$.pipe(take(1)).subscribe((token) => {
        if (!token) {
          // Không có token, hoàn thành khởi tạo
          resolve(true);
          return;
        }

        if (!authService.isTokenExpired(token)) {
          // Token hợp lệ, thiết lập người dùng
          authService.setUserFromToken(token).then(() => resolve(true));
        } else {
          // Token hết hạn, xử lý làm mới token
          handleRefreshToken(tokenService, authService, router)
            .then(() => resolve(true))
            .catch(() => resolve(true)); // Đảm bảo luôn kết thúc Promise
        }
      });
    });
  };
}

// Hàm xử lý làm mới token
function handleRefreshToken(tokenService: TokenService, authService: AuthService, router: Router): Promise<void> {
  return new Promise((resolve, reject) => {
    tokenService
      .refreshToken()
      .pipe(finalize(() => resolve())) // Đảm bảo Promise luôn được kết thúc
      .subscribe({
        next: (newToken: string) => {
          if (!newToken) {
            handleRefreshTokenFailure(authService, router);
            reject(); // Làm mới token thất bại
            return;
          }

          authService
            .setUserFromToken(newToken)
            .then(() => {
              console.log('Token refreshed successfully in app initializer');
              resolve(); // Thành công
            })
            .catch(() => {
              handleRefreshTokenFailure(authService, router);
              reject(); // Xử lý thất bại khi thiết lập người dùng
            });
        },
        error: () => {
          handleRefreshTokenFailure(authService, router);
          reject(); // Refresh token thất bại
        },
      });
  });
}

// Hàm xử lý khi làm mới token thất bại
function handleRefreshTokenFailure(authService: AuthService, router: Router) {
  authService.logout();
  router.navigate(['/login']);
  console.log('Redirecting to login after token refresh failure');
}
