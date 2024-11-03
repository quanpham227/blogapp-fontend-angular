import { Injectable } from '@angular/core';
import { ToasterService } from './toaster.service';
import { Observable, throwError } from 'rxjs';

// Enum định nghĩa các mã trạng thái HTTP dưới dạng chuỗi
export enum HttpStatus {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED',
  PaymentRequired = 'PAYMENT_REQUIRED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  RequestTimeout = 'REQUEST_TIMEOUT',
  Conflict = 'CONFLICT',
  TooManyRequests = 'TOO_MANY_REQUESTS',
  InternalServerError = 'INTERNAL_SERVER_ERROR',
  ServiceUnavailable = 'SERVICE_UNAVAILABLE',
}

@Injectable({
  providedIn: 'root',
})
export class GlobalErrorHandler {
  constructor(private toasterService: ToasterService) {}

  handleError(error: any): Observable<never> {
    // Kiểm tra kết nối internet
    if (error.status === 0 || !navigator.onLine) {
      this.toasterService.error('Không có kết nối internet. Vui lòng kiểm tra lại.');
      return throwError(() => new Error('Không có kết nối internet.'));
    }

    // Ưu tiên hiển thị thông báo lỗi từ server, nếu không có thì hiển thị thông báo mặc định
    const errorMessage =
      error?.error?.message || error?.message || 'Đã xảy ra lỗi không mong muốn, vui lòng thử lại sau.';

    // Xử lý theo chuỗi mã trạng thái HTTP
    switch (error.error?.status) {
      case HttpStatus.BadRequest:
        this.toasterService.error(errorMessage || 'Yêu cầu không hợp lệ.');
        break;
      case HttpStatus.Unauthorized:
        this.toasterService.error(errorMessage || 'Vui lòng đăng nhập lại.');
        break;
      case HttpStatus.PaymentRequired:
        this.toasterService.error(errorMessage || 'Yêu cầu thanh toán.');
        break;
      case HttpStatus.Forbidden:
        this.toasterService.error(errorMessage || 'Bạn không có quyền truy cập vào tài nguyên này.');
        break;
      case HttpStatus.NotFound:
        this.toasterService.error(errorMessage || 'Tài nguyên không tồn tại.');
        break;
      case HttpStatus.RequestTimeout:
        this.toasterService.error(errorMessage || 'Yêu cầu hết thời gian chờ.');
        break;
      case HttpStatus.TooManyRequests:
        this.toasterService.error(errorMessage || 'Quá nhiều yêu cầu trong một khoảng thời gian ngắn.');
        break;
      case HttpStatus.Conflict:
        this.toasterService.error(errorMessage || 'Xung đột dữ liệu.');
        break;
      case HttpStatus.InternalServerError:
        this.toasterService.error(errorMessage || 'Đã xảy ra lỗi trên server. Vui lòng thử lại sau.');
        break;
      case HttpStatus.ServiceUnavailable:
        this.toasterService.error(errorMessage || 'Dịch vụ không khả dụng. Vui lòng thử lại sau.');
        break;
      default:
        this.toasterService.error(errorMessage);
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
