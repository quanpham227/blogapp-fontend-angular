// http-status.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpStatusService {
  private pendingRequests = new BehaviorSubject<boolean>(false);
  pendingRequests$ = this.pendingRequests.asObservable();

  setPendingRequests(status: boolean) {
    this.pendingRequests.next(status);
  }
}
