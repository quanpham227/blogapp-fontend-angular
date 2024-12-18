import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { About } from '../models/about';
import { ApiResponse } from '../models/response';
import { environment } from '../../environments/environment';
import { map, tap } from 'rxjs/operators';
import { convertToCamelCase } from '../utils/case-converter';
import { Dashboard } from '../models/dashboard';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiAbout = `${environment.apiBaseUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ApiResponse<Dashboard>> {
    return this.http.get<ApiResponse<Dashboard>>(this.apiAbout).pipe(
      map((response) => {
        if (response && response.data) {
          response.data = convertToCamelCase(response.data);
        }
        return response;
      }),
    );
  }
}
