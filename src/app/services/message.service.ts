import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private message: string | null = null;

  setMessage(message: string) {
    this.message = message;
  }

  getMessage(): string | null {
    const message = this.message;
    this.message = null; // Xóa thông báo sau khi lấy
    return message;
  }
}
