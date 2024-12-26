import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { convertToCamelCase } from '../utils/case-converter';
import { ApiResponse } from '../models/response';
import { UserResponse } from '../responses/user/user.response';

@Injectable({
  providedIn: 'root',
})
export class UserDetailService {
  private apiUserDetail = `${environment.apiBaseUrl}/users/details`;

  constructor(private http: HttpClient) {}

  getUserDetail(token: string): Observable<ApiResponse<UserResponse>> {
    return this.http
      .post<ApiResponse<UserResponse>>(
        this.apiUserDetail,
        {},
        {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`,
          }),
        },
      )
      .pipe(map((response) => convertToCamelCase(response)));
  }
}
