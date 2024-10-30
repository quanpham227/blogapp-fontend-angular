import { Injectable } from '@angular/core';
import { NotificationService } from './toastr.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler {
  constructor(private notificationService: NotificationService) {}

  handleError(error: any): void {
    console.error('Logged error:', error);

    // Ưu tiên hiển thị thông báo lỗi từ server, nếu không có thì hiển thị thông báo mặc định
    const errorMessage =
      error?.error?.message || error?.message || 'Đã xảy ra lỗi không mong muốn, vui lòng thử lại sau.';

    switch (error.status) {
      case 400:
        this.notificationService.showWarning(errorMessage || 'Yêu cầu không hợp lệ.');
        break;
      case 401:
        this.notificationService.showWarning(errorMessage || 'Vui lòng đăng nhập lại.');
        break;
      case 402:
        this.notificationService.showWarning(errorMessage || 'Yêu cầu thanh toán.');
        break;
      case 403:
        this.notificationService.showWarning(errorMessage || 'Bạn không có quyền truy cập vào tài nguyên này.');
        break;
      case 404:
        this.notificationService.showWarning(errorMessage || 'Tài nguyên không tồn tại.');
        break;
      case 408:
        this.notificationService.showWarning(errorMessage || 'Yêu cầu hết thời gian chờ.');
        break;
      case 429:
        this.notificationService.showWarning(errorMessage || 'Quá nhiều yêu cầu trong một khoảng thời gian ngắn.');
        break;
      case 409:
        this.notificationService.showWarning(errorMessage || 'Xung đột dữ liệu.');
        break;
      case 500:
        this.notificationService.showError(errorMessage || 'Đã xảy ra lỗi trên server. Vui lòng thử lại sau.');
        break;
      case 503:
        this.notificationService.showError(errorMessage || 'Dịch vụ không khả dụng. Vui lòng thử lại sau.');
        break;
      default:
        this.notificationService.showError(errorMessage);
        break;
    }
  }
}
