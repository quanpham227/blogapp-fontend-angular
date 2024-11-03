import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/response';
import { environment } from '../../environments/environment';
import { SuccessHandlerService } from './success-handler.service';
import { tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private apiEmail = `${environment.apiBaseUrl}/email`;

  constructor(
    private http: HttpClient,
    private successHandlerService: SuccessHandlerService,
  ) {}

  sendEmail(formData: any): Observable<ApiResponse<any>> {
    return this.http
      .post<ApiResponse<any>>(this.apiEmail, formData)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }
}
