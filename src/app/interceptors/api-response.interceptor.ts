import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { GlobalErrorHandler } from './../services/error-handler.service';
import { LoggingService } from '../services/logging.service';
import { environment } from '../../environments/environment';

@Injectable()
export class ApiResponseInterceptor implements HttpInterceptor {
  constructor(
    private errorHandlingService: GlobalErrorHandler,
    private loggingService: LoggingService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // if (!environment.production) {
    //   console.log(`HTTP Request: ${req.method} ${req.url}`); // Log thông tin yêu cầu HTTP trong môi trường phát triển
    // }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const errorMessage = this.getErrorMessage(error);
        this.loggingService.logError('HTTP error occurred', { error, message: errorMessage }); // Ghi log lỗi với thông tin chi tiết
        this.errorHandlingService.handleError(error); // Gọi xử lý lỗi trung tâm

        // Trả về lỗi để tiếp tục xử lý ở nơi khác nếu cần
        return throwError(() => error);
      }),
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return 'Bad Request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not Found';
      case 500:
        return 'Internal Server Error';
      default:
        return 'An unknown error occurred';
    }
  }
}
