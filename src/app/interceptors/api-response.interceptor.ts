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
        this.errorHandlingService.handleError(error); // Gọi xử lý lỗi trung tâm

        // Trả về lỗi để tiếp tục xử lý ở nơi khác nếu cần
        return throwError(() => error);
      }),
    );
  }
}
