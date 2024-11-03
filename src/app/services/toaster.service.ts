import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToasterService {
  private toasts: Toast[] = [];
  private toastSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastSubject.asObservable();

  private show = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = Date.now();
    const toast: Toast = {
      id,
      title,
      message,
      type,
      timeoutId: null,
      paused: false,
      remainingTime: 3000,
      startTime: Date.now(),
    };
    this.toasts.push(toast);
    this.toastSubject.next(this.toasts);
    toast.timeoutId = setTimeout(() => this.remove(id), toast.remainingTime);
    return id;
  };

  remove = (id: number) => {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.toastSubject.next(this.toasts);
  };

  pause = (id: number) => {
    const toast = this.toasts.find((toast) => toast.id === id);
    if (toast) {
      if (toast.paused) {
        this.resume(id);
      } else {
        if (toast.timeoutId && toast.startTime !== undefined) {
          clearTimeout(toast.timeoutId);
          toast.timeoutId = null;
          toast.paused = true;
          toast.remainingTime -= Date.now() - toast.startTime;
          this.toastSubject.next(this.toasts);
        }
      }
    }
  };

  resume = (id: number) => {
    const toast = this.toasts.find((toast) => toast.id === id);
    if (toast && toast.paused) {
      toast.paused = false;
      toast.startTime = Date.now();
      toast.timeoutId = setTimeout(() => this.remove(id), toast.remainingTime);
      this.toastSubject.next(this.toasts);
    }
  };

  success(message: string, title: string = 'Success'): number {
    return this.show(title, message, 'success');
  }
  error(message: string, title: string = 'Error'): number {
    return this.show(title, message, 'error');
  }
  warning(message: string, title: string = 'Warning'): number {
    return this.show(title, message, 'warning');
  }
  info(message: string, title: string = 'Info'): number {
    return this.show(title, message, 'info');
  }
}

export interface Toast {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timeoutId: any;
  paused: boolean;
  remainingTime: number;
  startTime?: number;
}
