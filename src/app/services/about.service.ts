import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { About } from '../models/about';
import { ApiResponse } from '../models/response';
import { environment } from '../../environments/environment';
import { SuccessHandlerService } from './success-handler.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AboutService {
  private apiAbout = `${environment.apiBaseUrl}/about`;

  constructor(
    private http: HttpClient,
    private successHandlerService: SuccessHandlerService,
  ) {}

  getAbout(): Observable<ApiResponse<About>> {
    return this.http.get<ApiResponse<About>>(this.apiAbout);
  }
  updateAbout(id: number, about: About): Observable<ApiResponse<About>> {
    return this.http
      .put<ApiResponse<About>>(`${this.apiAbout}/${id}`, about)
      .pipe(tap((response) => this.successHandlerService.handleApiResponse(response)));
  }
}
