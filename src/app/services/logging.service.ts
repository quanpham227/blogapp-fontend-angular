import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  logError(message: string, error: any): void {
    if (!environment.production) {
      console.error(message, error); // Chỉ log lỗi trong môi trường dev
    } else {
      // Gửi log lỗi đến server hoặc công cụ log như Sentry
    }
  }
}
