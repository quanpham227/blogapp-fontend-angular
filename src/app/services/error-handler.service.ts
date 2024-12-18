import { Injectable } from '@angular/core';
import { ToasterService } from './toaster.service';
import { Observable, throwError } from 'rxjs';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler {
  constructor(
    private toasterService: ToasterService,
    private snackBarService: SnackbarService,
  ) {}

  handleError(error: any): Observable<never> {
    // Kiểm tra kết nối internet
    if (error.status === 0 || !navigator.onLine) {
      this.snackBarService.show('Không có kết nối internet. Vui lòng kiểm tra lại.');
      return throwError(() => new Error('Không có kết nối internet.'));
    }

    // Ưu tiên hiển thị thông báo lỗi từ server, nếu không có thì hiển thị thông báo mặc định
    const errorMessage = error?.error?.message || error?.message || 'Đã xảy ra lỗi không mong muốn, vui lòng thử lại sau.';

    // Xử lý theo mã trạng thái HTTP
    switch (error.status) {
      case 400:
        this.snackBarService.show(errorMessage || 'Yêu cầu không hợp lệ.');
        break;
      case 401:
        this.snackBarService.show(errorMessage || 'Vui lòng đăng nhập lại.');
        break;
      case 402:
        this.snackBarService.show(errorMessage || 'Yêu cầu thanh toán.');
        break;
      case 403:
        this.snackBarService.show(errorMessage || 'Bạn không có quyền truy cập vào tài nguyên này.');
        break;
      case 404:
        this.snackBarService.show(errorMessage || 'Tài nguyên không tồn tại.');
        break;
      case 408:
        this.snackBarService.show(errorMessage || 'Yêu cầu hết thời gian chờ.');
        break;
      case 429:
        this.snackBarService.show(errorMessage || 'Quá nhiều yêu cầu trong một khoảng thời gian ngắn.');
        break;
      case 409:
        this.snackBarService.show(errorMessage || 'Xung đột dữ liệu.');
        break;
      case 500:
        this.snackBarService.show(errorMessage || 'Đã xảy ra lỗi trên server. Vui lòng thử lại sau.');
        break;
      case 503:
        this.snackBarService.show(errorMessage || 'Dịch vụ không khả dụng. Vui lòng thử lại sau.');
        break;
      default:
        this.snackBarService.show(errorMessage);
        break;
    }

    // Trả về Observable lỗi để các component khác có thể xử lý tiếp
    return throwError(() => new Error(errorMessage));
  }

  handleWarning(message: string): void {
    this.toasterService.warning(message || 'Có một cảnh báo cần chú ý.');
  }

  handleInfo(message: string): void {
    this.toasterService.info(message || 'Thông tin cập nhật.');
  }
}
