// http-status.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpStatusService } from '../services/http-status.service';

@Injectable()
export class HttpStatusInterceptor implements HttpInterceptor {
  constructor(private httpStatusService: HttpStatusService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    this.httpStatusService.setPendingRequests(true);

    return next.handle(req).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            this.httpStatusService.setPendingRequests(false);
          }
        },
        (error: HttpErrorResponse) => {
          this.httpStatusService.setPendingRequests(false);
        },
      ),
    );
  }
}
