import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { About } from '../models/about';
import { ApiResponse } from '../models/response';
import { environment } from '../../environments/environment';
import { SuccessHandlerService } from './success-handler.service';
import { map, tap } from 'rxjs/operators';
import { convertToCamelCase, convertToSnakeCase } from '../utils/case-converter';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class AboutService {
  private apiAbout = `${environment.apiBaseUrl}/about`;

  constructor(
    private http: HttpClient,
    private successHandlerService: SuccessHandlerService,
    private snackBarService: SnackbarService,
  ) {}

  getAbout(): Observable<ApiResponse<About>> {
    return this.http.get<ApiResponse<About>>(this.apiAbout).pipe(
      map((response) => {
        if (response && response.data) {
          response.data = convertToCamelCase(response.data);
        }
        return response;
      }),
    );
  }
  updateAbout(id: number, about: About): Observable<ApiResponse<About>> {
    const snakeCaseAbout = convertToSnakeCase(about);
    return this.http
      .put<ApiResponse<About>>(`${this.apiAbout}/${id}`, snakeCaseAbout)
      .pipe(tap((response) => this.snackBarService.success(response.message)));
  }
}
