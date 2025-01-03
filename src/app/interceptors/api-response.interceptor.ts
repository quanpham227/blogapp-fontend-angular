import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { GlobalErrorHandler } from './../services/error-handler.service';

@Injectable()
export class ApiResponseInterceptor implements HttpInterceptor {
  constructor(private errorHandlingService: GlobalErrorHandler) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Chuyển lỗi sang GlobalErrorHandler để xử lý tập trung
        this.errorHandlingService.handleError(error);
        // Không throw lại lỗi để tránh lỗi xuất hiện 2 lần
        return throwError(() => error); // Optional: Nếu cần giữ nguyên luồng
      }),
    );
  }
}
