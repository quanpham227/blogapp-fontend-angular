import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Tag } from '../models/tag';
import { ApiResponse } from '../models/response';
import { SuccessHandlerService } from './success-handler.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  private apiTags = `${environment.apiBaseUrl}/tags`;

  constructor(
    private http: HttpClient,
    private successHandlerService: SuccessHandlerService,
  ) {}

  getTopTags(limit: number, page: number): Observable<ApiResponse<Tag[]>> {
    const params = new HttpParams().set('limit', limit.toString()).set('page', page.toString());
    return this.http.get<ApiResponse<Tag[]>>(`${this.apiTags}/top`, { params });
  }
}
