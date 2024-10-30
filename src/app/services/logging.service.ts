import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  logError(message: string, error: any): void {
    if (!environment.production) {
      console.error(message, error);
    } else {
      // Ghi log lỗi vào một nơi khác, ví dụ: gửi lỗi đến một server logging
      // hoặc sử dụng một công cụ ghi log như Sentry, LogRocket, v.v.
    }
  }
}
