import { Injectable } from '@angular/core';
import { ApiResponse } from '../models/response';
import { ToasterService } from './toaster.service';

@Injectable({
  providedIn: 'root',
})
export class SuccessHandlerService {
  constructor(private toasterService: ToasterService) {}

  handleApiResponse(response: ApiResponse<any>) {
    const successStatuses = [
      'OK',
      'CREATED',
      'ACCEPTED',
      'NO CONTENT',
      'Non-Authoritative Information',
      'Reset Content',
      'Partial Content',
    ];
    if (successStatuses.includes(response.status)) {
      const successMessage = response.message || 'Success';
      this.toasterService.success(successMessage);
    } else {
      console.warn(`Received unexpected status: ${response.status}`);
    }
  }
}
