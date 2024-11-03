import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { GlobalErrorHandler } from './../services/error-handler.service';
import { LoggingService } from '../services/logging.service';

@Injectable()
export class ApiResponseInterceptor implements HttpInterceptor {
  constructor(
    private errorHandlingService: GlobalErrorHandler,
    private loggingService: LoggingService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(`HTTP Request: ${req.method} ${req.url}`); // Log thông tin yêu cầu HTTP

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        this.loggingService.logError('HTTP error occurred', error); // Ghi log lỗi bằng LoggingService
        this.errorHandlingService.handleError(error); // Gọi xử lý lỗi trung tâm

        // Trả về lỗi để tiếp tục xử lý ở nơi khác nếu cần
        return throwError(() => error);
      }),
    );
  }
}
