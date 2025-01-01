import { Injectable } from '@angular/core';
import { SnackbarService } from './snackbar.service';
import { LoggingService } from './logging.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler {
  private isErrorLogged = false;

  constructor(
    private snackBarService: SnackbarService,
    private loggingService: LoggingService,
    private authService: AuthService,
  ) {}

  handleError(error: any): void {
    // Kiểm tra nếu là lỗi do hết hạn token, không hiển thị thông báo đăng nhập lại
    const token = this.authService.getAccessToken();
    if (error.status === 401 && token && this.authService.isTokenExpired(token)) {
      return; // Nếu token hết hạn, không cần hiển thị thông báo đăng nhập lại
    }

    // Kiểm tra lỗi mạng hoặc không có kết nối internet
    if (error.status === 0 || !navigator.onLine) {
      this.snackBarService.show('Không có kết nối internet. Vui lòng kiểm tra lại.');
      return;
    }

    // Kiểm tra lỗi JSON không hợp lệ
    if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
      return;
    }

    // Kiểm tra lỗi mạng
    if (error instanceof TypeError && error.message.includes('NetworkError')) {
      this.snackBarService.show('Không thể kết nối với máy chủ. Vui lòng kiểm tra lại kết nối.');
      return;
    }

    // Log lỗi (chỉ log một lần trong môi trường dev)
    if (!this.isErrorLogged) {
      this.isErrorLogged = true;
      this.loggingService.logError('HTTP error occurred', error);
    }

    // Hiển thị thông báo lỗi cho người dùng theo mã lỗi HTTP
    let errorMessage = 'Đã xảy ra lỗi không mong muốn.';
    if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    switch (error.status) {
      case 400:
        this.snackBarService.show('Yêu cầu không hợp lệ.');
        break;
      case 401:
        this.snackBarService.show('Bạn cần đăng nhập lại.');
        break;
      case 403:
        this.snackBarService.show('Bạn không có quyền truy cập.');
        break;
      case 404:
        this.snackBarService.show('Không tìm thấy tài nguyên.');
        break;
      case 500:
        this.snackBarService.show('Lỗi từ phía máy chủ. Vui lòng thử lại sau.');
        break;
      case 503:
        this.snackBarService.show('Dịch vụ không khả dụng. Vui lòng thử lại sau.');
        break;
      default:
        this.snackBarService.show(errorMessage);
        break;
    }

    // Reset trạng thái log lỗi sau 3 giây
    setTimeout(() => (this.isErrorLogged = false), 3000);
  }

  resetErrorLogState(): void {
    this.isErrorLogged = false;
  }
}
