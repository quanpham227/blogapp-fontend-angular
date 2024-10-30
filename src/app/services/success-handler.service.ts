import { Injectable } from '@angular/core';
import { NotificationService } from './toastr.service';
import { ApiResponse } from '../models/response';

@Injectable({
  providedIn: 'root',
})
export class SuccessHandlerService {
  constructor(private notificationService: NotificationService) {}

  handleApiResponse(response: ApiResponse<any>, successMessage: string) {
    const successStatuses = ['OK', 'Created', 'Accepted', 'No Content'];
    if (successStatuses.includes(response.status)) {
      this.notificationService.showSuccess(successMessage);
    }
  }
}
